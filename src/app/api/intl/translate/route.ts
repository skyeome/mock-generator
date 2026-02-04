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
  fallback?: boolean;
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
): Promise<Record<string, string>> {
  const baseUrl = process.env?.OPENAI_BASE_URL || "http://localhost:1234/v1";
  const model = process.env?.OPENAI_MODEL || "gpt-oss-20b";

  const prompt = `Translate from ${sourceLocale} to ${targetLocale}:
${JSON.stringify(Object.fromEntries(entries.map((e) => [e.key, e.value])), null, 2)}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
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

export async function POST(
  request: NextRequest,
): Promise<NextResponse<TranslateResponse>> {
  try {
    const body = (await request.json()) as TranslateRequest;
    const { sourceLocale, targetLocale, entries, context, tone } = body;

    // Validate request
    if (!sourceLocale || !targetLocale || !entries?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate tone if provided
    if (tone && tone !== "formal" && tone !== "casual") {
      return NextResponse.json(
        { success: false, error: 'Invalid tone. Must be "formal" or "casual"' },
        { status: 400 },
      );
    }

    let translations: Record<string, string>;

    if (isDev) {
      // Development: Use LM Studio
      translations = await translateWithOpenAI(
        sourceLocale,
        targetLocale,
        entries,
        tone,
        context,
      );
    } else {
      // Production: Use Cloudflare AI
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
          fallback: true,
        });
      }

      translations = await translateWithCloudflare(
        sourceLocale,
        targetLocale,
        entries,
        ai,
        tone,
        context,
      );
    }

    return NextResponse.json({
      success: true,
      translations,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
