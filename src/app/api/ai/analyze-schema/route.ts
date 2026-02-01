import { NextRequest, NextResponse } from 'next/server';
import type { JsonSchema } from '@/lib/types';
import { DEFAULT_AI_CONFIG } from '@/lib/types/ai';
import type { AISchemaAnalysis } from '@/lib/types/ai';

// Cloudflare Workers environment type
interface Env {
  AI: Ai;
}

/**
 * POST /api/ai/analyze-schema
 * Analyzes a JSON schema using AI to detect semantic types
 */
export async function POST(
  request: NextRequest
) {
  try {
    // Parse request body
    const body = await request.json();
    const { schema, config } = body as {
      schema: JsonSchema;
      config?: Partial<typeof DEFAULT_AI_CONFIG>;
    };

    // Validate schema
    if (!schema || typeof schema !== 'object') {
      return NextResponse.json(
        { error: 'Invalid schema: must be a JSON object' },
        { status: 400 }
      );
    }

    // AI binding not available in this context - return fallback
    // In Cloudflare Workers, AI binding would be accessed differently
    return NextResponse.json(
      {
        error: 'AI service not available',
        fallback: true,
        message: 'AI binding not configured. Using regex-based detection.'
      },
      { status: 503 }
    );

    // NOTE: The code below is kept for reference but unreachable
    // When AI binding is properly configured, this route would be updated
    const ai = null as unknown as Ai;
    if (!ai) {
      return NextResponse.json(
        {
          error: 'AI service not available',
          fallback: true,
          message: 'AI binding not configured. Using regex-based detection.'
        },
        { status: 503 }
      );
    }

    // NOTE: The analyzeSchemaWithAI function will be implemented in another task
    // For now, we'll import it dynamically and handle the error
    let analysis: AISchemaAnalysis | null = null;

    try {
      const { analyzeSchemaWithAI } = await import('@/lib/schema/aiDetectSemantic');
      analysis = await analyzeSchemaWithAI(
        schema,
        ai,
        { ...DEFAULT_AI_CONFIG, ...config }
      );
    } catch (importError) {
      // AI detection function not yet implemented - graceful fallback
      console.warn('AI detection not yet implemented:', importError);
      return NextResponse.json(
        {
          error: 'AI detection not yet implemented',
          fallback: true,
          message: 'Using regex-based detection as fallback.'
        },
        { status: 200 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        {
          error: 'AI analysis returned no results',
          fallback: true
        },
        { status: 200 }
      );
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
  return NextResponse.json({
    endpoint: '/api/ai/analyze-schema',
    method: 'POST',
    description: 'Analyze JSON schema with AI to detect semantic types',
    body: {
      schema: 'JsonSchema (required)',
      config: 'AIConfig (optional)'
    },
    response: {
      success: 'boolean',
      analysis: 'AISchemaAnalysis | null'
    },
    fallback: {
      note: 'Returns fallback flag when AI is unavailable or not yet implemented'
    }
  });
}
