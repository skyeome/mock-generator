/**
 * AI-powered translation client
 */

import {
  TRANSLATION_SYSTEM_PROMPT,
  buildTranslationPrompt,
  TranslationEntry,
} from "./prompts";

export interface I18nTranslationConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  batchSize?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

const DEFAULT_CONFIG: Required<I18nTranslationConfig> = {
  model: "@cf/meta/llama-3.1-8b-instruct-fp8",
  maxTokens: 2048,
  temperature: 0.3,
  batchSize: 50,
  maxRetries: 3,
  retryDelayMs: 1000,
};

export class I18nTranslationClient {
  private config: Required<I18nTranslationConfig>;

  constructor(config: I18nTranslationConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Translate entries from source to target locale
   */
  async translate(
    params: {
      sourceLocale: string;
      targetLocale: string;
      entries: TranslationEntry[];
    },
    ai?: Ai,
  ): Promise<Map<string, string>> {
    const { sourceLocale, targetLocale, entries } = params;

    if (!ai) {
      throw new Error("AI binding not available");
    }

    if (entries.length === 0) {
      return new Map();
    }

    const results = new Map<string, string>();

    // Batch entries according to batchSize
    const batches = this.createBatches(entries, this.config.batchSize);

    for (const batch of batches) {
      const batchResults = await this.translateBatch(
        { sourceLocale, targetLocale, entries: batch },
        ai,
      );

      // Merge batch results into final map
      for (const [key, value] of batchResults.entries()) {
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Translate a single batch with retry logic
   */
  private async translateBatch(
    params: {
      sourceLocale: string;
      targetLocale: string;
      entries: TranslationEntry[];
    },
    ai: Ai,
  ): Promise<Map<string, string>> {
    const { sourceLocale, targetLocale, entries } = params;

    const prompt = buildTranslationPrompt({
      sourceLocale,
      targetLocale,
      entries,
    });

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await ai.run(
          this.config.model as Parameters<Ai["run"]>[0],
          {
            messages: [
              { role: "system", content: TRANSLATION_SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
          },
        );

        const translated = this.parseResponse(response);
        return translated;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelayMs);
        }
      }
    }

    throw lastError || new Error("Translation failed");
  }

  /**
   * Parse AI response and extract translations
   */
  private parseResponse(response: unknown): Map<string, string> {
    // Handle Cloudflare response format
    let content: string;
    if (typeof response === "object" && response !== null) {
      const resp = response as { response?: string; content?: string };
      content = resp.response || resp.content || JSON.stringify(response);
    } else if (typeof response === "string") {
      content = response;
    } else {
      throw new Error("Invalid response type from AI");
    }

    let jsonText = content.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
    }

    const parsed = JSON.parse(jsonText);

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid translation response format");
    }

    const result = new Map<string, string>();

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * Split entries into batches
   */
  private createBatches(
    entries: TranslationEntry[],
    batchSize: number,
  ): TranslationEntry[][] {
    const batches: TranslationEntry[][] = [];

    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Delay utility for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
