"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { JournalCard } from "@/components/journal-card"
import { BookOpen, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

const MOCK_MODE = true // Set to false when backend is ready

interface Session {
  id: string
  date: Date
  completed: number
  entries: Array<{
    questionKey: string
    question: string
    answer: string
    audioUrl: string | null
  }>
}

const MOCK_SESSIONS: Session[] = [
  {
    id: "mock-1",
    date: new Date(Date.now() - 86400000), // Yesterday
    completed: 8,
    entries: [
      {
        questionKey: "mood",
        question: "How are you feeling today?",
        answer: "I'm feeling pretty good today. Had a productive morning and got some exercise in.",
        audioUrl: null,
      },
      {
        questionKey: "stress",
        question: "What's your stress level?",
        answer: "Moderate stress from work deadlines, but manageable. Taking breaks helps.",
        audioUrl: null,
      },
    ],
  },
  {
    id: "mock-2",
    date: new Date(Date.now() - 172800000), // 2 days ago
    completed: 8,
    entries: [
      {
        questionKey: "mood",
        question: "How are you feeling today?",
        answer: "A bit tired but optimistic. Looking forward to the weekend.",
        audioUrl: null,
      },
      {
        questionKey: "activity",
        question: "What activities did you do today?",
        answer: "Went for a walk in the park, did some reading, and caught up with a friend over coffee.",
        audioUrl: null,
      },
    ],
  },
  {
    id: "mock-3",
    date: new Date(Date.now() - 259200000), // 3 days ago
    completed: 8,
    entries: [
      {
        questionKey: "mood",
        question: "How are you feeling today?",
        answer: "Feeling energized and motivated. Started a new project that I'm excited about.",
        audioUrl: null,
      },
      {
        questionKey: "relationships",
        question: "How are your relationships?",
        answer: "Had a great conversation with my family. Feeling connected and supported.",
        audioUrl: null,
      },
    ],
  },
]

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (MOCK_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate loading
        setSessions(MOCK_SESSIONS)
        setIsLoading(false)
      } else {
        try {
          const response = await fetch("/api/journal/history")

          if (!response.ok) {
            throw new Error("Failed to fetch history")
          }

          const data = await response.json()
          setSessions(data.sessions)
        } catch (error) {
          console.error("[v0] Error fetching history:", error)
          setSessions(MOCK_SESSIONS)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchHistory()
  }, [])

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/chat">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to chat</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h1 className="font-semibold">Journal History</h1>
              {MOCK_MODE && (
                <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                  Demo Mode
                </span>
              )}
            </div>
          </div>
          <Button asChild>
            <Link href="/chat">
              <Plus className="mr-2 h-4 w-4" />
              New entry
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading your journal entries...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">No journal entries yet</h2>
              <p className="text-sm text-muted-foreground">Start your first daily reflection to see it here</p>
            </div>
            <Button asChild>
              <Link href="/chat">
                <Plus className="mr-2 h-4 w-4" />
                Start journaling
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {sessions.map((session) => (
              <JournalCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
