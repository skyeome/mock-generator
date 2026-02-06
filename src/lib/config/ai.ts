import type { AIConfig } from "../types/ai";

/**
 * Get AI configuration from environment variables
 */
export function getAIConfig(): AIConfig {
  const enabled = getEnvVar("AI_ENABLED", "true") === "true";
  const model = getEnvVar("AI_MODEL", "@cf/meta/llama-3.2-3b-instruct");
  const maxTokens = parseInt(getEnvVar("AI_MAX_TOKENS", "1024"), 10);
  const temperature = parseFloat(getEnvVar("AI_TEMPERATURE", "0.7"));
  const fallbackOnError = getEnvVar("AI_FALLBACK_ON_ERROR", "true") === "true";

  return {
    enabled,
    model,
    maxTokens,
    temperature,
    fallbackOnError,
  };
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string): string {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] as string;
  }
  return defaultValue;
}

/**
 * Validate AI configuration
 */
export function validateAIConfig(config: AIConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.maxTokens < 1 || config.maxTokens > 4096) {
    errors.push("maxTokens must be between 1 and 4096");
  }

  if (config.temperature < 0 || config.temperature > 2) {
    errors.push("temperature must be between 0 and 2");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
