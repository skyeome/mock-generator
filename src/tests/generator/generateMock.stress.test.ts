import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateMockData } from '@/lib/generator/generateMock';
import type { JsonSchema, GeneratorConfig } from '@/lib/types';

describe('generateMockData - Stress Tests', () => {
  // Track memory usage
  let initialMemory: NodeJS.MemoryUsage;

  beforeEach(() => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    initialMemory = process.memoryUsage();
  });

  afterEach(() => {
    // Force garbage collection after each test
    if (global.gc) {
      global.gc();
    }
  });

  describe('Memory Usage Tests', () => {
    it('should generate 1,000 records without excessive memory growth', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', 'x-faker': { method: 'person.fullName' } },
          age: { type: 'integer', minimum: 18, maximum: 80 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      };

      const config: GeneratorConfig = { count: 1000, locale: 'en' };
      const result = generateMockData(schema, config);

      // Verify generation completed
      expect(result).toHaveLength(1000);

      // Check memory growth (should be less than 50MB for 1k records)
      const memoryAfter = process.memoryUsage();
      const heapGrowth = (memoryAfter.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      expect(heapGrowth).toBeLessThan(50);
    });

    it('should generate 10,000 records without excessive memory growth', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', 'x-faker': { method: 'person.fullName' } },
          age: { type: 'integer', minimum: 18, maximum: 80 },
        },
      };

      const config: GeneratorConfig = { count: 10000, locale: 'en' };
      const result = generateMockData(schema, config);

      // Verify generation completed
      expect(result).toHaveLength(10000);

      // Check memory growth (should be less than 200MB for 10k records)
      const memoryAfter = process.memoryUsage();
      const heapGrowth = (memoryAfter.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      expect(heapGrowth).toBeLessThan(200);
    });

    it('should generate 100,000 records without excessive memory growth', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', 'x-faker': { method: 'person.fullName' } },
        },
      };

      const config: GeneratorConfig = { count: 100000, locale: 'en' };
      const result = generateMockData(schema, config);

      // Verify generation completed
      expect(result).toHaveLength(100000);

      // Check memory growth (should be less than 1GB for 100k records)
      const memoryAfter = process.memoryUsage();
      const heapGrowth = (memoryAfter.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      expect(heapGrowth).toBeLessThan(1024);
    });
  });

  describe('Performance Tests', () => {
    it('should generate 1,000 records within 2 seconds', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', 'x-faker': { method: 'person.fullName' } },
          age: { type: 'integer', minimum: 18, maximum: 80 },
          tags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 5,
          },
        },
      };

      const config: GeneratorConfig = { count: 1000, locale: 'en' };
      const startTime = performance.now();
      const result = generateMockData(schema, config);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });

    it('should generate 10,000 records within 10 seconds', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', 'x-faker': { method: 'person.fullName' } },
          age: { type: 'integer', minimum: 18, maximum: 80 },
        },
      };

      const config: GeneratorConfig = { count: 10000, locale: 'en' };
      const startTime = performance.now();
      const result = generateMockData(schema, config);
      const endTime = performance.now();

      expect(result).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds
    });

    it('should generate 100,000 simple records within 30 seconds', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
        },
      };

      const config: GeneratorConfig = { count: 100000, locale: 'en' };
      const startTime = performance.now();
      const result = generateMockData(schema, config);
      const endTime = performance.now();

      expect(result).toHaveLength(100000);
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
    }, 35000); // Increase test timeout to 35 seconds
  });

  describe('Data Integrity Tests', () => {
    it('should maintain schema consistency across 10,000 records', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          age: { type: 'integer', minimum: 18, maximum: 65 },
          status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
        },
      };

      const config: GeneratorConfig = { count: 10000, locale: 'en' };
      const result = generateMockData(schema, config);

      expect(result).toHaveLength(10000);

      // Verify every record matches schema
      result.forEach((item, index) => {
        const record = item as Record<string, unknown>;

        // Check UUID format
        expect(record.id, `Record ${index}: id should be UUID`).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );

        // Check email format
        expect(record.email, `Record ${index}: email should be valid`).toMatch(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        );

        // Check age constraints
        expect(record.age, `Record ${index}: age should be >= 18`).toBeGreaterThanOrEqual(18);
        expect(record.age, `Record ${index}: age should be <= 65`).toBeLessThanOrEqual(65);

        // Check enum values
        expect(['active', 'inactive', 'pending'], `Record ${index}: status should be in enum`).toContain(
          record.status
        );
      });
    });

    it('should maintain uniqueness for UUID fields across 10,000 records', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      };

      const config: GeneratorConfig = { count: 10000, locale: 'en' };
      const result = generateMockData(schema, config);

      // Extract all IDs
      const ids = result.map((item) => (item as Record<string, string>).id);

      // Check for uniqueness
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10000); // All IDs should be unique
    });

    it('should maintain data consistency with seeded generation for 10,000 records', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', 'x-faker': { method: 'person.fullName' } },
          email: { type: 'string', format: 'email' },
        },
      };

      const config: GeneratorConfig = { count: 10000, seed: 54321, locale: 'en' };

      const result1 = generateMockData(schema, config);
      const result2 = generateMockData(schema, config);

      expect(result1).toEqual(result2);
      expect(result1).toHaveLength(10000);
    });

    it('should handle complex nested structures at scale (1,000 records)', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', 'x-faker': { method: 'person.firstName' } },
                  lastName: { type: 'string', 'x-faker': { method: 'person.lastName' } },
                  age: { type: 'integer', minimum: 18, maximum: 80 },
                },
              },
              contacts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['email', 'phone', 'address'] },
                    value: { type: 'string' },
                  },
                },
                minItems: 1,
                maxItems: 3,
              },
            },
          },
          metadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', format: 'date-time' },
              tags: {
                type: 'array',
                items: { type: 'string' },
                minItems: 0,
                maxItems: 5,
              },
            },
          },
        },
      };

      const config: GeneratorConfig = { count: 1000, locale: 'en' };
      const result = generateMockData(schema, config);

      expect(result).toHaveLength(1000);

      // Verify structure integrity
      result.forEach((item, index) => {
        const record = item as Record<string, unknown>;
        expect(record.user, `Record ${index}: user should exist`).toBeDefined();
        expect(
          (record.user as Record<string, unknown>).profile,
          `Record ${index}: profile should exist`
        ).toBeDefined();
        expect(
          (record.user as Record<string, unknown>).contacts,
          `Record ${index}: contacts should be array`
        ).toBeInstanceOf(Array);
        expect(record.metadata, `Record ${index}: metadata should exist`).toBeDefined();
      });
    });

    it('should handle arrays with varied item counts consistently', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'integer' },
            minItems: 5,
            maxItems: 10,
          },
        },
      };

      const config: GeneratorConfig = { count: 1000, locale: 'en' };
      const result = generateMockData(schema, config);

      result.forEach((item, index) => {
        const record = item as Record<string, unknown>;
        const items = record.items as unknown[];
        expect(items.length, `Record ${index}: array length should be >= 5`).toBeGreaterThanOrEqual(5);
        expect(items.length, `Record ${index}: array length should be <= 10`).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Edge Cases at Scale', () => {
    it('should handle empty object schema at scale (10,000 records)', () => {
      const schema: JsonSchema = { type: 'object' };
      const config: GeneratorConfig = { count: 10000, locale: 'en' };
      const result = generateMockData(schema, config);

      expect(result).toHaveLength(10000);
      result.forEach((item) => {
        expect(typeof item).toBe('object');
        expect(item).toEqual({});
      });
    });

    it('should handle primitive types at scale (10,000 records)', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      const config: GeneratorConfig = { count: 10000, locale: 'en' };
      const result = generateMockData(schema, config);

      expect(result).toHaveLength(10000);
      result.forEach((item) => {
        expect(typeof item).toBe('string');
        expect(item).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should handle all data types in a single schema (1,000 records)', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          nullValue: { type: 'null' },
          boolValue: { type: 'boolean' },
          intValue: { type: 'integer' },
          floatValue: { type: 'number' },
          stringValue: { type: 'string' },
          arrayValue: { type: 'array', items: { type: 'string' } },
          objectValue: {
            type: 'object',
            properties: {
              nested: { type: 'string' },
            },
          },
        },
      };

      const config: GeneratorConfig = { count: 1000, locale: 'en' };
      const result = generateMockData(schema, config);

      expect(result).toHaveLength(1000);

      result.forEach((item) => {
        const record = item as Record<string, unknown>;
        expect(record.nullValue).toBeNull();
        expect(typeof record.boolValue).toBe('boolean');
        expect(typeof record.intValue).toBe('number');
        expect(Number.isInteger(record.intValue)).toBe(true);
        expect(typeof record.floatValue).toBe('number');
        expect(typeof record.stringValue).toBe('string');
        expect(Array.isArray(record.arrayValue)).toBe(true);
        expect(typeof record.objectValue).toBe('object');
      });
    });
  });

  describe('Resource Cleanup', () => {
    it('should not leak memory across multiple large generations', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          data: { type: 'string' },
        },
      };

      const config: GeneratorConfig = { count: 5000, locale: 'en' };

      // Run multiple generations
      for (let i = 0; i < 5; i++) {
        const result = generateMockData(schema, config);
        expect(result).toHaveLength(5000);

        // Force cleanup
        if (global.gc) {
          global.gc();
        }
      }

      // Check final memory state
      const finalMemory = process.memoryUsage();
      const totalGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

      // Should not grow more than 100MB after 5 iterations of 5k records each
      expect(totalGrowth).toBeLessThan(100);
    });
  });
});
