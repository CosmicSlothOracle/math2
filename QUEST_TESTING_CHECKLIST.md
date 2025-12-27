# Quest Testing Checklist

**Date:** Created for systematic testing
**Purpose:** Test all untested quests from QUEST_TESTING_REPORT.md (lines 182-192)

## Pre-Testing Setup

- [ ] Ensure local Netlify dev server is running (`netlify dev`)
- [ ] Clear browser cache or use incognito mode
- [ ] Verify user has sufficient coins for quest entry fees (if applicable)
- [ ] Check browser console for errors before starting
- [ ] Note starting coin balance and XP level

---

## Potenzen & Reelle Zahlen Quests

### 1. Power-Workout (`u_potenzen_02`)
- **Unit ID:** `u_potenzen_02`
- **Expected Tasks:** 6 variants (from `createPotenzgesetzeQuest`)
- **Difficulty:** Mittel
- **Reward:** 80 Coins + 200 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads (not stuck on "Lade Mission...")
- [ ] Answer all questions correctly on first try
- [ ] Verify correct answers are marked with "Richtig! 🎉"
- [ ] Verify incorrect answers (if any) show proper feedback
- [ ] Complete quest and verify:
  - [ ] Progress updates to 100%
  - [ ] Coins are awarded correctly
  - [ ] Bounty is unlocked
- [ ] Check browser console for errors
- [ ] Document any issues found

**Expected Question Types:**
- Potenzgesetze: Multiplikation, Division, Potenzieren von Potenzen
- Negative Exponenten
- Basis-Potenzgesetze Anwendung

**Issues Found:**
```
[Document any issues here]
```

---

