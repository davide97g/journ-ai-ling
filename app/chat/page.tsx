"use client";

import type React from "react";

import { AudioRecorder } from "@/components/audio-recorder";
import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JOURNAL_QUESTIONS } from "@/lib/journal-questions";
import { ArrowRight, BookOpen, History, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MOCK_MODE = false; // Set to false when backend is ready

export default function ChatPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [entries, setEntries] = useState<
    Array<{
      questionKey: string;
      question: string;
      answer: string;
      audioUrl?: string;
    }>
  >([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string }>
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [skipAttempts, setSkipAttempts] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function createSession() {
      if (MOCK_MODE) {
        // Mock session creation
        const mockSessionId = `mock-session-${Date.now()}`;
        setSessionId(mockSessionId);
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `Hi! I'm Collector, your journaling companion. I'm here to help you reflect on your day. ${JOURNAL_QUESTIONS[0].question}`,
          },
        ]);
      } else {
        try {
          const response = await fetch("/api/journal/session", {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Failed to create session");
          }

          const data = await response.json();
          setSessionId(data.session.id);
          setMessages([
            {
              id: "1",
              role: "assistant",
              content: `Hi! I'm Collector, your journaling companion. I'm here to help you reflect on your day. ${JOURNAL_QUESTIONS[0].question}`,
            },
          ]);
        } catch (error) {
          console.error("[v0] Failed to create session:", error);
          // Fallback to mock mode
          const mockSessionId = `mock-session-${Date.now()}`;
          setSessionId(mockSessionId);
          setMessages([
            {
              id: "1",
              role: "assistant",
              content: `Hi! I'm Collector, your journaling companion. I'm here to help you reflect on your day. ${JOURNAL_QUESTIONS[0].question}`,
            },
          ]);
        }
      }
    }
    createSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateMockResponse = (
    userInput: string,
    questionIndex: number
  ): string => {
    const responses = [
      "Thank you for sharing that. It's important to acknowledge how you're feeling.",
      "I appreciate you opening up about this. Your feelings are valid.",
      "That's really insightful. It sounds like you've given this some thought.",
      "I hear you. It's great that you're taking time to reflect on this.",
      "Thank you for being so honest. Self-reflection is a powerful tool.",
      "That's a meaningful observation. How does that make you feel?",
      "I understand. It's helpful to recognize these patterns in our lives.",
      "Thank you for sharing. Your perspective is valuable.",
    ];

    return responses[questionIndex % responses.length];
  };

  const saveMessage = async (message: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }) => {
    if (MOCK_MODE) {
      console.log("[v0] Mock saving message:", message);
    } else {
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
      } catch (error) {
        console.error("[v0] Failed to save message:", error);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Save user message immediately
    await saveMessage(userMessage);

    if (MOCK_MODE) {
      // Mock AI response with typing effect
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const aiResponse = generateMockResponse(text, currentQuestionIndex);
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: aiResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message immediately
      await saveMessage(assistantMessage);
      setIsTyping(false);
    } else {
      // Real AI API call would go here
      try {
        setIsTyping(true);
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            sessionId,
            currentQuestionIndex,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant" as const,
          content: data.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message immediately
        await saveMessage(assistantMessage);
        setIsTyping(false);
      } catch (error) {
        console.error("[v0] Failed to get AI response:", error);
        // Fallback to mock response
        const aiResponse = generateMockResponse(text, currentQuestionIndex);
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant" as const,
          content: aiResponse,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message immediately
        await saveMessage(assistantMessage);
        setIsTyping(false);
      }
    }
  };

  const handleNextQuestion = async () => {
    // Check if current question has been answered
    const hasAnswer = hasAnswerForCurrentQuestion();
    const userMessages = messages.filter((m) => m.role === "user");
    const lastMessage = userMessages[userMessages.length - 1];
    const lastAnswer = lastMessage?.content || "";

    // If no answer exists and no current input, implement two-click logic
    if (!hasAnswer && !input.trim()) {
      if (skipAttempts === 0) {
        // First attempt: show warning and increment counter
        setShowSkipWarning(true);
        setSkipAttempts(1);
        setTimeout(() => setShowSkipWarning(false), 3000);
        return;
      } else {
        // Second attempt: actually skip the question
        setSkipAttempts(0); // Reset for next question
        // Continue with skip logic below
      }
    } else {
      // Reset skip attempts if user has provided an answer
      setSkipAttempts(0);
    }

    // Don't save individual entries during conversation - save everything at the end

    setCurrentAudioUrl("");
    setInput("");

    if (currentQuestionIndex < JOURNAL_QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSkipAttempts(0); // Reset skip attempts for new question

      // Add next question as assistant message
      const nextQuestion = {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: JOURNAL_QUESTIONS[nextIndex].question,
      };
      setMessages((prev) => [...prev, nextQuestion]);

      // Save next question message immediately
      await saveMessage(nextQuestion);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);

    // Mark session as complete - all messages already saved individually
    if (MOCK_MODE) {
      // Mock completion
      console.log("[v0] Mock marking session as complete");
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
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
        console.error("[v0] Failed to mark session as complete:", error);
        // Continue anyway in mock mode
      }
    }

    setIsComplete(true);
    setIsSaving(false);

    const completionMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant" as const,
      content:
        "Thank you for sharing your day with me. Your journal entry has been saved. Take care, and I'll see you tomorrow!",
    };
    setMessages((prev) => [...prev, completionMessage]);

    // Save completion message immediately
    await saveMessage(completionMessage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    handleSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isTyping) return;
      handleSendMessage(input);
      setInput("");
    }
  };

  const hasAnswerForCurrentQuestion = () => {
    const currentQuestionKey = JOURNAL_QUESTIONS[currentQuestionIndex].key;
    return entries.some((entry) => entry.questionKey === currentQuestionKey);
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
          {MOCK_MODE && (
            <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600 dark:text-yellow-400">
              Demo Mode
            </span>
          )}
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
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}
          {isTyping && (
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

      {showSkipWarning && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 shadow-lg dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            You're skipping this question without answering. You can always go
            back to answer it later.
          </div>
        </div>
      )}

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
                  disabled={isTyping}
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
                  disabled={isTyping}
                >
                  {currentQuestionIndex === JOURNAL_QUESTIONS.length - 1
                    ? "Complete"
                    : "Next question"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button type="submit" disabled={isTyping || !input}>
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
                {MOCK_MODE
                  ? "Your journal entry has been recorded (demo mode - not saved to database)"
                  : "Your journal entry has been saved"}
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
