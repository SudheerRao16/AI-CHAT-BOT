import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { processDocument, generateContextFromQuery } from "./services/langchain";
import { generateChatResponse } from "./services/openai";
import { insertDocumentSchema, insertChatSessionSchema, insertMessageSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, and TXT files are allowed."));
    }
  },
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Document routes
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const documents = await storage.getDocumentsByUserId(req.user!.id);
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const document = await storage.createDocument({
        userId: req.user!.id,
        name: req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        status: "processing",
        filePath: req.file.path,
        pageCount: null,
      });

      // Process document asynchronously
      processDocument(
        req.file.path,
        document.id,
        document.name,
        req.user!.id,
        req.file.mimetype
      )
        .then(async (result) => {
          await storage.updateDocumentStatus(document.id, "processed", result.pageCount);
        })
        .catch(async (error) => {
          console.error("Document processing failed:", error);
          await storage.updateDocumentStatus(document.id, "failed");
        });

      res.status(201).json(document);
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Chat session routes
  app.get("/api/chat/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sessions = await storage.getChatSessionsByUserId(req.user!.id);
      res.json(sessions);
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sessionData = insertChatSessionSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const session = await storage.createChatSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Create session error:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/sessions/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getChatSession(sessionId);
      
      if (!session || session.userId !== req.user!.id) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      const messages = await storage.getMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.delete("/api/chat/sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getChatSession(sessionId);
      
      if (!session || session.userId !== req.user!.id) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      await storage.deleteChatSession(sessionId);
      res.sendStatus(200);
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ message: "Failed to delete chat session" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          const { sessionId, content, userId } = message;
          
          // Verify user owns the session
          const session = await storage.getChatSession(sessionId);
          if (!session || session.userId !== userId) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Unauthorized' 
            }));
            return;
          }

          // Save user message
          const userMessage = await storage.createMessage({
            sessionId,
            role: 'user',
            content,
            sources: null,
          });

          // Generate context from user's documents
          const context = await generateContextFromQuery(content, userId);
          
          // Generate AI response
          const messages = await storage.getMessagesBySessionId(sessionId);
          const chatHistory = messages.slice(-10).map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

          const response = await generateChatResponse(chatHistory, context);
          
          // Save AI response
          const aiMessage = await storage.createMessage({
            sessionId,
            role: 'assistant',
            content: response.content,
            sources: context ? { hasContext: true } : null,
          });

          // Update session with last message
          await storage.updateChatSession(sessionId, {
            lastMessage: content.length > 100 ? content.substring(0, 100) + '...' : content,
          });

          // Send response back to client
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat_response',
              userMessage,
              aiMessage,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to process message' 
          }));
        }
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
