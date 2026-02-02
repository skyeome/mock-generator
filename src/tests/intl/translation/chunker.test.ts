import { describe, it, expect } from 'vitest';
import {
  semanticChunk,
  flattenToEntries,
  type ChunkOptions
} from '@/lib/intl/translation/chunker';

describe('translation/chunker', () => {
  describe('flattenToEntries', () => {
    it('should flatten single-level object', () => {
      const obj = {
        hello: 'Hello',
        goodbye: 'Goodbye'
      };

      const entries = flattenToEntries(obj);

      expect(entries).toEqual([
        { key: 'hello', value: 'Hello' },
        { key: 'goodbye', value: 'Goodbye' }
      ]);
    });

    it('should flatten nested object with dot notation', () => {
      const obj = {
        common: {
          hello: 'Hello',
          goodbye: 'Goodbye'
        },
        errors: {
          notFound: 'Not found'
        }
      };

      const entries = flattenToEntries(obj);

      expect(entries).toEqual([
        { key: 'common.hello', value: 'Hello' },
        { key: 'common.goodbye', value: 'Goodbye' },
        { key: 'errors.notFound', value: 'Not found' }
      ]);
    });

    it('should handle deeply nested objects', () => {
      const obj = {
        auth: {
          login: {
            form: {
              email: 'Email',
              password: 'Password'
            }
          }
        }
      };

      const entries = flattenToEntries(obj);

      expect(entries).toEqual([
        { key: 'auth.login.form.email', value: 'Email' },
        { key: 'auth.login.form.password', value: 'Password' }
      ]);
    });

    it('should use custom prefix', () => {
      const obj = {
        hello: 'Hello'
      };

      const entries = flattenToEntries(obj, 'prefix');

      expect(entries).toEqual([
        { key: 'prefix.hello', value: 'Hello' }
      ]);
    });

    it('should skip non-string values', () => {
      const obj = {
        valid: 'Valid string',
        number: 123,
        boolean: true,
        null: null,
        undefined: undefined
      };

      const entries = flattenToEntries(obj);

      expect(entries).toEqual([
        { key: 'valid', value: 'Valid string' }
      ]);
    });

    it('should handle empty object', () => {
      const entries = flattenToEntries({});

      expect(entries).toEqual([]);
    });
  });

  describe('semanticChunk', () => {
    it('should chunk by top-level keys', () => {
      const data = {
        common: {
          hello: 'Hello',
          goodbye: 'Goodbye'
        },
        errors: {
          notFound: 'Not found',
          serverError: 'Server error'
        }
      };

      const chunks = semanticChunk(data);

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toEqual([
        { key: 'common.hello', value: 'Hello' },
        { key: 'common.goodbye', value: 'Goodbye' }
      ]);
      expect(chunks[1]).toEqual([
        { key: 'errors.notFound', value: 'Not found' },
        { key: 'errors.serverError', value: 'Server error' }
      ]);
    });

    it('should keep related keys together', () => {
      const data = {
        auth: {
          login: {
            email: 'Email',
            password: 'Password',
            submit: 'Sign in'
          }
        }
      };

      const chunks = semanticChunk(data);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toHaveLength(3);
      // All auth.login.* keys should be in the same chunk
      expect(chunks[0].every(e => e.key.startsWith('auth.login.'))).toBe(true);
    });

    it('should respect maxKeysPerChunk option', () => {
      const data = {
        section1: Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [`key${i}`, `value${i}`])
        ),
        section2: Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [`key${i}`, `value${i}`])
        )
      };

      const options: ChunkOptions = { maxKeysPerChunk: 25 };
      const chunks = semanticChunk(data, options);

      // Each section has 30 keys, with max 25 per chunk
      // section1 should be split into 2 chunks (25 + 5)
      // section2 should be split into 2 chunks (25 + 5)
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks.every(chunk => chunk.length <= 25)).toBe(true);
    });

    it('should handle single top-level key with many entries', () => {
      const data = {
        messages: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`msg${i}`, `Message ${i}`])
        )
      };

      const options: ChunkOptions = { maxKeysPerChunk: 30 };
      const chunks = semanticChunk(data, options);

      // 100 keys should be split into 4 chunks (30 + 30 + 30 + 10)
      expect(chunks.length).toBe(4);
      expect(chunks[0]).toHaveLength(30);
      expect(chunks[1]).toHaveLength(30);
      expect(chunks[2]).toHaveLength(30);
      expect(chunks[3]).toHaveLength(10);
    });

    it('should use default maxKeysPerChunk of 50', () => {
      const data = {
        section: Object.fromEntries(
          Array.from({ length: 60 }, (_, i) => [`key${i}`, `value${i}`])
        )
      };

      const chunks = semanticChunk(data);

      // 60 keys with default max 50 should give 2 chunks (50 + 10)
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toHaveLength(50);
      expect(chunks[1]).toHaveLength(10);
    });

    it('should handle empty data', () => {
      const chunks = semanticChunk({});

      expect(chunks).toEqual([]);
    });

    it('should handle data with single entry', () => {
      const data = {
        single: 'value'
      };

      const chunks = semanticChunk(data);

      expect(chunks).toEqual([
        [{ key: 'single', value: 'value' }]
      ]);
    });
  });
});
