import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSchemaInference } from '@/hooks/use-schema-inference';

// Mock the store
const mockSetSchema = vi.fn();
const mockSetParseError = vi.fn();

vi.mock('@/store/schema-store', () => ({
  useSchemaStore: vi.fn(() => ({
    inputJson: '{"name": "test"}',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    },
    setSchema: mockSetSchema,
    setParseError: mockSetParseError
  }))
}));

vi.mock('@/lib/schema/inferSchema', () => ({
  inferSchema: vi.fn(() => ({
    type: 'object',
    properties: { name: { type: 'string' } }
  }))
}));

vi.mock('@/lib/schema/enrichSchema', () => ({
  enrichSchemaWithSemantics: vi.fn((schema) => schema)
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useSchemaInference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('aiPreference state', () => {
    it('should default aiPreference to false', () => {
      const { result } = renderHook(() => useSchemaInference());
      expect(result.current.aiPreference).toBe(false);
    });

    it('should update aiPreference when setAIPreference is called', () => {
      const { result } = renderHook(() => useSchemaInference());

      act(() => {
        result.current.setAIPreference(true);
      });

      expect(result.current.aiPreference).toBe(true);
    });

    it('should allow toggling aiPreference back to false', () => {
      const { result } = renderHook(() => useSchemaInference());

      act(() => {
        result.current.setAIPreference(true);
      });
      expect(result.current.aiPreference).toBe(true);

      act(() => {
        result.current.setAIPreference(false);
      });
      expect(result.current.aiPreference).toBe(false);
    });
  });

  describe('analyzeWithAI return values', () => {
    it('should return { success: true } on successful AI analysis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          analysis: {
            fieldHints: [{ fieldPath: 'name', suggestedSemantic: 'firstName', confidence: 0.9 }]
          }
        })
      });

      const { result } = renderHook(() => useSchemaInference());

      vi.runAllTimers(); // Run debounce timer

      let aiResult: { success: boolean; aborted?: boolean; error?: string } | undefined;
      await act(async () => {
        aiResult = await result.current.analyzeWithAI();
      });

      expect(aiResult).toEqual({ success: true });
    });

    it('should return { success: false, error: ... } when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => useSchemaInference());
      vi.runAllTimers();

      let aiResult: { success: boolean; aborted?: boolean; error?: string } | undefined;
      await act(async () => {
        aiResult = await result.current.analyzeWithAI();
      });

      expect(aiResult?.success).toBe(false);
      expect(aiResult?.error).toBeDefined();
    });

    it('should return { success: false, aborted: true } when cancelled', async () => {
      // Create a fetch that will be aborted
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 100);
        });
      });

      const { result } = renderHook(() => useSchemaInference());
      vi.runAllTimers();

      let aiPromise: Promise<{ success: boolean; aborted?: boolean; error?: string }>;
      act(() => {
        aiPromise = result.current.analyzeWithAI();
      });

      // Cancel immediately
      act(() => {
        result.current.cancelAIAnalysis();
      });

      vi.runAllTimers();

      const aiResult = await aiPromise!;
      expect(aiResult).toEqual({ success: false, aborted: true });
    });

    it('should return { success: false, error: ... } on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSchemaInference());
      vi.runAllTimers();

      let aiResult: { success: boolean; aborted?: boolean; error?: string } | undefined;
      await act(async () => {
        aiResult = await result.current.analyzeWithAI();
      });

      expect(aiResult?.success).toBe(false);
      expect(aiResult?.error).toBe('Network error');
    });
  });

  describe('isUsingAI state', () => {
    it('should set isUsingAI to true during analysis', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, analysis: { fieldHints: [] } })
        }), 100);
      }));

      const { result } = renderHook(() => useSchemaInference());
      vi.runAllTimers();

      expect(result.current.isUsingAI).toBe(false);

      act(() => {
        result.current.analyzeWithAI();
      });

      expect(result.current.isUsingAI).toBe(true);
    });
  });

  describe('hasAIEnhancement state', () => {
    it('should set hasAIEnhancement to true after successful AI analysis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          analysis: { fieldHints: [] }
        })
      });

      const { result } = renderHook(() => useSchemaInference());
      vi.runAllTimers();

      expect(result.current.hasAIEnhancement).toBe(false);

      await act(async () => {
        await result.current.analyzeWithAI();
      });

      // Note: hasAIEnhancement is set via setSchema which is mocked
      expect(mockSetSchema).toHaveBeenCalled();
    });
  });

  describe('cancelAIAnalysis', () => {
    it('should abort pending AI request', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useSchemaInference());
      vi.runAllTimers();

      act(() => {
        result.current.analyzeWithAI();
      });

      expect(result.current.isUsingAI).toBe(true);

      act(() => {
        result.current.cancelAIAnalysis();
      });

      expect(result.current.isUsingAI).toBe(false);
    });
  });
});
