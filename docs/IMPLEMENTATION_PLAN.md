# Implementation Plan - Bugfix & Curriculum Extension

## Task System Map

| Unit | TaskType | Definition File | Renderer Component | Validator | Known Issue | Status |
|------|----------|----------------|-------------------|-----------|-------------|--------|
| u2 | multiAngleThrow | taskFactory.ts:801 | src/App.tsx:2843 | handleVerify (missing) | No coin deduction, no 5-input UI, no evaluation | 🔴 Broken |
| u5 | sliderTransform | taskFactory.ts:747 | App.tsx:1462 | App.tsx:1314 | Slider stuck/unreliable, may use stale value | 🟡 Unreliable |
| u4 | input (bounty) | taskFactory.ts:152 | App.tsx:1525 | App.tsx:1299 | Currency formatting leakage ("€64") | 🔴 Broken |
| All | bounty accept | App.tsx:1259 | UnitView | N/A | Sometimes doesn't transition | 🟡 Unreliable |
| u1 | dragDrop | taskFactory.ts:690 | App.tsx:1417 | App.tsx:1290 | Uses select dropdown, not real DnD | 🟡 Mismatch |
| u2 | angleMeasure | taskFactory.ts:724 | App.tsx:1442 | App.tsx:1310 | Copy says "hover to measure" but no hover | 🟡 Mismatch |
| u1 | visualChoice | taskFactory.ts:203 | App.tsx:1377 | App.tsx:1308 | Smartphone display duplicate | 🟡 Duplicate |

## Code References

### Task Definitions
- **Location**: `services/taskFactory.ts` (lines 16-826)
- **Key Functions**:
  - `createMultiAngleThrowTask` (line 801)
  - `createSliderTransformationTask` (line 747)
  - `createDragDropTask` (line 690)
  - `createAngleMeasurementTask` (line 724)
  - `createVisualShapeTask` (line 203)

### Task Rendering
- **Main Component**: `App.tsx` - `QuestExecutionView` (lines 1266-1567)
- **Alternative Component**: `src/App.tsx` - `QuestExecutionView` (lines 3040-3471)
- **MultiAngleThrow Component**: `src/App.tsx` - `MultiAngleThrowTraining` (lines 2843-3038)

### Validation Logic
- **Location**: `App.tsx` - `handleVerify` function (lines 1286-1333)
- **Alternative**: `src/App.tsx` - `handleVerify` function (lines 3087-3141)

### Bounty System
- **Accept Handler**: `App.tsx` line 1259 - `onClick={() => onStartQuest(unit, 'bounty')}`
- **Bounty Tasks**: `services/segments.ts` - defines bounty tasks per unit

### Economy System
- **Coin Service**: `services/coinAwardService.ts`
- **Quest Service**: `services/questService.ts`

## Implementation Status

- [x] Phase 0: Ground truth map created
- [x] Phase 1A: Fix multiAngleThrow
- [x] Phase 1B: Fix sliderTransform
- [x] Phase 1C: Fix bounty numeric input
- [x] Phase 1D: Fix bounty accept
- [x] Phase 2A: Implement real dragDrop
- [x] Phase 2B: Make angleMeasure interactive
- [x] Phase 2C: Remove duplicates
- [x] Phase 3A: Unit 2 extensions
- [x] Phase 3B: Unit 3 extensions
- [x] Phase 3C: Unit 4 extensions
- [x] Phase 3D: Unit 5 extensions
- [x] Phase 3E: Documentation update
- [x] Phase 4: QA & Regression (validator tests added)

