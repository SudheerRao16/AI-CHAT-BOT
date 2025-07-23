import { users, documents, chatSessions, messages, type User, type InsertUser, type Document, type InsertDocument, type ChatSession, type InsertChatSession, type Message, type InsertMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentStatus(id: number, status: string, pageCount?: number): Promise<Document | undefined>;
  
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getChatSessionsByUserId(userId: number): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  deleteChatSession(id: number): Promise<boolean>;
  
  getMessagesBySessionId(sessionId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private chatSessions: Map<number, ChatSession>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentSessionId: number;
  private currentMessageId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId,
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      status: insertDocument.status || "processing",
      pageCount: insertDocument.pageCount || null,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocumentStatus(id: number, status: string, pageCount?: number): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, status, pageCount: pageCount || document.pageCount };
    this.documents.set(id, updated);
    return updated;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessionsByUserId(userId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const now = new Date();
    const session: ChatSession = {
      ...insertSession,
      id,
      lastMessage: insertSession.lastMessage || null,
      createdAt: now,
      updatedAt: now,
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates, updatedAt: new Date() };
    this.chatSessions.set(id, updated);
    return updated;
  }

  async deleteChatSession(id: number): Promise<boolean> {
    // Delete all messages in the session
    Array.from(this.messages.values())
      .filter((msg) => msg.sessionId === id)
      .forEach((msg) => this.messages.delete(msg.id));
    
    return this.chatSessions.delete(id);
  }

  async getMessagesBySessionId(sessionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      sources: insertMessage.sources || null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
