'use client';

import { useCallback, useEffect, useState } from 'react';
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
  const { inputJson, setSchema, setParseError } = useSchemaStore();
  const [isUsingAI, setIsUsingAI] = useState(false);

  const inferFromJson = useCallback(async () => {
    if (!inputJson.trim()) {
      setSchema(null);
      setParseError(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const schema = inferSchema(parsed);

      // Try AI first
      try {
        setIsUsingAI(true);
        const response = await fetch('/api/ai/analyze-schema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schema, config: { enabled: true } }),
        });

        if (response.ok) {
          const data = await response.json() as { success?: boolean; analysis?: { fieldHints: Array<{ fieldPath: string; suggestedSemantic: string; confidence: number }> } };
          if (data.success && data.analysis) {
            const enriched = applyAIAnalysis(schema, data.analysis);
            setSchema(enriched);
            setParseError(null);
            return;
          }
        }
      } catch (aiError) {
        console.log('AI analysis not available, using regex fallback');
      } finally {
        setIsUsingAI(false);
      }

      // Fallback to regex-based enrichment
      const enriched = enrichSchemaWithSemantics(schema);
      setSchema(enriched);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
      setSchema(null);
    }
  }, [inputJson, setSchema, setParseError]);

  // Auto-infer on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(inferFromJson, 300);
    return () => clearTimeout(timer);
  }, [inferFromJson]);

  return { inferFromJson, isUsingAI };
}
