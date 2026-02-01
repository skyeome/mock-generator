# AI-Enhanced Mock Data Generation Implementation Plan

## Context

### Original Request
Enhance the mock data generator with AI capabilities using Cloudflare Workers AI to analyze **entire schema context** and generate more natural, contextually-aware mock data. Currently, the system uses pattern-matching on individual field names (e.g., "firstName" -> person.firstName). The goal is to leverage AI to understand relationships between fields and generate semantically coherent data.

### Interview Summary
- **Technology Stack**: Next.js 16.1.5 + Cloudflare Workers via OpenNext
- **AI Provider**: Cloudflare Workers AI (free tier available, unit-based pricing)
- **Existing Test Suite**: 149 tests covering core library
- **Approach**: Progressive enhancement - keep Faker.js as fallback, add AI as optional enhancement layer

### Research Findings

#### Cloudflare Workers AI Capabilities
1. **AI Binding Configuration** (`wrangler.jsonc`):
   ```json
   {
     "ai": {
       "binding": "AI"
     }
   }
   ```

2. **Available Models for Text Generation**:
   - `@cf/meta/llama-3.1-8b-instruct` - Best balance of quality/speed
   - `@cf/meta/llama-3-8b-instruct-awq` - Quantized, faster, 0.27 per M output tokens
   - Context window: 8,192 tokens (sufficient for schema analysis)

3. **Structured Output Support**:
   - Workers AI supports `response_format` with JSON schema
   - Can enforce structured JSON responses matching our data schemas

4. **Integration Pattern**:
   ```typescript
   const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
     messages: [...],
     max_tokens: 1024,
     temperature: 0.7
   });
   ```

#### Current Architecture Analysis

**Schema Detection Flow**:
```
JSON Sample -> inferSchema() -> enrichSchemaWithSemantics() -> generateMockData()
                                       |
                                       v
                              detectSemantic() [regex-based]
                                       |
                                       v
                              FAKER_METHODS mapping
```

**Key Files**:
- `src/lib/schema/detectSemantic.ts` - 30+ regex rules for field name matching
- `src/lib/schema/enrichSchema.ts` - Adds `x-faker` hints to schema
- `src/lib/generator/generateMock.ts` - Generates data using Faker.js
- `src/lib/types/schema.ts` - `SemanticType` union (47 semantic types)

