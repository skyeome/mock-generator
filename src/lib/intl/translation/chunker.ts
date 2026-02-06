/**
 * Semantic chunking utilities for translation
 */

import type { TranslationEntry } from './prompts';
import { setNestedValue } from '../utils/flatten';

export interface ChunkOptions {
  maxKeysPerChunk?: number;
}

/**
 * Flatten nested object to array of {key, value} entries with dot notation
 */
export function flattenToEntries(
  obj: Record<string, unknown>,
  prefix = ''
): TranslationEntry[] {
  const entries: TranslationEntry[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      entries.push({ key: fullKey, value });
    } else if (Array.isArray(value)) {
      // Handle arrays with bracket notation
      value.forEach((item, index) => {
        const arrayKey = `${fullKey}[${index}]`;

        if (typeof item === 'string') {
          entries.push({ key: arrayKey, value: item });
        } else if (item && typeof item === 'object' && !Array.isArray(item)) {
          // Nested object in array
          entries.push(...flattenToEntries(item as Record<string, unknown>, arrayKey));
        } else if (Array.isArray(item)) {
          // Nested array
          entries.push(...flattenToEntries({ '': item } as Record<string, unknown>, fullKey).map(e => ({
            ...e,
            key: e.key.replace(/^\./, `[${index}]`)
          })));
        }
        // Skip non-string, non-object array elements (numbers, booleans, null)
      });
    } else if (value && typeof value === 'object') {
      entries.push(...flattenToEntries(value as Record<string, unknown>, fullKey));
    }
    // Skip non-string, non-object values (numbers, booleans, null, undefined)
  }

  return entries;
}

/**
 * Reconstruct nested object from flattened entries
 * Handles both dot notation (a.b.c) and array notation (a[0].b)
 * Uses the original structure as a template for proper typing
 *
 * @param entries - Array of { key, value } pairs with flattened keys
 * @param originalStructure - The original object structure to use as template
 * @returns Reconstructed object with translated values
 *
 * @example
 * const entries = [
 *   { key: 'items[0]', value: 'translated_a' },
 *   { key: 'items[1]', value: 'translated_b' },
 * ];
 * const original = { items: ['a', 'b'] };
 * reconstructFromEntries(entries, original);
 * // { items: ['translated_a', 'translated_b'] }
 */
export function reconstructFromEntries(
  entries: Array<{ key: string; value: string }>,
  originalStructure: Record<string, unknown>
): Record<string, unknown> {
  // Deep clone to avoid mutating original
  const result = JSON.parse(JSON.stringify(originalStructure)) as Record<string, unknown>;

  for (const { key, value } of entries) {
    setNestedValue(result, key, value);
  }

  return result;
}

/**
 * Chunk translation data by top-level keys, keeping related keys together
 */
export function semanticChunk(
  data: Record<string, unknown>,
  options: ChunkOptions = {}
): TranslationEntry[][] {
  const { maxKeysPerChunk = 50 } = options;

  const topLevelKeys = Object.keys(data);
  if (topLevelKeys.length === 0) {
    return [];
  }

  const chunks: TranslationEntry[][] = [];

  for (const topKey of topLevelKeys) {
    const value = data[topKey];
    let entries: TranslationEntry[];

    if (typeof value === 'string') {
      entries = [{ key: topKey, value }];
    } else if (Array.isArray(value)) {
      // Handle arrays by flattening with index notation
      entries = [];
      value.forEach((item, index) => {
        const arrayKey = `${topKey}[${index}]`;
        if (typeof item === 'string') {
          entries.push({ key: arrayKey, value: item });
        } else if (item && typeof item === 'object' && !Array.isArray(item)) {
          entries.push(...flattenToEntries(item as Record<string, unknown>, arrayKey));
        } else if (Array.isArray(item)) {
          // Recursively handle nested arrays
          entries.push(...flattenToEntries({ '': item } as Record<string, unknown>, topKey).map(e => ({
            ...e,
            key: e.key.replace(/^\./, `[${index}]`)
          })));
        }
      });
    } else if (value && typeof value === 'object') {
      entries = flattenToEntries(value as Record<string, unknown>, topKey);
    } else {
      // Skip non-string, non-object values
      continue;
    }

    // If entries from this top-level key fit in maxKeysPerChunk, add as single chunk
    if (entries.length <= maxKeysPerChunk) {
      chunks.push(entries);
    } else {
      // Split large top-level sections into multiple chunks
      for (let i = 0; i < entries.length; i += maxKeysPerChunk) {
        chunks.push(entries.slice(i, i + maxKeysPerChunk));
      }
    }
  }

  return chunks;
}