### 2. Term-Tuner (`u_potenzen_03`)
- **Unit ID:** `u_potenzen_03`
- **Expected Tasks:** 4 variants (from `createTermTunerQuest`)
- **Difficulty:** Mittel
- **Reward:** 90 Coins + 220 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads successfully
- [ ] Answer all questions correctly
- [ ] Verify term simplification questions work correctly
- [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Terme mit Variablen vereinfachen
- Potenzgesetze auf Terme anwenden
- Umformen in Form a^n

**Issues Found:**
```
[Document any issues here]
```

---

### 3. Wurzel-Labor (`u_potenzen_04`)
- **Unit ID:** `u_potenzen_04`
- **Expected Tasks:** 4 variants (from `createWurzelLaborQuest`)
- **Difficulty:** Mittel
- **Reward:** 100 Coins + 250 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads successfully
- [ ] Answer all questions correctly
- [ ] Verify root/power conversion questions work
- [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Wurzeln und Potenzen mit rationalen Exponenten
- Umrechnung zwischen Wurzel- und Potenzdarstellung
- n-te Wurzel Berechnungen

**Issues Found:**
```
[Document any issues here]
```

---

### 4. Gleichungsknacker (`u_potenzen_05`)
- **Unit ID:** `u_potenzen_05`
- **Expected Tasks:** 4 variants (from `createGleichungsknackerQuest`)
- **Difficulty:** Schwer
- **Reward:** 120 Coins + 300 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads successfully
- [ ] Answer all questions correctly
- [ ] Verify root equation solving questions work
- [ ] Verify solution validation includes probe check
- [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Wurzelgleichungen lösen
- Quadrieren und Probe durchführen
- Scheinlösungen erkennen

**Issues Found:**
```
[Document any issues here]
```

---

## Quadratische Funktionen Quests

### 5. Parabel-Basics (`u_quadratisch_01`)
- **Unit ID:** `u_quadratisch_01`
- **Expected Tasks:** 4 variants (from `createParabelBasicsQuest`)
- **Difficulty:** Mittel
- **Reward:** 60 Coins + 180 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads successfully
- [ ] Answer all questions correctly
- [ ] Verify questions about Normalparabel work
- [ ] Verify opening direction questions work
- [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Normalparabel f(x) = x²
- Öffnung nach oben/unten
- Scheitelpunkt im Ursprung
- Symmetrie zur y-Achse

**Issues Found:**
```
[Document any issues here]
```

---

### 6. Scheitelpunkt-Studio (`u_quadratisch_02`)
- **Unit ID:** `u_quadratisch_02`
- **Expected Tasks:** 5 variants (from `createScheitelpunktQuest`)
- **Difficulty:** Mittel
- **Reward:** 70 Coins + 200 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads successfully
- [ ] Answer all questions correctly
- [ ] Verify Scheitelpunktform questions work
- [ ] Verify vertex reading from form f(x) = (x - d)² + e
- [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Scheitelpunktform f(x) = (x - d)² + e
- Scheitelpunkt S(d|e) ablesen
- Verschiebung verstehen

**Issues Found:**
```
[Document any issues here]
```

---

### 7. Stretch-Lab (`u_quadratisch_03`)
- **Unit ID:** `u_quadratisch_03`
- **Expected Tasks:** 4 variants (from `createStreckungQuest`)
- **Difficulty:** Mittel
- **Reward:** 80 Coins + 220 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads successfully
- [ ] Answer all questions correctly
- [ ] Verify stretch/compression questions work
- [ ] Verify questions about factor a work
- [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Streckung und Stauchung f(x) = a(x - d)² + e
- Streckfaktor a verstehen
- |a| > 1 (gestreckt) vs |a| < 1 (gestaucht)
- a < 0 (nach unten geöffnet)

**Issues Found:**
```
[Document any issues here]
```

---

### 8. Form-Transformer (`u_quadratisch_04` & `u_quadratisch_05`)
- **Unit IDs:** `u_quadratisch_04`, `u_quadratisch_05`
- **Expected Tasks:** 3 variants each (from `createFormTransformQuest`)
- **Difficulty:** Mittel
- **Reward:** 90 Coins + 240 Bounty (u_quadratisch_04), 100 Coins + 280 Bounty (u_quadratisch_05)

**Testing Steps:**
- [ ] Test `u_quadratisch_04` first
  - [ ] Navigate to quest card
  - [ ] Open quest detail modal
  - [ ] Click "Quest" tab
  - [ ] Click "Quiz starten"
  - [ ] Verify quest loads successfully
  - [ ] Answer all questions correctly
  - [ ] Verify general form questions work
  - [ ] Complete quest and verify rewards
- [ ] Test `u_quadratisch_05` (more transformation tasks)
  - [ ] Navigate to quest card
  - [ ] Open quest detail modal
  - [ ] Click "Quest" tab
  - [ ] Click "Quiz starten"
  - [ ] Verify quest loads successfully
  - [ ] Answer all questions correctly
  - [ ] Verify transformation questions work
  - [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Allgemeine Form f(x) = ax² + bx + c
- Koeffizienten a, b, c verstehen
- Umwandlung zwischen Formen

**Issues Found:**
```
[Document any issues here]
```

---

### 9. Quadratische Ergänzung (`u_quadratisch_05`)
- **Note:** This is the same unit as Form-Transformer above, but focuses on quadratic completion
- **Unit ID:** `u_quadratisch_05`
- **Expected Tasks:** 3 variants (additional from `createFormTransformQuest`)
- **Difficulty:** Schwer
- **Reward:** 100 Coins + 280 Bounty

**Testing Steps:**
- [ ] (Already covered in Form-Transformer section above)
- [ ] Verify quadratic completion questions specifically
- [ ] Verify conversion AF → SPF questions work
- [ ] Check for console errors

**Expected Question Types:**
- Quadratische Ergänzung durchführen
- Umwandlung AF → SPF
- Scheitelpunkt berechnen

**Issues Found:**
```
[Document any issues here]
```

---

### 10. Nullstellen-Finder (`u_quadratisch_06`)
- **Unit ID:** `u_quadratisch_06`
- **Expected Tasks:** 4 variants (from `createNullstellenQuest`)
- **Difficulty:** Schwer
- **Reward:** 110 Coins + 300 Bounty

**Testing Steps:**
- [ ] Navigate to quest card
- [ ] Open quest detail modal
- [ ] Click "Quest" tab
- [ ] Click "Quiz starten"
- [ ] Verify quest loads successfully
- [ ] Answer all questions correctly
- [ ] Verify zero point calculation questions work
- [ ] Verify pq-formula questions work
- [ ] Verify discriminant questions work
- [ ] Complete quest and verify rewards
- [ ] Check for console errors

**Expected Question Types:**
- Nullstellen berechnen
- pq-Formel anwenden
- Mitternachtsformel
- Diskriminante D bestimmen
- Anzahl der Lösungen bestimmen

**Issues Found:**
```
[Document any issues here]
```

---

## Bounty Quests

### All Bounty Quests
- [ ] Test each bounty quest after completing its corresponding standard quest
- [ ] Verify entry fee is deducted correctly (15% of bounty, min 10, max 60)
- [ ] Verify bounty can only be claimed once
- [ ] Verify "for practice only" message after first completion
- [ ] Test with perfect run vs imperfect run
- [ ] Verify bounty rewards are calculated correctly

**Bounty Quests to Test:**
- [ ] Power-Workout Bounty
- [ ] Term-Tuner Bounty
- [ ] Wurzel-Labor Bounty
- [ ] Gleichungsknacker Bounty
- [ ] Parabel-Basics Bounty
- [ ] Scheitelpunkt-Studio Bounty
- [ ] Stretch-Lab Bounty
- [ ] Form-Transformer Bounty
- [ ] Quadratische Ergänzung Bounty
- [ ] Nullstellen-Finder Bounty
- [ ] Real-World Parabeln Bounty (`u_quadratisch_07`)

---

## Common Issues to Check

For each quest, verify:
- [ ] Quest loads without getting stuck on "Lade Mission..."
- [ ] All questions display correctly
- [ ] Answer validation works (correct/incorrect feedback)
- [ ] Explanations appear after answering
- [ ] Progress tracking updates correctly
- [ ] Coin rewards are calculated and awarded correctly
- [ ] Bounty unlock status updates correctly
- [ ] Quest completion screen appears
- [ ] Progress is saved to server
- [ ] No console errors during quest execution
- [ ] Tip/Hint button works (or shows graceful error if API key missing)
- [ ] Level display shows correct number (not NaN)

---

## Testing Summary Template

After completing all tests, fill in:

**Total Quests Tested:** ___ / 11
**Successfully Completed:** ___ / 11
**Failed to Load:** ___ / 11
**Critical Issues Found:** ___
**Minor Issues Found:** ___

**Critical Issues:**
1. [List critical issues here]

**Minor Issues:**
1. [List minor issues here]

**Recommendations:**
1. [List recommendations here]

---

## Notes

- Test in the same order as listed if possible
- Document any quest-specific issues immediately
- Take screenshots of any visual bugs
- Note any performance issues (slow loading, lag, etc.)
- Test on different browsers if possible (Chrome, Firefox, Safari)
- Test on mobile device if applicable

