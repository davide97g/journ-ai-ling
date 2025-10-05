import { db } from "@/lib/db";
import { userQuestions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all default questions
export async function GET(request: NextRequest) {
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

    // Get all questions for the user, ordered by order field
    const questions = await db
      .select()
      .from(userQuestions)
      .where(eq(userQuestions.userId, user.id))
      .orderBy(asc(userQuestions.order));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST - Create a new question
export async function POST(request: NextRequest) {
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

    const { question } = await request.json();

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

    // Get the highest order number for this user
    const existingQuestions = await db
      .select({ order: userQuestions.order })
      .from(userQuestions)
      .where(eq(userQuestions.userId, user.id))
      .orderBy(asc(userQuestions.order));

    const nextOrder =
      existingQuestions.length > 0
        ? Math.max(...existingQuestions.map((q) => q.order)) + 1
        : 1;

    // Create the new question
    const [newQuestion] = await db
      .insert(userQuestions)
      .values({
        userId: user.id,
        question: question.trim(),
        order: nextOrder,
        isActive: 1,
      })
      .returning();

    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
