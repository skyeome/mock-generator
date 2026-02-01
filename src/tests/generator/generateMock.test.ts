import { describe, it, expect, beforeEach } from 'vitest';
import { generateMockData, generateSingleRecord } from '@/lib/generator/generateMock';
import type { JsonSchema, GeneratorConfig } from '@/lib/types';

describe('generateMockData', () => {
  const defaultConfig: GeneratorConfig = {
    count: 5,
    locale: 'en',
  };

  describe('primitive types', () => {
    it('should generate null values', () => {
      const schema: JsonSchema = { type: 'null' };
      const result = generateMockData(schema, { count: 3, locale: 'en' });
      expect(result).toHaveLength(3);
      result.forEach(item => expect(item).toBeNull());
    });

    it('should generate boolean values', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const result = generateMockData(schema, { count: 10, locale: 'en' });
      expect(result).toHaveLength(10);
      result.forEach(item => expect(typeof item).toBe('boolean'));
    });

    it('should generate integer values', () => {
      const schema: JsonSchema = { type: 'integer' };
      const result = generateMockData(schema, defaultConfig);
      expect(result).toHaveLength(5);
      result.forEach(item => {
        expect(typeof item).toBe('number');
        expect(Number.isInteger(item)).toBe(true);
      });
    });

    it('should generate number (float) values', () => {
      const schema: JsonSchema = { type: 'number' };
      const result = generateMockData(schema, defaultConfig);
      expect(result).toHaveLength(5);
      result.forEach(item => expect(typeof item).toBe('number'));
    });

    it('should generate string values', () => {
      const schema: JsonSchema = { type: 'string' };
      const result = generateMockData(schema, defaultConfig);
      expect(result).toHaveLength(5);
      result.forEach(item => expect(typeof item).toBe('string'));
    });
  });

  describe('string constraints', () => {
    it('should respect minLength constraint', () => {
      const schema: JsonSchema = { type: 'string', minLength: 10 };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect((item as string).length).toBeGreaterThanOrEqual(10);
      });
    });

    it('should respect maxLength constraint', () => {
      const schema: JsonSchema = { type: 'string', maxLength: 5 };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect((item as string).length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('number constraints', () => {
    it('should respect minimum constraint', () => {
      const schema: JsonSchema = { type: 'integer', minimum: 100 };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(item).toBeGreaterThanOrEqual(100);
      });
    });

    it('should respect maximum constraint', () => {
      const schema: JsonSchema = { type: 'integer', maximum: 10 };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(item).toBeLessThanOrEqual(10);
      });
    });

    it('should respect both min and max constraints', () => {
      const schema: JsonSchema = { type: 'integer', minimum: 5, maximum: 10 };
      const result = generateMockData(schema, { count: 20, locale: 'en' });
      result.forEach(item => {
        expect(item).toBeGreaterThanOrEqual(5);
        expect(item).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('string formats', () => {
    it('should generate valid email format', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should generate valid uri format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uri' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item).toMatch(/^https?:\/\//);
      });
    });

    it('should generate valid uuid format', () => {
      const schema: JsonSchema = { type: 'string', format: 'uuid' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
    });

    it('should generate valid date-time format', () => {
      const schema: JsonSchema = { type: 'string', format: 'date-time' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });

    it('should generate valid date format', () => {
      const schema: JsonSchema = { type: 'string', format: 'date' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should generate valid ipv4 format', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv4' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item).toMatch(/^(\d{1,3}\.){3}\d{1,3}$/);
      });
    });
  });

  describe('enum values', () => {
    it('should pick from enum values', () => {
      const schema: JsonSchema = { type: 'string', enum: ['red', 'green', 'blue'] };
      const result = generateMockData(schema, { count: 20, locale: 'en' });
      result.forEach(item => {
        expect(['red', 'green', 'blue']).toContain(item);
      });
    });

    it('should handle number enums', () => {
      const schema: JsonSchema = { type: 'integer', enum: [1, 2, 3, 5, 8] };
      const result = generateMockData(schema, { count: 20, locale: 'en' });
      result.forEach(item => {
        expect([1, 2, 3, 5, 8]).toContain(item);
      });
    });
  });

  describe('object generation', () => {
    it('should generate objects with properties', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
      };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('object');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('age');
        expect(typeof (item as Record<string, unknown>).name).toBe('string');
        expect(typeof (item as Record<string, unknown>).age).toBe('number');
      });
    });

    it('should generate nested objects', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
            },
          },
        },
      };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        const record = item as Record<string, unknown>;
        expect(record.user).toBeDefined();
        expect((record.user as Record<string, unknown>).email).toBeDefined();
      });
    });

    it('should handle empty object schema', () => {
      const schema: JsonSchema = { type: 'object' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(typeof item).toBe('object');
        expect(item).toEqual({});
      });
    });
  });

  describe('array generation', () => {
    it('should generate arrays with items', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'string' },
      };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(Array.isArray(item)).toBe(true);
        (item as unknown[]).forEach(element => {
          expect(typeof element).toBe('string');
        });
      });
    });

    it('should respect minItems constraint', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'integer' },
        minItems: 3,
      };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect((item as unknown[]).length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should respect maxItems constraint', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'integer' },
        maxItems: 2,
      };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect((item as unknown[]).length).toBeLessThanOrEqual(2);
      });
    });

    it('should handle empty array schema', () => {
      const schema: JsonSchema = { type: 'array' };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        expect(Array.isArray(item)).toBe(true);
        expect(item).toEqual([]);
      });
    });
  });

  describe('x-faker hints', () => {
    it('should use x-faker method for generation', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            'x-faker': { method: 'internet.email' },
          },
        },
      };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        const email = (item as Record<string, string>).email;
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should use x-faker method with args', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            'x-faker': { method: 'number.int', args: [{ min: 1, max: 100 }] },
          },
        },
      };
      const result = generateMockData(schema, { count: 50, locale: 'en' });
      result.forEach(item => {
        const id = (item as Record<string, number>).id;
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(100);
      });
    });

    it('should generate first and last names', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            'x-faker': { method: 'person.firstName' },
          },
          lastName: {
            type: 'string',
            'x-faker': { method: 'person.lastName' },
          },
        },
      };
      const result = generateMockData(schema, defaultConfig);
      result.forEach(item => {
        const record = item as Record<string, string>;
        expect(record.firstName.length).toBeGreaterThan(0);
        expect(record.lastName.length).toBeGreaterThan(0);
      });
    });
  });

  describe('seed for reproducibility', () => {
    it('should generate same data with same seed', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', 'x-faker': { method: 'person.fullName' } },
          age: { type: 'integer', minimum: 1, maximum: 100 },
        },
      };
      const config: GeneratorConfig = { count: 5, seed: 12345, locale: 'en' };

      const result1 = generateMockData(schema, config);
      const result2 = generateMockData(schema, config);

      expect(result1).toEqual(result2);
    });

    it('should generate different data with different seeds', () => {
      const schema: JsonSchema = { type: 'string', 'x-faker': { method: 'person.fullName' } };

      const result1 = generateMockData(schema, { count: 5, seed: 11111, locale: 'en' });
      const result2 = generateMockData(schema, { count: 5, seed: 22222, locale: 'en' });

      expect(result1).not.toEqual(result2);
    });
  });

  describe('complex schemas', () => {
    it('should generate user profile data', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string', 'x-faker': { method: 'person.firstName' } },
              lastName: { type: 'string', 'x-faker': { method: 'person.lastName' } },
              age: { type: 'integer', minimum: 18, maximum: 80 },
            },
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 5,
          },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      };

      const result = generateMockData(schema, { count: 10, locale: 'en' });

      expect(result).toHaveLength(10);
      result.forEach(item => {
        const user = item as Record<string, unknown>;
        expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(user.profile).toBeDefined();
        expect((user.profile as Record<string, unknown>).age).toBeGreaterThanOrEqual(18);
        expect((user.profile as Record<string, unknown>).age).toBeLessThanOrEqual(80);
        expect(Array.isArray(user.tags)).toBe(true);
        expect((user.tags as unknown[]).length).toBeGreaterThanOrEqual(1);
        expect((user.tags as unknown[]).length).toBeLessThanOrEqual(5);
        expect(typeof user.isActive).toBe('boolean');
        expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });
  });
});

describe('generateSingleRecord', () => {
  it('should generate a single record', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const result = generateSingleRecord(schema);
    expect(typeof result).toBe('object');
    expect((result as Record<string, unknown>).name).toBeDefined();
  });

  it('should handle primitive schema', () => {
    const schema: JsonSchema = { type: 'string', format: 'email' };
    const result = generateSingleRecord(schema);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
