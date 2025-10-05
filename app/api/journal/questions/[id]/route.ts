import { db } from "@/lib/db";
import { userQuestions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// PUT - Update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { question, order } = await request.json();

    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Update the question
    const [updatedQuestion] = await db
      .update(userQuestions)
      .set({
        question: question.trim(),
        order: order || undefined,
        updatedAt: new Date(),
      })
      .where(
        and(eq(userQuestions.id, params.id), eq(userQuestions.userId, user.id))
      )
      .returning();

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete the question
    const [deletedQuestion] = await db
      .delete(userQuestions)
      .where(
        and(eq(userQuestions.id, params.id), eq(userQuestions.userId, user.id))
      )
      .returning();

    if (!deletedQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
