"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useApiKey } from "@/hooks/use-api-key";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface ApiKeyConfig {
  hasKey: boolean;
  keyPreview: string;
  createdAt: string | null;
}

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o", description: "Most capable model" },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Faster and cheaper",
  },
  {
    value: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    description: "High performance",
  },
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    description: "Fast and efficient",
  },
];

export function AiSettingsContent() {
  const [modelConfig, setModelConfig] =
    useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // Usa il nuovo hook per gestire le chiavi API
  const { apiKeyStatus, isLoading, saveApiKey, deleteApiKey, validateApiKey } =
    useApiKey();

  // Load model configuration on component mount
  useEffect(() => {
    const loadModelConfig = () => {
      try {
        const savedModelConfig = localStorage.getItem("ai-model-config");
        if (savedModelConfig) {
          setModelConfig(JSON.parse(savedModelConfig));
        }
      } catch (error) {
        console.error("Error loading model config:", error);
      }
    };

    loadModelConfig();
  }, []);

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    if (!newApiKey.startsWith("sk-")) {
      toast({
        title: "Error",
        description: "API key should start with 'sk-'",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveApiKey(newApiKey.trim());

      if (result.success) {
        setNewApiKey("");
        toast({
          title: "Success",
          description: "API key saved securely",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      const result = await deleteApiKey();

      if (result.success) {
        setNewApiKey("");
        toast({
          title: "Success",
          description: "API key removed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing API key:", error);
      toast({
        title: "Error",
        description: "Failed to remove API key",
        variant: "destructive",
      });
    }
  };

  const handleValidateApiKey = async () => {
    setIsValidating(true);
    try {
      const result = await validateApiKey();

      if (result.success) {
        toast({
          title: "Success",
          description: "API key is valid and working",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "API key validation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating API key:", error);
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveModelConfig = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("ai-model-config", JSON.stringify(modelConfig));
      toast({
        title: "Success",
        description: "Model configuration saved successfully",
      });
    } catch (error) {
      console.error("Error saving model config:", error);
      toast({
        title: "Error",
        description: "Failed to save model configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleModelConfigChange = (
    field: keyof ModelConfig,
    value: string | number
  ) => {
    setModelConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">AI Settings</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <h1 className="text-2xl font-semibold">AI Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* API Key Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              OpenAI API Key
            </CardTitle>
            <CardDescription>
              Configure your OpenAI API key for AI-powered journaling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeyStatus.hasKey ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {apiKeyStatus.keyPreview}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleValidateApiKey}
                      disabled={isValidating}
                      className="h-8"
                    >
                      {isValidating ? (
                        <XCircle className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      {isValidating ? "Validating..." : "Validate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveApiKey}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Your API key is encrypted and stored securely on our servers.
                  {apiKeyStatus.createdAt && (
                    <span className="block mt-1">
                      Saved on{" "}
                      {new Date(apiKeyStatus.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-9 w-9"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={!newApiKey.trim() || isSaving}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save API Key"}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Your API key will be encrypted and stored securely on our
                  servers.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
            <CardDescription>
              Configure the AI model parameters for your journaling experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={modelConfig.model}
                  onValueChange={(value) =>
                    handleModelConfigChange("model", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model">
                      {modelConfig.model && (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {
                              MODEL_OPTIONS.find(
                                (opt) => opt.value === modelConfig.model
                              )?.label
                            }
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    Temperature: {modelConfig.temperature}
                  </Label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={modelConfig.temperature}
                    onChange={(e) =>
                      handleModelConfigChange(
                        "temperature",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Controls randomness (0 = focused, 2 = creative)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">
                    Max Tokens: {modelConfig.maxTokens}
                  </Label>
                  <input
                    id="max-tokens"
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={modelConfig.maxTokens}
                    onChange={(e) =>
                      handleModelConfigChange(
                        "maxTokens",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Maximum response length
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="top-p">Top P: {modelConfig.topP}</Label>
                  <input
                    id="top-p"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelConfig.topP}
                    onChange={(e) =>
                      handleModelConfigChange(
                        "topP",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Controls diversity of responses
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency-penalty">
                    Frequency Penalty: {modelConfig.frequencyPenalty}
                  </Label>
                  <input
                    id="frequency-penalty"
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={modelConfig.frequencyPenalty}
                    onChange={(e) =>
                      handleModelConfigChange(
                        "frequencyPenalty",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Reduces repetition (-2 to 2)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveModelConfig} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
