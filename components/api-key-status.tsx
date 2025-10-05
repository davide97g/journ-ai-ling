"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/hooks/use-api-key";
import { AlertTriangle, CheckCircle, Key, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ApiKeyStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const ApiKeyStatus = ({
  showDetails = false,
  className = "",
}: ApiKeyStatusProps) => {
  const { apiKeyStatus, isLoading, validateApiKey } = useApiKey();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validateApiKey();
      setValidationResult({
        isValid: result.success,
        message: result.success
          ? "API key is valid"
          : result.error || "Validation failed",
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "Validation error",
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!apiKeyStatus.hasKey) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            No API key configured. Configure your OpenAI API key to use AI
            features.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/ai-settings">
              <Key className="h-4 w-4 mr-2" />
              Configure
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">API Key Configured</span>
        <Badge variant="secondary" className="text-xs">
          {apiKeyStatus.keyPreview}
        </Badge>
      </div>

      {showDetails && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {apiKeyStatus.createdAt && (
              <span>
                Saved on {new Date(apiKeyStatus.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900 mr-2"></div>
              ) : (
                <CheckCircle className="h-3 w-3 mr-2" />
              )}
              {isValidating ? "Validating..." : "Validate Key"}
            </Button>

            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/ai-settings">
                <Key className="h-3 w-3 mr-2" />
                Manage
              </Link>
            </Button>
          </div>

          {validationResult && (
            <div
              className={`flex items-center gap-2 text-xs ${
                validationResult.isValid ? "text-green-600" : "text-red-600"
              }`}
            >
              {validationResult.isValid ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {validationResult.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
