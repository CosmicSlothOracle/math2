# 🎯 MIGRATIONS-LOG

**Von:** `mathmaster2/` (altes Hauptprojekt)
**Nach:** `Matheneueshauptrojekt/` (neues Hauptprojekt)
**Datum:** 2025-12-19/20

---

## ✅ BEREITS ÜBERTRAGEN:

### 1. services/taskFactory.ts

- **Status:** ✅ Komplett übertragen
- **Zeilen:** 741 (alle erweiterten Aufgaben)
- **Inhalt:**
  - createVisualShapeTask (4 Varianten mit shapeType, context, showAngles)
  - createVisualAngleTask (mit angleValue)
  - createShapeTask, createAngleTask, createAreaTask, createVolumeTask
  - createTransformTask, createContextTask, createBountyTask
  - createDragDropTask, createAngleMeasurementTask, createAreaDecompositionTask, createSliderTransformationTask
  - createVisualSimilarityTask, createScalingLogicTask
  - createWagerTask

### 2. types.ts

- **Status:** ✅ Komplett übertragen
- **Neue Interfaces:**
  - `TileStatus` ('locked', 'gold_unlocked', 'bounty_cleared')
  - `PreTask` (Voraufgaben mit uiType und meta)
  - `BountyTask extends Task` (mit difficultyLevel)
- **Erweiterte Task-Types:**
  - 'dragDrop', 'angleMeasure', 'sliderTransform', 'areaDecomposition'
- **Erweiterte User-Properties:**
  - `perfectStandardQuizUnits`, `perfectBountyUnits`, `questionCoins`

### 3. constants.tsx

- **Status:** ✅ Teilweise ergänzt
- **Neue Shop-Items:**
  - `eff_event_horizon` (Event Horizon UI, 2500 Coins)
  - `eff_quantum` (Quantum Afterimage, 1800 Coins)

---

## ⏳ NOCH ZU ÜBERTRAGEN:

### 4. src/config/segments.ts (WICHTIG!)

- **Inhalt:** PreTasks & BountyTasks für jede Unit
- **Struktur:** SegmentConfig pro Unit
- **Details:**
  - PreTasks: 4-5 interaktive Mini-Games pro Unit
  - BountyTasks: 3 klassische Prüfungsaufgaben pro Unit
- **Status:** ⏳ Pending

### 5. src/services/coinAwardService.ts

- **Inhalt:** Münz-Belohnungslogik
- **Status:** ⏳ Pending

### 6. src/services/tileStateService.ts

- **Inhalt:** Tile-Status-Management
- **Status:** ⏳ Pending

### 7. src/components/ (Optional)

- **BountyView.tsx** - Bounty-Aufgaben-Ansicht
- **PreTasksView.tsx** - Voraufgaben-Ansicht
- **TileCard.tsx** - Kachel-Component
- **shared/** - 14 interaktive Components
- **Status:** ⏳ Pending (nur wenn UI benötigt wird)

### 8. Dokumentation

- **COIN_AWARD_SYSTEM.md**
- **SEGMENT_STRUCTURE.md**
- **TILE_STATE_TRANSITIONS.md**
- **PROMPT_IMPLEMENTATION_MAP.md**
- **Status:** ⏳ Pending

---

## 📋 NÄCHSTE SCHRITTE:

1. ✅ segments.ts erstellen in `services/segments.ts`
2. ✅ coinAwardService.ts übertragen
3. ✅ tileStateService.ts übertragen
4. 🤔 Interaktive Components (nur bei Bedarf)
5. ✅ Dokumentation aktualisieren
6. ✅ Testing

---

**Ziel:** Alle Aufgaben und Logik übertragen, aber die einfache Architektur des neuen Projekts beibehalten!
