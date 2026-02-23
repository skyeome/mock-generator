import { beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage for Zustand persist middleware
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

global.localStorage = localStorageMock as Storage;

beforeEach(() => {
  vi.stubEnv('AI_PROVIDER', 'cloudflare');
});
