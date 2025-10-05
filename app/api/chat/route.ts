import { JournalMessage } from "@/app/chat/page";
import { getUserApiKey } from "@/lib/api-key-service";
import { db } from "@/lib/db";
import { userQuestions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { and, asc, eq } from "drizzle-orm";

export const maxDuration = 30;

// Function to fetch user questions directly from database
async function fetchUserQuestions(userId: string) {
  try {
    // Get all active questions for the user, ordered by order field
    const questions = await db
      .select()
      .from(userQuestions)
      .where(
        and(eq(userQuestions.userId, userId), eq(userQuestions.isActive, 1))
      )
      .orderBy(asc(userQuestions.order));

    console.log("questions", questions);

    // If user has no questions, copy default questions
    if (questions.length === 0) {
      // Copy default questions to this user
      await db.execute(`
        INSERT INTO user_questions (user_id, question, "order", is_active, created_at, updated_at)
        SELECT 
          '${userId}'::uuid,
          question,
          "order",
          is_active,
          NOW(),
          NOW()
        FROM user_questions 
        WHERE user_id = '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid
        AND is_active = 1
        ORDER BY "order"
      `);

      // Fetch the newly copied questions
      const newQuestions = await db
        .select()
        .from(userQuestions)
        .where(eq(userQuestions.userId, userId))
        .orderBy(asc(userQuestions.order));

      return newQuestions;
    }

    return questions;
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return [];
  }
}

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

  const userQuestions = await fetchUserQuestions(user.id);
  // Get the current question
  const currentQuestion = userQuestions[currentQuestionIndex];
  console.log("[Chat API] Current question:", {
    index: currentQuestionIndex,
    question: currentQuestion.question,
  });

  // Unified model configuration - easily extensible for future providers
  const getModel = async (provider: string) => {
    console.log("[Chat API] Getting model for provider:", provider);
    switch (provider) {
      case "openai":
        // Recupera e valida la chiave API dell'utente
        const apiKeyResult = await getUserApiKey();
        if (!apiKeyResult.isValid) {
          console.error(
            "[Chat API] API key validation failed:",
            apiKeyResult.error
          );
          throw new Error(apiKeyResult.error || "API key validation failed");
        }

        console.log(
          "[Chat API] Using OpenAI model: gpt-4o-mini with user's API key"
        );

        const openai = createOpenAI({
          apiKey: apiKeyResult.apiKey,
        });
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
    const model = await getModel(modelProvider);

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

    // Gestione specifica degli errori di API key
    if (error instanceof Error && error.message.includes("API key")) {
      return new Response(
        JSON.stringify({
          error: "API key error",
          message: error.message,
          code: "API_KEY_ERROR",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      `Model configuration error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
