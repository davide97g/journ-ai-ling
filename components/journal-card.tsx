import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, Headphones } from "lucide-react"
import { format } from "date-fns"

interface JournalCardProps {
  session: {
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
}

export function JournalCard({ session }: JournalCardProps) {
  const formattedDate = format(new Date(session.date), "EEEE, MMMM d, yyyy")
  const isComplete = session.completed === 8
  const hasAudio = session.entries.some((entry) => entry.audioUrl)

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">{formattedDate}</CardTitle>
          </div>
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
        </div>
        <CardDescription>{session.completed} of 8 questions answered</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {session.entries.slice(0, 2).map((entry, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{entry.question}</p>
              <p className="line-clamp-2 text-sm leading-relaxed">{entry.answer}</p>
              {entry.audioUrl && <audio src={entry.audioUrl} controls className="h-8 w-full" preload="metadata" />}
            </div>
          ))}
          {session.entries.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{session.entries.length - 2} more {session.entries.length - 2 === 1 ? "entry" : "entries"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
