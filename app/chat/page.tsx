"use client";

import type React from "react";

import AIBotBlobs from "@/components/ai-blob";
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
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string }>
  >([]);

  // Typing detection with debounce
  useEffect(() => {
    if (input.length === 0) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const timeoutId = setTimeout(() => {
      setIsTyping(false);
    }, 2000); // Increased to 2s to allow full transition

    return () => clearTimeout(timeoutId);
  }, [input]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [hintMessage, setHintMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Array of therapist-like hint messages
  const hintMessages = [
    "How are you feeling today?",
    "Ready when you are.",
    "What's on your mind?",
    "How was your day?",
    "What would you like to talk about?",
    "I'm here to listen.",
    "What's been going through your head lately?",
    "How can I help you today?",
    "What's weighing on your heart?",
    "Tell me what's happening in your world.",
  ];

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

  // Check for existing session from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get("id");

    if (sessionIdFromUrl) {
      loadExistingSession(sessionIdFromUrl);
    } else {
      // No existing session, show random hint
      const randomMessage =
        hintMessages[Math.floor(Math.random() * hintMessages.length)];
      setHintMessage(randomMessage);
      setShowHint(true);
      setLocalMessages([]);
    }
  }, []);

  const loadExistingSession = async (sessionId: string) => {
    setIsLoadingSession(true);
    try {
      // Load session details and messages
      const [sessionResponse, messagesResponse] = await Promise.all([
        fetch(`/api/journal/session/${sessionId}`),
        fetch(`/api/journal/messages/${sessionId}`),
      ]);

      if (sessionResponse.ok && messagesResponse.ok) {
        const sessionData = await sessionResponse.json();
        const messagesData = await messagesResponse.json();

        setSessionId(sessionId);
        setCurrentQuestionIndex(sessionData.session.completed || 0);
        setIsComplete(
          sessionData.session.completed === JOURNAL_QUESTIONS.length
        );

        // Load existing messages
        if (messagesData.messages && messagesData.messages.length > 0) {
          setLocalMessages(messagesData.messages);
          setShowHint(false);
        } else {
          // No messages yet, show random hint
          const randomMessage =
            hintMessages[Math.floor(Math.random() * hintMessages.length)];
          setHintMessage(randomMessage);
          setShowHint(true);
          setLocalMessages([]);
        }
      } else {
        // Session not found, redirect to new chat
        router.replace("/chat");
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      router.replace("/chat");
    } finally {
      setIsLoadingSession(false);
    }
  };

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
    if (!text.trim() || isLoading || isCreatingSession) return;

    // Hide hint when user sends first message
    setShowHint(false);

    // Create session on first message if it doesn't exist
    if (!sessionId) {
      await createSessionAndSendMessage(text);
      return;
    }

    console.log("[Chat Frontend] Sending message:", {
      text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      sessionId,
      currentQuestionIndex,
    });

    sendMessage({
      parts: [{ type: "text", text }],
    });
  };

  const createSessionAndSendMessage = async (text: string) => {
    setIsCreatingSession(true);
    try {
      const response = await fetch("/api/journal/session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      const newSessionId = data.session.id;
      setSessionId(newSessionId);

      // Update URL with session ID
      const newUrl = `/chat?id=${newSessionId}`;
      window.history.replaceState({}, "", newUrl);

      // Now send the message
      sendMessage({
        parts: [{ type: "text", text }],
      });
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreatingSession(false);
    }
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

  const handleDeleteSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/journal/session/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      // Reset all state and clear messages
      setSessionId(null);
      setCurrentQuestionIndex(0);
      setIsComplete(false);
      setInput("");
      setCurrentAudioUrl("");

      // Clear all messages and show fresh random hint
      const randomMessage =
        hintMessages[Math.floor(Math.random() * hintMessages.length)];
      setHintMessage(randomMessage);
      setLocalMessages([]);
      setShowHint(true);

      // Clear useChat messages by resetting the hook
      // We'll do this by refreshing the page to ensure clean state
      window.location.href = "/chat";
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleStartNewSession = () => {
    // Reset all state and redirect to new chat
    setSessionId(null);
    setCurrentQuestionIndex(0);
    setIsComplete(false);
    setInput("");
    setCurrentAudioUrl("");
    setLocalMessages([]);
    const randomMessage =
      hintMessages[Math.floor(Math.random() * hintMessages.length)];
    setHintMessage(randomMessage);
    setShowHint(true);

    // Use full page refresh to ensure clean state
    window.location.href = "/chat";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isCreatingSession) return;

    handleSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading || isCreatingSession) return;
      handleSendMessage(input);
      setInput("");
    }
  };

  if (isLoadingSession) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">
          Loading your journal session...
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
          {sessionId && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSession}
                className="text-destructive hover:text-destructive"
              >
                Delete session
              </Button>
              <Button variant="ghost" size="sm" onClick={handleStartNewSession}>
                New session
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/history">
              <History className="h-5 w-5" />
              <span className="sr-only">View history</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto relative">
        {/* Background blob when not typing */}

        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <AIBotBlobs
              size={!isTyping ? 600 : 300}
              animated={true}
              randomColors={true}
              colorChangeInterval={4000}
              isTyping={!isTyping}
              className="opacity-20"
            />
          </div>
        </div>

        <div className="mx-auto max-w-3xl relative z-10">
          {/* Show hint message when no messages and no session */}
          {showHint && localMessages.length === 0 && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 relative">
              <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 shadow-lg">
                <p className="text-lg text-white/90 font-medium">
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Display local messages */}
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
                  placeholder={
                    isCreatingSession
                      ? "Creating session..."
                      : "Share your thoughts..."
                  }
                  className="min-h-[80px] resize-none flex-1"
                  disabled={isLoading || isCreatingSession}
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
                  disabled={isLoading || isSaving || isCreatingSession}
                >
                  {currentQuestionIndex === JOURNAL_QUESTIONS.length - 1
                    ? "Complete"
                    : "Next question"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading || !input || isSaving || isCreatingSession
                  }
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
