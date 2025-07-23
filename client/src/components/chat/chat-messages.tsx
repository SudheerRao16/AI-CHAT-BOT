import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { type Message } from "@shared/schema";
import { type WebSocketMessage } from "@/hooks/use-websocket";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  sessionId: number | null;
  lastMessage: WebSocketMessage | null;
}

export function ChatMessages({ sessionId, lastMessage }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch } = useQuery<Message[]>({
    queryKey: ["/api/chat/sessions", sessionId, "messages"],
    enabled: !!sessionId,
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "chat_response") {
      refetch();
    }
  }, [lastMessage, refetch]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to AI Assistant
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create a new chat session to start talking with your AI assistant powered by GPT-4 and enhanced with RAG capabilities.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              • Document analysis
            </div>
            <div>
              • Contextual responses
            </div>
            <div>
              • Smart conversations
            </div>
            <div>
              • Real-time chat
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md shadow-sm border border-gray-200 dark:border-gray-600 p-4">
                <p className="text-gray-900 dark:text-white">
                  👋 Hello! I'm your AI assistant powered by GPT-4 and enhanced with RAG capabilities. I can help you with:
                </p>
                <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Answering questions using your uploaded documents</li>
                  <li>• Analyzing and summarizing content</li>
                  <li>• Providing contextual information</li>
                  <li>• General conversation and assistance</li>
                </ul>
                <p className="mt-3 text-gray-900 dark:text-white">
                  How can I help you today?
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                AI Assistant • Just now
              </p>
            </div>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3",
                message.role === "user" ? "justify-end" : ""
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={cn(
                "flex-1",
                message.role === "user" ? "flex justify-end" : ""
              )}>
                <div className={cn(
                  "max-w-xs lg:max-w-md",
                  message.role === "user" ? "" : "w-full max-w-none"
                )}>
                  <div className={cn(
                    "rounded-2xl shadow-sm p-4",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-tl-md"
                  )}>
                    <p className={cn(
                      message.role === "user"
                        ? "text-primary-foreground"
                        : "text-gray-900 dark:text-white"
                    )}>
                      {message.content}
                    </p>
                    
                    {message.role === "assistant" && message.sources && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Sources:
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Knowledge Base
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs text-gray-500 dark:text-gray-400 mt-2",
                    message.role === "user" ? "text-right" : ""
                  )}>
                    {message.role === "user" ? "You" : "AI Assistant"} • {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
              
              {message.role === "user" && (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
