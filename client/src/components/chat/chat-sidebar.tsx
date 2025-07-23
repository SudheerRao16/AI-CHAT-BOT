import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DocumentUpload } from "@/components/ui/document-upload";
import { type ChatSession, type Document } from "@shared/schema";
import { Bot, Plus, Trash2, FileText, Sun, Moon, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  currentSessionId: number | null;
  onSessionSelect: (sessionId: number) => void;
  onNewSession: () => void;
  sessions: ChatSession[];
  isDark: boolean;
  onToggleDark: () => void;
}

export function ChatSidebar({
  currentSessionId,
  onSessionSelect,
  onNewSession,
  sessions,
  isDark,
  onToggleDark,
}: ChatSidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [newSessionTitle, setNewSessionTitle] = useState("");

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/chat/sessions", { title });
      return await res.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      onSessionSelect(session.id);
      setNewSessionTitle("");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("DELETE", `/api/chat/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      if (currentSessionId === deleteSessionMutation.variables) {
        onNewSession();
      }
    },
  });

  const handleCreateSession = () => {
    const title = newSessionTitle.trim() || "New Chat";
    createSessionMutation.mutate(title);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    return "📄";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "processing": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "failed": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Assistant
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                RAG-Powered
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDark}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Chat title..."
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateSession();
              }
            }}
          />
          <Button
            onClick={handleCreateSession}
            disabled={createSessionMutation.isPending}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Recent Chats */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Recent Chats
          </h3>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No chat sessions yet. Create your first chat!
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors duration-200 group",
                    currentSessionId === session.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                  onClick={() => onSessionSelect(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session.title}
                      </p>
                      {session.lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {session.lastMessage}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatRelativeTime(new Date(session.updatedAt))}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSessionMutation.mutate(session.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Knowledge Base */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Knowledge Base
            </h3>
            <DocumentUpload />
          </div>
          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No documents uploaded yet. Upload your first document!
              </p>
            ) : (
              documents.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getDocumentIcon(doc.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(doc.size / 1024 / 1024).toFixed(1)} MB
                        {doc.pageCount && ` • ${doc.pageCount} pages`}
                      </p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(doc.status)
                    )}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
