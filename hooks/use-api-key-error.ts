import { useApiKey } from "@/hooks/use-api-key";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ApiKeyError {
  code: string;
  message: string;
}

/**
 * Hook per gestire automaticamente gli errori di API key
 * Mostra notifiche appropriate quando vengono rilevati errori di autenticazione
 */
export const useApiKeyError = () => {
  const { toast } = useToast();
  const { apiKeyStatus } = useApiKey();

  const handleApiKeyError = (error: ApiKeyError) => {
    switch (error.code) {
      case "API_KEY_ERROR":
        toast({
          title: "API Key Error",
          description:
            "Your API key is invalid or expired. Please update it in settings.",
          variant: "destructive",
          action: {
            label: "Go to Settings",
            onClick: () => {
              // Navigate to settings page
              window.location.href = "/dashboard/ai-settings";
            },
          },
        });
        break;

      case "NO_API_KEY":
        toast({
          title: "API Key Required",
          description:
            "Please configure your OpenAI API key to use AI features.",
          variant: "destructive",
          action: {
            label: "Configure Now",
            onClick: () => {
              window.location.href = "/dashboard/ai-settings";
            },
          },
        });
        break;

      case "API_KEY_RATE_LIMIT":
        toast({
          title: "Rate Limit Exceeded",
          description:
            "Your API key has reached its rate limit. Please try again later.",
          variant: "destructive",
        });
        break;

      default:
        toast({
          title: "API Error",
          description: error.message || "An error occurred with your API key.",
          variant: "destructive",
        });
    }
  };

  // Verifica automatica se l'utente ha una chiave API configurata
  useEffect(() => {
    if (!apiKeyStatus.hasKey) {
      // Non mostrare automaticamente il toast se l'utente non ha mai configurato una chiave
      // Questo evita spam di notifiche
      return;
    }
  }, [apiKeyStatus.hasKey]);

  return {
    handleApiKeyError,
  };
};
