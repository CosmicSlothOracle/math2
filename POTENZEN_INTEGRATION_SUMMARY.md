# Potenzen & Reelle Zahlen - Integration Summary

## ✅ Erstellte Dateien

1. **`services/potenzenQuests.ts`** - Task-Factories für Standard-Quest-Aufgaben
   - `createPotenzgesetzeQuest()` - Power-Workout (Aufgaben 5-8)
   - `createTermTunerQuest()` - Term-Tuner (Aufgaben 9-11)
   - `createWurzelLaborQuest()` - Wurzel-Labor (Aufgaben 12, 13, 15, 18, 19)
   - `createGleichungsknackerQuest()` - Gleichungsknacker (Aufgabe 20)

2. **`services/potenzenBounties.ts`** - Bounty-Tasks
   - `BEWEIS_BOUNTIES` - Der Beweis: √3 ist irrational (Aufgabe 2)
   - `HERON_BOUNTIES` - Heron-Verfahren: √7 und √13 (Aufgaben 3, 4)
   - `SCIENCE_BOUNTIES` - Real World Science (Aufgaben 21-25)

3. **`services/potenzenLearningUnits.ts`** - Learning Units Definition
   - 8 LearningUnits für Potenzen & Reelle Zahlen
   - PreTask für Zahlen-Sortierer (Drag-Drop)

4. **`potenzen_reelle_zahlen_content.json`** - Strukturierte JSON-Daten
   - Vollständige Mapping-Tabelle (PDF → JSON)
   - Spickzettel, Quests, Gym, Bounties

5. **`POTENZEN_CONTENT_MAPPING.md`** - Dokumentation
   - Detaillierte Erklärung des Mappings
   - Implementierungs-Checkliste

## ✅ Integrierte Dateien

1. **`services/taskFactory.ts`**
   - Import der Potenzen-Quest-Funktionen
   - Erweitert `getTaskPool()` um Potenzen-Unit-IDs:
     - `u_potenzen_01` (Zahlen-Sortierer - PreTask only)
     - `u_potenzen_02` (Power-Workout)
     - `u_potenzen_03` (Term-Tuner)
     - `u_potenzen_04` (Wurzel-Labor)
     - `u_potenzen_05` (Gleichungsknacker)
     - Bounty-only Units: `u_potenzen_bounty_proof`, `u_potenzen_bounty_heron`, `u_potenzen_bounty_science`

2. **`services/bountyCatalog.ts`**
   - Import der Potenzen-Bounty-Tasks
   - Erweitert `getBountyTasks()` um Potenzen-Bounty-Unit-IDs

## 📋 Nächste Schritte

### 1. LearningUnits zu constants.tsx hinzufügen

Die LearningUnits müssen noch in `constants.tsx` importiert und zum `LEARNING_UNITS`-Array hinzugefügt werden:

```typescript
import { POTENZEN_LEARNING_UNITS } from './services/potenzenLearningUnits';

export const LEARNING_UNITS: LearningUnit[] = [
  // ... bestehende Units (u1-u6)
  ...POTENZEN_LEARNING_UNITS,
];
```

### 2. Spickzettel-Integration

Die Spickzettel-Ressourcen (Video-Links, Regelwerk) müssen in die UI integriert werden:
- Video-Embed/Lightbox für YouTube-Links
- Accordion oder Modal für Regelwerk-Content

### 3. PreTask: Drag-Drop für Zahlbereiche

Die PreTask `zahlbereichePreTask` nutzt `uiType: 'dragDrop'`. Die UI-Komponente muss:
- 11 Zahlen als Drag-Elemente anzeigen
- 5 Kategorien (N, Z, Q, I, R) als Drop-Zonen
- Mehrfach-Zuordnung unterstützen (eine Zahl kann in mehreren Mengen sein)

### 4. Validatoren (Optional)

Die bestehenden Validatoren in `utils/answerValidators.ts` sollten ausreichen:
- ✅ `numericTolerance` - für numerische Antworten (Wurzeln, Potenzen)
- ✅ `keywords` - für Beweise und Text-Antworten
- ✅ `multiInputFields` - für wissenschaftliche Schreibweise

**Mögliche Erweiterungen:**
- Validator für Potenz-Notation (z.B. "2.5e-5" oder "2,5 · 10⁻⁵")
- Validator für rationale Exponenten (z.B. "a^(2/3)")

