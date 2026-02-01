# Work Plan: AI Provider 환경별 분리

## 요약

개발 환경(NODE_ENV=development)에서는 LM Studio(OpenAI 호환 API)를, 배포 환경(production)에서는 Cloudflare Workers AI를 사용하도록 변경합니다.

## 요구사항

| 환경 | Provider | Endpoint | Model | API Key |
|------|----------|----------|-------|---------|
| Development | OpenAI 호환 | http://localhost:1234/v1/chat/completions | gpt-oss-20b | 불필요 |
| Production | Cloudflare Workers AI | (binding) | @cf/meta/llama-3.1-8b-instruct | N/A |

**AI 비활성화 시**: 기존처럼 Regex 기반 감지로 fallback

## 현재 아키텍처

```
AIClient.analyzeSchema(schema, ai: Ai)  ← Cloudflare 직접 의존
    ↓
ai.run(model, { messages })  ← Cloudflare SDK 메서드
    ↓
response.response || response.content  ← Cloudflare 응답 형식
```

**문제점**: Cloudflare Workers AI에 하드코딩되어 다른 provider 지원 불가

## 목표 아키텍처

```
AIClient.analyzeSchema(schema)
    ↓
AIProvider.analyze(schema, config)  ← 추상화 인터페이스
    ↓
┌─────────────────────┬─────────────────────────┐
│ OpenAIProvider      │ CloudflareAIProvider    │
│ (development)       │ (production)            │
│ fetch() → /v1/chat  │ ai.run()                │
└─────────────────────┴─────────────────────────┘
```

## 작업 목록

### Phase 1: Provider 추상화 레이어 생성

#### Task 1.1: AIProvider 인터페이스 정의
**파일**: `src/lib/ai/providers/types.ts`

```typescript
export interface AIProvider {
  name: string;
  analyze(schema: JsonSchema, config: AIConfig): Promise<AISchemaAnalysis | null>;
}

export type ProviderType = 'openai' | 'cloudflare';
```

#### Task 1.2: OpenAI Provider 구현
**파일**: `src/lib/ai/providers/openai.ts`

- OpenAI Chat Completions API 호출 (fetch 사용)
- 엔드포인트: `http://localhost:1234/v1/chat/completions`
- 모델: 환경변수 또는 기본값 `gpt-oss-20b`
- API 키: 환경변수에서 읽되, 없으면 빈 문자열 (LM Studio는 불필요)
- 응답 파싱: `response.choices[0].message.content` → JSON

#### Task 1.3: Cloudflare Provider 리팩토링
**파일**: `src/lib/ai/providers/cloudflare.ts`

- 기존 `AIClient.analyzeSchema` 로직을 Provider로 이동
- `Ai` 바인딩을 생성자에서 받아 저장
- 기존 응답 파싱 로직 유지

#### Task 1.4: Provider Factory 생성
**파일**: `src/lib/ai/providers/factory.ts`

```typescript
export function createAIProvider(env: CloudflareEnv): AIProvider {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return new OpenAIProvider();
  }
  return new CloudflareAIProvider(env.AI);
}
```

### Phase 2: 설정 및 환경변수 업데이트

#### Task 2.1: AIConfig 타입 확장
**파일**: `src/lib/types/ai.ts`

```typescript
interface AIConfig {
  enabled: boolean;
  provider: ProviderType;  // 추가
  model: string;
  maxTokens: number;
  temperature: number;
  fallbackOnError: boolean;
  // OpenAI 전용
  openaiBaseUrl?: string;
  openaiApiKey?: string;
}
```

#### Task 2.2: 환경변수 로더 업데이트
**파일**: `src/lib/config/ai.ts`

새 환경변수 추가:
- `OPENAI_BASE_URL`: 기본값 `http://localhost:1234/v1`
- `OPENAI_API_KEY`: 기본값 빈 문자열
- `OPENAI_MODEL`: 기본값 `gpt-oss-20b`

자동 provider 감지:
```typescript
function getDefaultProvider(): ProviderType {
  return process.env.NODE_ENV === 'development' ? 'openai' : 'cloudflare';
}
```

### Phase 3: AIClient 및 호출부 수정

#### Task 3.1: AIClient 리팩토링
**파일**: `src/lib/ai/client.ts`

- `analyzeSchema(schema, ai)` → `analyzeSchema(schema)` (ai 파라미터 제거)
- Provider를 생성자에서 주입받거나 factory로 생성
- Provider의 `analyze()` 메서드에 위임

#### Task 3.2: aiDetectSemantic 수정
**파일**: `src/lib/schema/aiDetectSemantic.ts`

- `analyzeSchemaWithAI(schema, ai, config)` 시그니처 수정
- `ai` 파라미터 대신 `env` (또는 제거)
- 내부에서 provider factory 사용

#### Task 3.3: API Route 수정 (선택적)
**파일**: `src/app/api/ai/analyze-schema/route.ts`

- 현재 503 반환하는 stub → 실제 동작하도록 업데이트
- 환경에 따라 적절한 provider 사용

### Phase 4: 문서화 및 테스트

#### Task 4.1: 환경변수 문서 업데이트
**파일**: `.dev.vars.example`, `README.md`, `CLAUDE.md`

#### Task 4.2: 테스트 업데이트
**파일**: `src/tests/ai/` 디렉토리

- OpenAI provider 단위 테스트
- Provider factory 테스트
- 기존 테스트 수정

## 파일 변경 요약

| 파일 | 변경 유형 |
|------|----------|
| `src/lib/ai/providers/types.ts` | 신규 생성 |
| `src/lib/ai/providers/openai.ts` | 신규 생성 |
| `src/lib/ai/providers/cloudflare.ts` | 신규 생성 |
| `src/lib/ai/providers/factory.ts` | 신규 생성 |
| `src/lib/ai/providers/index.ts` | 신규 생성 |
| `src/lib/types/ai.ts` | 수정 |
| `src/lib/config/ai.ts` | 수정 |
| `src/lib/ai/client.ts` | 수정 |
| `src/lib/ai/index.ts` | 수정 |
| `src/lib/schema/aiDetectSemantic.ts` | 수정 |
| `.dev.vars.example` | 수정/생성 |
| `CLAUDE.md` | 수정 |

## 예상 결과

**개발 환경 (.dev.vars)**:
```bash
AI_ENABLED=true
# NODE_ENV=development → 자동으로 OpenAI provider 선택
# OPENAI_BASE_URL=http://localhost:1234/v1 (기본값)
# OPENAI_MODEL=gpt-oss-20b (기본값)
```

**배포 환경**:
- `NODE_ENV=production` → 자동으로 Cloudflare provider 선택
- 기존 wrangler.jsonc의 AI 바인딩 사용

## 리스크 및 고려사항

1. **LM Studio 응답 형식**: OpenAI API와 100% 호환되는지 테스트 필요
2. **타임아웃**: 로컬 LLM은 응답이 느릴 수 있음 → 타임아웃 설정 고려
3. **모델 호환성**: 프롬프트가 다른 모델에서도 잘 동작하는지 확인 필요
