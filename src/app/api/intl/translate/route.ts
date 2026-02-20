import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const isDev =
  typeof process !== "undefined" && process.env?.NODE_ENV === "development";

interface TranslateRequest {
  sourceLocale: string;
  targetLocale: string;
  entries: Array<{ key: string; value: string }>;
  context?: string; // User-provided context hint
  tone?: "formal" | "casual"; // Translation tone
}

interface TranslateResponse {
  success: boolean;
  translations?: Record<string, string>;
  error?: string;
  debugId?: string;
  fallback?: boolean;
  // New fields for partial success
  partial?: boolean;
  failedKeys?: string[];
  stats?: {
    totalChunks: number;
    successfulChunks: number;
  };
}

interface RequestDebugContext {
  requestId: string;
  provider: string;
}

function buildRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function sanitizeUrlForLog(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return "invalid-url";
  }
}

function describeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { type: typeof error, value: String(error) };
  }

  const details: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === "string") {
    details.code = maybeCode;
  }

  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof Error) {
    details.cause = {
      name: cause.name,
      message: cause.message,
      code: (cause as { code?: unknown }).code,
    };
  } else if (cause !== undefined) {
    details.cause = String(cause);
  }

  return details;
}

// Utility functions for chunking and timeout management
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000,
  shouldRetry: (error: Error) => boolean = () => true,
  debug?: {
    requestId: string;
    provider: string;
    chunkIndex?: number;
    totalChunks?: number;
  },
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const retryable = shouldRetry(lastError);
      console.warn("[intl-translate] Retry attempt failed", {
        requestId: debug?.requestId,
        provider: debug?.provider,
        chunkIndex: debug?.chunkIndex,
        totalChunks: debug?.totalChunks,
        attempt,
        maxAttempts,
        retryable,
        error: describeError(lastError),
      });

      if (!retryable) {
        throw lastError;
      }

      if (attempt < maxAttempts) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

function resolveGeminiModel(): string {
  return String(process.env?.GEMINI_MODEL ?? "gemini-3-flash-preview");
}

function isNonRetryableGeminiError(error: Error): boolean {
  const message = error.message;
  return (
    message.includes("Gemini API error: 400") ||
    message.includes("Gemini API error: 401") ||
    message.includes("Gemini API error: 403") ||
    message.includes("Gemini API error: 404")
  );
}

const buildSystemPrompt = (
  tone?: "formal" | "casual",
  context?: string,
): string => {
  let prompt = `You are a professional translator. Translate the given JSON key-value pairs.
Rules:
1. Output ONLY valid JSON with the translated values
2. Keep the same keys, only translate the string values
3. Preserve any placeholder tokens like {{name}}, {0}, $var exactly as-is
4. Do not add any extra keys or explanations
5. Ensure translations are natural and contextually appropriate`;

  if (tone) {
    prompt += `\n6. Use ${tone} tone in translations`;
  }

  if (context) {
    prompt += `\n\nAdditional context: ${context}`;
  }

  return prompt;
};

/**
 * Development: Call LM Studio at localhost:1234
 */
