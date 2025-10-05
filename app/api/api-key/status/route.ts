import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Controlla se l'utente ha una chiave API salvata
    const { data, error } = await supabase
      .from("api_keys")
      .select("created_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to check API key status" },
        { status: 500 }
      );
    }

    const hasKey = !!data;
    const keyPreview = hasKey
      ? `sk-...${data.created_at.toString().slice(-4)}`
      : "";

    return NextResponse.json({
      hasKey,
      keyPreview,
      createdAt: data?.created_at || null,
    });
  } catch (error) {
    console.error("Error checking API key status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
