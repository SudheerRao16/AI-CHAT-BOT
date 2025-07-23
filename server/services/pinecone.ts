import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || process.env.PINECONE_API_KEY_ENV_VAR || "default_key",
});

const indexName = process.env.PINECONE_INDEX_NAME || "chatbot-knowledge-base";

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    documentId: number;
    documentName: string;
    userId: number;
    chunkIndex: number;
    pageNumber?: number;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    documentId: number;
    documentName: string;
    userId: number;
    chunkIndex: number;
    pageNumber?: number;
  };
  text: string;
}

export async function initializePinecone() {
  try {
    // Check if index exists, create if it doesn't
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(index => index.name === indexName);
    
    if (!indexExists) {
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    return pinecone.index(indexName);
  } catch (error) {
    console.error("Pinecone initialization error:", error);
    throw new Error("Failed to initialize Pinecone");
  }
}

export async function upsertDocumentChunks(chunks: DocumentChunk[], embeddings: number[][]) {
  try {
    const index = await initializePinecone();
    
    const vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      values: embeddings[i],
      metadata: {
        ...chunk.metadata,
        text: chunk.text,
      },
    }));

    await index.upsert(vectors);
  } catch (error) {
    console.error("Pinecone upsert error:", error);
    throw new Error("Failed to store document chunks");
  }
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  userId: number,
  topK: number = 5
): Promise<SearchResult[]> {
  try {
    const index = await initializePinecone();
    
    const response = await index.query({
      vector: queryEmbedding,
      topK,
      filter: { userId },
      includeMetadata: true,
    });

    return response.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata as any,
      text: (match.metadata as any)?.text || "",
    })) || [];
  } catch (error) {
    console.error("Pinecone search error:", error);
    throw new Error("Failed to search document chunks");
  }
}

export async function deleteDocumentChunks(documentId: number) {
  try {
    const index = await initializePinecone();
    
    await index.deleteMany({
      filter: { documentId }
    });
  } catch (error) {
    console.error("Pinecone delete error:", error);
    throw new Error("Failed to delete document chunks");
  }
}
