import { db } from "@/lib/db";
import { userQuestions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET - Fetch questions for the current user
export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active questions for the user, ordered by order field
    const questions = await db
      .select()
      .from(userQuestions)
      .where(
        and(eq(userQuestions.userId, user.id), eq(userQuestions.isActive, 1))
      )
      .orderBy(asc(userQuestions.order));

    console.log("questions", questions);

    // If user has no questions, copy default questions
    if (questions.length === 0) {
      // Copy default questions to this user
      await db.execute(`
        INSERT INTO user_questions (user_id, question, "order", is_active, created_at, updated_at)
        SELECT 
          '${user.id}'::uuid,
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
        .where(eq(userQuestions.userId, user.id))
        .orderBy(asc(userQuestions.order));

      return NextResponse.json({ questions: newQuestions });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
