import { NextRequest, NextResponse } from 'next/server';
import type { JsonSchema } from '@/lib/types';
import { DEFAULT_AI_CONFIG } from '@/lib/types/ai';
import { AIClient } from '@/lib/ai/client';

/**
 * POST /api/ai/analyze-schema
 * Analyzes a JSON schema using AI to detect semantic types
 * - Development: Uses LM Studio at localhost:1234
 * - Production: Uses Cloudflare Workers AI (requires AI binding)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schema, config } = body as {
      schema: JsonSchema;
      config?: Partial<typeof DEFAULT_AI_CONFIG>;
    };

    if (!schema || typeof schema !== 'object') {
      return NextResponse.json(
        { error: 'Invalid schema: must be a JSON object' },
        { status: 400 }
      );
    }

    const mergedConfig = { ...DEFAULT_AI_CONFIG, ...config };

    if (!mergedConfig.enabled) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: 'AI is disabled'
      });
    }

    const client = new AIClient(mergedConfig);

    // In development, AIClient uses fetch to localhost:1234
    // In production, it would need the Cloudflare AI binding (passed as undefined here)
    const analysis = await client.analyzeSchema(schema);

    if (!analysis) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: 'AI analysis returned no results'
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error('AI analysis error:', error);

    return NextResponse.json(
      {
        error: 'AI analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/analyze-schema
 * Returns API info and status
 */
export async function GET() {
  const isDev = process.env.NODE_ENV === 'development';

  return NextResponse.json({
    endpoint: '/api/ai/analyze-schema',
    method: 'POST',
    status: 'active',
    provider: isDev ? 'OpenAI-compatible (LM Studio)' : 'Cloudflare Workers AI',
    body: {
      schema: 'JsonSchema (required)',
      config: 'AIConfig (optional)'
    }
  });
}
