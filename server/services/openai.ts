import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateChatResponse(
  messages: ChatMessage[],
  context?: string
): Promise<ChatResponse> {
  try {
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are a helpful AI assistant powered by GPT-4. You have access to a knowledge base through RAG (Retrieval-Augmented Generation).
      
      ${context ? `Here is relevant context from the user's documents:
      
      ${context}
      
      Use this context to provide accurate and relevant responses. If the context doesn't contain relevant information, you can still provide general assistance.` : "Provide helpful and accurate responses to user queries."}
      
      Always be concise, helpful, and cite sources when using information from the provided context.`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate chat response");
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("OpenAI embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
}
