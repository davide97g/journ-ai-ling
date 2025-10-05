import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
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

    const { sessionId, starred } = await request.json();

    if (!sessionId || typeof starred !== "boolean") {
      return NextResponse.json(
        { error: "Missing sessionId or starred status" },
        { status: 400 }
      );
    }

    // Update the starred status
    const { data, error } = await supabase
      .from("journal_sessions")
      .update({
        starred: starred ? 1 : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating starred status:", error);
      return NextResponse.json(
        { error: "Failed to update starred status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      starred: data.starred === 1,
    });
  } catch (error) {
    console.error("Error in star route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
