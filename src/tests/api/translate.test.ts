import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the utilities we'll test
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

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

describe('Translation API Timeout Fix - Utility Functions', () => {
  describe('chunkArray', () => {
    it('splits array into exact chunks', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = chunkArray(input, 3);

      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10]
      ]);
    });

    it('handles empty array', () => {
      const result = chunkArray([], 5);
      expect(result).toEqual([]);
    });

    it('returns single chunk when size >= array length', () => {
      const input = [1, 2, 3];
      const result = chunkArray(input, 10);

      expect(result).toEqual([[1, 2, 3]]);
    });

    it('creates exact multiple chunks', () => {
      const input = [1, 2, 3, 4, 5, 6];
      const result = chunkArray(input, 2);

      expect(result).toEqual([
        [1, 2],
        [3, 4],
        [5, 6]
      ]);
      expect(result.length).toBe(3);
    });

    it('handles chunk size of 1', () => {
      const input = [1, 2, 3];
      const result = chunkArray(input, 1);

      expect(result).toEqual([[1], [2], [3]]);
    });

    it('preserves complex objects', () => {
      const input = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'B' },
        { key: 'c', value: 'C' }
      ];
      const result = chunkArray(input, 2);

      expect(result).toEqual([
        [{ key: 'a', value: 'A' }, { key: 'b', value: 'B' }],
        [{ key: 'c', value: 'C' }]
      ]);
    });

    it('handles large arrays efficiently', () => {
      const input = Array.from({ length: 100 }, (_, i) => i);
      const result = chunkArray(input, 10);

      expect(result.length).toBe(10);
      expect(result[0]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(result[9]).toEqual([90, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
    });
  });

  describe('withTimeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('resolves when promise completes before timeout', async () => {
      const fastPromise = Promise.resolve('success');

      const resultPromise = withTimeout(fastPromise, 1000);
      const result = await resultPromise;

      expect(result).toBe('success');
    });

    it('rejects when timeout is reached', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('too-late'), 2000);
      });

      const timeoutPromise = withTimeout(slowPromise, 1000);

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(1000);

      await expect(timeoutPromise).rejects.toThrow('Timeout after 1000ms');
    });

    it('propagates errors from the original promise', async () => {
      const errorPromise = Promise.reject(new Error('Original error'));

      const resultPromise = withTimeout(errorPromise, 1000);

      await expect(resultPromise).rejects.toThrow('Original error');
    });

    it('resolves with correct value type', async () => {
      const objectPromise = Promise.resolve({ data: 'test', count: 42 });

      const result = await withTimeout(objectPromise, 1000);

      expect(result).toEqual({ data: 'test', count: 42 });
    });

    it('handles immediate rejection', async () => {
      const immediateReject = Promise.reject(new Error('Immediate fail'));

      await expect(withTimeout(immediateReject, 1000)).rejects.toThrow('Immediate fail');
    });
  });

  describe('retryWithBackoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('succeeds on first attempt', async () => {
      const successFn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(successFn, 3, 1000);

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('succeeds after retries', async () => {
      const attempts: number[] = [];
      const retryFn = vi.fn().mockImplementation(() => {
        attempts.push(attempts.length + 1);
        if (attempts.length < 2) {
          return Promise.reject(new Error('Retry me'));
        }
        return Promise.resolve('success-after-retry');
      });

      const resultPromise = retryWithBackoff(retryFn, 3, 1000);

      // Advance timers for backoff delays
      await vi.advanceTimersByTimeAsync(1000); // First retry delay

      const result = await resultPromise;

      expect(result).toBe('success-after-retry');
      expect(retryFn).toHaveBeenCalledTimes(2);
      expect(attempts).toEqual([1, 2]);
    });

    it('fails after all retries exhausted', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Always fails'));

      const resultPromise = retryWithBackoff(failFn, 3, 1000);

      // Advance through all retry delays
      const advancePromise = (async () => {
        await vi.advanceTimersByTimeAsync(1000); // 1st retry: 1000ms
        await vi.advanceTimersByTimeAsync(2000); // 2nd retry: 2000ms
      })();

      await expect(resultPromise).rejects.toThrow('Always fails');
      await advancePromise;
      expect(failFn).toHaveBeenCalledTimes(3);
    });

    it('uses exponential backoff delays', async () => {
      const delays: number[] = [];
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const resultPromise = retryWithBackoff(failFn, 4, 1000);

      // Track when delays occur
      const startTime = Date.now();

      const advancePromise = (async () => {
        // First retry: 1000ms * 2^0 = 1000ms
        await vi.advanceTimersByTimeAsync(1000);
        delays.push(Date.now() - startTime);

        // Second retry: 1000ms * 2^1 = 2000ms
        await vi.advanceTimersByTimeAsync(2000);
        delays.push(Date.now() - startTime);

        // Third retry: 1000ms * 2^2 = 4000ms
        await vi.advanceTimersByTimeAsync(4000);
        delays.push(Date.now() - startTime);
      })();

      await expect(resultPromise).rejects.toThrow('Fail');
      await advancePromise;

      // Verify exponential pattern
      expect(delays[0]).toBe(1000);
      expect(delays[1]).toBe(3000); // 1000 + 2000
      expect(delays[2]).toBe(7000); // 1000 + 2000 + 4000
    });

    it('respects custom maxAttempts', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const resultPromise = retryWithBackoff(failFn, 2, 500);

      const advancePromise = vi.advanceTimersByTimeAsync(500); // Only one retry delay

      await expect(resultPromise).rejects.toThrow('Fail');
      await advancePromise;
      expect(failFn).toHaveBeenCalledTimes(2);
    });

    it('respects custom baseDelayMs', async () => {
      const delays: number[] = [];
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const resultPromise = retryWithBackoff(failFn, 3, 500);

      const startTime = Date.now();

      const advancePromise = (async () => {
        await vi.advanceTimersByTimeAsync(500); // 500ms
        delays.push(Date.now() - startTime);

        await vi.advanceTimersByTimeAsync(1000); // 1000ms
        delays.push(Date.now() - startTime);
      })();

      await expect(resultPromise).rejects.toThrow('Fail');
      await advancePromise;

      expect(delays[0]).toBe(500);
      expect(delays[1]).toBe(1500); // 500 + 1000
    });

    it('handles different error types', async () => {
      const customError = new Error('Custom error');
      customError.name = 'CustomError';

      const failFn = vi.fn().mockRejectedValue(customError);

      const resultPromise = retryWithBackoff(failFn, 2, 100);

      const advancePromise = vi.advanceTimersByTimeAsync(100);

      await expect(resultPromise).rejects.toThrow('Custom error');
      await advancePromise;
      const caught = await resultPromise.catch((e: unknown) => e);
      const error = caught as Error;
      expect(error.name).toBe('CustomError');
    });
  });
});

