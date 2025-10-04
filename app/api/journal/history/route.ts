import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { journalSessions, journalEntries } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    // Get all sessions for the user
    const sessions = await db
      .select()
      .from(journalSessions)
      .where(eq(journalSessions.userId, user.id))
      .orderBy(desc(journalSessions.date))

    // Get entries for each session
    const sessionsWithEntries = await Promise.all(
      sessions.map(async (session) => {
        const entries = await db.select().from(journalEntries).where(eq(journalEntries.sessionId, session.id))

        return {
          ...session,
          entries,
        }
      }),
    )

    return Response.json({ sessions: sessionsWithEntries })
  } catch (error) {
    console.error("[v0] Error fetching history:", error)
    return Response.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
