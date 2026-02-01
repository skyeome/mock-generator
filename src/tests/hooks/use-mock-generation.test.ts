import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMockGeneration } from '@/hooks/use-mock-generation';

// Mock the stores
vi.mock('@/store/schema-store', () => ({
  useSchemaStore: vi.fn(() => ({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' }
      }
    }
  }))
}));

vi.mock('@/store/generator-store', () => ({
  useGeneratorStore: vi.fn(() => ({
    getConfig: vi.fn(() => ({ count: 10, seed: 123, locale: 'en' })),
    setGeneratedData: vi.fn(),
    setIsGenerating: vi.fn()
  }))
}));

vi.mock('@/lib/generator/generateMock', () => ({
  generateMockData: vi.fn(() => [{ name: 'John', email: 'john@test.com' }])
}));

describe('useMockGeneration', () => {
  const mockAnalyzeWithAI = vi.fn();
  const mockSetGeneratedData = vi.fn();
  const mockSetIsGenerating = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalyzeWithAI.mockResolvedValue({ success: true });
  });

  describe('generate with AI preference OFF', () => {
    it('should skip AI analysis when aiPreference is false', async () => {
      const { result } = renderHook(() =>
        useMockGeneration({
          analyzeWithAI: mockAnalyzeWithAI,
          aiPreference: false,
          hasAIEnhancement: false
        })
      );

      await act(async () => {
        await result.current.generate();
      });

      expect(mockAnalyzeWithAI).not.toHaveBeenCalled();
    });
  });

  describe('generate with AI preference ON', () => {
    it('should call analyzeWithAI when aiPreference is true and not yet enhanced', async () => {
      const { result } = renderHook(() =>
        useMockGeneration({
          analyzeWithAI: mockAnalyzeWithAI,
          aiPreference: true,
          hasAIEnhancement: false
        })
      );

      await act(async () => {
        await result.current.generate();
      });

      expect(mockAnalyzeWithAI).toHaveBeenCalledTimes(1);
    });

    it('should skip analyzeWithAI when already enhanced', async () => {
      const { result } = renderHook(() =>
        useMockGeneration({
          analyzeWithAI: mockAnalyzeWithAI,
          aiPreference: true,
          hasAIEnhancement: true
        })
      );

      await act(async () => {
        await result.current.generate();
      });

      expect(mockAnalyzeWithAI).not.toHaveBeenCalled();
    });
  });

  describe('AI analysis results handling', () => {
    it('should proceed with generation when AI is aborted', async () => {
      mockAnalyzeWithAI.mockResolvedValue({ success: false, aborted: true });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useMockGeneration({
          analyzeWithAI: mockAnalyzeWithAI,
          aiPreference: true,
          hasAIEnhancement: false
        })
      );

      await act(async () => {
        await result.current.generate();
      });

      expect(consoleSpy).toHaveBeenCalledWith('AI analysis cancelled. Using pattern-based detection.');
      consoleSpy.mockRestore();
    });

    it('should proceed with generation when AI fails', async () => {
      mockAnalyzeWithAI.mockResolvedValue({ success: false, error: 'Network error' });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useMockGeneration({
          analyzeWithAI: mockAnalyzeWithAI,
          aiPreference: true,
          hasAIEnhancement: false
        })
      );

      await act(async () => {
        await result.current.generate();
      });

      expect(consoleSpy).toHaveBeenCalledWith('AI analysis failed. Using pattern-based detection.');
      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle generation errors gracefully', async () => {
      const { generateMockData } = await import('@/lib/generator/generateMock');
      vi.mocked(generateMockData).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useMockGeneration({
          analyzeWithAI: mockAnalyzeWithAI,
          aiPreference: false,
          hasAIEnhancement: false
        })
      );

      await act(async () => {
        await result.current.generate();
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
