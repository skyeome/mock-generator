import { describe, it, expect } from 'vitest';
import { enrichSchemaWithSemantics, enrichSchema } from '@/lib/schema/enrichSchema';
import type { JsonSchema } from '@/lib/types';

describe('enrichSchemaWithSemantics', () => {
  it('should add x-faker hint for email field', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.email['x-faker']).toBeDefined();
    expect(enriched.properties!.email['x-faker']!.method).toBe('internet.email');
  });

  it('should add x-faker hint for name fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.firstName['x-faker']!.method).toBe('person.firstName');
    expect(enriched.properties!.lastName['x-faker']!.method).toBe('person.lastName');
  });

  it('should handle nested objects', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
          },
        },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.user.properties!.email['x-faker']!.method).toBe('internet.email');
  });

  it('should handle arrays with single item schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        emails: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.emails.type).toBe('array');
    expect(enriched.properties!.emails.items).toBeDefined();
  });

  it('should handle arrays with tuple schema (array of items)', () => {
    const schema: JsonSchema = {
      type: 'array',
      items: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
      ],
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.type).toBe('array');
    expect(Array.isArray(enriched.items)).toBe(true);
    expect((enriched.items as JsonSchema[]).length).toBe(3);
  });

  it('should add args for id fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.id['x-faker']!.method).toBe('number.int');
    expect(enriched.properties!.id['x-faker']!.args).toEqual([{ min: 1, max: 999999 }]);
  });

  it('should handle datetime semantic type', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        timestamp: { type: 'string' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.timestamp['x-faker']!.method).toBe('date.past');
  });

  it('should handle pastDate semantic type', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        createdAt: { type: 'string' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.createdAt['x-faker']!.method).toBe('date.past');
  });

  it('should handle futureDate semantic type', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        expiresAt: { type: 'string' },
        dueDate: { type: 'string' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.expiresAt['x-faker']!.method).toBe('date.future');
    expect(enriched.properties!.dueDate['x-faker']!.method).toBe('date.future');
  });

  it('should preserve original schema properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        age: { type: 'integer', minimum: 0, maximum: 120 },
      },
      required: ['age'],
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.required).toEqual(['age']);
    expect(enriched.properties!.age.minimum).toBe(0);
    expect(enriched.properties!.age.maximum).toBe(120);
  });

  it('should not add x-faker for unknown semantic on numeric types', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        randomNumber: { type: 'number' },
        randomInteger: { type: 'integer' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.randomNumber['x-faker']).toBeUndefined();
    expect(enriched.properties!.randomInteger['x-faker']).toBeUndefined();
  });

  it('should add x-faker for unknown semantic on string types', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        randomField: { type: 'string' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.randomField['x-faker']!.method).toBe('lorem.word');
  });

  it('should handle nested arrays with objects', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              email: { type: 'string' },
            },
          },
        },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.users.type).toBe('array');
    expect(enriched.properties!.users.items).toBeDefined();
    const itemSchema = enriched.properties!.users.items as JsonSchema;
    expect(itemSchema.properties!.email['x-faker']!.method).toBe('internet.email');
  });
});

describe('type-priority detection integration', () => {
  it('should detect userId with integer type as id, not username', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        userId: { type: 'integer' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    // Should be number.int (for id), NOT internet.username
    expect(enriched.properties!.userId['x-faker']!.method).toBe('number.int');
  });

  it('should detect user_id with number type as id, not username', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user_id: { type: 'number' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.user_id['x-faker']!.method).toBe('number.int');
  });

  it('should detect userId with string type as username (login id)', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    // String userId should still be username
    expect(enriched.properties!.userId['x-faker']!.method).toBe('internet.username');
  });

  it('should detect various *Id fields with integer type as numeric id', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        postId: { type: 'integer' },
        orderId: { type: 'integer' },
        customerId: { type: 'integer' },
        productId: { type: 'integer' },
      },
    };
    const enriched = enrichSchemaWithSemantics(schema);
    expect(enriched.properties!.postId['x-faker']!.method).toBe('number.int');
    expect(enriched.properties!.orderId['x-faker']!.method).toBe('number.int');
    expect(enriched.properties!.customerId['x-faker']!.method).toBe('number.int');
    expect(enriched.properties!.productId['x-faker']!.method).toBe('number.int');
  });
});

describe('enrichSchema', () => {
  it('should use regex-based enrichment when no AI options provided', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    };
    const enriched = await enrichSchema(schema);
    expect(enriched.properties!.email['x-faker']!.method).toBe('internet.email');
  });

  it('should use regex-based enrichment when AI binding is null', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
      },
    };
    const enriched = await enrichSchema(schema, { ai: null });
    expect(enriched.properties!.firstName['x-faker']!.method).toBe('person.firstName');
  });

  it('should use regex-based enrichment when AI is disabled in config', async () => {
    const mockAi = {} as Ai;
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        lastName: { type: 'string' },
      },
    };
    const enriched = await enrichSchema(schema, { ai: mockAi, config: { enabled: false } });
    expect(enriched.properties!.lastName['x-faker']!.method).toBe('person.lastName');
  });

  it('should handle empty options object', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        phone: { type: 'string' },
      },
    };
    const enriched = await enrichSchema(schema, {});
    expect(enriched.properties!.phone['x-faker']!.method).toBe('phone.number');
  });

  it('should call AI enrichment when AI binding is provided and enabled', async () => {
    const mockAi = {
      run: async () => ({
        response: JSON.stringify({
          fields: [{ name: 'email', semantic: 'email', confidence: 0.95 }],
        }),
      }),
    } as unknown as Ai;

    const schema: JsonSchema = {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    };

    const enriched = await enrichSchema(schema, { ai: mockAi, config: { enabled: true } });

    // Should have called AI enrichment (aiDetectSemantic module)
    expect(enriched.properties!.email).toBeDefined();
  });
});
