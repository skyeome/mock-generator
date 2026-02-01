'use client';

import { useCallback } from 'react';
import { useSchemaStore } from '@/store/schema-store';
import { useGeneratorStore } from '@/store/generator-store';
import { generateMockData } from '@/lib/generator/generateMock';

interface UseMockGenerationOptions {
  analyzeWithAI: () => Promise<{ success: boolean; aborted?: boolean; error?: string }>;
  aiPreference: boolean;
  hasAIEnhancement: boolean;
}

export function useMockGeneration({
  analyzeWithAI,
  aiPreference,
  hasAIEnhancement
}: UseMockGenerationOptions) {
  const { schema } = useSchemaStore();
  const {
    getConfig,
    setGeneratedData,
    setIsGenerating
  } = useGeneratorStore();

  const generate = useCallback(async () => {
    if (!schema) {
      console.warn('No schema available for generation');
      return;
    }

    setIsGenerating(true);

    try {
      // Step 1: Run AI analysis if preference is ON and not already applied
      if (aiPreference && !hasAIEnhancement) {
        const aiResult = await analyzeWithAI();

        if (aiResult.aborted) {
          // User cancelled AI - log and proceed with regex
          console.log('AI analysis cancelled. Using pattern-based detection.');
        } else if (!aiResult.success) {
          // AI failed - log and proceed with regex
          console.log('AI analysis failed. Using pattern-based detection.');
        }
        // If success, schema is now AI-enhanced (state updated by analyzeWithAI)
        // Either way, proceed to generation
      }

      // Step 2: Allow UI to update before CPU-intensive generation
      await new Promise(resolve => setTimeout(resolve, 0));

      // Step 3: Generate mock data using current schema (may be AI-enhanced or regex-only)
      const config = getConfig();
      const data = generateMockData(schema, config);

      setGeneratedData(data);
    } catch (error) {
      console.error('Generation failed:', error);
      setGeneratedData([]);
    } finally {
      setIsGenerating(false);
    }
  }, [schema, getConfig, setGeneratedData, setIsGenerating, analyzeWithAI, aiPreference, hasAIEnhancement]);

  return { generate };
}
