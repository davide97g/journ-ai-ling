import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
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
    // Save the message to the messages table
    await db.insert(messages).values({
      sessionId,
      role: message.role,
      content: message.content,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[v0] Error saving message:", error);
    return Response.json({ error: "Failed to save message" }, { status: 500 });
  }
}
