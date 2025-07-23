import { useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { type ChatSession } from "@shared/schema";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MessageInput } from "@/components/chat/message-input";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { user } = useAuth();
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const { data: sessions = [], refetch: refetchSessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions"],
    enabled: !!user,
  });

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  const handleSendMessage = (content: string) => {
    if (!currentSessionId || !user) return;

    sendMessage({
      type: "chat_message",
      sessionId: currentSessionId,
      content,
      userId: user.id,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-80" : "w-0",
        "lg:w-80"
      )}>
        <ChatSidebar
          currentSessionId={currentSessionId}
          onSessionSelect={setCurrentSessionId}
          onNewSession={() => {
            setCurrentSessionId(null);
            refetchSessions();
          }}
          sessions={sessions}
          isDark={isDark}
          onToggleDark={toggleDarkMode}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Assistant Chat
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-red-500"
                  )} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    GPT-4 • RAG Enabled • {isConnected ? "Connected" : "Disconnected"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            sessionId={currentSessionId}
            lastMessage={lastMessage}
          />
        </div>

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!currentSessionId || !isConnected}
        />
      </div>
    </div>
  );
}
