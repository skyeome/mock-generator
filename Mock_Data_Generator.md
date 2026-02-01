# Mock Data Generator - Requirements Specification

## Project Summary

**Mock Data Generator** - JSON 샘플에서 스키마를 추론하고, AI 강화 규칙으로 리얼한 테스트 데이터를 생성하는 웹 기반 개발자 도구

### Problem Statement

개발자들은 API 문서화나 검증을 위해 복잡한 JSON 데이터를 JSON Schema로 변환하거나, 프론트엔드 테스트를 위해 가짜 데이터(Mock Data)를 일일이 만드는 비생산적인 작업을 반복한다.

### Solution

JSON 샘플을 붙여넣으면 즉시 표준 스키마를 생성해주고, 해당 스키마 규칙에 맞는 대량의 더미 데이터를 생성해주는 개발자 유틸리티.

---

## Key Decisions

| Category | Decision |
|----------|----------|
| Platform | Web App |
| AI | Hybrid (규칙 기반 + LLM 강화 옵션) |
| Target Users | Frontend Devs, QA Engineers |
| Storage | Local Storage (브라우저) |
| Export Formats | JSON, CSV, SQL, TypeScript |
| Scale | 1-100 records |
| Business Model | Freemium (무료 횟수 + 유료 플랜) |

---

## Functional Requirements

### FR-1: JSON → Schema Conversion

| ID | Requirement |
|----|-------------|
| FR-1.1 | JSON 샘플 입력 시 JSON Schema (draft-07) 자동 생성 |
| FR-1.2 | 중첩 객체, 배열, nullable 타입 정확히 추론 |
| FR-1.3 | 생성된 스키마 복사/다운로드 기능 |

### FR-2: Mock Data Generation

| ID | Requirement |
|----|-------------|
| FR-2.1 | 스키마 기반 1-100개 데이터 일괄 생성 |
| FR-2.2 | 필드명 분석 → 적절한 Faker 함수 자동 매핑 |
| FR-2.3 | 동일 스키마로 반복 생성 시 다른 값 생성 |

### FR-3: AI Enhancement (Hybrid)

| ID | Requirement |
|----|-------------|
| FR-3.1 | 기본: 규칙 기반 매핑 (email→faker.email, name→faker.name) |
| FR-3.2 | 강화 모드: LLM으로 복잡한 필드 컨텍스트 이해 |
| FR-3.3 | Freemium 모델: 무료 횟수 + 유료 플랜 |

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

## Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Performance | 100개 데이터 생성 < 2초 (규칙 기반) |
| NFR-2 | Usability | 붙여넣기 → 결과까지 3클릭 이내 |
| NFR-3 | Privacy | API 키 로컬 저장, 서버 전송 시 암호화 |
| NFR-4 | Accessibility | 키보드 네비게이션, 스크린리더 지원 |
| NFR-5 | Browser Support | Chrome, Firefox, Safari, Edge 최신 2버전 |

---

## User Stories

```
AS A Frontend Developer
I WANT TO paste a sample API response and get mock data instantly
SO THAT I can build UI without waiting for backend APIs

AS A QA Engineer
I WANT TO generate diverse test data with edge cases
SO THAT I can test form validation and data handling

AS A Developer
I WANT TO export data in multiple formats
SO THAT I can use it in different contexts (DB seeding, API mocking, tests)
```

---

## Acceptance Criteria

### Core Flow

```gherkin
GIVEN I have a JSON sample
WHEN I paste it into the input area
THEN I see the inferred JSON Schema displayed

GIVEN a valid JSON Schema is displayed
WHEN I click "Generate" with count=10
THEN I receive 10 unique mock data entries

GIVEN generated mock data
WHEN I select "Export as CSV"
THEN a CSV file is downloaded with correct headers
```

### AI Enhancement

```gherkin
GIVEN a field named "productDescription"
WHEN AI mode is enabled
THEN the generated value is a realistic product description (not lorem ipsum)

GIVEN I have exhausted free LLM credits
WHEN I try to use AI mode
THEN I see upgrade prompt with pricing options
```

---

## Open Questions

| # | Question | Impact |
|---|----------|--------|
| 1 | 한국어/영어 데이터 로케일 지원 범위는? | Faker 설정, UI 다국어 |
| 2 | LLM 프로바이더 선택? (OpenAI, Claude, 자체 호스팅) | 비용, 지연시간, 프라이버시 |
| 3 | 유료 플랜 가격대 및 무료 횟수는? | 비즈니스 모델 |
| 4 | 팀 공유 기능은 향후 로드맵? | 아키텍처 확장성 |

---

## Competitive Analysis

| Tool | Strengths | Gaps |
|------|-----------|------|
| json-generator.com | 템플릿 문법 강력 | 학습 곡선, AI 없음 |
| mockaroo.com | 다양한 타입 | 스키마 추론 없음 |
| quicktype.io | 타입 생성 훌륭 | mock data 미지원 |

**Differentiator**: JSON 붙여넣기 → 스키마 + Mock + AI 강화 **원스톱 경험**

---

## Next Steps

- `/sc:design` - 아키텍처 설계
- `/sc:workflow` - 구현 계획 수립
