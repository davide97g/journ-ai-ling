import { encrypt } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const saveApiKeySchema = z.object({
  key: z
    .string()
    .min(1, "API key is required")
    .startsWith("sk-", "API key should start with 'sk-'"),
});

export async function POST(req: Request) {
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

    // Valida il body della richiesta
    const body = await req.json();
    const { key } = saveApiKeySchema.parse(body);

    // Cripta la chiave API
    const encryptedKey = encrypt(key);

    // Salva la chiave criptata nel database
    const { error: dbError } = await supabase.from("api_keys").upsert({
      user_id: user.id,
      key_encrypted: encryptedKey,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key saved successfully",
    });
  } catch (error) {
    console.error("Error saving API key:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid API key format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
