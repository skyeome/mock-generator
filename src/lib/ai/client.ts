import type { AISchemaAnalysis, AIConfig } from '../types/ai';
import { DEFAULT_AI_CONFIG } from '../types/ai';
import type { JsonSchema } from '../types';
import { SCHEMA_ANALYSIS_SYSTEM_PROMPT, buildSchemaPrompt } from './prompts';

const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

/**
 * AI Service Client
 * - Development: Uses OpenAI-compatible API at localhost:1234 (LM Studio)
 * - Production: Uses Cloudflare Workers AI
 */
export class AIClient {
  private config: AIConfig;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
  }

  async analyzeSchema(schema: JsonSchema, ai?: Ai): Promise<AISchemaAnalysis | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      if (isDev) {
        return await this.analyzeWithOpenAI(schema);
      } else {
        return await this.analyzeWithCloudflare(schema, ai);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      if (this.config.fallbackOnError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Development: Call LM Studio at localhost:1234
   */
  private async analyzeWithOpenAI(schema: JsonSchema): Promise<AISchemaAnalysis | null> {
    const baseUrl = process.env?.OPENAI_BASE_URL || 'http://localhost:1234/v1';
    const model = process.env?.OPENAI_MODEL || 'gpt-oss-20b';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SCHEMA_ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: buildSchemaPrompt(schema as unknown as Record<string, unknown>) },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    return content ? this.parseResponse(content) : null;
  }

  /**
   * Production: Use Cloudflare Workers AI binding
   */
  private async analyzeWithCloudflare(schema: JsonSchema, ai?: Ai): Promise<AISchemaAnalysis | null> {
    if (!ai) {
      console.error('Cloudflare AI binding not available');
      return null;
    }

    const response = await ai.run(this.config.model as Parameters<Ai['run']>[0], {
      messages: [
        { role: 'system', content: SCHEMA_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: buildSchemaPrompt(schema as unknown as Record<string, unknown>) },
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    // Handle Cloudflare response format
    let content: string;
    if (typeof response === 'object' && response !== null) {
      const resp = response as { response?: string; content?: string };
      content = resp.response || resp.content || JSON.stringify(response);
    } else {
      content = String(response);
    }

    return this.parseResponse(content);
  }

  private parseResponse(content: string): AISchemaAnalysis | null {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as AISchemaAnalysis;

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

export function createAIClient(config?: Partial<AIConfig>): AIClient {
  return new AIClient(config);
}