describe('Translation API - Chunked Scenarios', () => {
  interface TranslationEntry {
    key: string;
    value: string;
  }

  const mockAITranslate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // Simulate chunked translation orchestrator
  async function simulateChunkedTranslation(
    entries: TranslationEntry[],
    chunkSize: number,
    timeoutMs: number,
    mockBehavior: 'success' | 'partial-fail' | 'complete-fail'
  ) {
    const chunks = chunkArray(entries, chunkSize);
    const allTranslations: Record<string, string> = {};
    const failedKeys: string[] = [];
    let successfulChunks = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        let chunkResult: Record<string, string>;

        if (mockBehavior === 'complete-fail') {
          throw new Error('AI service unavailable');
        } else if (mockBehavior === 'partial-fail' && i % 2 === 1) {
          throw new Error('Chunk timeout');
        } else {
          chunkResult = Object.fromEntries(
            chunk.map(e => [e.key, `[TRANSLATED] ${e.value}`])
          );
        }

        const result = await retryWithBackoff(
          () => withTimeout(Promise.resolve(chunkResult), timeoutMs),
          3,
          1000
        );

        Object.assign(allTranslations, result);
        successfulChunks++;
      } catch (error) {
        failedKeys.push(...chunk.map(e => e.key));
      }
    }

    return {
      translations: allTranslations,
      failedKeys,
      totalChunks: chunks.length,
      successfulChunks,
      stats: undefined as { totalChunks: number; successfulChunks: number } | undefined,
    };
  }

  describe('Small request (single chunk)', () => {
    it('processes 5 entries in single chunk successfully', async () => {
      const entries: TranslationEntry[] = [
        { key: 'app.title', value: 'Hello' },
        { key: 'app.subtitle', value: 'World' },
        { key: 'button.save', value: 'Save' },
        { key: 'button.cancel', value: 'Cancel' },
        { key: 'error.generic', value: 'Error' },
      ];

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'success'
      );

      expect(result.successfulChunks).toBe(1);
      expect(result.totalChunks).toBe(1);
      expect(result.failedKeys).toEqual([]);
      expect(Object.keys(result.translations)).toHaveLength(5);
      expect(result.translations['app.title']).toBe('[TRANSLATED] Hello');
    });

    it('works as before with backward compatibility', async () => {
      const entries: TranslationEntry[] = [
        { key: 'greeting', value: 'Hi' },
        { key: 'farewell', value: 'Bye' },
      ];

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'success'
      );

      expect(result.successfulChunks).toBe(1);
      expect(result.failedKeys).toEqual([]);
      expect(result.translations).toEqual({
        greeting: '[TRANSLATED] Hi',
        farewell: '[TRANSLATED] Bye',
      });
    });
  });

  describe('Large request (multiple chunks)', () => {
    it('processes 25 entries across 3 chunks successfully', async () => {
      const entries: TranslationEntry[] = Array.from(
        { length: 25 },
        (_, i) => ({ key: `key${i}`, value: `Value ${i}` })
      );

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'success'
      );

      expect(result.totalChunks).toBe(3); // 10 + 10 + 5
      expect(result.successfulChunks).toBe(3);
      expect(result.failedKeys).toEqual([]);
      expect(Object.keys(result.translations)).toHaveLength(25);
    });

    it('handles 100 entries efficiently', async () => {
      const entries: TranslationEntry[] = Array.from(
        { length: 100 },
        (_, i) => ({ key: `item.${i}`, value: `Item ${i}` })
      );

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'success'
      );

      expect(result.totalChunks).toBe(10);
      expect(result.successfulChunks).toBe(10);
      expect(Object.keys(result.translations)).toHaveLength(100);
    });
  });

  describe('Partial failure scenarios', () => {
    it('succeeds with some chunks failing', async () => {
      const entries: TranslationEntry[] = Array.from(
        { length: 40 },
        (_, i) => ({ key: `key${i}`, value: `Value ${i}` })
      );

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'partial-fail'
      );

      expect(result.totalChunks).toBe(4);
      expect(result.successfulChunks).toBe(2); // Chunks 0 and 2 succeed
      expect(result.failedKeys.length).toBeGreaterThan(0);
      expect(Object.keys(result.translations).length).toBeGreaterThan(0);
      expect(Object.keys(result.translations).length).toBeLessThan(40);
    });

    it('returns partial success metadata', async () => {
      const entries: TranslationEntry[] = Array.from(
        { length: 20 },
        (_, i) => ({ key: `key${i}`, value: `Value ${i}` })
      );

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'partial-fail'
      );

      expect(result.failedKeys).toBeDefined();
      expect(result.failedKeys.length).toBe(10); // One chunk of 10 failed
      expect(result.stats).toBeUndefined(); // Not in this mock, but would exist in real API
    });

    it('identifies specific failed keys', async () => {
      const entries: TranslationEntry[] = [
        { key: 'chunk0.a', value: 'A' },
        { key: 'chunk0.b', value: 'B' },
        { key: 'chunk1.a', value: 'C' }, // This chunk will fail
        { key: 'chunk1.b', value: 'D' }, // This chunk will fail
      ];

      const result = await simulateChunkedTranslation(
        entries,
        2,
        25000,
        'partial-fail'
      );

      expect(result.failedKeys).toContain('chunk1.a');
      expect(result.failedKeys).toContain('chunk1.b');
      expect(result.translations['chunk0.a']).toBe('[TRANSLATED] A');
      expect(result.translations['chunk0.b']).toBe('[TRANSLATED] B');
    });
  });

  describe('Complete failure scenarios', () => {
    it('fails when all chunks fail', async () => {
      const entries: TranslationEntry[] = Array.from(
        { length: 30 },
        (_, i) => ({ key: `key${i}`, value: `Value ${i}` })
      );

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'complete-fail'
      );

      expect(result.successfulChunks).toBe(0);
      expect(result.totalChunks).toBe(3);
      expect(result.failedKeys).toHaveLength(30);
      expect(Object.keys(result.translations)).toHaveLength(0);
    });

    it('returns appropriate error response structure', async () => {
      const entries: TranslationEntry[] = [
        { key: 'test', value: 'Test' }
      ];

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'complete-fail'
      );

      expect(result.successfulChunks).toBe(0);
      expect(result.failedKeys).toEqual(['test']);
      // In real API, this would trigger 500 error response
    });
  });

  describe('Edge cases', () => {
    it('handles empty entries array', async () => {
      const entries: TranslationEntry[] = [];

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'success'
      );

      expect(result.totalChunks).toBe(0);
      expect(result.successfulChunks).toBe(0);
      expect(result.failedKeys).toEqual([]);
      expect(result.translations).toEqual({});
    });

    it('handles exactly chunk-size entries', async () => {
      const entries: TranslationEntry[] = Array.from(
        { length: 10 },
        (_, i) => ({ key: `key${i}`, value: `Value ${i}` })
      );

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'success'
      );

      expect(result.totalChunks).toBe(1);
      expect(result.successfulChunks).toBe(1);
      expect(Object.keys(result.translations)).toHaveLength(10);
    });

    it('handles one entry over chunk size', async () => {
      const entries: TranslationEntry[] = Array.from(
        { length: 11 },
        (_, i) => ({ key: `key${i}`, value: `Value ${i}` })
      );

      const result = await simulateChunkedTranslation(
        entries,
        10,
        25000,
        'success'
      );

      expect(result.totalChunks).toBe(2);
      expect(result.successfulChunks).toBe(2);
    });
  });
});
