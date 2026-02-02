import { NextRequest, NextResponse } from 'next/server';

interface ValidateRequest {
  source: Record<string, unknown>;
  target: Record<string, unknown>;
  translations: Array<{ key: string; source: string; target: string }>;
}

interface ValidationError {
  keyPath: string;
  type: 'variable_mismatch' | 'length_anomaly' | 'schema_error';
  message: string;
}

interface ValidateResponse {
  success: boolean;
  valid: boolean;
  errors: ValidationError[];
}

// Variable pattern for consistency check
const VARIABLE_PATTERN = /(\{\{[^}]+\}\}|(?<!\{)\{[^{}]+\}(?!\})|\$[a-zA-Z_][a-zA-Z0-9_]*|:[a-zA-Z_][a-zA-Z0-9_]*|%[a-zA-Z_][a-zA-Z0-9_]*|<\/?[a-zA-Z][^>]*\/?>)/g;

export async function POST(request: NextRequest): Promise<NextResponse<ValidateResponse>> {
  try {
    const body = await request.json() as ValidateRequest;
    const { translations } = body;

    const errors: ValidationError[] = [];

    for (const { key, source, target } of translations) {
      // Check variable consistency
      const sourceVars = new Set(source.match(VARIABLE_PATTERN) || []);
      const targetVars = new Set(target.match(VARIABLE_PATTERN) || []);

      const missingVars = [...sourceVars].filter(v => !targetVars.has(v));
      const extraVars = [...targetVars].filter(v => !sourceVars.has(v));

      if (missingVars.length > 0 || extraVars.length > 0) {
        errors.push({
          keyPath: key,
          type: 'variable_mismatch',
          message: missingVars.length > 0
            ? `Missing variables: ${missingVars.join(', ')}`
            : `Extra variables: ${extraVars.join(', ')}`
        });
      }

      // Check length anomaly (5x threshold)
      if (source.length > 0 && target.length / source.length > 5) {
        errors.push({
          keyPath: key,
          type: 'length_anomaly',
          message: `Translation is ${(target.length / source.length).toFixed(1)}x longer than source`
        });
      }
    }

    return NextResponse.json({
      success: true,
      valid: errors.length === 0,
      errors
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { success: false, valid: false, errors: [{ keyPath: '', type: 'schema_error', message: (error as Error).message }] },
      { status: 500 }
    );
  }
}
