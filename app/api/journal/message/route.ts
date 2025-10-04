import { db } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { sessionId, message, currentQuestionIndex } = await req.json();

  try {
    // Save the message as a journal entry
    await db.insert(journalEntries).values({
      sessionId,
      questionKey: `message_${message.role}_${Date.now()}`,
      question:
        message.role === "assistant" ? "Assistant Response" : "User Message",
      answer: message.content,
      audioUrl: null,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[v0] Error saving message:", error);
    return Response.json({ error: "Failed to save message" }, { status: 500 });
  }
}
