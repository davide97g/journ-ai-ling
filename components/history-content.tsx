"use client";

import { JournalCard } from "@/components/journal-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isSameDay } from "date-fns";
import { BookOpen, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Session {
  id: string;
  date: Date;
  updatedAt: Date;
  completed: number;
  starred: number;
  entries: Array<{
    questionKey: string;
    question: string;
    answer: string;
    audioUrl: string | null;
  }>;
}

export function HistoryContent({
  onlyStarred = false,
}: {
  onlyStarred?: boolean;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(
          `/api/journal/history?onlyStarred=${onlyStarred}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await response.json();
        // Sort sessions by date (newest first) and then by updatedAt
        const sortedSessions = data.sessions.sort((a: Session, b: Session) => {
          const dateComparison =
            new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateComparison === 0) {
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          }
          return dateComparison;
        });
        setSessions(sortedSessions);
      } catch (error) {
        console.error("Error fetching history:", error);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    setDeletingSessionId(sessionToDelete.id);
    try {
      const response = await fetch(
        `/api/journal/session/${sessionToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      // Remove the session from the local state
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsDeleting(false);
      setDeletingSessionId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  // Filter sessions based on selected date
  const filteredSessions = selectedDate
    ? sessions.filter((session) =>
        isSameDay(new Date(session.date), selectedDate)
      )
    : sessions;

  // Get dates that have journal entries for calendar highlighting
  const getDatesWithEntries = () => {
    return sessions.map((session) => new Date(session.date));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(undefined);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">
            {onlyStarred ? "Starred Journal Entries" : "Journal History"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "MMM d, yyyy")
                  : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={{
                  hasEntries: getDatesWithEntries(),
                }}
                modifiersStyles={{
                  hasEntries: {
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  },
                }}
                className="rounded-lg border shadow-sm"
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button variant="ghost" size="sm" onClick={clearDateFilter}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button asChild>
            <Link href="/chat">
              <Plus className="mr-2 h-4 w-4" />
              New entry
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">
              Loading your journal entries...
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {selectedDate
                  ? "No entries for this date"
                  : "No journal entries yet"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedDate
                  ? "Try selecting a different date or start a new entry"
                  : "Start your first daily reflection to see it here"}
              </p>
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
            {filteredSessions.map((session) => (
              <JournalCard
                key={session.id}
                session={{
                  ...session,
                  updatedAt: session.updatedAt || session.date, // Fallback to date if updatedAt is missing
                }}
                onDelete={handleDeleteClick}
                isDeleting={deletingSessionId === session.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action
              cannot be undone. All your thoughts and reflections from this
              session will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
