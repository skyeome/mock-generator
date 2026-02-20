# AGENTS.md

AI-powered mock data generator that analyzes JSON schemas and generates realistic test data. Built with Next.js 16 on Cloudflare Workers, using Faker.js for data generation with optional AI for semantic field detection.

## Commands

```bash
pnpm dev              # Next.js dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint check (extends next/core-web-vitals, next/typescript)
pnpm test             # Run Vitest in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Generate coverage report (80% threshold required)
pnpm preview          # Build and preview on Cloudflare runtime locally
pnpm deploy           # Build and deploy to Cloudflare
```

### Testing a Single File

```bash
pnpm test src/tests/generator/generateMock.test.ts
pnpm test src/tests/schema/detectSemantic.test.ts
```

### AI Features (Remote Runtime Required)

```bash
wrangler dev --remote
```

## Architecture Overview

### Data Flow Pipeline

1. **Input**: User pastes JSON sample → `src/store/schema-store.ts`
2. **Schema Inference**: Extract structure/types → `src/lib/schema/inferSchema.ts`
3. **Semantic Detection**: AI-powered or regex fallback (`src/lib/schema/`)
4. **Mock Generation**: `src/lib/generator/generateMock.ts` → Faker.js produces data
5. **Export**: `src/lib/export/` → JSON, CSV, SQL, or TypeScript formats

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/lib/schema/` | Schema inference and semantic detection |
| `src/lib/generator/` | Mock data generation using Faker.js |
| `src/lib/export/` | Export formatters |
| `src/lib/ai/` | AI client with provider abstraction |
| `src/store/` | Zustand stores (schema, generator, export state) |
| `src/hooks/` | Custom React hooks for generation/export workflows |
| `src/components/` | UI components (editor, output panels) |

## Code Style Guidelines

### Imports

- **Path alias required**: Use `@/` for all imports from `src/`
- **Order**: External libraries → Internal modules → Types
- **Type imports**: Use `import type { ... }` for type-only imports

```typescript
// Correct
import { create } from 'zustand';
import type { JsonSchema } from '@/lib/types';
import { generateMockData } from '@/lib/generator/generateMock';

// Wrong - no relative paths from src/
import type { JsonSchema } from '../lib/types';
```

### TypeScript

- **Strict mode**: Enabled (`strict: true` in tsconfig)
- **Interface over type**: Prefer `interface` for object shapes
- **Union types**: Use for known finite sets

```typescript
interface SchemaState {
  inputJson: string;
  setInputJson: (json: string) => void;
}

export type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
```

### React Components

- **Client directive**: Use `'use client'` for client components
- **Functional components**: Always use function declarations
- **Props typing**: Define interface above component

```typescript
'use client';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function JsonInput({ value, onChange, error }: JsonInputProps) {
  // ...
}
```

### Naming Conventions

| Pattern | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `JsonInput`, `DataPreview` |
| Functions | camelCase | `generateMockData`, `inferSchema` |
| Types/Interfaces | PascalCase | `JsonSchema`, `FakerHint` |
| Files (components) | kebab-case | `json-input.tsx` |
| Files (lib) | camelCase | `generateMock.ts` |
| Stores | kebab-case with `-store` | `schema-store.ts` |
| Hooks | camelCase with `use-` prefix | `use-mock-generation.ts` |

### Error Handling

- **Console warnings**: Use for non-critical issues in development
- **Try-catch**: Required for async operations and JSON parsing
- **Graceful degradation**: AI failures should fall back to regex detection

```typescript
try {
  const parsed = JSON.parse(value);
  onChange(JSON.stringify(parsed, null, 2));
} catch {
  // Invalid JSON, can't format
}
```

### Testing Patterns

- **Framework**: Vitest with Testing Library
- **Structure**: `describe` blocks for grouping, `it` for individual tests
- **Mocking**: Use `vi.fn()` for mocks, setup in `src/tests/setup.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { generateMockData } from '@/lib/generator/generateMock';
import type { JsonSchema } from '@/lib/types';

describe('generateMockData', () => {
  it('should generate null values', () => {
    const schema: JsonSchema = { type: 'null' };
    const result = generateMockData(schema, { count: 3, locale: 'en' });
    expect(result).toHaveLength(3);
    result.forEach(item => expect(item).toBeNull());
  });
});
```

### State Management (Zustand)

- **Pattern**: `create` with `persist` middleware for localStorage
- **Partialize**: Only persist necessary state

```typescript
export const useSchemaStore = create<SchemaState>()(
  persist(
    (set) => ({
      inputJson: '',
      setInputJson: (inputJson) => set({ inputJson }),
    }),
    {
      name: 'mock-generator-schema',
      partialize: (state) => ({ inputJson: state.inputJson }),
    }
  )
);
```

## Schema Extension Format

```typescript
{
  "x-faker": { "method": "person.firstName", "args": [] },
  "x-ai-domain": "e-commerce",
  "x-ai-coherence": [["firstName", "lastName", "email"]]
}
```

## Important Notes

- **Never suppress type errors**: No `as any`, `@ts-ignore`, or `@ts-expect-error`
- **Coverage threshold**: 80% required - run `pnpm test:coverage` before commits
- **Package manager**: `pnpm` only (enforced by preinstall script)