async function translateWithOpenAI(
  sourceLocale: string,
  targetLocale: string,
  entries: Array<{ key: string; value: string }>,
  tone?: "formal" | "casual",
  context?: string,
  debug?: RequestDebugContext,
): Promise<Record<string, string>> {
  const baseUrl = process.env?.OPENAI_BASE_URL || "http://localhost:1234/v1";
  const model = process.env?.OPENAI_MODEL || "gpt-oss-20b";
  const endpoint = `${baseUrl}/chat/completions`;

  const prompt = `Translate from ${sourceLocale} to ${targetLocale}:
${JSON.stringify(Object.fromEntries(entries.map((e) => [e.key, e.value])), null, 2)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt(tone, context) },
          { role: "user", content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });
  } catch (error) {
    console.error("[intl-translate] OpenAI fetch failed", {
      requestId: debug?.requestId,
      provider: debug?.provider,
      endpoint: sanitizeUrlForLog(endpoint),
      model,
      entries: entries.length,
      error: describeError(error),
    });
    throw error;
  }

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON in AI response");
  }

  const rawTranslations = JSON.parse(jsonMatch[0]) as Record<string, string>;

  // Filter out any masking token keys (e.g., __VAR_N__, __VAR_0__)
  const translations: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawTranslations)) {
    if (!key.startsWith("__VAR_") && !key.startsWith("__HTML_")) {
      translations[key] = value;
    }
  }

  return translations;
}

/**
 * Production: Use Cloudflare Workers AI binding
 */
async function translateWithCloudflare(
  sourceLocale: string,
  targetLocale: string,
  entries: Array<{ key: string; value: string }>,
  ai: Ai,
  tone?: "formal" | "casual",
  context?: string,
): Promise<Record<string, string>> {
  const prompt = `Translate from ${sourceLocale} to ${targetLocale}:
${JSON.stringify(Object.fromEntries(entries.map((e) => [e.key, e.value])), null, 2)}`;

  const response = await ai.run("@cf/meta/llama-3.1-8b-instruct-fp8" as any, {
    messages: [
      { role: "system", content: buildSystemPrompt(tone, context) },
      { role: "user", content: prompt },
    ],
    max_tokens: 2048,
    temperature: 0.3,
  });

  // Parse response
  const content =
    typeof response === "object" && response !== null
      ? (response as { response?: string }).response || JSON.stringify(response)
      : String(response);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON in AI response");
  }

  const rawTranslations = JSON.parse(jsonMatch[0]) as Record<string, string>;

  // Filter out any masking token keys (e.g., __VAR_N__, __VAR_0__)
  const translations: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawTranslations)) {
    if (!key.startsWith("__VAR_") && !key.startsWith("__HTML_")) {
      translations[key] = value;
    }
  }

  return translations;
}

interface ChunkedTranslationResult {
  translations: Record<string, string>;
  failedKeys: string[];
  totalChunks: number;
  successfulChunks: number;
}

/**
 * Gemini: Use Google Generative Language API (fastest)
 */
async function translateWithGemini(
  sourceLocale: string,
  targetLocale: string,
  entries: Array<{ key: string; value: string }>,
  tone?: "formal" | "casual",
  context?: string,
  debug?: RequestDebugContext,
): Promise<Record<string, string>> {
  const apiKey = process.env?.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  const model = resolveGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Translate from ${sourceLocale} to ${targetLocale}:
${JSON.stringify(Object.fromEntries(entries.map((e) => [e.key, e.value])), null, 2)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${buildSystemPrompt(tone, context)}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3,
        }
      }),
    });
  } catch (error) {
    console.error("[intl-translate] Gemini fetch failed", {
      requestId: debug?.requestId,
      provider: debug?.provider,
      model,
      entries: entries.length,
      error: describeError(error),
    });
    throw error;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("No content in Gemini response");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON in AI response");
  }

  const rawTranslations = JSON.parse(jsonMatch[0]) as Record<string, string>;

  // Filter out any masking token keys
  const translations: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawTranslations)) {
    if (!key.startsWith("__VAR_") && !key.startsWith("__HTML_")) {
      translations[key] = value;
    }
  }

  return translations;
}

/**
 * Chunked translation orchestrator for Gemini (optimized for speed)
 */
async function translateChunkedGemini(
  sourceLocale: string,
  targetLocale: string,
  entries: Array<{ key: string; value: string }>,
  tone?: "formal" | "casual",
  context?: string,
  debug?: RequestDebugContext,
): Promise<ChunkedTranslationResult> {
  const CHUNK_SIZE = 40;       // Gemini handles larger batches efficiently
  const TIMEOUT_MS = 15000;    // 15s timeout (Gemini is faster)
  const MAX_RETRIES = 2;       // Fewer retries needed
  const BASE_DELAY_MS = 500;   // Shorter backoff
  const chunks = chunkArray(entries, CHUNK_SIZE);

  const allTranslations: Record<string, string> = {};
  const failedKeys: string[] = [];
  let successfulChunks = 0;

  const results = await Promise.allSettled(
    chunks.map((chunk, chunkIndex) =>
      retryWithBackoff(
        () => withTimeout(
          translateWithGemini(sourceLocale, targetLocale, chunk, tone, context, debug),
          TIMEOUT_MS
        ),
        MAX_RETRIES,
        BASE_DELAY_MS,
        (error) => !isNonRetryableGeminiError(error),
        {
          requestId: debug?.requestId ?? "unknown",
          provider: debug?.provider ?? "gemini",
          chunkIndex,
          totalChunks: chunks.length,
        },
      )
    )
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      Object.assign(allTranslations, result.value);
      successfulChunks++;
    } else {
      console.error("[intl-translate] Gemini chunk failed after retries", {
        requestId: debug?.requestId,
        provider: debug?.provider,
        chunkIndex: i,
        totalChunks: chunks.length,
        error: describeError(result.reason),
      });
      failedKeys.push(...chunks[i].map(e => e.key));
    }
  }

  return {
    translations: allTranslations,
    failedKeys,
    totalChunks: chunks.length,
    successfulChunks,
  };
}

/**
 * Chunked translation orchestrator for Cloudflare AI
 */
async function translateChunked(
  sourceLocale: string,
  targetLocale: string,
  entries: Array<{ key: string; value: string }>,
  ai: Ai,
  tone?: "formal" | "casual",
  context?: string,
  debug?: RequestDebugContext,
): Promise<ChunkedTranslationResult> {
  const CHUNK_SIZE = 10;
  const TIMEOUT_MS = 25000;
  const chunks = chunkArray(entries, CHUNK_SIZE);

  const allTranslations: Record<string, string> = {};
  const failedKeys: string[] = [];
  let successfulChunks = 0;

  const results = await Promise.allSettled(
    chunks.map((chunk, chunkIndex) =>
      retryWithBackoff(
        () => withTimeout(
          translateWithCloudflare(sourceLocale, targetLocale, chunk, ai, tone, context),
          TIMEOUT_MS
        ),
        3,
        1000,
        undefined,
        {
          requestId: debug?.requestId ?? "unknown",
          provider: debug?.provider ?? "cloudflare",
          chunkIndex,
          totalChunks: chunks.length,
        },
      )
    )
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      Object.assign(allTranslations, result.value);
      successfulChunks++;
    } else {
      console.error("[intl-translate] Cloudflare chunk failed after retries", {
        requestId: debug?.requestId,
        provider: debug?.provider,
        chunkIndex: i,
        totalChunks: chunks.length,
        error: describeError(result.reason),
      });
      failedKeys.push(...chunks[i].map(e => e.key));
    }
  }

  return {
    translations: allTranslations,
    failedKeys,
    totalChunks: chunks.length,
    successfulChunks,
  };
}

/**
 * Chunked translation orchestrator for OpenAI
 */
async function translateChunkedOpenAI(
  sourceLocale: string,
  targetLocale: string,
  entries: Array<{ key: string; value: string }>,
  tone?: "formal" | "casual",
  context?: string,
  debug?: RequestDebugContext,
): Promise<ChunkedTranslationResult> {
  const CHUNK_SIZE = 10;
  const TIMEOUT_MS = 25000;
  const chunks = chunkArray(entries, CHUNK_SIZE);

  const allTranslations: Record<string, string> = {};
  const failedKeys: string[] = [];
  let successfulChunks = 0;

  const results = await Promise.allSettled(
    chunks.map((chunk, chunkIndex) =>
      retryWithBackoff(
        () => withTimeout(
          translateWithOpenAI(sourceLocale, targetLocale, chunk, tone, context, debug),
          TIMEOUT_MS
        ),
        3,
        1000,
        undefined,
        {
          requestId: debug?.requestId ?? "unknown",
          provider: debug?.provider ?? "openai",
          chunkIndex,
          totalChunks: chunks.length,
        },
      )
    )
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      Object.assign(allTranslations, result.value);
      successfulChunks++;
    } else {
      console.error("[intl-translate] OpenAI chunk failed after retries", {
        requestId: debug?.requestId,
        provider: debug?.provider,
        chunkIndex: i,
        totalChunks: chunks.length,
        error: describeError(result.reason),
      });
      failedKeys.push(...chunks[i].map(e => e.key));
    }
  }

  return {
    translations: allTranslations,
    failedKeys,
    totalChunks: chunks.length,
    successfulChunks,
  };
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<TranslateResponse>> {
  const requestId = buildRequestId();
  try {
    const body = (await request.json()) as TranslateRequest;
    const { sourceLocale, targetLocale, entries, context, tone } = body;

    // Validate request
    if (!sourceLocale || !targetLocale || !entries?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", debugId: requestId },
        { status: 400 },
      );
    }

    // Validate tone if provided
    if (tone && tone !== "formal" && tone !== "casual") {
      return NextResponse.json(
        { success: false, error: 'Invalid tone. Must be "formal" or "casual"', debugId: requestId },
        { status: 400 },
      );
    }

    // Determine provider: explicit env var > dev/prod default
    const provider = process.env?.AI_PROVIDER || (isDev ? 'openai' : 'cloudflare');
    const resolvedModel = provider === 'openai'
      ? (process.env?.OPENAI_MODEL || 'gpt-oss-20b')
      : provider === 'gemini'
        ? resolveGeminiModel()
        : (process.env?.CLOUDFLARE_MODEL || '@cf/meta/llama-3.1-8b-instruct-fp8');
    console.info("[intl-translate] Request started", {
      requestId,
      provider,
      model: resolvedModel,
      sourceLocale,
      targetLocale,
      entries: entries.length,
      hasTone: Boolean(tone),
      hasContext: Boolean(context),
    });

    const debug: RequestDebugContext = {
      requestId,
      provider,
    };

    if (provider === 'gemini') {
      // Use Google Gemini API (fastest)
      const apiKey = process.env?.GOOGLE_API_KEY;
      const model = resolveGeminiModel();

      if (!apiKey) {
        // Fallback to prefix-based translations
        const fallbackTranslations: Record<string, string> = {};
        for (const entry of entries) {
          fallbackTranslations[entry.key] = `[${targetLocale.toUpperCase()}] ${entry.value}`;
        }
        return NextResponse.json({
          success: true,
          translations: fallbackTranslations,
          debugId: requestId,
          fallback: true,
        });
      }

      const result = await translateChunkedGemini(
        sourceLocale,
        targetLocale,
        entries,
        tone,
        context,
        debug,
      );

      if (result.successfulChunks === 0) {
        // Gemini 완전 실패 시 Cloudflare AI로 폴백
        console.warn('Gemini translation failed (likely location restriction), falling back to Cloudflare AI');
        let ai: Ai | undefined;
        try {
          const ctx = await getCloudflareContext();
          ai = ctx.env?.AI;
        } catch {
          // AI binding not available
        }

        if (ai) {
          const cfResult = await translateChunked(sourceLocale, targetLocale, entries, ai, tone, context, {
            requestId,
            provider: "cloudflare",
          });
          if (cfResult.successfulChunks > 0) {
            return NextResponse.json({
              success: true,
              translations: cfResult.translations,
              debugId: requestId,
              partial: cfResult.failedKeys.length > 0,
              failedKeys: cfResult.failedKeys.length > 0 ? cfResult.failedKeys : undefined,
              stats: {
                totalChunks: cfResult.totalChunks,
                successfulChunks: cfResult.successfulChunks,
              },
            });
          }
        }

        return NextResponse.json(
          { success: false, error: "All translation chunks failed", debugId: requestId },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        translations: result.translations,
        debugId: requestId,
        partial: result.failedKeys.length > 0,
        failedKeys: result.failedKeys.length > 0 ? result.failedKeys : undefined,
        stats: {
          totalChunks: result.totalChunks,
          successfulChunks: result.successfulChunks,
        },
      });
    }

    if (provider === 'openai') {
      // Development: Use LM Studio with chunked processing
      const result = await translateChunkedOpenAI(
        sourceLocale,
        targetLocale,
        entries,
        tone,
        context,
        debug,
      );

      if (result.successfulChunks === 0) {
        // Complete failure
        return NextResponse.json(
          { success: false, error: "All translation chunks failed", debugId: requestId },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        translations: result.translations,
        debugId: requestId,
        partial: result.failedKeys.length > 0,
        failedKeys: result.failedKeys.length > 0 ? result.failedKeys : undefined,
        stats: {
          totalChunks: result.totalChunks,
          successfulChunks: result.successfulChunks,
        },
      });
    }

    // Cloudflare AI (production default)
    {
      let ai: Ai | undefined;
      try {
        const ctx = await getCloudflareContext();
        ai = ctx.env?.AI;
      } catch {
        // AI not available
      }

      if (!ai) {
        // Return fallback - entries with [TRANSLATE] prefix
        const fallbackTranslations: Record<string, string> = {};
        for (const entry of entries) {
          fallbackTranslations[entry.key] =
            `[${targetLocale.toUpperCase()}] ${entry.value}`;
        }
        return NextResponse.json({
          success: true,
          translations: fallbackTranslations,
          debugId: requestId,
          fallback: true,
        });
      }

      const result = await translateChunked(
        sourceLocale,
        targetLocale,
        entries,
        ai,
        tone,
        context,
        debug,
      );

      if (result.successfulChunks === 0) {
        // Complete failure
        return NextResponse.json(
          { success: false, error: "All translation chunks failed", debugId: requestId },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        translations: result.translations,
        debugId: requestId,
        partial: result.failedKeys.length > 0,
        failedKeys: result.failedKeys.length > 0 ? result.failedKeys : undefined,
        stats: {
          totalChunks: result.totalChunks,
          successfulChunks: result.successfulChunks,
        },
      });
    }
  } catch (error) {
    console.error("[intl-translate] Translation error", {
      requestId,
      error: describeError(error),
    });
    return NextResponse.json(
      { success: false, error: (error as Error).message, debugId: requestId },
      { status: 500 },
    );
  }
}
