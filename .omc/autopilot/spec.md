# Mock Data Generator - Complete Specification

## EXPANSION_COMPLETE

---

# Part 1: Requirements Analysis

## 1. Functional Requirements (FR)

### FR-1: JSON → Schema Conversion
| ID | Requirement |
|----|-------------|
| FR-1.1 | JSON 샘플 입력 시 JSON Schema (draft-07) 자동 생성 |
| FR-1.2 | 중첩 객체, 배열, nullable 타입 정확히 추론 |
| FR-1.3 | 생성된 스키마 복사/다운로드 기능 |
| FR-1.4 | Format 자동 감지: email, date, date-time, uri, uuid |

### FR-2: Mock Data Generation
| ID | Requirement |
|----|-------------|
| FR-2.1 | 스키마 기반 1-100개 데이터 일괄 생성 |
| FR-2.2 | 필드명 분석 → 적절한 Faker 함수 자동 매핑 |
| FR-2.3 | 동일 스키마로 반복 생성 시 다른 값 생성 |
| FR-2.4 | Seed 지원으로 재현 가능한 생성 |

### FR-3: AI Enhancement (Hybrid)
| ID | Requirement |
|----|-------------|
| FR-3.1 | 기본: 규칙 기반 매핑 (email→faker.email, name→faker.name) |
| FR-3.2 | 강화 모드: LLM으로 복잡한 필드 컨텍스트 이해 |
| FR-3.3 | BYOK 모델: 사용자 API 키 사용 |

### FR-4: Multi-format Export
| ID | Requirement |
|----|-------------|
| FR-4.1 | JSON 배열 출력 |
| FR-4.2 | CSV 다운로드 |
| FR-4.3 | SQL INSERT 문 생성 |
| FR-4.4 | TypeScript interface 생성 |

### FR-5: Local Persistence
| ID | Requirement |
|----|-------------|
| FR-5.1 | 최근 스키마 localStorage 저장 |
| FR-5.2 | 자주 쓰는 스키마 즐겨찾기 |
| FR-5.3 | 설정(기본 언어, 생성 개수 등) 저장 |

---

## 2. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Performance | 100개 데이터 생성 < 2초 (규칙 기반) |
| NFR-2 | Usability | 붙여넣기 → 결과까지 3클릭 이내 |
| NFR-3 | Privacy | 클라이언트 사이드 처리, 서버 전송 없음 |
| NFR-4 | Accessibility | 키보드 네비게이션, 스크린리더 지원 |
| NFR-5 | Browser | Chrome, Firefox, Safari, Edge 최신 2버전 |

---

# Part 2: Technical Architecture

## Tech Stack

| Category | Technology | Rationale |
|----------|------------|-----------|
| Framework | Next.js 16 + React 19 | 기존 설정 유지, SSR for SEO |
| Styling | Tailwind CSS 4 + shadcn/ui | 빠른 개발, 접근성 |
| Mock Generation | @faker-js/faker | 50KB, 40+ locales, tree-shakeable |
| Schema | quicktype-core + ajv | 스키마 추론 및 검증 |
| Editor | @monaco-editor/react | VS Code 엔진, syntax highlighting |
| State | Zustand | 1KB, localStorage 미들웨어 |
| Export | papaparse, file-saver | CSV, 파일 다운로드 |
| Deployment | Cloudflare Pages | 기존 설정 유지 |

## File Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── editor/
│   │   ├── json-input.tsx
│   │   ├── schema-view.tsx
│   │   └── preview-panel.tsx
│   ├── generator/
│   │   ├── field-config.tsx
│   │   └── generation-options.tsx
│   └── export/
│       ├── export-modal.tsx
│       └── format-options.tsx
├── lib/
│   ├── schema/
│   │   ├── inferrer.ts
│   │   ├── validator.ts
│   │   └── enricher.ts
│   ├── generator/
│   │   ├── mock-generator.ts
│   │   └── field-resolver.ts
│   ├── detector/
│   │   ├── pattern-matcher.ts
│   │   └── name-analyzer.ts
│   └── export/
│       ├── json-exporter.ts
│       ├── csv-exporter.ts
│       ├── sql-exporter.ts
│       └── typescript-exporter.ts
├── store/
│   ├── schema-store.ts
│   ├── config-store.ts
│   └── history-store.ts
├── hooks/
│   ├── use-schema-inference.ts
│   └── use-mock-generation.ts
└── types/
    ├── schema.ts
    ├── generator.ts
    └── export.ts
```

## Core Interfaces

```typescript
// JSONSchema with Faker extension
interface JSONSchema {
  type: string | string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  format?: string;
  "x-faker"?: { method: string; args?: unknown[] };
}

// Generation Config
interface GenerationConfig {
  count: number;
  seed?: number;
  locale: string;
}

// Export Options
type ExportFormat = "json" | "csv" | "sql" | "typescript";
```

## User Flow (3 Clicks)

1. **Paste JSON** → Auto-parse
2. **Click Generate** → Mock data created
3. **Click Export** → Download file
