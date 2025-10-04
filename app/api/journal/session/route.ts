import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { journalSessions } from "@/lib/db/schema"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Session creation - Auth check:", { user: user?.id, authError })

    if (authError || !user) {
      console.error("[v0] Auth error:", authError)
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Creating session for user:", user.id)
    const [session] = await db
      .insert(journalSessions)
      .values({
        userId: user.id,
        date: new Date(),
        completed: 0,
      })
      .returning()

    console.log("[v0] Session created successfully:", session.id)
    return Response.json({ session })
  } catch (error) {
    console.error("[v0] Error creating session:", error)
    return Response.json(
      {
        error: "Failed to create session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
