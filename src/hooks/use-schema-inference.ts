'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useSchemaStore } from '@/store/schema-store';
import { inferSchema } from '@/lib/schema/inferSchema';
import { enrichSchemaWithSemantics } from '@/lib/schema/enrichSchema';
import type { JsonSchema } from '@/lib/types';

// Apply AI analysis to schema
function applyAIAnalysis(schema: JsonSchema, analysis: { fieldHints: Array<{ fieldPath: string; suggestedSemantic: string; confidence: number }> }): JsonSchema {
  const enriched = { ...schema };

  if (schema.type === 'object' && schema.properties) {
    enriched.properties = { ...schema.properties };

    for (const hint of analysis.fieldHints) {
      const prop = enriched.properties[hint.fieldPath];
      if (prop && hint.confidence >= 0.5) {
        enriched.properties[hint.fieldPath] = {
          ...prop,
          'x-faker': {
            method: mapSemanticToFaker(hint.suggestedSemantic),
            aiConfidence: hint.confidence,
          },
        };
      }
    }
  }

  // Handle array schema
  if (schema.type === 'array' && schema.items && !Array.isArray(schema.items)) {
    enriched.items = applyAIAnalysis(schema.items, analysis);
  }

  return enriched;
}

// Map semantic type to faker method
function mapSemanticToFaker(semantic: string): string {
  const mapping: Record<string, string> = {
    firstName: 'person.firstName',
    lastName: 'person.lastName',
    fullName: 'person.fullName',
    email: 'internet.email',
    phone: 'phone.number',
    url: 'internet.url',
    city: 'location.city',
    country: 'location.country',
    streetAddress: 'location.streetAddress',
    zipCode: 'location.zipCode',
    price: 'commerce.price',
    company: 'company.name',
    jobTitle: 'person.jobTitle',
    uuid: 'string.uuid',
    id: 'number.int',
    date: 'date.past',
    datetime: 'date.past',
    boolean: 'datatype.boolean',
    integer: 'number.int',
    number: 'number.float',
  };
  return mapping[semantic] || 'lorem.word';
}

export function useSchemaInference() {
  const { inputJson, schema, setSchema, setParseError } = useSchemaStore();
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [hasAIEnhancement, setHasAIEnhancement] = useState(false);
  const [aiPreference, setAIPreference] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Basic schema inference with regex (fast, local - runs on input change)
  const inferFromJson = useCallback(() => {
    if (!inputJson.trim()) {
      setSchema(null);
      setParseError(null);
      setHasAIEnhancement(false);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const rawSchema = inferSchema(parsed);

      // Use regex-based enrichment (fast, no server call)
      const enriched = enrichSchemaWithSemantics(rawSchema);
      setSchema(enriched);
      setParseError(null);
      setHasAIEnhancement(false);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
      setSchema(null);
      setHasAIEnhancement(false);
    }
  }, [inputJson, setSchema, setParseError]);

  // AI-enhanced analysis (expensive - only on explicit user action)
  const analyzeWithAI = useCallback(async (): Promise<{ success: boolean; aborted?: boolean; error?: string }> => {
    if (!schema) return { success: false, error: 'No schema available' };

    // Cancel any pending AI request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsUsingAI(true);
      const response = await fetch('/api/ai/analyze-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, config: { enabled: true } }),
        signal: abortControllerRef.current.signal,
      });

      if (response.ok) {
        const data = await response.json() as {
          success?: boolean;
          analysis?: { fieldHints: Array<{ fieldPath: string; suggestedSemantic: string; confidence: number }> }
        };

        if (data.success && data.analysis) {
          const enriched = applyAIAnalysis(schema, data.analysis);
          setSchema(enriched);
          setHasAIEnhancement(true);
          return { success: true };
        }
      }

      // AI failed - keep current schema (already has regex enrichment)
      console.log('AI analysis not available, keeping regex-based detection');
      return { success: false, error: 'AI analysis not available' };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('AI analysis cancelled');
        return { success: false, aborted: true };
      }
      console.log('AI analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsUsingAI(false);
      abortControllerRef.current = null;
    }
  }, [schema, setSchema]);

  // Cancel AI analysis
  const cancelAIAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsUsingAI(false);
    }
  }, []);

  // Auto-infer on input change (regex only - debounced)
  useEffect(() => {
    const timer = setTimeout(inferFromJson, 300);
    return () => clearTimeout(timer);
  }, [inferFromJson]);

  return {
    inferFromJson,
    analyzeWithAI,
    cancelAIAnalysis,
    isUsingAI,
    hasAIEnhancement,
    aiPreference,
    setAIPreference
  };
}
