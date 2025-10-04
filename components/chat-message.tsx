import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  userInitials?: string;
}

export function ChatMessage({ role, content, userInitials }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full px-4 py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex gap-3 max-w-[80%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
          {isUser ? (
            <span className="text-sm font-medium">{userInitials || "U"}</span>
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <div
            className={cn(
              "rounded-lg px-3 py-2",
              isUser ? "bg-primary text-primary-foreground" : "bg-muted border"
            )}
          >
            <p className="leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