**Current Limitations**:
1. No context awareness between fields (firstName + lastName don't relate)
2. Field names must match regex patterns exactly
3. No understanding of domain context (e-commerce vs healthcare vs social)
4. Custom field names (e.g., "buyerName", "vendorEmail") may not match

---

## Work Objectives

### Core Objective
Implement an AI-enhanced semantic detection layer that analyzes the **complete schema structure** to infer field semantics and generate contextually coherent mock data, while maintaining backward compatibility with the existing Faker.js-based system.

### Deliverables

1. **AI Service Layer** (`src/lib/ai/`)
   - Cloudflare Workers AI integration
   - Schema analysis prompt engineering
   - Response parsing and validation

2. **Enhanced Semantic Detection** (`src/lib/schema/aiDetectSemantic.ts`)
   - AI-powered field semantic inference
   - Context-aware relationship detection
   - Fallback to regex-based detection

3. **API Route** (`src/app/api/ai/analyze-schema/route.ts`)
   - Server-side AI inference endpoint
   - Rate limiting and error handling

4. **Configuration & Types**
   - Extended type definitions for AI hints
   - Feature flag for AI enhancement toggle
   - Environment variable configuration

5. **Test Suite**
   - Unit tests for AI service layer
   - Integration tests for enhanced schema detection
   - Mock tests for Cloudflare AI responses

### Definition of Done
- [ ] AI binding configured in wrangler.jsonc
- [ ] AI service layer with proper error handling and fallback
- [ ] Enhanced schema detection using AI analysis
- [ ] All 149 existing tests still pass
- [ ] New tests for AI functionality (minimum 20 tests)
- [ ] Feature flag to enable/disable AI enhancement
- [ ] Documentation for AI configuration

---

## Guardrails

### Must Have
- Backward compatibility with existing Faker.js generation
- Graceful degradation when AI is unavailable
- All existing 149 tests must pass
- Type safety throughout AI integration
- Error handling for AI service failures
- Rate limiting to prevent API abuse

### Must NOT Have
- Breaking changes to existing public API
- Hard dependency on AI (must work without it)
- Synchronous blocking calls to AI
- Storing user data in AI prompts beyond current request
- Changes to export formats (JSON, CSV, SQL, TypeScript)

---

## Task Flow and Dependencies

```
[Phase 1: Foundation]
    |
    +-- T1: Configure AI binding in wrangler.jsonc
    |
    +-- T2: Create AI types and interfaces
    |
    +-- T3: Implement AI service client
    |
    v
[Phase 2: Core AI Integration]
    |
    +-- T4: Design schema analysis prompt
    |
    +-- T5: Implement AI semantic detector
    |
    +-- T6: Create API route for AI analysis
    |
    v
[Phase 3: Integration]
    |
    +-- T7: Integrate AI detection into enrichSchema
    |
    +-- T8: Add feature flag and configuration
    |
    v
[Phase 4: Testing & Polish]
    |
    +-- T9: Write unit tests for AI layer
    |
    +-- T10: Write integration tests
    |
    +-- T11: Verify all existing tests pass
    |
    v
[Phase 5: Documentation]
    |
    +-- T12: Update README with AI configuration
```

---

## Detailed TODOs

### Phase 1: Foundation

#### T1: Configure AI Binding
**File**: `wrangler.jsonc`
**Acceptance Criteria**:
- AI binding added with name "AI"
- TypeScript types generated via `pnpm cf-typegen`
- Local dev works with `remote: true` for AI

**Changes**:
```jsonc
{
  // ... existing config
  "ai": {
    "binding": "AI"
  }
}
```

---

#### T2: Create AI Types and Interfaces
**File**: `src/lib/types/ai.ts`
**Acceptance Criteria**:
- `AISchemaAnalysis` interface for AI response
- `AISemanticHint` interface for per-field hints
- `AIConfig` interface for configuration options

**Types to Define**:
```typescript
export interface AISemanticHint {
  fieldPath: string;
  suggestedSemantic: SemanticType;
  confidence: number; // 0-1
  reasoning?: string;
  relatedFields?: string[]; // Fields that should be coherent
}

export interface AISchemaAnalysis {
  domainContext: string; // e.g., "e-commerce", "social-media"
  fieldHints: AISemanticHint[];
  coherenceGroups: string[][]; // Fields that should be generated together
}

export interface AIConfig {
  enabled: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
  fallbackOnError: boolean;
}
```

---

#### T3: Implement AI Service Client
**File**: `src/lib/ai/client.ts`
**Acceptance Criteria**:
- `AIClient` class with `analyzeSchema` method
- Proper error handling with typed errors
- Timeout handling (10 second default)
- Response validation

**Implementation Notes**:
- Use `env.AI.run()` for Cloudflare Workers AI
- Parse JSON response safely
- Validate response matches `AISchemaAnalysis` schema

---

### Phase 2: Core AI Integration

#### T4: Design Schema Analysis Prompt
**File**: `src/lib/ai/prompts.ts`
**Acceptance Criteria**:
- System prompt defining the task clearly
- Schema serialization format
- Output JSON schema specification
- Example few-shot prompts

**Prompt Structure**:
```typescript
const SYSTEM_PROMPT = `You are a data schema analyzer. Given a JSON schema, analyze each field and determine:
1. The semantic type (e.g., firstName, email, price)
2. The domain context (e.g., e-commerce, healthcare)
3. Fields that should be coherent (e.g., firstName/lastName of same person)

Available semantic types: ${SEMANTIC_TYPES.join(', ')}

Respond with valid JSON matching this schema:
{
  "domainContext": "string",
  "fieldHints": [
    {
      "fieldPath": "string (dot notation)",
      "suggestedSemantic": "SemanticType",
      "confidence": "number 0-1",
      "relatedFields": ["string[]"]
    }
  ],
  "coherenceGroups": [["fieldPath1", "fieldPath2"]]
}`;
```

---

#### T5: Implement AI Semantic Detector
**File**: `src/lib/schema/aiDetectSemantic.ts`
**Acceptance Criteria**:
- `analyzeSchemaWithAI()` function
- Combines AI hints with existing regex detection
- Higher confidence AI hints override regex detection
- Falls back to regex if AI fails

**Function Signature**:
```typescript
export async function analyzeSchemaWithAI(
  schema: JsonSchema,
  config: AIConfig,
  aiClient: AIClient
): Promise<EnrichedSchema>
```

---

#### T6: Create API Route for AI Analysis
**File**: `src/app/api/ai/analyze-schema/route.ts`
**Acceptance Criteria**:
- POST endpoint accepting JSON schema
- Returns AI analysis results
- Rate limiting (10 requests/minute default)
- Error responses with proper status codes

**Route Handler**:
```typescript
export async function POST(request: Request, { env }: { env: CloudflareEnv }) {
  // 1. Parse request body (JSON schema)
  // 2. Validate schema structure
  // 3. Call AI service
  // 4. Return analysis results
}
```

---

### Phase 3: Integration

#### T7: Integrate AI Detection into enrichSchema
**File**: `src/lib/schema/enrichSchema.ts`
**Acceptance Criteria**:
- New `enrichSchemaWithAI()` function
- Uses AI hints when available
- Falls back to `enrichSchemaWithSemantics()`
- Handles coherence groups for related field generation

**Changes**:
- Add optional `aiAnalysis` parameter
- Apply AI hints with higher priority than regex
- Store coherence information in schema extensions

---

#### T8: Add Feature Flag and Configuration
**Files**:
- `src/lib/config/ai.ts`
- Environment variables in `.dev.vars`

**Acceptance Criteria**:
- `AI_ENABLED` environment variable
- `AI_MODEL` selection (default: llama-3.1-8b-instruct)
- Configuration validation on startup
- Runtime toggle support

---

### Phase 4: Testing

#### T9: Write Unit Tests for AI Layer
**File**: `src/tests/ai/client.test.ts`
**Acceptance Criteria**:
- Mock Cloudflare AI responses
- Test error handling scenarios
- Test response validation
- Test timeout behavior
- Minimum 10 test cases

**Test Cases**:
1. Successful schema analysis
2. Invalid JSON response handling
3. AI service timeout
4. Empty schema handling
5. Complex nested schema
6. Array schema analysis
7. Mixed type handling
8. Confidence threshold filtering
9. Coherence group detection
10. Fallback behavior on error

---

#### T10: Write Integration Tests
**File**: `src/tests/ai/integration.test.ts`
**Acceptance Criteria**:
- End-to-end schema enrichment with AI
- Verify generated data coherence
- Test feature flag behavior
- Minimum 10 test cases

---

#### T11: Verify Existing Tests Pass
**Command**: `pnpm test:run`
**Acceptance Criteria**:
- All 149 existing tests pass
- No regression in test coverage
- Test run completes in under 60 seconds

---

### Phase 5: Documentation

#### T12: Update Documentation
**File**: `README.md`
**Acceptance Criteria**:
- AI configuration section
- Environment variable documentation
- Usage examples with AI enhancement
- Troubleshooting guide

---

## Commit Strategy

| Phase | Commit Message |
|-------|----------------|
| T1-T2 | `feat(ai): add Cloudflare Workers AI binding and types` |
| T3 | `feat(ai): implement AI service client with error handling` |
| T4-T5 | `feat(ai): add AI-powered semantic detection` |
| T6 | `feat(api): add AI schema analysis endpoint` |
| T7-T8 | `feat(schema): integrate AI detection with feature flag` |
| T9-T10 | `test(ai): add comprehensive AI layer tests` |
| T11 | `chore: verify existing test suite passes` |
| T12 | `docs: add AI configuration documentation` |

---

## Success Criteria

### Functional
- [ ] AI can analyze a user schema and suggest semantic types
- [ ] AI suggestions are more accurate than regex for complex field names
- [ ] Generated mock data shows coherence (same person's first/last name)
- [ ] System works without AI (fallback mode)
- [ ] Feature can be toggled on/off via config

### Performance
- [ ] AI analysis adds < 2 seconds to generation time
- [ ] Fallback to regex is instant (< 10ms)
- [ ] No impact on generation speed when AI disabled

### Quality
- [ ] All 149 existing tests pass
- [ ] 20+ new tests for AI functionality
- [ ] Type safety maintained throughout
- [ ] No console errors or warnings

### Example Improvement

**Before (Regex-based)**:
```json
{
  "buyerFirstName": "qwerty123",  // Unknown field, random string
  "buyerLastName": "xyz789",      // Unknown field, random string
  "buyerEmail": "test@example.com"
}
```

**After (AI-enhanced)**:
```json
{
  "buyerFirstName": "John",       // AI detects "buyer" + "FirstName" = person.firstName
  "buyerLastName": "Smith",       // Coherent with firstName (same person)
  "buyerEmail": "john.smith@example.com" // Coherent email using name
}
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI service unavailable | Automatic fallback to regex detection |
| AI returns invalid JSON | Response validation + fallback |
| High latency | Timeout + async processing option |
| Rate limiting | Request queue + caching |
| Increased costs | Token budget limits + monitoring |

---

## File Structure (New/Modified)

```
src/
  lib/
    ai/
      client.ts          [NEW] AI service client
      prompts.ts         [NEW] Prompt templates
      types.ts           [NEW] AI-specific types
      index.ts           [NEW] Public exports
    schema/
      aiDetectSemantic.ts [NEW] AI-powered detection
      enrichSchema.ts    [MODIFIED] Add AI integration
    config/
      ai.ts              [NEW] AI configuration
    types/
      ai.ts              [NEW] AI type definitions
      index.ts           [MODIFIED] Export AI types
  app/
    api/
      ai/
        analyze-schema/
          route.ts       [NEW] AI analysis endpoint
  tests/
    ai/
      client.test.ts     [NEW] AI client tests
      integration.test.ts [NEW] Integration tests

wrangler.jsonc           [MODIFIED] Add AI binding
.dev.vars                [NEW] Local dev environment
README.md                [MODIFIED] Add AI docs
```

---

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Foundation | T1-T3 | 2-3 hours |
| Core AI | T4-T6 | 4-5 hours |
| Integration | T7-T8 | 2-3 hours |
| Testing | T9-T11 | 3-4 hours |
| Documentation | T12 | 1 hour |
| **Total** | | **12-16 hours** |

---

*Plan generated by Prometheus (Planner Agent)*
*Ready for Critic review*
