# Content-Mapping: Potenzen und reelle Zahlen

Dieses Dokument erklärt, wie der Diagnosebogen-PDF-Content in die strukturierte JSON-Datei `potenzen_reelle_zahlen_content.json` übersetzt wurde.

## Übersicht: Die 4 Sektionen

### 1. "Der Spickzettel" (Wissensbasis)

Diese Sektion enthält **Referenzmaterialien**, keine interaktiven Aufgaben.

| Kachel-ID | Titel | PDF-Quelle | Inhalt |
|-----------|-------|------------|--------|
| `spick-01` | Video-Lounge | Seite 1 (YouTube-Links) | 3 Lernvideos: Heron-Verfahren (Schlau ist wow), Potenzen Grundlagen & Vertiefung (Cornelsen) |
| `spick-02` | Regelwerk & Gesetze | Implizit in allen Aufgaben | Zahlbereiche (N, Z, Q, I, R), Potenzgesetze, Wurzel-Potenz-Umrechnung |

**Implementierungshinweis**:
- Videos können als externe Links/Lightbox-Overlay dargestellt werden
- Regelwerk kann als kollapsible Accordion-UI oder Modal erscheinen

---

### 2. "Quests" (Diagnose & Einstieg)

Zwei Einstiegs-Kacheln für Selbsteinschätzung und Grundverständnis.

| Kachel-ID | Titel | PDF-Quelle | Aufgaben-Typ |
|-----------|-------|------------|--------------|
| `quest-01` | Self-Check | Seite 1 ("Ich kann...") | Checkliste/Selbsteinschätzung (10 Items) |
| `quest-02` | Zahlen-Sortierer | Aufgabe 1 | Drag & Drop oder Multi-Select (11 Zahlen → 5 Mengen) |

**Gamification**:
- Self-Check: 30 Coins (Motivation zur Selbsteinschätzung)
- Zahlen-Sortierer: 50 Coins + 120 Bounty (Erste echte Challenge)

---

### 3. "Das Gym" (Training & Routine)

Vier Trainingseinheiten, die den Löwenanteil der Aufgaben abdecken.

| Kachel-ID | Titel | PDF-Aufgaben | Schwierigkeit | Reward |
|-----------|-------|--------------|---------------|--------|
| `gym-01` | Power-Workout | 5, 6, 7, 8 | Mittel | 80 Coins + 200 Bounty |
| `gym-02` | Term-Tuner | 9, 10, 11 | Mittel | 90 Coins + 220 Bounty |
| `gym-03` | Wurzel-Labor | 12, 13, 15, 18, 19 | Mittel | 100 Coins + 250 Bounty |
| `gym-04` | Gleichungsknacker | 20 (a-l) | Schwer | 120 Coins + 300 Bounty |

**Logische Gruppierung**:
- **gym-01**: Basis-Potenzgesetze (Multiplikation, Division, Potenzieren, negative Exponenten)
- **gym-02**: Variablen-Terme vereinfachen (Transfer auf Algebra)
- **gym-03**: Wurzel ↔ Potenz-Umrechnung (rationale Exponenten)
- **gym-04**: Wurzelgleichungen (mit Probe-Pflicht!)

**Hinweis zu Aufgabe 20**:
Die 12 Teilaufgaben (a-l) werden als **Varianten** einer Task-Factory generiert, damit keine Kachel überladen ist. Der User bekommt zufällig 3-5 davon pro Quest-Durchlauf.

---

### 4. "Bounties" (Herausforderungen & Boss-Level)

Drei High-Value-Challenges für fortgeschrittene Lernende.

| Bounty-ID | Titel | PDF-Aufgabe | Reward | Entry Fee | Typ |
|-----------|-------|-------------|--------|-----------|-----|
| `bounty-01` | Der Beweis | Aufgabe 2 | 350 Coins | 53 Coins | Beweis (Theorie) |
| `bounty-02` | Heron-Verfahren | 3, 4 | 320 Coins | 48 Coins | Algorithmus |
| `bounty-03` | Real World Science | 21, 22, 23, 24, 25 | 380 Coins | 57 Coins | Anwendung |

**Bounty-Logik**:
- Alle 3 Bounty-Tasks müssen **in einem Durchlauf** korrekt gelöst werden
- Entry Fee wird beim Start abgezogen (15% des Rewards, min 10, max 60)
- Perfekter Run = einmalige Auszahlung des Bounty-Rewards

---

## Strukturelle Anpassungen für die App

### Neue Category-Gruppen?

Die bestehenden `CategoryGroup` sind: `'A' | 'B' | 'C'`

Für Potenzen/Algebra könnten wir:
1. **Option A**: Neue Gruppen einführen (`'D' | 'E'`)
2. **Option B**: Bestehende Gruppen wiederverwenden (z.B. `'A'` für Basics, `'B'` für Berechnung)

**Empfehlung**: Option B (Wiederverwendung), da die Gruppen primär für UI-Gruppierung sind. Die `category`-Felder (`'Basics' | 'Berechnung' | ...`) unterscheiden bereits die Art der Aufgabe.

### Neue Category-Typen?

Aktuelle Categories: `'Basics' | 'Konstruktion' | 'Berechnung' | 'Transformation' | 'Koordinaten' | 'Modellierung'`

Für Potenzen passen:
- ✅ `'Basics'` → Zahlbereiche, Grundlagen
- ✅ `'Berechnung'` → Potenzen, Wurzeln, Gleichungen
- ✅ `'Transformation'` → Terme umformen
- ✅ `'Modellierung'` → Anwendungsaufgaben (Real World Science)

