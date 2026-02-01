import type { AISchemaAnalysis, AIConfig } from '../types/ai';
import { DEFAULT_AI_CONFIG } from '../types/ai';
import type { JsonSchema } from '../types';

/**
 * AI Service Client for Cloudflare Workers AI
 */
export class AIClient {
  private config: AIConfig;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
  }

  /**
   * Analyze a JSON schema using AI to detect semantic types
   */
  async analyzeSchema(
    schema: JsonSchema,
    ai: Ai // Cloudflare AI binding type
  ): Promise<AISchemaAnalysis | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      const prompt = this.buildPrompt(schema);

      const response = await ai.run(this.config.model as Parameters<Ai['run']>[0], {
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      return this.parseResponse(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      if (this.config.fallbackOnError) {
        return null;
      }
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are a data schema analyzer. Given a JSON schema, analyze each field and determine:
1. The semantic type (firstName, lastName, email, phone, url, city, country, price, date, etc.)
2. The domain context (e-commerce, social-media, healthcare, etc.)
3. Fields that should be coherent (e.g., firstName/lastName of same person)

Respond ONLY with valid JSON matching this exact schema:
{
  "domainContext": "string",
  "fieldHints": [
    {
      "fieldPath": "string (dot notation for nested)",
      "suggestedSemantic": "SemanticType",
      "confidence": 0.0-1.0,
      "relatedFields": ["optional array of related field paths"]
    }
  ],
  "coherenceGroups": [["fieldPath1", "fieldPath2"]]
}`;
  }

  private buildPrompt(schema: JsonSchema): string {
    return `Analyze this JSON schema and identify semantic types for each field:

${JSON.stringify(schema, null, 2)}

Identify the domain context and suggest appropriate semantic types for generating realistic mock data.`;
  }

  private parseResponse(response: unknown): AISchemaAnalysis | null {
    try {
      // Handle different response formats from Cloudflare AI
      let content: string;
      if (typeof response === 'object' && response !== null) {
        const resp = response as { response?: string; content?: string };
        content = resp.response || resp.content || JSON.stringify(response);
      } else {
        content = String(response);
      }

      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as AISchemaAnalysis;

      // Validate required fields
      if (!parsed.domainContext || !Array.isArray(parsed.fieldHints)) {
        console.error('Invalid AI response structure');
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return null;
    }
  }
}

/**
 * Create a singleton AI client instance
 */
export function createAIClient(config?: Partial<AIConfig>): AIClient {
  return new AIClient(config);
}
