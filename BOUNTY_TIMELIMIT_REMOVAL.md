# Bounty-Modus: Zeitlimit und Tipps-Sperre entfernt

## Durchgeführte Änderungen

### ✅ UI-Elemente entfernt
- **Zeitlimit-Dropdown** entfernt aus Bounty-Ansicht
- **"Tipps sperren" Checkbox** entfernt
- **State-Variablen** `bountyTimeLimit` und `lockCheatSheet` entfernt

### ✅ Beschreibung angepasst
- **Alt**: "Zeitlimit & Extra-Schwer."
- **Neu**: "Extra-Schwer."

### ✅ Timer-Logik angepasst
- Timer läuft nur noch wenn explizit `timeLimit > 0` gesetzt ist
- Bounty-Modus startet ohne Zeitlimit (zeigt "∞")
- Initialer State: `Infinity` statt `60`

### ✅ Bounty-Start angepasst
- `handleBountyStart` übergibt keine `timeLimit` oder `noCheatSheet` Optionen mehr
- Bounty startet immer ohne Zeitlimit und mit Tipps verfügbar

## Geänderte Dateien

- `App.tsx`:
  - Zeilen 5768-5771: State-Variablen entfernt
  - Zeilen 5781-5794: `handleBountyStart` angepasst
  - Zeilen 5901-5920: UI-Elemente entfernt, Beschreibung angepasst
  - Zeilen 4044, 4062-4077, 4223: Timer-Logik angepasst
  - Zeile 4420: Timer-Anzeige angepasst

## Ergebnis

✅ **Bounty-Modus hat jetzt:**
- ❌ Kein Zeitlimit mehr
- ❌ Keine Tipps-Sperre mehr
- ✅ Tipps sind immer verfügbar
- ✅ Unbegrenzte Zeit zum Lösen

Die Bountys sind jetzt schwieriger (Extra-Schwer), aber ohne Zeitdruck und mit Hilfe verfügbar.

