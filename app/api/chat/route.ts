import { streamText, convertToModelMessages, type UIMessage, validateUIMessages } from "ai"
import { createClient } from "@/lib/supabase/server"
import { JOURNAL_QUESTIONS } from "@/lib/journal-questions"

export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const { messages, sessionId, currentQuestionIndex } = body

  const validatedMessages = await validateUIMessages<UIMessage>({
    messages: messages || [],
    tools: {},
  })

  // Get the current question
  const currentQuestion = JOURNAL_QUESTIONS[currentQuestionIndex]

  // System prompt for the AI
  const systemPrompt = `You are "Collector", an empathetic AI journaling companion. You're helping the user reflect on their day through a structured conversation.

Current question focus: ${currentQuestion.question}

Guidelines:
- Be warm, empathetic, and encouraging
- Ask follow-up questions to help them reflect deeper
- Keep responses concise (2-3 sentences)
- When they've shared enough, acknowledge their response and naturally transition by saying something like "Thank you for sharing. Let's move on to the next question."
- Don't be overly formal or clinical
- Show genuine interest in their wellbeing`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: convertToModelMessages(validatedMessages),
  })

  return result.toUIMessageStreamResponse()
}
