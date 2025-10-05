import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Headphones,
  MessageSquare,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface JournalCardProps {
  session: {
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
  };
  onDelete?: (session: JournalCardProps["session"]) => void;
  isDeleting?: boolean;
}

export function JournalCard({
  session,
  onDelete,
  isDeleting = false,
}: JournalCardProps) {
  const [isStarring, setIsStarring] = useState(false);
  const [starred, setStarred] = useState(session.starred === 1);

  const formattedDate = format(new Date(session.date), "EEEE, MMMM d, yyyy");
  const formattedUpdatedAt = format(
    new Date(session.updatedAt),
    "MMM d, yyyy 'at' h:mm a"
  );
  const isComplete = session.completed === 8;
  const hasAudio = session.entries.some((entry) => entry.audioUrl);

  const handleToggleStar = async () => {
    if (isStarring) return;

    setIsStarring(true);
    try {
      const response = await fetch("/api/journal/star", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
          starred: !starred,
        }),
      });

      if (response.ok) {
        setStarred(!starred);
      } else {
        console.error("Failed to toggle star status");
      }
    } catch (error) {
      console.error("Error toggling star status:", error);
    } finally {
      setIsStarring(false);
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">{formattedDate}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {hasAudio && (
                <Badge variant="outline" className="gap-1">
                  <Headphones className="h-3 w-3" />
                  Audio
                </Badge>
              )}
              {isComplete && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleStar}
                disabled={isStarring}
                className={`h-8 w-8 transition-colors ${
                  starred
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-muted-foreground hover:text-yellow-500"
                } disabled:opacity-50`}
              >
                {isStarring ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Star
                    className={`h-4 w-4 ${starred ? "fill-current" : ""}`}
                  />
                )}
                <span className="sr-only">
                  {isStarring
                    ? "Updating star status..."
                    : starred
                    ? "Remove from favorites"
                    : "Add to favorites"}
                </span>
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(session)}
                  disabled={isDeleting}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isDeleting ? "Deleting session..." : "Delete session"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
        <CardDescription>
          {session.completed} of 8 questions answered • Last updated{" "}
          {formattedUpdatedAt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {session.entries.slice(0, 2).map((entry, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {entry.question}
              </p>
              <p className="line-clamp-2 text-sm leading-relaxed">
                {entry.answer}
              </p>
              {entry.audioUrl && (
                <audio
                  src={entry.audioUrl}
                  controls
                  className="h-8 w-full"
                  preload="metadata"
                />
              )}
            </div>
          ))}
          {session.entries.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{session.entries.length - 2} more{" "}
              {session.entries.length - 2 === 1 ? "entry" : "entries"}
            </p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Badge
            asChild
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Link
              href={`/chat?id=${session.id}`}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Vedi Dettagli
            </Link>
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer transition-colors ${
              starred
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                : "hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200"
            }`}
            onClick={handleToggleStar}
          >
            <Star className={`h-3 w-3 ${starred ? "fill-current" : ""}`} />
            {starred ? "Preferito" : "Aggiungi ai Preferiti"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
