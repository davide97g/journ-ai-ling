import { JOURNAL_QUESTIONS } from "@/lib/journal-questions";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

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
    modelProvider = "openai",
  } = body;

  // Get the current question
  const currentQuestion = JOURNAL_QUESTIONS[currentQuestionIndex];

  // Unified model configuration - easily extensible for future providers
  const getModel = (provider: string) => {
    switch (provider) {
      case "openai":
        if (!process.env.OPENAI_API_KEY) {
          throw new Error("OpenAI API key not configured");
        }
        return openai("gpt-4o-mini");

      // Future providers can be added here:
      // case "anthropic":
      //   return anthropic("claude-3-5-sonnet");
      // case "google":
      //   return google("gemini-1.5-pro");

      default:
        throw new Error(`Unsupported model provider: ${provider}`);
    }
  };

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
    const model = getModel(modelProvider);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: messages || [],
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[v0] Model configuration error:", error);
    return new Response(
      `Model configuration error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
