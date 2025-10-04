"use client";

import type React from "react";

import { AudioRecorder } from "@/components/audio-recorder";
import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JOURNAL_QUESTIONS } from "@/lib/journal-questions";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowRight, BookOpen, History, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use the AI SDK useChat hook
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        sessionId,
        currentQuestionIndex,
      },
    }),
  });

  const isLoading = status === "streaming";

  useEffect(() => {
    async function createSession() {
      try {
        const response = await fetch("/api/journal/session", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const data = await response.json();
        setSessionId(data.session.id);

        // Add welcome message as placeholder (not sent to LLM, not saved to DB)
        // We'll add this manually to the messages array
        const welcomeMessage = {
          id: "welcome",
          role: "assistant" as const,
          content: `Hi! I'm Collector, your journaling companion. I'm here to help you reflect on your day. ${JOURNAL_QUESTIONS[0].question}`,
        };

        // Add welcome message to the local messages array
        setLocalMessages([welcomeMessage]);
      } catch (error) {
        console.error("Failed to create session:", error);
      }
    }
    createSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, localMessages]);

  // Save message to database
  const saveMessage = async (message: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }) => {
    try {
      const response = await fetch("/api/journal/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message,
          currentQuestionIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      console.log("[Chat Frontend] Message saved successfully:", message.id);
    } catch (error) {
      console.error("[Chat Frontend] Failed to save message:", error);
    }
  };

  // Watch for message changes and save to database
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      // Get the latest message from useChat
      const latestMessage = messages[messages.length - 1];

      // Skip saving if it's still streaming
      if (isLoading) {
        return;
      }

      // Convert message format for database
      const messageForDB = {
        id: latestMessage.id,
        role:
          latestMessage.role === "system"
            ? "assistant"
            : (latestMessage.role as "user" | "assistant"),
        content: latestMessage.parts
          .map((part) => (part.type === "text" ? part.text : ""))
          .join(""),
      };

      // Save to database
      saveMessage(messageForDB);
    }
  }, [messages, sessionId, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    console.log("[Chat Frontend] Sending message:", {
      text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      sessionId,
      currentQuestionIndex,
    });

    sendMessage({
      parts: [{ type: "text", text }],
    });
  };

  const handleNextQuestion = async () => {
    setCurrentAudioUrl("");
    setInput("");

    if (currentQuestionIndex < JOURNAL_QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Send next question as assistant message
      sendMessage({
        parts: [{ type: "text", text: JOURNAL_QUESTIONS[nextIndex].question }],
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/journal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          entries: [], // No entries to save, just mark as complete
          completed: JOURNAL_QUESTIONS.length,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark session as complete");
      }
    } catch (error) {
      console.error("Failed to mark session as complete:", error);
    }

    setIsComplete(true);
    setIsSaving(false);

    // Send completion message
    sendMessage({
      parts: [
        {
          type: "text",
          text: "Thank you for sharing your day with me. Your journal entry has been saved. Take care, and I'll see you tomorrow!",
        },
      ],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    handleSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      handleSendMessage(input);
      setInput("");
    }
  };

  if (!sessionId) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">
          Starting your journal session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h1 className="font-semibold">Daily Journal</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {JOURNAL_QUESTIONS.length}
          </span>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/history">
              <History className="h-5 w-5" />
              <span className="sr-only">View history</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          {/* Display local messages (welcome message) */}
          {localMessages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}
          {/* Display useChat messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={message.parts
                .map((part) => (part.type === "text" ? part.text : ""))
                .join("")}
            />
          ))}
          {isLoading && (
            <div className="px-4 py-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  C
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!isComplete && (
        <div className="border-t bg-background">
          <div className="mx-auto max-w-3xl p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share your thoughts..."
                  className="min-h-[80px] resize-none flex-1"
                  disabled={isLoading}
                />
                <AudioRecorder
                  onAudioUploaded={setCurrentAudioUrl}
                  audioUrl={currentAudioUrl}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={isLoading || isSaving}
                >
                  {currentQuestionIndex === JOURNAL_QUESTIONS.length - 1
                    ? "Complete"
                    : "Next question"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !input || isSaving}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="border-t bg-background">
          <div className="mx-auto max-w-3xl p-4">
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Your journal entry has been saved
              </p>
              <div className="flex gap-2">
                <Button onClick={() => router.push("/history")}>
                  View history
                </Button>
                <Button variant="outline" onClick={() => router.refresh()}>
                  Start new entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
