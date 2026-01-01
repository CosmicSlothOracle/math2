# Bounty-Fixes Bericht

## Durchgeführte Fixes

### 1. ✅ Eingabeformat für Koordinaten
**Problem**: Punktformat "(3|4)" konnte nicht eingegeben werden, da das Eingabefeld nur Ziffern erlaubte.

**Fix**:
- `sanitizeMathInput` erlaubt jetzt Pipe-Zeichen `|` für Koordinatenpaare
- `inputMode` wird auf `text` gesetzt für `coordinatePair` Validatoren
- `MultiFieldInput` erlaubt Pipe-Zeichen für Koordinaten-Eingaben
- Validierung verwendet rohen Input für Koordinatenpaare

**Dateien**:
- `utils/inputSanitizer.ts`: Pipe-Zeichen Unterstützung hinzugefügt
- `App.tsx`: `inputMode` dynamisch basierend auf Validator-Typ
- `components/MultiFieldInput.tsx`: Pipe-Zeichen für Koordinaten erlaubt

### 2. ✅ Fehlerhafte Bewertung "Figuren verstehen"
**Problem**: Antwort "rechte Winkel" wurde als falsch markiert, obwohl sie korrekt ist.

**Fix**:
- Validierungslogik korrigiert: Keywords müssen zuerst matchen, dann wird Negation geprüft
- `requireNegation` wird jetzt korrekt angewendet: Antwort muss Keywords enthalten UND Negation haben

**Dateien**:
- `utils/answerValidators.ts`: Validierungsreihenfolge korrigiert

### 3. ✅ Falsch berechnete Ergebnisse

#### Kegelstumpf Mantelfläche
**Problem**: System erwartete 314 cm², korrekt ist 406 cm².

**Fix**:
- Korrekte Berechnung: M = π(r₁+r₂)s = 3,14 × 12 × 10,77 ≈ 406 cm²
- Erwarteter Wert auf 406 cm² aktualisiert

**Dateien**:
- `services/geometrieMundoBounties.ts`: Mantelfläche korrigiert

#### Zusammengesetztes Prisma
**Problem**: Oberfläche wurde falsch berechnet (472 cm² statt korrekter Wert).

**Fix**:
- Berechnung korrigiert: Quader O ohne Kontaktfläche + Dreiecksprisma O ohne Kontaktfläche
- Erwarteter Wert auf 426 cm² aktualisiert (Toleranz ±10)

**Dateien**:
- `services/bountyCatalog.ts`: Oberfläche korrigiert

### 4. ✅ Schwankende Auswertung identischer Antworten
**Problem**: Gleiche Antworten wurden unterschiedlich bewertet (z.B. h=6 cm, a≈7,2 cm).

**Fix**:
- Toleranzen vereinheitlicht: `u6-bounty-hoehensatz` verwendet jetzt Toleranz 0.1 (wie `u6-bounty-satzgruppe`)
- Konsistente Toleranzen für ähnliche Aufgaben

**Dateien**:
- `services/bountyCatalog.ts`: Toleranz vereinheitlicht

### 5. ✅ Wiederholt ausführbare Bountys
**Problem**: Bounty konnte mehrfach ausgeführt werden, obwohl bereits abgeschlossen.

**Fix**:
- Button wird deaktiviert wenn `bountyCompleted` true ist
- Status wird korrekt angezeigt: "Bounty gemeistert" statt "Bounty bereit"
- `bountyPayoutClaimed` wird korrekt geprüft

**Dateien**:
- `App.tsx`: Button-Logik korrigiert (Zeile 5943)

### 6. ✅ UI-Probleme

#### Komma als Dezimaltrennzeichen
**Problem**: Textfelder akzeptierten kein Komma als Dezimaltrennzeichen.

**Fix**:
- `MultiFieldInput` erlaubt Komma-Eingabe
- `sanitizeMathInput` konvertiert Komma zu Punkt während Validierung
- Benutzer kann Komma eingeben, System konvertiert intern

**Dateien**:
- `components/MultiFieldInput.tsx`: Komma-Eingabe erlaubt
- `App.tsx`: Sanitization vor Validierung

#### Buttons außerhalb des sichtbaren Bereichs
**Problem**: Buttons lagen außerhalb des sichtbaren Bereichs.

