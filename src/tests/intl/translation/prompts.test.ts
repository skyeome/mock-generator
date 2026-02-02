import { describe, it, expect } from 'vitest';
import {
  TRANSLATION_SYSTEM_PROMPT,
  buildTranslationPrompt,
  getLocaleName,
  type TranslationEntry,
  type TranslationPromptParams
} from '@/lib/intl/translation/prompts';

describe('translation/prompts', () => {
  describe('TRANSLATION_SYSTEM_PROMPT', () => {
    it('should include critical rules', () => {
      expect(TRANSLATION_SYSTEM_PROMPT).toContain('NEVER modify tokens');
      expect(TRANSLATION_SYSTEM_PROMPT).toContain('__VAR_');
      expect(TRANSLATION_SYSTEM_PROMPT).toContain('JSON key path');
      expect(TRANSLATION_SYSTEM_PROMPT).toContain('tone and formality');
    });

    it('should specify output format', () => {
      expect(TRANSLATION_SYSTEM_PROMPT).toContain('Output format');
      expect(TRANSLATION_SYSTEM_PROMPT).toContain('JSON object');
      expect(TRANSLATION_SYSTEM_PROMPT).toContain('No markdown');
    });
  });

  describe('getLocaleName', () => {
    it('should return locale name for known codes', () => {
      expect(getLocaleName('en')).toBe('English');
      expect(getLocaleName('ko')).toBe('Korean');
      expect(getLocaleName('ja')).toBe('Japanese');
      expect(getLocaleName('zh')).toBe('Chinese');
    });

    it('should return code as-is for unknown locales', () => {
      expect(getLocaleName('xx')).toBe('xx');
      expect(getLocaleName('unknown')).toBe('unknown');
    });
  });

  describe('buildTranslationPrompt', () => {
    const entries: TranslationEntry[] = [
      { key: 'common.hello', value: 'Hello' },
      { key: 'common.welcome', value: 'Welcome __VAR_0__' }
    ];

    it('should include source and target locales', () => {
      const params: TranslationPromptParams = {
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries
      };

      const prompt = buildTranslationPrompt(params);

      expect(prompt).toContain('English');
      expect(prompt).toContain('Korean');
    });

    it('should include key paths for context', () => {
      const params: TranslationPromptParams = {
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries
      };

      const prompt = buildTranslationPrompt(params);

      expect(prompt).toContain('common.hello');
      expect(prompt).toContain('common.welcome');
    });

    it('should warn about variable preservation', () => {
      const params: TranslationPromptParams = {
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries
      };

      const prompt = buildTranslationPrompt(params);

      expect(prompt).toContain('IMPORTANT');
      expect(prompt).toContain('Preserve all __VAR_N__');
      expect(prompt).toContain('exactly as they appear');
    });

    it('should handle custom context', () => {
      const params: TranslationPromptParams = {
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries,
        context: 'E-commerce product page'
      };

      const prompt = buildTranslationPrompt(params);

      expect(prompt).toContain('Context: E-commerce product page');
    });

    it('should format entries as JSON', () => {
      const params: TranslationPromptParams = {
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries
      };

      const prompt = buildTranslationPrompt(params);

      expect(prompt).toContain('"common.hello": "Hello"');
      expect(prompt).toContain('"common.welcome": "Welcome __VAR_0__"');
    });

    it('should handle empty entries array', () => {
      const params: TranslationPromptParams = {
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries: []
      };

      const prompt = buildTranslationPrompt(params);

      expect(prompt).toContain('English');
      expect(prompt).toContain('Korean');
      expect(prompt).toContain('{}');
    });
  });
});
