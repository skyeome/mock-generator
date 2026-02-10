import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
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

    // Get AI binding from Cloudflare context (only when using cloudflare provider)
    let aiBinding: Ai | undefined;
    const provider = process.env.AI_PROVIDER || mergedConfig.provider || 'gemini';

    if (provider === 'cloudflare') {
      try {
        const ctx = await getCloudflareContext();
        aiBinding = ctx.env.AI;
      } catch (e) {
        console.warn('Failed to get Cloudflare context:', e);
      }
    }

    const analysis = await client.analyzeSchema(schema, aiBinding);

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
  const provider = process.env.AI_PROVIDER || 'gemini';

  return NextResponse.json({
    endpoint: '/api/ai/analyze-schema',
    method: 'POST',
    status: 'active',
    provider: provider,
    availableProviders: ['gemini', 'openai', 'cloudflare'],
  });
}
