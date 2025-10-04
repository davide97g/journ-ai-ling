import { db } from "@/lib/db";
import { journalSessions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const sessionId = (await params).id;

    // Get session details using Drizzle
    const session = await db
      .select()
      .from(journalSessions)
      .where(
        and(
          eq(journalSessions.id, sessionId),
          eq(journalSessions.userId, user.id)
        )
      )
      .limit(1);

    if (!session || session.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: session[0] });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const sessionId = (await params).id;

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

    // Delete the session using Drizzle (this will cascade delete messages due to foreign key)
    await db.delete(journalSessions).where(eq(journalSessions.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
