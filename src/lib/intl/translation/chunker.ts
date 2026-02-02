/**
 * Semantic chunking utilities for translation
 */

import type { TranslationEntry } from './prompts';

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
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flattenToEntries(value as Record<string, unknown>, fullKey));
    }
    // Skip non-string, non-object values (numbers, booleans, null, undefined)
  }

  return entries;
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
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
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
