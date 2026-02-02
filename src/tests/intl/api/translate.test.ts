import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/intl/translate/route';
import { NextRequest } from 'next/server';

// Response type for translate API
interface TranslateResponse {
  success: boolean;
  translations?: Record<string, string>;
  error?: string;
  fallback?: boolean;
}

// Mock Cloudflare context
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(() => Promise.resolve({ env: {} })),
}));

describe('POST /api/intl/translate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost:3000/api/intl/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('validates required fields', async () => {
    const request = createRequest({});
    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing required fields');
  });

  it('returns fallback when AI not available', async () => {
    const request = createRequest({
      sourceLocale: 'en',
      targetLocale: 'ko',
      entries: [{ key: 'app.title', value: 'Hello' }],
    });

    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    expect(data.success).toBe(true);
    expect(data.fallback).toBe(true);
    expect(data.translations).toEqual({
      'app.title': '[KO] Hello',
    });
  });

  it('accepts context parameter in request', async () => {
    const request = createRequest({
      sourceLocale: 'en',
      targetLocale: 'ko',
      entries: [{ key: 'app.greeting', value: 'Hello' }],
      context: 'This is a formal business greeting',
    });

    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Context should be accepted without error
  });

  it('accepts tone parameter in request', async () => {
    const request = createRequest({
      sourceLocale: 'en',
      targetLocale: 'ko',
      entries: [{ key: 'app.greeting', value: 'Hello' }],
      tone: 'casual',
    });

    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Tone should be accepted without error
  });

  it('works without optional parameters (backward compatible)', async () => {
    const request = createRequest({
      sourceLocale: 'en',
      targetLocale: 'ko',
      entries: [{ key: 'app.title', value: 'Hello' }],
      // No context or tone
    });

    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('accepts both context and tone together', async () => {
    const request = createRequest({
      sourceLocale: 'en',
      targetLocale: 'ko',
      entries: [{ key: 'app.greeting', value: 'Hello' }],
      context: 'Customer support message',
      tone: 'formal',
    });

    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('handles empty context gracefully', async () => {
    const request = createRequest({
      sourceLocale: 'en',
      targetLocale: 'ko',
      entries: [{ key: 'app.title', value: 'Hello' }],
      context: '',
    });

    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('validates tone values', async () => {
    const request = createRequest({
      sourceLocale: 'en',
      targetLocale: 'ko',
      entries: [{ key: 'app.title', value: 'Hello' }],
      tone: 'invalid-tone',
    });

    const response = await POST(request);
    const data = await response.json() as TranslateResponse;

    // Should either reject or ignore invalid tone
    expect(response.status).toBeLessThan(500);
  });
});
