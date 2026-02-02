import { describe, it, expect } from 'vitest';
import type {
  DiffOperationType,
  DiffOperation,
  DiffResult,
  MaskResult,
  TranslationEntry,
  ValidationResult,
  ConsistencyResult,
  AnomalyResult,
} from '@/lib/intl/types';

describe('i18n types', () => {
  it('should allow creating DiffOperation objects', () => {
    const operation: DiffOperation = {
      type: 'MISSING',
      keyPath: 'user.name',
      sourceValue: 'John',
      targetValue: undefined,
    };

    expect(operation.type).toBe('MISSING');
    expect(operation.keyPath).toBe('user.name');
    expect(operation.sourceValue).toBe('John');
  });

  it('should allow creating DiffResult objects', () => {
    const result: DiffResult = {
      operations: [],
      stats: {
        missing: 1,
        orphaned: 0,
        typeMismatch: 0,
        equal: 5,
      },
      sourceKeyOrder: ['a', 'b', 'c'],
      targetKeyOrder: ['a', 'b'],
    };

    expect(result.stats.missing).toBe(1);
    expect(result.sourceKeyOrder).toHaveLength(3);
  });

  it('should support all DiffOperationType values', () => {
    const types: DiffOperationType[] = [
      'MISSING',
      'ORPHANED',
      'TYPE_MISMATCH',
      'VALUE_DIFF',
      'EQUAL',
    ];

    types.forEach((type) => {
      const operation: DiffOperation = {
        type,
        keyPath: 'test',
        sourceValue: null,
        targetValue: null,
      };
      expect(operation.type).toBe(type);
    });
  });

  it('should allow nested DiffOperation with children', () => {
    const operation: DiffOperation = {
      type: 'MISSING',
      keyPath: 'user',
      sourceValue: { name: 'John' },
      targetValue: undefined,
      children: [
        {
          type: 'MISSING',
          keyPath: 'user.name',
          sourceValue: 'John',
          targetValue: undefined,
        },
      ],
    };

    expect(operation.children).toHaveLength(1);
    expect(operation.children?.[0].keyPath).toBe('user.name');
  });

  it('should allow creating MaskResult objects', () => {
    const result: MaskResult = {
      masked: 'Hello {0}, welcome to {1}',
      tokens: ['John', 'App'],
    };

    expect(result.masked).toContain('{0}');
    expect(result.tokens).toHaveLength(2);
  });

  it('should allow creating TranslationEntry objects', () => {
    const entry: TranslationEntry = {
      key: 'greeting.hello',
      value: 'Hello World',
    };

    expect(entry.key).toBe('greeting.hello');
    expect(entry.value).toBe('Hello World');
  });

  it('should allow creating ValidationResult objects', () => {
    const result: ValidationResult = {
      success: false,
      errors: [
        { path: 'user.email', message: 'Invalid format' },
      ],
    };

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it('should allow creating ConsistencyResult objects', () => {
    const result: ConsistencyResult = {
      isConsistent: false,
      missingInTarget: ['key1', 'key2'],
      extraInTarget: ['key3'],
    };

    expect(result.isConsistent).toBe(false);
    expect(result.missingInTarget).toHaveLength(2);
  });

  it('should allow creating AnomalyResult objects', () => {
    const result: AnomalyResult = {
      isAnomaly: true,
      ratio: 2.5,
      sourceLength: 100,
      targetLength: 250,
    };

    expect(result.isAnomaly).toBe(true);
    expect(result.ratio).toBe(2.5);
  });
});
