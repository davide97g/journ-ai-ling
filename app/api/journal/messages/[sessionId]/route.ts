import { db } from "@/lib/db";
import { journalSessions, messages } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.sessionId;

    // Check if user owns the session using Drizzle
    const session = await db
      .select({ userId: journalSessions.userId })
      .from(journalSessions)
      .where(eq(journalSessions.id, sessionId))
      .limit(1);

    if (!session || session.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session[0].userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get messages for the session using Drizzle
    const messagesData = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);

    // Convert to the format expected by the frontend
    const formattedMessages = messagesData.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
