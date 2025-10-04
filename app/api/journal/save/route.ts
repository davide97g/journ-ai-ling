import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { journalSessions, journalEntries } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { sessionId, entries, completed } = await req.json()

  try {
    // Update session completion status
    await db
      .update(journalSessions)
      .set({
        completed,
        updatedAt: new Date(),
      })
      .where(eq(journalSessions.id, sessionId))

    // Save entries
    for (const entry of entries) {
      await db.insert(journalEntries).values({
        sessionId,
        questionKey: entry.questionKey,
        question: entry.question,
        answer: entry.answer,
        audioUrl: entry.audioUrl || null,
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving journal:", error)
    return Response.json({ error: "Failed to save journal" }, { status: 500 })
  }
}
