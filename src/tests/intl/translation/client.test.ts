import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nTranslationClient, type I18nTranslationConfig } from '@/lib/intl/translation/client';
import type { TranslationEntry } from '@/lib/intl/translation/prompts';

describe('translation/client', () => {
  let mockAi: Ai;

  beforeEach(() => {
    mockAi = {
      run: vi.fn()
    } as unknown as Ai;
  });

  describe('constructor', () => {
    it('should use default configuration', () => {
      const client = new I18nTranslationClient();
      expect(client).toBeDefined();
    });

    it('should merge custom configuration', () => {
      const config: I18nTranslationConfig = {
        model: '@cf/meta/llama-3.3-70b-instruct',
        maxTokens: 4096,
        temperature: 0.5,
        batchSize: 100
      };

      const client = new I18nTranslationClient(config);
      expect(client).toBeDefined();
    });
  });

  describe('translate', () => {
    it('should translate single entry', async () => {
      const client = new I18nTranslationClient();
      const entries: TranslationEntry[] = [
        { key: 'common.hello', value: 'Hello' }
      ];

      vi.mocked(mockAi.run).mockResolvedValue({
        response: JSON.stringify({
          'common.hello': '안녕하세요'
        })
      });

      const result = await client.translate(
        {
          sourceLocale: 'en',
          targetLocale: 'ko',
          entries
        },
        mockAi
      );

      expect(result.get('common.hello')).toBe('안녕하세요');
      expect(mockAi.run).toHaveBeenCalledTimes(1);
    });

    it('should preserve masked variables', async () => {
      const client = new I18nTranslationClient();
      const entries: TranslationEntry[] = [
        { key: 'greeting', value: 'Hello __VAR_0__, welcome to __VAR_1__' }
      ];

      vi.mocked(mockAi.run).mockResolvedValue({
        response: JSON.stringify({
          greeting: '안녕하세요 __VAR_0__, __VAR_1__에 오신 것을 환영합니다'
        })
      });

      const result = await client.translate(
        {
          sourceLocale: 'en',
          targetLocale: 'ko',
          entries
        },
        mockAi
      );

      const translated = result.get('greeting');
      expect(translated).toContain('__VAR_0__');
      expect(translated).toContain('__VAR_1__');
    });

    it('should batch large requests', async () => {
      const config: I18nTranslationConfig = {
        batchSize: 3
      };
      const client = new I18nTranslationClient(config);

      const entries: TranslationEntry[] = Array.from({ length: 7 }, (_, i) => ({
        key: `key${i}`,
        value: `Value ${i}`
      }));

      vi.mocked(mockAi.run)
        .mockResolvedValueOnce({
          response: JSON.stringify({
            key0: '값 0',
            key1: '값 1',
            key2: '값 2'
          })
        })
        .mockResolvedValueOnce({
          response: JSON.stringify({
            key3: '값 3',
            key4: '값 4',
            key5: '값 5'
          })
        })
        .mockResolvedValueOnce({
          response: JSON.stringify({
            key6: '값 6'
          })
        });

      const result = await client.translate(
        {
          sourceLocale: 'en',
          targetLocale: 'ko',
          entries
        },
        mockAi
      );

      // Should make 3 API calls (3 + 3 + 1)
      expect(mockAi.run).toHaveBeenCalledTimes(3);
      expect(result.size).toBe(7);
      expect(result.get('key0')).toBe('값 0');
      expect(result.get('key6')).toBe('값 6');
    });

    it('should retry on failure', async () => {
      const config: I18nTranslationConfig = {
        maxRetries: 3,
        retryDelayMs: 10
      };
      const client = new I18nTranslationClient(config);

      const entries: TranslationEntry[] = [
        { key: 'test', value: 'Test' }
      ];

      vi.mocked(mockAi.run)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          response: JSON.stringify({
            test: '테스트'
          })
        });

      const result = await client.translate(
        {
          sourceLocale: 'en',
          targetLocale: 'ko',
          entries
        },
        mockAi
      );

      // Should retry twice and succeed on third attempt
      expect(mockAi.run).toHaveBeenCalledTimes(3);
      expect(result.get('test')).toBe('테스트');
    });

    it('should throw after max retries exceeded', async () => {
      const config: I18nTranslationConfig = {
        maxRetries: 2,
        retryDelayMs: 10
      };
      const client = new I18nTranslationClient(config);

      const entries: TranslationEntry[] = [
        { key: 'test', value: 'Test' }
      ];

      vi.mocked(mockAi.run).mockRejectedValue(new Error('Persistent error'));

      await expect(
        client.translate(
          {
            sourceLocale: 'en',
            targetLocale: 'ko',
            entries
          },
          mockAi
        )
      ).rejects.toThrow('Persistent error');

      // Should attempt maxRetries + 1 times (initial + 2 retries = 3 total)
      expect(mockAi.run).toHaveBeenCalledTimes(3);
    });

    it('should handle AI unavailable gracefully', async () => {
      const client = new I18nTranslationClient();
      const entries: TranslationEntry[] = [
        { key: 'test', value: 'Test' }
      ];

      await expect(
        client.translate(
          {
            sourceLocale: 'en',
            targetLocale: 'ko',
            entries
          },
          undefined // No AI binding
        )
      ).rejects.toThrow('AI binding not available');
    });

    it('should handle malformed JSON response', async () => {
      const client = new I18nTranslationClient();
      const entries: TranslationEntry[] = [
        { key: 'test', value: 'Test' }
      ];

      vi.mocked(mockAi.run).mockResolvedValue({
        response: 'Invalid JSON {'
      });

      await expect(
        client.translate(
          {
            sourceLocale: 'en',
            targetLocale: 'ko',
            entries
          },
          mockAi
        )
      ).rejects.toThrow();
    });

    it('should handle empty entries array', async () => {
      const client = new I18nTranslationClient();

      const result = await client.translate(
        {
          sourceLocale: 'en',
          targetLocale: 'ko',
          entries: []
        },
        mockAi
      );

      expect(result.size).toBe(0);
      expect(mockAi.run).not.toHaveBeenCalled();
    });

    it('should merge results from multiple batches correctly', async () => {
      const config: I18nTranslationConfig = {
        batchSize: 2
      };
      const client = new I18nTranslationClient(config);

      const entries: TranslationEntry[] = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'B' },
        { key: 'c', value: 'C' }
      ];

      vi.mocked(mockAi.run)
        .mockResolvedValueOnce({
          response: JSON.stringify({ a: 'ㄱ', b: 'ㄴ' })
        })
        .mockResolvedValueOnce({
          response: JSON.stringify({ c: 'ㄷ' })
        });

      const result = await client.translate(
        {
          sourceLocale: 'en',
          targetLocale: 'ko',
          entries
        },
        mockAi
      );

      expect(result.size).toBe(3);
      expect(result.get('a')).toBe('ㄱ');
      expect(result.get('b')).toBe('ㄴ');
      expect(result.get('c')).toBe('ㄷ');
    });
  });
});
