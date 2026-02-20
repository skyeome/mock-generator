# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered mock data generator that analyzes JSON schemas and generates realistic test data. Built with Next.js 16 on Cloudflare Workers, using Faker.js for data generation with optional Cloudflare Workers AI for semantic field detection.

## Commands

```bash
pnpm dev              # Next.js dev server (localhost:3000)
pnpm test             # Run Vitest in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Generate coverage report (80% threshold required)
pnpm lint             # ESLint check
pnpm preview          # Build and preview on Cloudflare runtime locally
pnpm deploy           # Build and deploy to Cloudflare
```

**Testing a single file:**
```bash
pnpm test src/tests/generator/generateMock.test.ts
```

**AI features require remote Cloudflare runtime:**
```bash
wrangler dev --remote
```

## Architecture

### Data Flow Pipeline

1. **Input**: User pastes JSON sample → `src/store/schema-store.ts`
2. **Schema Inference**: Extract structure/types → `src/lib/schema/inferSchema.ts`
3. **Semantic Detection**: Identify field meanings via:
   - AI-powered (optional): `src/lib/schema/aiDetectSemantic.ts` → API route `src/app/api/ai/analyze-schema/`
   - Regex fallback: `src/lib/schema/detectSemantic.ts` (148 pattern rules)
4. **Schema Enrichment**: Add `x-faker` hints with Faker.js method paths
5. **Mock Generation**: `src/lib/generator/generateMock.ts` → Faker.js produces data
6. **Export**: `src/lib/export/` → JSON, CSV, SQL, or TypeScript formats

### Key Directories

- `src/lib/schema/` - Schema inference and semantic detection logic
- `src/lib/generator/` - Mock data generation using Faker.js
- `src/lib/export/` - Export formatters (JSON, CSV, SQL, TypeScript)
- `src/lib/ai/` - AI client with provider abstraction (OpenAI/Cloudflare)
- `src/lib/ai/providers/` - Provider implementations (OpenAI, Cloudflare)
- `src/store/` - Zustand stores (schema, generator, export state)
- `src/hooks/` - Custom React hooks for generation/export workflows
- `src/components/` - UI components (editor, output panels)

### Schema Extension Format

The system enriches JSON Schema with custom extensions:
```typescript
{
  "x-faker": {
    "method": "person.firstName",  // Faker.js method path
    "args": []                      // Optional arguments
  },
  "x-ai-domain": "e-commerce",     // Detected domain context
  "x-ai-coherence": [["firstName", "lastName", "email"]]  // Related field groups
}
```

### State Management

Three Zustand stores with localStorage persistence:
- **schema-store**: Input JSON, parsed schema, validation errors
- **generator-store**: Count, seed, locale, generated data, loading state
- **export-store**: Selected export format

## Environment Variables

AI provider is selected via `AI_PROVIDER` environment variable:
- `gemini` (default): Google Gemini API (fastest)
- `openai`: OpenAI-compatible API (LM Studio)
- `cloudflare`: Cloudflare Workers AI

Provider-specific model environment variables:
- `GEMINI_MODEL` - Gemini model (default: gemini-3-flash-preview)
- `OPENAI_MODEL` - OpenAI model (default: gpt-4o-mini)
- `CLOUDFLARE_MODEL` - Cloudflare model (default: @cf/meta/llama-3.1-8b-instruct-fp8)

Create `.dev.vars`:

```bash
AI_PROVIDER=gemini
GOOGLE_API_KEY=your-google-api-key

# Optional: OpenAI-compatible (for local LM Studio)
# AI_PROVIDER=openai
# OPENAI_BASE_URL=http://localhost:1234/v1
# OPENAI_MODEL=gpt-oss-20b
```

## Path Alias

`@/` maps to `src/` - use for all imports.
