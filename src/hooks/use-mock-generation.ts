'use client';

import { useCallback } from 'react';
import { useSchemaStore } from '@/store/schema-store';
import { useGeneratorStore } from '@/store/generator-store';
import { generateMockData } from '@/lib/generator/generateMock';

export function useMockGeneration() {
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
      // Run generation in a microtask to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));

      const config = getConfig();
      const data = generateMockData(schema, config);

      setGeneratedData(data);
    } catch (error) {
      console.error('Generation failed:', error);
      setGeneratedData([]);
    } finally {
      setIsGenerating(false);
    }
  }, [schema, getConfig, setGeneratedData, setIsGenerating]);

  return { generate };
}
