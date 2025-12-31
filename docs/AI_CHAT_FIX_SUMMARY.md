# AI-Chat Fix Summary

## Behobene Bugs (2025-12-29)

### 1. ✅ Coin-Update Bug behoben

**Problem:** `applyCoinDelta` in `_coins.cjs` hat `.update()` ohne `.select()` aufgerufen

- Supabase gibt ohne `.select()` immer `data: null` zurück, auch bei erfolgreichem Update
- Die Prüfung auf leeres `updateData` war daher immer wahr → fälschlicherweise `COIN_UPDATE_CONFLICT` Fehler

**Fix:** `.select().limit(1)` wurde nach `.update()` hinzugefügt (Zeile 49-50 in `_coins.cjs`)

**Datei:** `netlify/functions/_coins.cjs`

---

### 2. ✅ Verbessertes Logging für Gemini API

**Problem:** Fehlende Details bei Gemini API Fehlern

**Fixes:**

- Detailliertes Logging für jeden Model-Versuch
- Response-Struktur-Logging für Debugging
- Verbesserte Fehlerbehandlung mit mehr Details
- Response-Extraktion angepasst an funktionierende `hint.cjs` Pattern

**Datei:** `netlify/functions/aiAssistant.cjs`

---

## Aktueller Status

### ✅ Behoben

- Coin-Update sollte jetzt funktionieren (`.select()` hinzugefügt)
- Besseres Logging für Debugging
- **Gemini Model Problem:** `gemini-pro` aus Standard-Liste entfernt (ist deprecated/nicht verfügbar)
- **404-Fehler-Behandlung:** Verbesserte Erkennung von 404-Fehlern (auch verschachtelte Strukturen)

### ⚠️ Bekannte Probleme

- **Coin-Update-Konflikte:** Können bei gleichzeitigen Requests auftreten (Optimistic Locking). Retry-Logik sollte das abfangen.
- **Gemini API Key:** Muss in Netlify Environment Variables gesetzt sein

---

## Nächste Schritte

### 1. Function neu deployen

```bash
netlify deploy --prod
```

### 2. Netlify Function Logs prüfen

1. Gehe zu Netlify Dashboard → Functions → `aiAssistant` → Logs
2. Suche nach:
   - `[aiAssistant] Trying Gemini model` - zeigt welche Models versucht werden
   - `[aiAssistant] Model ... failed` - zeigt spezifische Fehler
   - `[aiAssistant] Gemini Error` - zeigt vollständigen Fehler
   - `[Supabase] Client initialized` - bestätigt Supabase-Verbindung

### 3. Environment Variables prüfen

In Netlify Dashboard → Site settings → Environment variables:

- [ ] `SUPABASE_URL` ist gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ist gesetzt
- [ ] `GEMINI_API_KEY` oder `API_KEY` ist gesetzt
- [ ] `GEMINI_MODELS` ist optional gesetzt (Standard: `gemini-1.5-flash,gemini-1.5-pro,gemini-pro`)

### 4. Testen

1. Sende eine AI-Chat-Nachricht
2. Prüfe Browser Console für Fehler
3. Prüfe Netlify Function Logs für Details
4. Prüfe `coin_ledger` Tabelle in Supabase für neuen Eintrag

---

## Mögliche weitere Probleme

### Problem: Gemini API Key fehlt oder ungültig

**Symptom:** `[aiAssistant] Missing Gemini API key` in Logs

**Lösung:**

1. Prüfe Environment Variables in Netlify
2. Stelle sicher, dass der API Key gültig ist (in Google AI Studio testen)
3. Prüfe ob der API Key nicht abgelaufen ist

### Problem: Gemini API Response-Struktur geändert

**Symptom:** `Could not extract text from Gemini API response` in Logs

**Lösung:**

1. Prüfe Netlify Function Logs für Response-Struktur
2. Vergleiche mit `hint.cjs` Function (die funktioniert)
3. Passe Response-Extraktion an, falls nötig

### Problem: Supabase RLS blockiert Updates

**Symptom:** Coin-Update schlägt fehl mit Datenbankfehler

**Lösung:**

1. Prüfe RLS Policies in Supabase
2. Stelle sicher, dass Service Role Key verwendet wird (umgeht RLS)
3. Prüfe ob `SUPABASE_SERVICE_ROLE_KEY` gesetzt ist (nicht nur `SUPABASE_KEY`)

---

## Debugging-Tipps

### 1. Lokal testen

```bash
netlify dev
# Dann Function direkt testen
```

### 2. Response-Struktur loggen

Die Function loggt jetzt:

- Response type
- Response keys
- Vollständige Response bei Fehlern

### 3. Coin-Update testen

```sql
-- In Supabase SQL Editor:
-- Prüfe ob coin_ledger Eintrag erstellt wurde
SELECT * FROM coin_ledger
WHERE reason = 'ai_assistant_message'
ORDER BY created_at DESC
LIMIT 1;
```

---

## Code-Änderungen

### `netlify/functions/_coins.cjs`

```javascript
// VORHER:
const { data: updateData, error: updateError } = await supabase
  .from("users")
  .update({ coins: safeNext })
  .eq("id", userId)
  .eq("coins", prev);

// NACHHER:
const { data: updateData, error: updateError } = await supabase
  .from("users")
  .update({ coins: safeNext })
  .eq("id", userId)
  .eq("coins", prev)
  .select() // ← HINZUGEFÜGT
  .limit(1); // ← HINZUGEFÜGT
```

### `netlify/functions/aiAssistant.cjs`

- Verbessertes Logging für Model-Versuche
- Detaillierte Fehlerbehandlung
- Response-Struktur-Logging
- Response-Extraktion angepasst an `hint.cjs` Pattern
- **`gemini-pro` aus Standard-Model-Liste entfernt** (deprecated/nicht verfügbar)
- **Verbesserte 404-Fehler-Erkennung** (prüft auch verschachtelte Fehlerstrukturen)

### `netlify/functions/hint.cjs`

- **`gemini-pro` aus Standard-Model-Liste entfernt** (konsistent mit aiAssistant.cjs)

---

## Erfolgs-Indikatoren

✅ **Coin-Update funktioniert:**

- Neuer Eintrag in `coin_ledger` mit `reason: 'ai_assistant_message'`
- User Coins werden korrekt abgezogen
- Keine `COIN_UPDATE_FAILED` Fehler mehr

✅ **Gemini API funktioniert:**

- Response wird erfolgreich extrahiert
- AI-Antwort wird angezeigt
- Keine `GEMINI_REQUEST_FAILED` Fehler mehr

✅ **Alles funktioniert:**

- AI-Chat-Nachricht wird gesendet
- Coins werden abgezogen
- AI-Antwort wird angezeigt
- User Coins werden aktualisiert

---

## Bei weiteren Problemen

1. **Sammle diese Informationen:**

   - Netlify Function Logs (vollständig)
   - Browser Console Fehler
   - Network Tab Request/Response zu `aiAssistant`
   - Environment Variables Status (ohne Werte!)

2. **Prüfe diese Dateien:**

   - `netlify/functions/aiAssistant.cjs`
   - `netlify/functions/_coins.cjs`
   - `netlify/functions/_supabase.cjs`
   - `docs/AI_CHAT_TROUBLESHOOTING.md`

3. **Vergleiche mit funktionierender Function:**
   - `netlify/functions/hint.cjs` (funktioniert ähnlich)
