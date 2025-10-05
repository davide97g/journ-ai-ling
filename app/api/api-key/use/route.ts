import { decrypt } from "@/lib/crypto";
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

    // Recupera la chiave API criptata
    const { data, error } = await supabase
      .from("api_keys")
      .select("key_encrypted")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "No API key found" }, { status: 404 });
    }

    // Decripta la chiave API
    const apiKey = decrypt(data.key_encrypted);

    // Esempio di utilizzo: verifica che la chiave sia valida con OpenAI
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Invalid API key", status: response.status },
          { status: 400 }
        );
      }

      const models = await response.json();

      return NextResponse.json({
        success: true,
        keyValid: true,
        modelsCount: models.data?.length || 0,
      });
    } catch (fetchError) {
      console.error("Error validating API key:", fetchError);
      return NextResponse.json(
        { error: "Failed to validate API key" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error using API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
