import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DocumentUpload } from "@/components/ui/document-upload";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
      {/* File Upload Area */}
      {showFileUpload && (
        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
          <DocumentUpload />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me anything about your documents or general questions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[52px] max-h-[120px] resize-none pr-12"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 h-6 w-6 p-0"
              onClick={() => setShowFileUpload(!showFileUpload)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="h-[52px] px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center space-x-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              disabled ? "bg-red-500" : "bg-green-500"
            )} />
            <span>{disabled ? "Disconnected" : "Connected"}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span>{message.length}/4000</span>
          <span>•</span>
          <span>GPT-4</span>
        </div>
      </div>
    </div>
  );
}
