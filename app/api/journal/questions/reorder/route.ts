import { db } from "@/lib/db";
import { userQuestions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// PUT - Reorder questions
export async function PUT(request: NextRequest) {
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

    const { questions } = await request.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Questions array is required" },
        { status: 400 }
      );
    }

    // Update the order for each question
    const updatePromises = questions.map(
      (question: { id: string; order: number }) =>
        db
          .update(userQuestions)
          .set({
            order: question.order,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userQuestions.id, question.id),
              eq(userQuestions.userId, user.id)
            )
          )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering questions:", error);
    return NextResponse.json(
      { error: "Failed to reorder questions" },
      { status: 500 }
    );
  }
}
