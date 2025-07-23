import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import * as path from "path";
import { generateEmbedding } from "./openai";
import { upsertDocumentChunks, type DocumentChunk } from "./pinecone";

export interface ProcessedDocument {
  chunks: DocumentChunk[];
  pageCount?: number;
}

export async function processDocument(
  filePath: string,
  documentId: number,
  documentName: string,
  userId: number,
  mimeType: string
): Promise<ProcessedDocument> {
  try {
    let text: string = "";
    
    // Read file content based on type
    switch (mimeType) {
      case "text/plain":
        text = fs.readFileSync(filePath, 'utf-8');
        break;
      case "application/pdf":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        // For now, treat as text (in production, you'd use proper PDF/DOCX parsers)
        try {
          text = fs.readFileSync(filePath, 'utf-8');
        } catch {
          throw new Error(`PDF and DOCX processing requires additional setup. Please upload TXT files for now.`);
        }
        break;
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (!text.trim()) {
      throw new Error("Document appears to be empty or unreadable");
    }
    
    // Split document into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitText(text);
    
    // Create document chunks
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      id: `${documentId}-${index}`,
      text: chunk,
      metadata: {
        documentId,
        documentName,
        userId,
        chunkIndex: index,
      },
    }));

    // Generate embeddings for all chunks
    const embeddings = await Promise.all(
      documentChunks.map(chunk => generateEmbedding(chunk.text))
    );

    // Store in Pinecone
    await upsertDocumentChunks(documentChunks, embeddings);

    return {
      chunks: documentChunks,
      pageCount: 1, // Estimate page count
    };
  } catch (error) {
    console.error("Document processing error:", error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateContextFromQuery(
  query: string,
  userId: number
): Promise<string> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for similar chunks
    const { searchSimilarChunks } = await import("./pinecone");
    const results = await searchSimilarChunks(queryEmbedding, userId, 5);
    
    if (results.length === 0) {
      return "";
    }

    // Combine relevant chunks into context
    const context = results
      .filter(result => result.score > 0.7) // Only include high-confidence results
      .map(result => `[${result.metadata.documentName}, page ${result.metadata.pageNumber || 'unknown'}]: ${result.text}`)
      .join("\n\n");

    return context;
  } catch (error) {
    console.error("Context generation error:", error);
    return "";
  }
}
