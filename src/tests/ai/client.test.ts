import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIClient, createAIClient } from '@/lib/ai/client';
import type { AISchemaAnalysis } from '@/lib/types/ai';
import type { JsonSchema } from '@/lib/types';

// Mock Cloudflare AI binding
const createMockAI = (response: unknown) => ({
  run: vi.fn().mockResolvedValue(response),
});

// Store original process.env
const originalEnv = process.env;

describe('AIClient', () => {
  describe('constructor', () => {
    it('should create client with default config', () => {
      const client = new AIClient();
      expect(client).toBeInstanceOf(AIClient);
    });

    it('should merge custom config with defaults', () => {
      const client = new AIClient({ maxTokens: 2048 });
      expect(client).toBeInstanceOf(AIClient);
    });

    it('should allow disabling AI via config', () => {
      const client = new AIClient({ enabled: false });
      expect(client).toBeInstanceOf(AIClient);
    });

    it('should allow custom model configuration', () => {
      const client = new AIClient({ model: '@cf/meta/llama-3.2-1b-instruct' });
      expect(client).toBeInstanceOf(AIClient);
    });

    it('should allow custom temperature', () => {
      const client = new AIClient({ temperature: 0.3 });
      expect(client).toBeInstanceOf(AIClient);
    });
  });

  describe('analyzeSchema', () => {
    const sampleSchema: JsonSchema = {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
    };

    const validResponse: AISchemaAnalysis = {
      domainContext: 'user-profile',
      fieldHints: [
        { fieldPath: 'firstName', suggestedSemantic: 'firstName', confidence: 0.95 },
        { fieldPath: 'lastName', suggestedSemantic: 'lastName', confidence: 0.95 },
        { fieldPath: 'email', suggestedSemantic: 'email', confidence: 0.98 },
      ],
      coherenceGroups: [['firstName', 'lastName', 'email']],
    };

    it('should return null when AI is disabled', async () => {
      const client = new AIClient({ enabled: false });
      const mockAI = createMockAI(validResponse);

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
      expect(mockAI.run).not.toHaveBeenCalled();
    });

    it('should successfully analyze schema with valid AI response', async () => {
      const client = new AIClient();
      const mockAI = createMockAI({ response: JSON.stringify(validResponse) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toEqual(validResponse);
      expect(mockAI.run).toHaveBeenCalledTimes(1);
    });

    it('should call AI with correct parameters', async () => {
      const client = new AIClient({
        model: '@cf/meta/llama-3.1-8b-instruct',
        maxTokens: 1024,
        temperature: 0.7
      });
      const mockAI = createMockAI({ response: JSON.stringify(validResponse) });

      await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(mockAI.run).toHaveBeenCalledWith(
        '@cf/meta/llama-3.1-8b-instruct',
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
          max_tokens: 1024,
          temperature: 0.7,
        })
      );
    });

    it('should handle response wrapped in markdown code blocks', async () => {
      const client = new AIClient();
      const wrappedResponse = '```json\n' + JSON.stringify(validResponse) + '\n```';
      const mockAI = createMockAI({ response: wrappedResponse });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toEqual(validResponse);
    });

    it('should handle response with extra text around JSON', async () => {
      const client = new AIClient();
      const messyResponse = 'Here is the analysis:\n' + JSON.stringify(validResponse) + '\nHope this helps!';
      const mockAI = createMockAI({ response: messyResponse });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toEqual(validResponse);
    });

    it('should handle response with content field instead of response', async () => {
      const client = new AIClient();
      const mockAI = createMockAI({ content: JSON.stringify(validResponse) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toEqual(validResponse);
    });

    it('should return null for invalid JSON response', async () => {
      const client = new AIClient();
      const mockAI = createMockAI({ response: 'not valid json at all' });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
    });

    it('should return null for response with no JSON object', async () => {
      const client = new AIClient();
      const mockAI = createMockAI({ response: 'Just some text without any JSON' });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
    });

    it('should return null for missing domainContext field', async () => {
      const client = new AIClient();
      const invalidResponse = {
        fieldHints: validResponse.fieldHints,
        coherenceGroups: validResponse.coherenceGroups
      };
      const mockAI = createMockAI({ response: JSON.stringify(invalidResponse) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
    });

    it('should return null for missing fieldHints field', async () => {
      const client = new AIClient();
      const invalidResponse = {
        domainContext: 'test',
        coherenceGroups: validResponse.coherenceGroups
      };
      const mockAI = createMockAI({ response: JSON.stringify(invalidResponse) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
    });

    it('should return null for non-array fieldHints', async () => {
      const client = new AIClient();
      const invalidResponse = {
        domainContext: 'test',
        fieldHints: 'not an array',
        coherenceGroups: []
      };
      const mockAI = createMockAI({ response: JSON.stringify(invalidResponse) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
    });

    it('should handle AI service errors with fallback enabled', async () => {
      const client = new AIClient({ fallbackOnError: true });
      const mockAI = {
        run: vi.fn().mockRejectedValue(new Error('AI service unavailable')),
      };

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
    });

    it('should throw error when fallback disabled and AI fails', async () => {
      const client = new AIClient({ fallbackOnError: false });
      const mockAI = {
        run: vi.fn().mockRejectedValue(new Error('AI service unavailable')),
      };

      await expect(
        client.analyzeSchema(sampleSchema, mockAI as unknown as Ai)
      ).rejects.toThrow('AI service unavailable');
    });

    it('should handle network timeout errors gracefully', async () => {
      const client = new AIClient({ fallbackOnError: true });
      const mockAI = {
        run: vi.fn().mockRejectedValue(new Error('Request timeout')),
      };

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toBeNull();
    });

    it('should handle empty schema', async () => {
      const client = new AIClient();
      const emptyResponse: AISchemaAnalysis = {
        domainContext: 'unknown',
        fieldHints: [],
        coherenceGroups: [],
      };
      const mockAI = createMockAI({ response: JSON.stringify(emptyResponse) });

      const result = await client.analyzeSchema({ type: 'object' }, mockAI as unknown as Ai);

      expect(result).toEqual(emptyResponse);
    });

    it('should handle complex nested schema', async () => {
      const client = new AIClient();
      const nestedSchema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                  country: { type: 'string' },
                },
              },
            },
          },
        },
      };

      const nestedResponse: AISchemaAnalysis = {
        domainContext: 'user-profile',
        fieldHints: [
          { fieldPath: 'user.name', suggestedSemantic: 'fullName', confidence: 0.8 },
          { fieldPath: 'user.address.city', suggestedSemantic: 'city', confidence: 0.9 },
          { fieldPath: 'user.address.country', suggestedSemantic: 'country', confidence: 0.9 },
        ],
        coherenceGroups: [['user.address.city', 'user.address.country']],
      };
      const mockAI = createMockAI({ response: JSON.stringify(nestedResponse) });

      const result = await client.analyzeSchema(nestedSchema, mockAI as unknown as Ai);

      expect(result).toEqual(nestedResponse);
      expect(mockAI.run).toHaveBeenCalled();
    });

    it('should handle array schema', async () => {
      const client = new AIClient();
      const arraySchema: JsonSchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      };

      const arrayResponse: AISchemaAnalysis = {
        domainContext: 'list-items',
        fieldHints: [
          { fieldPath: 'items.id', suggestedSemantic: 'id', confidence: 0.95 },
          { fieldPath: 'items.name', suggestedSemantic: 'fullName', confidence: 0.85 },
        ],
        coherenceGroups: [],
      };
      const mockAI = createMockAI({ response: JSON.stringify(arrayResponse) });

      const result = await client.analyzeSchema(arraySchema, mockAI as unknown as Ai);

      expect(result).toEqual(arrayResponse);
      expect(mockAI.run).toHaveBeenCalled();
    });

    it('should handle schema with multiple semantic types', async () => {
      const client = new AIClient();
      const ecommerceSchema: JsonSchema = {
        type: 'object',
        properties: {
          productName: { type: 'string' },
          price: { type: 'number' },
          currency: { type: 'string' },
          sellerId: { type: 'string', format: 'uuid' },
          sellerName: { type: 'string' },
          category: { type: 'string' },
          stock: { type: 'integer' },
        },
      };

      const ecommerceResponse: AISchemaAnalysis = {
        domainContext: 'e-commerce',
        fieldHints: [
          { fieldPath: 'productName', suggestedSemantic: 'word', confidence: 0.95 },
          { fieldPath: 'price', suggestedSemantic: 'price', confidence: 0.98 },
          { fieldPath: 'currency', suggestedSemantic: 'currency', confidence: 0.92 },
          { fieldPath: 'sellerId', suggestedSemantic: 'uuid', confidence: 0.99 },
          { fieldPath: 'sellerName', suggestedSemantic: 'company', confidence: 0.85 },
          { fieldPath: 'category', suggestedSemantic: 'word', confidence: 0.88 },
          { fieldPath: 'stock', suggestedSemantic: 'integer', confidence: 0.90 },
        ],
        coherenceGroups: [
          ['price', 'currency'],
          ['sellerId', 'sellerName'],
        ],
      };
      const mockAI = createMockAI({ response: JSON.stringify(ecommerceResponse) });

      const result = await client.analyzeSchema(ecommerceSchema, mockAI as unknown as Ai);

      expect(result).toEqual(ecommerceResponse);
      expect(result?.fieldHints.length).toBe(7);
      expect(result?.coherenceGroups.length).toBe(2);
    });

    it('should handle response with optional relatedFields', async () => {
      const client = new AIClient();
      const responseWithRelated: AISchemaAnalysis = {
        domainContext: 'user-profile',
        fieldHints: [
          {
            fieldPath: 'firstName',
            suggestedSemantic: 'firstName',
            confidence: 0.95,
            relatedFields: ['lastName', 'fullName']
          },
          {
            fieldPath: 'lastName',
            suggestedSemantic: 'lastName',
            confidence: 0.95,
            relatedFields: ['firstName']
          },
        ],
        coherenceGroups: [['firstName', 'lastName']],
      };
      const mockAI = createMockAI({ response: JSON.stringify(responseWithRelated) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toEqual(responseWithRelated);
      expect(result?.fieldHints[0].relatedFields).toBeDefined();
      expect(result?.fieldHints[0].relatedFields).toContain('lastName');
    });

    it('should handle response with optional reasoning field', async () => {
      const client = new AIClient();
      const responseWithReasoning: AISchemaAnalysis = {
        domainContext: 'user-profile',
        fieldHints: [
          {
            fieldPath: 'email',
            suggestedSemantic: 'email',
            confidence: 0.98,
            reasoning: 'Field name and format suggest email address'
          },
        ],
        coherenceGroups: [],
      };
      const mockAI = createMockAI({ response: JSON.stringify(responseWithReasoning) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toEqual(responseWithReasoning);
      expect(result?.fieldHints[0].reasoning).toBe('Field name and format suggest email address');
    });

    it('should handle primitive type schemas', async () => {
      const client = new AIClient();
      const primitiveSchema: JsonSchema = { type: 'string', format: 'email' };
      const primitiveResponse: AISchemaAnalysis = {
        domainContext: 'email-field',
        fieldHints: [
          { fieldPath: 'root', suggestedSemantic: 'email', confidence: 1.0 }
        ],
        coherenceGroups: [],
      };
      const mockAI = createMockAI({ response: JSON.stringify(primitiveResponse) });

      const result = await client.analyzeSchema(primitiveSchema, mockAI as unknown as Ai);

      expect(result).toEqual(primitiveResponse);
    });

    it('should handle confidence values correctly', async () => {
      const client = new AIClient();
      const responseWithVaryingConfidence: AISchemaAnalysis = {
        domainContext: 'mixed-confidence',
        fieldHints: [
          { fieldPath: 'field1', suggestedSemantic: 'email', confidence: 1.0 },
          { fieldPath: 'field2', suggestedSemantic: 'fullName', confidence: 0.5 },
          { fieldPath: 'field3', suggestedSemantic: 'unknown', confidence: 0.2 },
        ],
        coherenceGroups: [],
      };
      const mockAI = createMockAI({ response: JSON.stringify(responseWithVaryingConfidence) });

      const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

      expect(result).toEqual(responseWithVaryingConfidence);
      expect(result?.fieldHints[0].confidence).toBe(1.0);
      expect(result?.fieldHints[1].confidence).toBe(0.5);
      expect(result?.fieldHints[2].confidence).toBe(0.2);
    });
  });
});

describe('createAIClient', () => {
  it('should create a new AIClient instance', () => {
    const client = createAIClient();
    expect(client).toBeInstanceOf(AIClient);
  });

  it('should pass config to AIClient', () => {
    const client = createAIClient({ enabled: false });
    expect(client).toBeInstanceOf(AIClient);
  });

  it('should create client with custom maxTokens', () => {
    const client = createAIClient({ maxTokens: 2048 });
    expect(client).toBeInstanceOf(AIClient);
  });

  it('should create client with custom temperature', () => {
    const client = createAIClient({ temperature: 0.3 });
    expect(client).toBeInstanceOf(AIClient);
  });

  it('should create multiple independent instances', () => {
    const client1 = createAIClient({ enabled: true });
    const client2 = createAIClient({ enabled: false });

    expect(client1).toBeInstanceOf(AIClient);
    expect(client2).toBeInstanceOf(AIClient);
    expect(client1).not.toBe(client2);
  });
});

describe('AIClient - Response Parsing Edge Cases', () => {
  const sampleSchema: JsonSchema = {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  };

  const validResponse: AISchemaAnalysis = {
    domainContext: 'user-profile',
    fieldHints: [
      { fieldPath: 'firstName', suggestedSemantic: 'firstName', confidence: 0.95 },
      { fieldPath: 'email', suggestedSemantic: 'email', confidence: 0.98 },
    ],
    coherenceGroups: [['firstName', 'email']],
  };

  it('should handle AI client internal error during parsing', async () => {
    const client = new AIClient({ fallbackOnError: true });
    // Pass a response that will trigger parseResponse error handling
    const mockAI = createMockAI({ response: '{ broken json without proper formatting' });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });

  it('should throw parsing errors when fallback disabled', async () => {
    const client = new AIClient({ fallbackOnError: false });
    // Create a mock AI that throws during processing
    const mockAI = {
      run: vi.fn().mockImplementation(() => {
        throw new Error('AI runtime error');
      }),
    };

    await expect(
      client.analyzeSchema(sampleSchema, mockAI as unknown as Ai)
    ).rejects.toThrow('AI runtime error');
  });

  it('should handle response with complex nested JSON that fails validation', async () => {
    const client = new AIClient();
    // Valid JSON but missing required fields
    const invalidStructure = {
      notDomainContext: 'test',
      notFieldHints: [],
    };
    const mockAI = createMockAI({ response: JSON.stringify(invalidStructure) });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });

  it('should extract and parse JSON from response with markdown and text', async () => {
    const client = new AIClient();
    const responseWithMarkdown = `
Here's the analysis:
\`\`\`json
${JSON.stringify(validResponse)}
\`\`\`
This should work!`;
    const mockAI = createMockAI({ response: responseWithMarkdown });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toEqual(validResponse);
  });

  it('should handle catch block in parseResponse for unexpected errors', async () => {
    const client = new AIClient();
    // Create a string that will cause JSON.parse to throw
    const problematicJSON = '{"domainContext": "test", "fieldHints": [}';
    const mockAI = createMockAI({ response: problematicJSON });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });
});

describe('AIClient - Cloudflare Response Edge Cases', () => {
  const sampleSchema: JsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  };

  const validResponse: AISchemaAnalysis = {
    domainContext: 'test',
    fieldHints: [{ fieldPath: 'name', suggestedSemantic: 'fullName', confidence: 0.9 }],
    coherenceGroups: [],
  };

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should handle Cloudflare response as primitive string', async () => {
    const client = new AIClient();
    const mockAI = createMockAI(JSON.stringify(validResponse));

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toEqual(validResponse);
  });

  it('should handle Cloudflare response as number', async () => {
    const client = new AIClient();
    const mockAI = createMockAI(42);

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull(); // Number won't contain valid JSON
  });

  it('should handle Cloudflare response as null', async () => {
    const client = new AIClient();
    const mockAI = createMockAI(null);

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });

  it('should return null when Cloudflare AI binding is missing', async () => {
    const client = new AIClient();

    const result = await client.analyzeSchema(sampleSchema, undefined);

    expect(result).toBeNull();
  });

  it('should handle Cloudflare response with neither response nor content field', async () => {
    const client = new AIClient();
    const mockAI = createMockAI({ someOtherField: 'value' });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });
});

describe('AIClient - Parse Response Edge Cases', () => {
  const sampleSchema: JsonSchema = {
    type: 'object',
    properties: {
      test: { type: 'string' },
    },
  };

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should handle malformed JSON in response', async () => {
    const client = new AIClient();
    const malformedJSON = '{ "domainContext": "test", "fieldHints": [missing closing bracket';
    const mockAI = createMockAI({ response: malformedJSON });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });

  it('should handle JSON with syntax errors', async () => {
    const client = new AIClient();
    const invalidJSON = '{ "domainContext": "test", fieldHints: [] }'; // Missing quotes
    const mockAI = createMockAI({ response: invalidJSON });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });

  it('should handle response with nested JSON objects and extract first match', async () => {
    const client = new AIClient();
    const validResponse: AISchemaAnalysis = {
      domainContext: 'test',
      fieldHints: [],
      coherenceGroups: [],
    };
    const nestedResponse = `Some text { "invalid": "json" } more text ${JSON.stringify(validResponse)} extra`;
    const mockAI = createMockAI({ response: nestedResponse });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    // Should match the first JSON object found (invalid one)
    expect(result).toBeNull();
  });

  it('should handle empty string response', async () => {
    const client = new AIClient();
    const mockAI = createMockAI({ response: '' });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });

  it('should handle response with only whitespace', async () => {
    const client = new AIClient();
    const mockAI = createMockAI({ response: '   \n\t  ' });

    const result = await client.analyzeSchema(sampleSchema, mockAI as unknown as Ai);

    expect(result).toBeNull();
  });
});
