import { decrypt } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";

export interface ApiKeyValidationResult {
  isValid: boolean;
  apiKey?: string;
  error?: string;
}

/**
 * Recupera e valida la chiave API dell'utente autenticato
 */
export async function getUserApiKey(): Promise<ApiKeyValidationResult> {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        isValid: false,
        error: "User not authenticated",
      };
    }

    // Recupera la chiave API criptata
    const { data, error } = await supabase
      .from("api_keys")
      .select("key_encrypted")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return {
        isValid: false,
        error: "No API key found for user",
      };
    }

    // Decripta la chiave API
    let apiKey: string;
    try {
      apiKey = decrypt(data.key_encrypted);
    } catch (decryptError) {
      console.error("Error decrypting API key:", decryptError);
      return {
        isValid: false,
        error: "Failed to decrypt API key",
      };
    }

    // Valida la chiave API con OpenAI
    const validationResult = await validateApiKeyWithOpenAI(apiKey);

    if (!validationResult.isValid) {
      return {
        isValid: false,
        error: validationResult.error || "API key validation failed",
      };
    }

    return {
      isValid: true,
      apiKey,
    };
  } catch (error) {
    console.error("Error getting user API key:", error);
    return {
      isValid: false,
      error: "Internal server error",
    };
  }
}

/**
 * Valida una chiave API con OpenAI
 */
async function validateApiKeyWithOpenAI(
  apiKey: string
): Promise<ApiKeyValidationResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          isValid: false,
          error: "Invalid API key",
        };
      }

      if (response.status === 429) {
        return {
          isValid: false,
          error: "API key rate limit exceeded",
        };
      }

      return {
        isValid: false,
        error: `OpenAI API error: ${response.status}`,
      };
    }

    // Verifica che la risposta contenga modelli validi
    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      return {
        isValid: false,
        error: "Invalid response from OpenAI API",
      };
    }

    return {
      isValid: true,
      apiKey,
    };
  } catch (error) {
    console.error("Error validating API key with OpenAI:", error);
    return {
      isValid: false,
      error: "Failed to validate API key with OpenAI",
    };
  }
}

/**
 * Crea un'istanza OpenAI configurata con la chiave API dell'utente
 */
export async function createOpenAIClient() {
  const apiKeyResult = await getUserApiKey();

  if (!apiKeyResult.isValid || !apiKeyResult.apiKey) {
    throw new Error(apiKeyResult.error || "Failed to get valid API key");
  }

  return {
    apiKey: apiKeyResult.apiKey,
    // Possiamo aggiungere altre configurazioni qui se necessario
  };
}
