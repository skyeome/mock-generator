# Mock Data Generator - Implementation Plan

## PLANNING_COMPLETE

---

## Phase 1: MVP (Core Functionality)

### P1-T1: Project Structure Setup
- Add dependencies: @faker-js/faker
- Create directory structure

### P1-T2: TypeScript Type Definitions
- /src/lib/types/schema.ts
- /src/lib/types/generator.ts

### P1-T3: JSON Schema Inference Engine
- /src/lib/schema/inferSchema.ts
- /src/lib/schema/mergeSchemas.ts

### P1-T4: Semantic Field Detection
- /src/lib/schema/detectSemantic.ts
- /src/lib/schema/semanticRules.ts

### P1-T5: Mock Data Generator
- /src/lib/generator/generateMock.ts
- /src/lib/generator/semanticGenerators.ts

### P1-T6: Basic UI - JSON Input
- /src/components/editor/JsonEditor.tsx

### P1-T7: Basic UI - Output Panel
- /src/components/output/OutputPanel.tsx
- /src/components/output/GeneratorControls.tsx

### P1-T8: Main Application Integration
- /src/app/page.tsx

### P1-T9: localStorage Persistence
- /src/hooks/useLocalStorage.ts

---

## Phase 2: Enhanced Features

### P2-T1: CSV Export
- /src/lib/export/csv.ts

### P2-T2: SQL Export
- /src/lib/export/sql.ts

### P2-T3: TypeScript Export
- /src/lib/export/typescript.ts

### P2-T4: Format Selector UI
- /src/components/export/FormatSelector.tsx

---

## Phase 3: Polish

### P3-T1: Performance Optimization
### P3-T2: Keyboard Shortcuts
### P3-T3: Dark Mode
### P3-T4: Mobile Responsiveness
### P3-T5: Sample Templates

---

## Dependency Order

P1-T1 → P1-T2 → P1-T3 → P1-T4 → P1-T5 → P1-T6/P1-T7 → P1-T8 → P1-T9
                                            ↓
P2-T1, P2-T2, P2-T3 (parallel) → P2-T4
                                    ↓
                              P3-T1 → P3-T5
