import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={cn("flex w-full gap-3 px-4 py-6", role === "assistant" ? "bg-muted/50" : "bg-background")}>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        {role === "assistant" ? (
          <span className="text-sm font-medium">C</span>
        ) : (
          <span className="text-sm font-medium">You</span>
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
