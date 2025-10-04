import { JOURNAL_QUESTIONS } from "@/lib/journal-questions";
import { createClient } from "@/lib/supabase/server";
import { Ollama } from "ollama";

export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    messages,
    sessionId,
    currentQuestionIndex,
    model = "llama3.2",
  } = body;

  // Get the current question
  const currentQuestion = JOURNAL_QUESTIONS[currentQuestionIndex];

  // System prompt for the AI
  const systemPrompt = `You are "Collector", an empathetic AI journaling companion. You're helping the user reflect on their day through a structured conversation.

Current question focus: ${currentQuestion.question}

Guidelines:
- Be warm, empathetic, and encouraging
- Ask follow-up questions to help them reflect deeper
- Keep responses concise (2-3 sentences)
- When they've shared enough, acknowledge their response and naturally transition by saying something like "Thank you for sharing. Let's move on to the next question."
- Don't be overly formal or clinical
- Show genuine interest in their wellbeing`;

  try {
    const ollama = new Ollama({
      host: process.env.OLLAMA_HOST || "http://localhost:11434",
    });

    // Convert messages to Ollama format
    const ollamaMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await ollama.chat({
      model,
      messages: ollamaMessages,
      stream: true,
    });

    // Convert Ollama stream to AI SDK format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.message?.content) {
              const data = JSON.stringify({
                type: "text-delta",
                textDelta: chunk.message.content,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("[v0] Ollama streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[v0] Ollama error:", error);
    return new Response(
      `Ollama error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