**Keine neuen Categories nötig!**

### Task-Types für Potenzen

Bestehende Types (aus `types.ts`):
- `'choice'`, `'input'`, `'boolean'`, `'shorttext'`, `'visualChoice'`, `'wager'`, `'dragDrop'`, ...

Für Potenzen besonders relevant:
- ✅ `'input'` → Numerische Antworten (Wurzeln, Potenzen, wissenschaftliche Schreibweise)
- ✅ `'dragDrop'` → Zahlen in Zahlbereiche sortieren (Aufgabe 1)
- ✅ `'shorttext'` → Beweise (Aufgabe 2)
- ✅ `'multiInput'` → Wissenschaftliche Schreibweise (mehrere Zahlen)

**Zusätzlich nötig**: Validatoren für:
- Potenzschreibweise (z.B. "2,5 · 10⁻⁵" oder "2.5e-5")
- Rationale Exponenten (z.B. "a^(2/3)")
- Mathematische Beweise (Keyword-Matching für Beweisführung)

---

## Implementierungs-Checkliste

### Phase 1: Datenstruktur
- [ ] JSON-Datei in `constants.tsx` oder separaten Service importieren
- [ ] `LearningUnit[]`-Array erweitern um `u_potenzen_*` Units
- [ ] Spickzettel-Ressourcen als neue Sektion im UI rendern

### Phase 2: Task-Generierung
- [ ] Task-Factory für Potenzgesetze (Aufgaben 5-8)
- [ ] Task-Factory für Wurzelgleichungen (Aufgabe 20, Varianten)
- [ ] Drag-Drop-UI für Zahlbereiche (Aufgabe 1)
- [ ] Multi-Input für wissenschaftliche Schreibweise (Aufgaben 23-24)

### Phase 3: Validatoren
- [ ] Numeric-Tolerance-Validator (für Heron, Wurzeln)
- [ ] Keyword-Match-Validator (für Beweise)
- [ ] Potenz-Notation-Validator (flexibel: "2.5e-5" oder "2,5 · 10⁻⁵")

### Phase 4: Bounties
- [ ] Bounty-Catalog um Potenzen-Bounties erweitern
- [ ] Beweis-Aufgabe (shorttext mit Keyword-Matching)
- [ ] Heron-Verfahren (iterative Berechnung, 3-4 Schritte)
- [ ] Real-World-Science (Multi-Input + Kontext-Erklärungen)

### Phase 5: UI/UX
- [ ] Spickzettel-Sektion: Video-Embed oder Lightbox
- [ ] Self-Check: Interaktive Checkliste (10 Items mit 4 Smiley-Leveln)
- [ ] Zahlbereiche: Drag-Drop-Grid (11 Zahlen → 5 Spalten)
- [ ] Wurzelgleichungen: Warnung "Probe nicht vergessen!" als Hint

---

## Beispiel-Task: Wurzelgleichung (Aufgabe 20)

```typescript
{
  id: "gym-04-task-01",
  type: "input",
  question: "Löse die Gleichung: √(7x + 63) = 7. Gib die Lösung für x an.",
  correctAnswer: "-2",
  explanation: "Quadrieren: 7x + 63 = 49 → 7x = -14 → x = -2. Probe: √(7·(-2) + 63) = √49 = 7 ✓",
  validator: {
    type: "numericTolerance",
    numericAnswer: -2,
    tolerance: 0.01
  },
  instructions: "Wichtig: Führe nach dem Quadrieren immer eine Probe durch!"
}
```

---

## Beispiel-Task: Zahlbereiche (Aufgabe 1)

```typescript
{
  id: "quest-02-task-01",
  type: "dragDrop",
  question: "Ordne die folgenden Zahlen den richtigen Zahlbereichen zu:",
  dragDropData: {
    numbers: [
      { id: "n1", label: "9" },
      { id: "n2", label: "-26" },
      { id: "n3", label: "√9" },
      { id: "n4", label: "√5" },
      { id: "n5", label: "3/4" },
      // ... weitere
    ],
    categories: [
      { id: "N", label: "ℕ (Natürliche Zahlen)", accepts: ["n1", "n3"] },
      { id: "Z", label: "ℤ (Ganze Zahlen)", accepts: ["n1", "n2", "n3"] },
      { id: "Q", label: "ℚ (Rationale Zahlen)", accepts: ["n1", "n2", "n3", "n5"] },
      { id: "I", label: "𝕀 (Irrationale Zahlen)", accepts: ["n4"] },
      { id: "R", label: "ℝ (Reelle Zahlen)", accepts: ["n1", "n2", "n3", "n4", "n5"] }
    ]
  },
  correctAnswer: "all_correct",
  explanation: "Wichtig: Eine Zahl kann in mehreren Mengen enthalten sein! z.B. 9 ∈ N, Z, Q, R"
}
```

---

## Nächste Schritte

1. **Review**: Prüfe das JSON auf Vollständigkeit und Konsistenz
2. **Integration**: Füge die Units zur `LEARNING_UNITS`-Konstante hinzu
3. **Task-Factory**: Implementiere Generatoren für die verschiedenen Aufgabentypen
4. **Testing**: Teste besonders die Validatoren (Potenz-Notation, Beweise)

---

**Erstellt**: 2025-01-XX
**Basierend auf**: Diagnosebogen_HSG_9_KA_1_Potenzen_und_reelle_Zahlen_2025-26.pdf
**Struktur**: Angelehnt an `GEOMETRIE_QUESTS_CODE.ts` und `types.ts`

