import { db } from "@/lib/db";
import { journalEntries, journalSessions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const onlyStarred =
    request.nextUrl.searchParams.get("onlyStarred") === "true";

  try {
    // Build the where condition
    const whereCondition = onlyStarred
      ? and(eq(journalSessions.userId, user.id), eq(journalSessions.starred, 1))
      : eq(journalSessions.userId, user.id);

    // Get all sessions for the user
    const sessions = await db
      .select()
      .from(journalSessions)
      .where(whereCondition)
      .orderBy(desc(journalSessions.date));

    // Get entries for each session
    const sessionsWithEntries = await Promise.all(
      sessions.map(async (session) => {
        const entries = await db
          .select()
          .from(journalEntries)
          .where(eq(journalEntries.sessionId, session.id));

        return {
          ...session,
          entries,
        };
      })
    );

    return Response.json({ sessions: sessionsWithEntries });
  } catch (error) {
    console.error("[v0] Error fetching history:", error);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
