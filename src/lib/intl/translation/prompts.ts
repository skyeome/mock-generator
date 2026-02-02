/**
 * AI translation prompt templates and utilities
 */

export const TRANSLATION_SYSTEM_PROMPT = `You are a professional translator and software developer.
Your task is to translate i18n strings from one language to another.

CRITICAL RULES:
1. NEVER modify tokens like __VAR_0__, __VAR_1__, etc. Keep them EXACTLY as-is.
2. Use the JSON key path as context for accurate translation.
3. Maintain the same tone and formality as the source.
4. For technical terms, prefer commonly accepted translations in the target locale.
5. Keep translations concise - avoid unnecessary verbosity.

Output format: JSON object with key-value pairs only. No markdown, no explanations.`;

export interface TranslationEntry {
  key: string;
  value: string;
}

export interface TranslationPromptParams {
  sourceLocale: string;
  targetLocale: string;
  entries: TranslationEntry[];
  context?: string;
}

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi'
};

/**
 * Get human-readable locale name
 */
export function getLocaleName(code: string): string {
  return LOCALE_NAMES[code] || code;
}

/**
 * Build translation prompt for AI
 */
export function buildTranslationPrompt(params: TranslationPromptParams): string {
  const { sourceLocale, targetLocale, entries, context } = params;

  let prompt = `Translate the following strings from ${getLocaleName(sourceLocale)} to ${getLocaleName(targetLocale)}.\n\n`;

  if (context) {
    prompt += `Context: ${context}\n\n`;
  }

  prompt += `IMPORTANT: Preserve all __VAR_N__ tokens exactly as they appear.\n\n`;
  prompt += `Strings to translate:\n`;
  prompt += JSON.stringify(
    Object.fromEntries(entries.map(e => [e.key, e.value])),
    null,
    2
  );

  return prompt;
}