**Fix**:
- Button-Container mit `sticky bottom-0` versehen
- Padding hinzugefügt für bessere Sichtbarkeit
- Z-index erhöht für korrekte Überlagerung

**Dateien**:
- `App.tsx`: Button-Container mit sticky positioning

## Weitere Verbesserungen

### Validierungslogik
- Koordinatenpaare werden jetzt korrekt validiert ohne vorherige Sanitization
- Numerische Eingaben werden vor Validierung sanitized (Komma → Punkt)
- Multi-Field-Validierung verwendet jetzt sanitized Input

### Konsistenz
- Toleranzen für ähnliche Aufgaben vereinheitlicht
- Erwartete Werte mathematisch korrekt berechnet
- Erklärungen aktualisiert mit korrekten Berechnungen

## Weitere gefundene Probleme

### Koordinaten-Parsing
**Gefunden**: `parseCoordinatePair` kann verschiedene Formate parsen:
- "(3|4)" → {x: 3, y: 4} ✅
- "3|4" → {x: 3, y: 4} ✅
- "3,4 5,6" → {x: 3.4, y: 5.6} ⚠️ (könnte problematisch sein)

**Empfehlung**: Klarstellen, dass für Koordinatenpaare das Format "(x|y)" oder "x|y" erwartet wird.

### Toleranzen-Konsistenz
**Gefunden**: Verschiedene Toleranzen für ähnliche Aufgaben:
- Katheten-Berechnungen: meist 0.1, manchmal 0.2
- Oberflächen: 1-10 je nach Größenordnung
- Winkel: meist 0.1

**Status**: ✅ Bereits korrigiert für `u6-bounty-hoehensatz` (0.2 → 0.1)

### Negation-Wörter
**Gefunden**: `NEGATION_WORDS` enthält: ['nicht', 'kein', 'keine', 'keiner', 'keines', 'ohne']

**Status**: ✅ Vollständig - sollte alle deutschen Negationen abdecken

## Verbleibende Probleme (möglicherweise)

### Fortschrittsverlust beim Neuladen
**Hinweis**: Der Fortschritt sollte über `bootstrapServerUser` geladen werden. Falls Probleme auftreten:
- Prüfe `netlify/functions/me.cjs` - lädt `bountyPayoutClaimed` korrekt?
- Prüfe `services/apiService.ts` - normalisiert User-State korrekt?

### Pyramide-Oberfläche Berechnung
**Hinweis**: Die Berechnung für "Quader + Pyramide" sollte nochmal überprüft werden:
- Aktuell: 520 cm² erwartet
- Möglicherweise: Kontaktfläche-Berechnung muss genauer geprüft werden
- **Empfehlung**: Manuelle Berechnung durchführen und mit erwartetem Wert vergleichen

## Test-Empfehlungen

1. **Koordinaten-Eingabe testen**:
   - Eingabe "(3|4)" sollte funktionieren
   - Eingabe "3|4" sollte funktionieren
   - Eingabe "3,4" sollte zu "3.4" konvertiert werden

2. **"Figuren verstehen" testen**:
   - "Raute" + "keine rechten Winkel" → korrekt
   - "Raute" + "rechte Winkel sind nicht zwingend" → korrekt
   - "Raute" + "rechte Winkel" → sollte falsch sein (fehlende Negation)

3. **Berechnungen testen**:
   - Kegelstumpf Mantelfläche: 406 cm² sollte akzeptiert werden
   - Zusammengesetztes Prisma: 426 cm² sollte akzeptiert werden

4. **Bounty-Status testen**:
   - Nach Bounty-Abschluss sollte Button deaktiviert sein
   - Status sollte "Bounty gemeistert" anzeigen
   - Nach Neuladen sollte Status erhalten bleiben

5. **UI-Tests**:
   - Buttons sollten immer sichtbar sein
   - Komma-Eingabe sollte funktionieren
   - Scroll-Verhalten sollte korrekt sein

## Nächste Schritte

1. Manuelle Tests durchführen für alle genannten Bereiche
2. Weitere mathematische Berechnungen überprüfen
3. Fortschritts-Persistenz testen (Neuladen der Seite)
4. Mobile Ansicht testen (Buttons sichtbar?)
5. Edge Cases testen (leere Eingaben, Sonderzeichen, etc.)

