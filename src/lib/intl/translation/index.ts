/**
 * AI translation pipeline
 */

export {
  TRANSLATION_SYSTEM_PROMPT,
  buildTranslationPrompt,
  getLocaleName,
  type TranslationPromptParams
} from './prompts';

export {
  I18nTranslationClient,
  type I18nTranslationConfig
} from './client';

export {
  semanticChunk,
  flattenToEntries,
  type ChunkOptions
} from './chunker';
