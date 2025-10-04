import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Daily Journaling with AI</h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Reflect on your day through guided conversations. Track your mood, stress, activities, and more with an
            empathetic AI companion.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
