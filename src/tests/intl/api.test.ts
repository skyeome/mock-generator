import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

// Mock implementations
const createMockRequest = (body: unknown) => {
  return {
    json: async () => body
  } as NextRequest;
};

describe('API Routes', () => {
  describe('POST /api/intl/translate', () => {
    it('should return fallback translations when AI unavailable', async () => {
      // Import dynamically to avoid side effects
      const { POST } = await import('@/app/api/intl/translate/route');

      const req = createMockRequest({
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries: [
          { key: 'greeting', value: 'Hello' },
          { key: 'farewell', value: 'Goodbye' }
        ]
      });

      const response = await POST(req);
      const data = await response.json();

      expect((data as any).success).toBe(true);
      expect((data as any).fallback).toBe(true);
      expect((data as any).translations).toEqual({
        greeting: '[KO] Hello',
        farewell: '[KO] Goodbye'
      });
    });

    it('should validate required fields', async () => {
      const { POST } = await import('@/app/api/intl/translate/route');

      const req = createMockRequest({
        sourceLocale: 'en',
        // Missing targetLocale and entries
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect((data as any).success).toBe(false);
      expect((data as any).error).toBe('Missing required fields');
    });

    it('should handle empty entries array', async () => {
      const { POST } = await import('@/app/api/intl/translate/route');

      const req = createMockRequest({
        sourceLocale: 'en',
        targetLocale: 'ko',
        entries: []
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect((data as any).success).toBe(false);
    });
  });

  describe('POST /api/intl/validate', () => {
    it('should detect variable mismatches', async () => {
      const { POST } = await import('@/app/api/intl/validate/route');

      const req = createMockRequest({
        source: {},
        target: {},
        translations: [
          {
            key: 'greeting',
            source: 'Hello {name}',
            target: 'こんにちは' // Missing {name}
          }
        ]
      });

      const response = await POST(req);
      const data = await response.json();

      expect((data as any).success).toBe(true);
      expect((data as any).valid).toBe(false);
      expect((data as any).errors).toHaveLength(1);
      expect((data as any).errors[0].type).toBe('variable_mismatch');
      expect((data as any).errors[0].message).toContain('Missing variables');
    });

    it('should detect length anomalies', async () => {
      const { POST } = await import('@/app/api/intl/validate/route');

      const req = createMockRequest({
        source: {},
        target: {},
        translations: [
          {
            key: 'short',
            source: 'OK',
            target: 'This is an extremely long translation that is way too verbose'
          }
        ]
      });

      const response = await POST(req);
      const data = await response.json();

      expect((data as any).success).toBe(true);
      expect((data as any).valid).toBe(false);
      expect((data as any).errors).toHaveLength(1);
      expect((data as any).errors[0].type).toBe('length_anomaly');
      expect((data as any).errors[0].message).toContain('longer than source');
    });

    it('should pass valid translations', async () => {
      const { POST } = await import('@/app/api/intl/validate/route');

      const req = createMockRequest({
        source: {},
        target: {},
        translations: [
          {
            key: 'greeting',
            source: 'Hello {name}',
            target: 'こんにちは {name}'
          },
          {
            key: 'farewell',
            source: 'Goodbye',
            target: 'さようなら'
          }
        ]
      });

      const response = await POST(req);
      const data = await response.json();

      expect((data as any).success).toBe(true);
      expect((data as any).valid).toBe(true);
      expect((data as any).errors).toHaveLength(0);
    });

    it('should detect extra variables', async () => {
      const { POST } = await import('@/app/api/intl/validate/route');

      const req = createMockRequest({
        source: {},
        target: {},
        translations: [
          {
            key: 'greeting',
            source: 'Hello',
            target: 'こんにちは {extra}' // Extra variable
          }
        ]
      });

      const response = await POST(req);
      const data = await response.json();

      expect((data as any).success).toBe(true);
      expect((data as any).valid).toBe(false);
      expect((data as any).errors).toHaveLength(1);
      expect((data as any).errors[0].type).toBe('variable_mismatch');
      expect((data as any).errors[0].message).toContain('Extra variables');
    });

    it('should handle multiple errors', async () => {
      const { POST } = await import('@/app/api/intl/validate/route');

      const req = createMockRequest({
        source: {},
        target: {},
        translations: [
          {
            key: 'key1',
            source: 'Hello {name}',
            target: 'こんにちは' // Missing variable
          },
          {
            key: 'key2',
            source: 'OK',
            target: 'This is way too long for such a short source text'
          }
        ]
      });

      const response = await POST(req);
      const data = await response.json();

      expect((data as any).success).toBe(true);
      expect((data as any).valid).toBe(false);
      expect((data as any).errors).toHaveLength(2);
      expect((data as any).errors[0].keyPath).toBe('key1');
      expect((data as any).errors[1].keyPath).toBe('key2');
    });

    it('should handle malformed request', async () => {
      const { POST } = await import('@/app/api/intl/validate/route');

      const req = createMockRequest({
        // Missing translations field
        source: {},
        target: {}
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect((data as any).success).toBe(false);
      expect((data as any).valid).toBe(false);
      expect((data as any).errors).toHaveLength(1);
      expect((data as any).errors[0].type).toBe('schema_error');
    });
  });
});
