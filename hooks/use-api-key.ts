import { useEffect, useState } from "react";

interface ApiKeyStatus {
  hasKey: boolean;
  keyPreview: string;
  createdAt: string | null;
}

interface UseApiKeyReturn {
  apiKeyStatus: ApiKeyStatus;
  isLoading: boolean;
  saveApiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
  deleteApiKey: () => Promise<{ success: boolean; error?: string }>;
  validateApiKey: () => Promise<{ success: boolean; error?: string }>;
}

export const useApiKey = (): UseApiKeyReturn => {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    hasKey: false,
    keyPreview: "",
    createdAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carica lo stato della chiave API
  const loadApiKeyStatus = async () => {
    try {
      const response = await fetch("/api/api-key/status");
      if (response.ok) {
        const data = await response.json();
        setApiKeyStatus(data);
      }
    } catch (error) {
      console.error("Error loading API key status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salva una nuova chiave API
  const saveApiKey = async (
    key: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/api-key/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (response.ok) {
        // Ricarica lo stato dopo il salvataggio
        await loadApiKeyStatus();
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Failed to save API key",
        };
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      return { success: false, error: "Network error" };
    }
  };

  // Elimina la chiave API
  const deleteApiKey = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const response = await fetch("/api/api-key/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        // Aggiorna lo stato locale
        setApiKeyStatus({
          hasKey: false,
          keyPreview: "",
          createdAt: null,
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Failed to delete API key",
        };
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      return { success: false, error: "Network error" };
    }
  };

  // Valida la chiave API
  const validateApiKey = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const response = await fetch("/api/api-key/use");
      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "API key validation failed",
        };
      }
    } catch (error) {
      console.error("Error validating API key:", error);
      return { success: false, error: "Network error" };
    }
  };

  // Carica lo stato iniziale
  useEffect(() => {
    loadApiKeyStatus();
  }, []);

  return {
    apiKeyStatus,
    isLoading,
    saveApiKey,
    deleteApiKey,
    validateApiKey,
  };
};
