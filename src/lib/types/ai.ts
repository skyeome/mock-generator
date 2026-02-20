import type { SemanticType } from "./schema";

/**
 * Hint for a single field from AI analysis
 */
export interface AISemanticHint {
  fieldPath: string;
  suggestedSemantic: SemanticType;
  confidence: number; // 0-1
  reasoning?: string;
  relatedFields?: string[]; // Fields that should be coherent
}

/**
 * Complete AI analysis result for a schema
 */
export interface AISchemaAnalysis {
  domainContext: string; // e.g., "e-commerce", "social-media"
  fieldHints: AISemanticHint[];
  coherenceGroups: string[][]; // Fields that should be generated together
}

/**
 * Supported AI providers
 */
export type AIProvider = 'openai' | 'cloudflare' | 'gemini';

/**
 * Default models for each provider
 */
export const PROVIDER_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-3-flash-preview',
  openai: 'gpt-4o-mini',
  cloudflare: '@cf/meta/llama-3.1-8b-instruct-fp8',
};

/**
 * Configuration for AI service
 */
export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  maxTokens: number;
  temperature: number;
  fallbackOnError: boolean;
}

/**
 * Default AI configuration
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: true,
  provider: 'gemini',
  maxTokens: 1024,
  temperature: 0.7,
  fallbackOnError: true,
};
