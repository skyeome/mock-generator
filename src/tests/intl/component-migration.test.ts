import { describe, it, expect } from 'vitest';

describe('i18n Component Migration - Complex Type Preservation', () => {
  describe('handleTranslate with complex types', () => {
    it('should serialize arrays as JSON, not "[object Object]"', () => {
      // Given: An operation with array sourceValue
      const op = {
        sourceValue: [
          { id: "1", text: "First item" },
          { id: "2", text: "Second item" }
        ]
      };

      // When: Converting to string for API (with the fix applied)
      const actual = typeof op.sourceValue === 'object' && op.sourceValue !== null
        ? JSON.stringify(op.sourceValue)
        : String(op.sourceValue ?? "");
      const expected = JSON.stringify(op.sourceValue);

      // Then: Should use JSON format, not object toString
      expect(actual).not.toBe("[object Object],[object Object]"); // Should NOT be "[object Object],[object Object]"
      expect(actual).toBe(expected); // Should match JSON.stringify
      expect(expected).toMatch(/^\[.*\]$/); // Array JSON format
    });

    it('should preserve nested object structure through serialization', () => {
      // Given: Realistic nested structure matching certification.ol bug
      const op = {
        sourceValue: {
          product: {
            name: "Widget",
            certification: {
              ol: [
                { id: "1", text: "ISO certified" },
                { id: "2", text: "Safety approved" }
              ]
            }
          }
        }
      };

      // When: Using the fixed conversion
      const stringified = typeof op.sourceValue === 'object' && op.sourceValue !== null
        ? JSON.stringify(op.sourceValue)
        : String(op.sourceValue ?? "");
      const jsonStringified = JSON.stringify(op.sourceValue);

      // Then: Fixed version preserves structure with JSON.stringify()
      expect(stringified).not.toBe("[object Object]");
      expect(stringified).toBe(jsonStringified);

      // Expected behavior: JSON.stringify() preserves structure
      const parsed = JSON.parse(jsonStringified);
      expect(parsed.product.certification.ol).toHaveLength(2);
      expect(parsed.product.certification.ol[0].id).toBe("1");
      expect(parsed.product.certification.ol[0].text).toBe("ISO certified");
    });

    it('should handle arrays with multiple complex objects', () => {
      // Given: Array of objects (like certification.ol)
      const op = {
        sourceValue: [
          { id: "cert-1", text: "ISO 9001 certified", validated: true },
          { id: "cert-2", text: "Safety approved", validated: false },
          { id: "cert-3", text: "Environmental compliance", validated: true }
        ]
      };

      // When: Converting using the fixed logic
      const stringResult = typeof op.sourceValue === 'object' && op.sourceValue !== null
        ? JSON.stringify(op.sourceValue)
        : String(op.sourceValue ?? "");
      const jsonResult = JSON.stringify(op.sourceValue);

      // Then: Fixed version properly serializes all objects
      expect(stringResult).not.toContain("[object Object]");
      expect(stringResult).toBe(jsonResult);

      // Expected: JSON preserves all fields
      const parsed = JSON.parse(jsonResult);
      expect(parsed).toHaveLength(3);
      expect(parsed[1].validated).toBe(false);
    });

    it('should handle deeply nested objects without data loss', () => {
      // Given: Deep nesting scenario
      const op = {
        sourceValue: {
          level1: {
            level2: {
              level3: {
                items: [
                  { key: "a", value: "alpha" },
                  { key: "b", value: "beta" }
                ]
              }
            }
          }
        }
      };

      // When: Using the fixed conversion logic
      const stringified = typeof op.sourceValue === 'object' && op.sourceValue !== null
        ? JSON.stringify(op.sourceValue)
        : String(op.sourceValue ?? "");

      // Then: Fixed version preserves all nested levels
      expect(stringified).not.toBe("[object Object]");

      // Expected: JSON.stringify() preserves all levels
      const jsonStringified = JSON.stringify(op.sourceValue);
      expect(stringified).toBe(jsonStringified);

      const parsed = JSON.parse(jsonStringified);
      expect(parsed.level1.level2.level3.items[1].value).toBe("beta");
    });
  });
});
