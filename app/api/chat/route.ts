import { JournalMessage } from "@/app/chat/page";
import { JOURNAL_QUESTIONS } from "@/lib/journal-questions";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log("[Chat API] Starting chat request");

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[Chat API] Unauthorized request - no user");
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { messages }: { messages: JournalMessage[] } = body;
  const { modelProvider = "openai" } = body;

  const sessionId =
    messages.length > 0 ? messages[messages.length - 1].sessionId : null;
  const currentQuestionIndex =
    messages.length > 0
      ? messages[messages.length - 1].currentQuestionIndex
      : 0;

  console.log("[Chat API] Request details:", {
    sessionId,
    currentQuestionIndex,
    modelProvider,
    messageCount: messages?.length || 0,
    userId: user.id,
  });

  // Get the current question
  const currentQuestion = JOURNAL_QUESTIONS[currentQuestionIndex];
  console.log("[Chat API] Current question:", {
    index: currentQuestionIndex,
    question: currentQuestion.question,
  });

  // Unified model configuration - easily extensible for future providers
  const getModel = (provider: string) => {
    console.log("[Chat API] Getting model for provider:", provider);
    switch (provider) {
      case "openai":
        if (!process.env.OPENAI_API_KEY) {
          console.error("[Chat API] OpenAI API key not configured");
          throw new Error("OpenAI API key not configured");
        }
        console.log("[Chat API] Using OpenAI model: gpt-4o-mini");
        return openai("gpt-4o-mini");

      // Future providers can be added here:
      // case "anthropic":
      //   return anthropic("claude-3-5-sonnet");
      // case "google":
      //   return google("gemini-1.5-pro");

      default:
        console.error("[Chat API] Unsupported model provider:", provider);
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

    console.log("[Chat API] Starting streamText generation");
    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
    });

    console.log(
      "[Chat API] StreamText created, returning UI message stream response"
    );
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Chat API] Model configuration error:", error);
    return new Response(
      `Model configuration error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