### 5. Testing

**Zu testen:**
- [ ] Task-Generierung für alle Potenzen-Units
- [ ] Bounty-Tasks werden korrekt geladen
- [ ] PreTask Drag-Drop funktioniert
- [ ] Validatoren akzeptieren verschiedene Antwortformate
- [ ] Coins/Bounties werden korrekt vergeben

## 🎯 Unit-IDs Übersicht

| Unit-ID | Titel | Typ | Tasks | Bounties |
|---------|-------|-----|-------|----------|
| `u_potenzen_01` | Zahlen-Sortierer | Quest | PreTask (Drag-Drop) | - |
| `u_potenzen_02` | Power-Workout | Quest | 6 Varianten | - |
| `u_potenzen_03` | Term-Tuner | Quest | 4 Varianten | - |
| `u_potenzen_04` | Wurzel-Labor | Quest | 4 Varianten | - |
| `u_potenzen_05` | Gleichungsknacker | Quest | 4 Varianten | - |
| `u_potenzen_bounty_proof` | Der Beweis | Bounty | - | 1 Task |
| `u_potenzen_bounty_heron` | Heron-Verfahren | Bounty | - | 3 Tasks |
| `u_potenzen_bounty_science` | Real World Science | Bounty | - | 3 Tasks |

## 📊 Aufgaben-Mapping

| PDF-Aufgabe | Unit | Task-Factory |
|-------------|------|--------------|
| 1 | u_potenzen_01 | PreTask (Drag-Drop) |
| 2 | u_potenzen_bounty_proof | BEWEIS_BOUNTIES[0] |
| 3, 4 | u_potenzen_bounty_heron | HERON_BOUNTIES |
| 5-8 | u_potenzen_02 | createPotenzgesetzeQuest |
| 9-11 | u_potenzen_03 | createTermTunerQuest |
| 12, 13, 15, 18, 19 | u_potenzen_04 | createWurzelLaborQuest |
| 20 (a-l) | u_potenzen_05 | createGleichungsknackerQuest |
| 21-25 | u_potenzen_bounty_science | SCIENCE_BOUNTIES |

## 🔍 Wichtige Hinweise

1. **Wurzelgleichungen (Aufgabe 20)**: Die Probe ist Pflicht! Die Task-Factory fügt automatisch einen Hint hinzu.

2. **Heron-Verfahren**: Iterative Berechnung, die Validatoren akzeptieren Ergebnisse mit 3 Nachkommastellen (±0.001).

3. **Beweis-Aufgabe**: Nutzt Keyword-Matching, da es keine "eine richtige Antwort" gibt. Wichtige Keywords: "widerspruch", "teilerfremd", "p²", "q²".

4. **Wissenschaftliche Schreibweise**: Akzeptiert verschiedene Notationen:
   - `2,5 · 10⁻⁵` (mit Komma, Malpunkt, Unicode-Hochzeichen)
   - `2.5e-5` (englische Notation)
   - `2.5 * 10^-5` (ASCII-Alternative)

5. **PreTask für u_potenzen_01**: Die Zahlen-Sortierer-Aufgabe ist als PreTask implementiert, da sie ein interaktives Drag-Drop-Element benötigt.

## 📝 Code-Beispiele

### Task generieren (Standard-Quest):
```typescript
import { TaskFactory } from './services/taskFactory';

const tasks = TaskFactory.getTasksForUnit('u_potenzen_02', 'standard');
// Gibt 5 zufällige Tasks aus dem Pool zurück
```

### Bounty-Tasks abrufen:
```typescript
import { getBountyTasks } from './services/bountyCatalog';

const bounties = getBountyTasks('u_potenzen_bounty_proof');
// Gibt BEWEIS_BOUNTIES zurück (1 Task)
```

### LearningUnit verwenden:
```typescript
import { POTENZEN_LEARNING_UNITS } from './services/potenzenLearningUnits';

const unit = POTENZEN_LEARNING_UNITS.find(u => u.id === 'u_potenzen_02');
// Gibt Power-Workout Unit zurück
```

---

**Status**: ✅ Code-Erstellung abgeschlossen
**Nächster Schritt**: Integration in `constants.tsx` und UI-Testing

