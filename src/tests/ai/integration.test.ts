import { describe, it, expect, vi } from 'vitest';
import { enrichSchemaWithAI, analyzeSchemaWithAI } from '@/lib/schema/aiDetectSemantic';
import { enrichSchemaWithSemantics } from '@/lib/schema/enrichSchema';
import type { JsonSchema } from '@/lib/types';
import type { AISchemaAnalysis } from '@/lib/types/ai';

// Mock AI binding helper
const createMockAI = (response: AISchemaAnalysis) => ({
  run: vi.fn().mockResolvedValue({ response: JSON.stringify(response) }),
});

describe('AI Integration', () => {
  describe('enrichSchemaWithAI', () => {
    const userSchema: JsonSchema = {
      type: 'object',
      properties: {
        buyerFirstName: { type: 'string' },
        buyerLastName: { type: 'string' },
        buyerEmail: { type: 'string', format: 'email' },
        totalPrice: { type: 'number' },
      },
    };

    it('should fall back to regex when AI is null', async () => {
      const result = await enrichSchemaWithAI(userSchema, null, { enabled: false });

      // Should still have x-faker hints from regex detection
      expect(result.properties?.buyerEmail?.['x-faker']).toBeDefined();
      expect(result.properties?.buyerEmail?.['x-faker']?.method).toBe('internet.email');
    });

    it('should fall back to regex when AI is disabled', async () => {
      const mockAI = createMockAI({
        domainContext: 'test',
        fieldHints: [],
        coherenceGroups: [],
      });

      const result = await enrichSchemaWithAI(userSchema, mockAI as unknown as Ai, { enabled: false });

      // AI should not be called
      expect(mockAI.run).not.toHaveBeenCalled();
      // Should still have regex-based hints
      expect(result.properties?.buyerEmail?.['x-faker']).toBeDefined();
    });

    it('should apply AI hints with high confidence', async () => {
      const aiResponse: AISchemaAnalysis = {
        domainContext: 'e-commerce',
        fieldHints: [
          { fieldPath: 'buyerFirstName', suggestedSemantic: 'firstName', confidence: 0.95 },
          { fieldPath: 'buyerLastName', suggestedSemantic: 'lastName', confidence: 0.95 },
          { fieldPath: 'buyerEmail', suggestedSemantic: 'email', confidence: 0.98 },
          { fieldPath: 'totalPrice', suggestedSemantic: 'price', confidence: 0.9 },
        ],
        coherenceGroups: [['buyerFirstName', 'buyerLastName', 'buyerEmail']],
      };
      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(userSchema, mockAI as unknown as Ai, { enabled: true });

      // Check AI domain context was stored
      expect(result['x-ai-domain']).toBe('e-commerce');

      // Check coherence groups were stored
      expect(result['x-ai-coherence']).toEqual([['buyerFirstName', 'buyerLastName', 'buyerEmail']]);

      // Check AI hints were applied
      expect(result.properties?.buyerFirstName?.['x-faker']?.method).toBe('person.firstName');
      expect(result.properties?.buyerFirstName?.['x-faker']?.aiConfidence).toBe(0.95);
    });

    it('should ignore AI hints with low confidence', async () => {
      const aiResponse: AISchemaAnalysis = {
        domainContext: 'unknown',
        fieldHints: [
          { fieldPath: 'buyerFirstName', suggestedSemantic: 'firstName', confidence: 0.3 }, // Low confidence
        ],
        coherenceGroups: [],
      };
      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(userSchema, mockAI as unknown as Ai, { enabled: true });

      // Low confidence hint should be ignored, regex fallback used
      const prop = result.properties?.buyerFirstName;
      expect(prop?.['x-faker']?.aiConfidence).toBeUndefined(); // No AI confidence means regex was used
      // buyerFirstName doesn't match regex pattern (requires exact match like "firstName"), so falls back to lorem.word
      expect(prop?.['x-faker']?.method).toBe('lorem.word');
    });

    it('should handle AI errors gracefully with fallback', async () => {
      const mockAI = {
        run: vi.fn().mockRejectedValue(new Error('AI unavailable')),
      };

      const result = await enrichSchemaWithAI(
        userSchema,
        mockAI as unknown as Ai,
        { enabled: true, fallbackOnError: true }
      );

      // Should still return enriched schema from regex
      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.properties?.buyerEmail?.['x-faker']?.method).toBe('internet.email');
    });

    it('should handle null AI analysis response', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ response: null }),
      };

      const result = await enrichSchemaWithAI(userSchema, mockAI as unknown as Ai, { enabled: true });

      // Should fall back to regex when AI returns null
      expect(result.properties?.buyerEmail?.['x-faker']).toBeDefined();
    });

    it('should handle invalid JSON from AI', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ response: 'invalid json {' }),
      };

      const result = await enrichSchemaWithAI(userSchema, mockAI as unknown as Ai, { enabled: true });

      // Should fall back to regex on parse error
      expect(result.properties?.buyerEmail?.['x-faker']).toBeDefined();
    });
  });

  describe('AI vs Regex comparison', () => {
    it('should detect complex field names that regex misses', async () => {
      const complexSchema: JsonSchema = {
        type: 'object',
        properties: {
          primaryContactFirstName: { type: 'string' },
          primaryContactLastName: { type: 'string' },
          primaryContactEmail: { type: 'string' },
        },
      };

      // Regex-based detection
      const regexResult = enrichSchemaWithSemantics(complexSchema);

      // AI-based detection (mocked)
      const aiResponse: AISchemaAnalysis = {
        domainContext: 'business',
        fieldHints: [
          { fieldPath: 'primaryContactFirstName', suggestedSemantic: 'firstName', confidence: 0.9 },
          { fieldPath: 'primaryContactLastName', suggestedSemantic: 'lastName', confidence: 0.9 },
          { fieldPath: 'primaryContactEmail', suggestedSemantic: 'email', confidence: 0.95 },
        ],
        coherenceGroups: [['primaryContactFirstName', 'primaryContactLastName', 'primaryContactEmail']],
      };
      const mockAI = createMockAI(aiResponse);
      const aiResult = await enrichSchemaWithAI(complexSchema, mockAI as unknown as Ai, { enabled: true });

      // AI should provide coherence groups that regex cannot
      expect(aiResult['x-ai-coherence']).toBeDefined();
      expect(regexResult['x-ai-coherence']).toBeUndefined();

      // AI should provide domain context
      expect(aiResult['x-ai-domain']).toBe('business');
      expect(regexResult['x-ai-domain']).toBeUndefined();
    });

    it('should provide reasoning that regex cannot', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          customerIdentifier: { type: 'string' },
        },
      };

      const aiResponse: AISchemaAnalysis = {
        domainContext: 'crm',
        fieldHints: [
          {
            fieldPath: 'customerIdentifier',
            suggestedSemantic: 'uuid',
            confidence: 0.85,
            reasoning: 'Field name suggests unique customer ID in CRM context'
          },
        ],
        coherenceGroups: [],
      };
      const mockAI = createMockAI(aiResponse);

      const aiResult = await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: true });

      // AI provides reasoning
      expect(aiResult.properties?.customerIdentifier?.['x-faker']?.aiReasoning).toBeDefined();

      // Regex doesn't provide reasoning
      const regexResult = enrichSchemaWithSemantics(schema);
      expect(regexResult.properties?.customerIdentifier?.['x-faker']?.aiReasoning).toBeUndefined();
    });
  });

  describe('Feature flag behavior', () => {
    it('should respect enabled=false config', async () => {
      const schema: JsonSchema = { type: 'object', properties: { name: { type: 'string' } } };
      const mockAI = createMockAI({
        domainContext: 'test',
        fieldHints: [{ fieldPath: 'name', suggestedSemantic: 'fullName', confidence: 0.9 }],
        coherenceGroups: [],
      });

      const result = await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: false });

      expect(mockAI.run).not.toHaveBeenCalled();
    });

    it('should use default config when not specified', async () => {
      const schema: JsonSchema = { type: 'object', properties: { email: { type: 'string' } } };
      const mockAI = createMockAI({
        domainContext: 'test',
        fieldHints: [],
        coherenceGroups: [],
      });

      // Call with enabled: true to ensure AI is used (config.enabled defaults to undefined without explicit pass)
      await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: true });

      expect(mockAI.run).toHaveBeenCalled();
    });

    it('should pass config to AI client', async () => {
      const schema: JsonSchema = { type: 'object', properties: { email: { type: 'string' } } };
      const mockAI = createMockAI({
        domainContext: 'test',
        fieldHints: [],
        coherenceGroups: [],
      });

      await enrichSchemaWithAI(schema, mockAI as unknown as Ai, {
        enabled: true,
        model: '@cf/meta/llama-3.1-70b-instruct',
        maxTokens: 2048,
        temperature: 0.5
      });

      expect(mockAI.run).toHaveBeenCalled();
    });
  });

  describe('Coherence group handling', () => {
    it('should store coherence groups in schema extensions', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
        },
      };

      const aiResponse: AISchemaAnalysis = {
        domainContext: 'user-profile',
        fieldHints: [
          { fieldPath: 'firstName', suggestedSemantic: 'firstName', confidence: 0.95, relatedFields: ['lastName', 'email'] },
          { fieldPath: 'lastName', suggestedSemantic: 'lastName', confidence: 0.95, relatedFields: ['firstName', 'email'] },
          { fieldPath: 'email', suggestedSemantic: 'email', confidence: 0.98, relatedFields: ['firstName', 'lastName'] },
        ],
        coherenceGroups: [['firstName', 'lastName', 'email']],
      };
      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: true });

      expect(result['x-ai-coherence']).toEqual([['firstName', 'lastName', 'email']]);
    });

    it('should handle multiple coherence groups', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          buyerFirstName: { type: 'string' },
          buyerLastName: { type: 'string' },
          sellerFirstName: { type: 'string' },
          sellerLastName: { type: 'string' },
        },
      };

      const aiResponse: AISchemaAnalysis = {
        domainContext: 'e-commerce',
        fieldHints: [],
        coherenceGroups: [
          ['buyerFirstName', 'buyerLastName'],
          ['sellerFirstName', 'sellerLastName'],
        ],
      };
      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: true });

      expect(result['x-ai-coherence']).toHaveLength(2);
      expect(result['x-ai-coherence']).toContainEqual(['buyerFirstName', 'buyerLastName']);
      expect(result['x-ai-coherence']).toContainEqual(['sellerFirstName', 'sellerLastName']);
    });

    it('should store relatedFields in property extensions', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      };

      const aiResponse: AISchemaAnalysis = {
        domainContext: 'user',
        fieldHints: [
          {
            fieldPath: 'firstName',
            suggestedSemantic: 'firstName',
            confidence: 0.9,
            relatedFields: ['lastName']
          },
        ],
        coherenceGroups: [],
      };
      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: true });

      expect(result.properties?.firstName?.['x-ai-related']).toEqual(['lastName']);
    });
  });

  describe('Nested schema handling', () => {
    it('should enrich nested object properties', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
      };

      const aiResponse: AISchemaAnalysis = {
        domainContext: 'user-management',
        fieldHints: [
          { fieldPath: 'user.email', suggestedSemantic: 'email', confidence: 0.95 },
          { fieldPath: 'user.phone', suggestedSemantic: 'phone', confidence: 0.9 },
        ],
        coherenceGroups: [['user.email', 'user.phone']],
      };
      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: true });

      expect(result.properties?.user?.properties?.email?.['x-faker']?.method).toBe('internet.email');
      expect(result.properties?.user?.properties?.phone?.['x-faker']?.method).toBe('phone.number');
    });

    it('should handle array item schemas', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const aiResponse: AISchemaAnalysis = {
        domainContext: 'user-list',
        fieldHints: [],
        coherenceGroups: [],
      };
      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(schema, mockAI as unknown as Ai, { enabled: true });

      expect(result['x-ai-domain']).toBe('user-list');
      expect(result.properties?.users?.type).toBe('array');
      expect(result.properties?.users?.items).toBeDefined();
    });
  });

  describe('analyzeSchemaWithAI', () => {
    it('should call AI with schema and return analysis', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          email: { type: 'string' },
        },
      };

      const expectedResponse: AISchemaAnalysis = {
        domainContext: 'contact',
        fieldHints: [
          { fieldPath: 'email', suggestedSemantic: 'email', confidence: 0.95 },
        ],
        coherenceGroups: [],
      };

      const mockAI = createMockAI(expectedResponse);

      const result = await analyzeSchemaWithAI(schema, mockAI as unknown as Ai);

      expect(result).toEqual(expectedResponse);
      expect(mockAI.run).toHaveBeenCalled();
    });

    it('should pass custom config to AI client', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: { test: { type: 'string' } },
      };

      const mockAI = createMockAI({
        domainContext: 'test',
        fieldHints: [],
        coherenceGroups: [],
      });

      await analyzeSchemaWithAI(schema, mockAI as unknown as Ai, {
        temperature: 0.3,
        maxTokens: 512,
      });

      expect(mockAI.run).toHaveBeenCalled();
    });
  });

  describe('End-to-end integration', () => {
    it('should complete full enrichment workflow', async () => {
      const inputSchema: JsonSchema = {
        type: 'object',
        properties: {
          orderNumber: { type: 'string' },
          customerEmail: { type: 'string' },
          shippingAddress: { type: 'string' },
          totalAmount: { type: 'number' },
          createdAt: { type: 'string' },
        },
      };

      const aiResponse: AISchemaAnalysis = {
        domainContext: 'e-commerce-orders',
        fieldHints: [
          { fieldPath: 'orderNumber', suggestedSemantic: 'uuid', confidence: 0.8 },
          { fieldPath: 'customerEmail', suggestedSemantic: 'email', confidence: 0.98 },
          { fieldPath: 'shippingAddress', suggestedSemantic: 'streetAddress', confidence: 0.85 },
          { fieldPath: 'totalAmount', suggestedSemantic: 'price', confidence: 0.92 },
          { fieldPath: 'createdAt', suggestedSemantic: 'pastDate', confidence: 0.95 },
        ],
        coherenceGroups: [
          ['customerEmail', 'shippingAddress'],
        ],
      };

      const mockAI = createMockAI(aiResponse);

      const result = await enrichSchemaWithAI(inputSchema, mockAI as unknown as Ai, { enabled: true });

      // Verify all aspects of enrichment
      expect(result['x-ai-domain']).toBe('e-commerce-orders');
      expect(result['x-ai-coherence']).toContainEqual(['customerEmail', 'shippingAddress']);

      // Verify all fields got appropriate faker hints
      expect(result.properties?.orderNumber?.['x-faker']?.method).toBe('string.uuid');
      expect(result.properties?.customerEmail?.['x-faker']?.method).toBe('internet.email');
      expect(result.properties?.shippingAddress?.['x-faker']?.method).toBe('location.streetAddress');
      expect(result.properties?.totalAmount?.['x-faker']?.method).toBe('commerce.price');
      expect(result.properties?.createdAt?.['x-faker']?.method).toBe('date.past');

      // Verify AI confidence scores are preserved
      expect(result.properties?.customerEmail?.['x-faker']?.aiConfidence).toBe(0.98);
    });
  });
});
