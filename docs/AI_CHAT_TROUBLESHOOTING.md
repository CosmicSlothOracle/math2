# AI-Chat Fehlerdiagnose

## Übersicht der Fehler

Basierend auf dem Screenshot und Code-Analyse gibt es zwei Hauptfehler:

1. **500-Fehler** vom Netlify-Function-Endpoint `/.netlify/functions/aiAssistant`
2. **"Fehler beim Aktualisieren der Coins"** - Coin-Update schlägt fehl

## ⚠️ BEHOBENER BUG (2025-12-29)

**Problem:** Die `applyCoinDelta` Funktion in `_coins.cjs` hat einen kritischen Bug:

- `.update()` wurde ohne `.select()` aufgerufen
- Supabase gibt ohne `.select()` immer `data: null` zurück, auch bei erfolgreichem Update
- Die Prüfung auf leeres `updateData` war daher immer wahr → fälschlicherweise `COIN_UPDATE_CONFLICT` Fehler

**Fix:** `.select().limit(1)` wurde hinzugefügt (Zeile 49-50 in `_coins.cjs`)

**Status:** ✅ Behoben in Commit vom 2025-12-29

---

## Mögliche Fehlerursachen

### 1. Supabase-Client nicht initialisiert

**Symptom:** Function gibt 500-Fehler zurück, Coin-Update schlägt fehl

**Ursachen:**

- Fehlende Environment-Variablen in Netlify:
  - `SUPABASE_URL` nicht gesetzt
  - `SUPABASE_SERVICE_ROLE_KEY` nicht gesetzt (oder `SUPABASE_KEY` / `SUPABASE_ANON_KEY`)
- Supabase-Package nicht installiert: `@supabase/supabase-js` fehlt

**Prüfung:**

```bash
# In Netlify Dashboard: Site settings > Environment variables
# Prüfe ob folgende Variablen existieren:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (oder SUPABASE_KEY)
```

**Code-Stelle:** `netlify/functions/_supabase.cjs` Zeile 4-30

---

### 2. Datenbank-Schema-Probleme

**Symptom:** Coin-Update schlägt fehl mit Datenbankfehler

**Ursachen:**

- `users`-Tabelle fehlt oder hat falsche Struktur
- `coin_ledger`-Tabelle fehlt
- Spalte `coins` in `users`-Tabelle fehlt oder hat falschen Typ
- RLS (Row Level Security) blockiert Updates

**Prüfung:**

```sql
-- In Supabase SQL Editor ausführen:
-- 1. Prüfe ob Tabellen existieren
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'coin_ledger');

-- 2. Prüfe users-Tabelle Struktur
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('id', 'coins', 'display_name');

-- 3. Prüfe coin_ledger Struktur
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'coin_ledger';

-- 4. Prüfe RLS Policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'coin_ledger');
```

**Lösung:**

- Führe `docs/supabase_schema.sql` aus, falls Tabellen fehlen
- Deaktiviere RLS für `users` und `coin_ledger` (oder erstelle passende Policies)

---

### 3. Gemini API Key fehlt

**Symptom:** 500-Fehler mit "API_KEY_MISSING" oder "Der KI-Service ist momentan nicht verfügbar"

**Ursachen:**

- `GEMINI_API_KEY` oder `API_KEY` Environment-Variable nicht gesetzt
- API Key ist ungültig oder abgelaufen

**Prüfung:**

```bash
# In Netlify Dashboard prüfen:
- GEMINI_API_KEY (oder API_KEY) ist gesetzt
- API Key ist gültig (in Google AI Studio testen)
```

**Code-Stelle:** `netlify/functions/aiAssistant.cjs` Zeile 252-263

---

### 4. Gemini API Fehler

**Symptom:** 500-Fehler mit "GEMINI_REQUEST_FAILED"

**Ursachen:**

- API Rate Limit erreicht
- Ungültiges Modell-Name in `GEMINI_MODELS`
- Netzwerk-Timeout
- API-Response-Format hat sich geändert

**Prüfung:**

- Netlify Function Logs prüfen (in Netlify Dashboard)
- Google AI Studio API Status prüfen
- `GEMINI_MODELS` Environment-Variable prüfen (Standard: `gemini-1.5-flash,gemini-1.5-pro,gemini-pro`)

**Code-Stelle:** `netlify/functions/aiAssistant.cjs` Zeile 265-348

---

### 5. Coin-Update Race Condition

**Symptom:** "Fehler beim Aktualisieren der Coins" trotz ausreichender Coins

**Ursachen:**

- Optimistic Locking schlägt fehl (Coins wurden zwischen Read und Update geändert)
- Retry-Logik erschöpft (3 Versuche fehlgeschlagen)
- Datenbank-Timeout

**Prüfung:**

- Netlify Function Logs prüfen für `COIN_UPDATE_CONFLICT` Fehler
- Prüfe ob mehrere Requests gleichzeitig laufen

**Code-Stelle:** `netlify/functions/aiAssistant.cjs` Zeile 170-248, `netlify/functions/_coins.cjs` Zeile 44-59

---

### 6. User nicht registriert

**Symptom:** 401-Fehler "USER_NOT_REGISTERED"

**Ursachen:**

- User hat kein `display_name` in der `users`-Tabelle
- `display_name` ist zu kurz (< 2 Zeichen) oder ist "User"

**Prüfung:**

```sql
-- Prüfe User-Registrierung
SELECT id, display_name, coins
FROM users
WHERE id = '<userId>';
```

**Code-Stelle:** `netlify/functions/_utils.cjs` Zeile 97-117

---

### 7. Unzureichende Coins

**Symptom:** 400-Fehler "INSUFFICIENT_COINS"

**Ursachen:**

- User hat weniger als 5 Coins
- Coin-Balance ist nicht synchronisiert

**Prüfung:**

- Frontend zeigt 250 Coins, aber Datenbank hat weniger
- `bootstrapServerUser()` wurde nicht nach Coin-Update aufgerufen

---

## Diagnose-Checkliste

### Schritt 1: Netlify Environment Variables prüfen

- [ ] `SUPABASE_URL` ist gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (oder `SUPABASE_KEY`) ist gesetzt
- [ ] `GEMINI_API_KEY` (oder `API_KEY`) ist gesetzt
- [ ] `GEMINI_MODELS` ist optional gesetzt (Standard verwendet Fallback)

### Schritt 2: Supabase-Datenbank prüfen

- [ ] `users`-Tabelle existiert mit Spalten: `id`, `coins`, `display_name`
- [ ] `coin_ledger`-Tabelle existiert
- [ ] RLS ist deaktiviert oder passende Policies existieren
- [ ] Test-User existiert in `users`-Tabelle

### Schritt 3: Netlify Function Logs prüfen

1. Gehe zu Netlify Dashboard > Functions > `aiAssistant`
2. Prüfe Logs für:
   - `[Supabase] Client initialized successfully` oder Fehler
   - `[aiAssistant] Coin update failed` oder Erfolg
   - `[aiAssistant] Gemini Error` oder Erfolg
   - Spezifische Fehlermeldungen

### Schritt 4: Browser Console prüfen

- [ ] Network-Tab: Prüfe Request zu `/.netlify/functions/aiAssistant`
  - Status Code: 500, 400, 401, etc.?
  - Response Body: Welche Fehlermeldung?
- [ ] Console: Prüfe JavaScript-Fehler

### Schritt 5: Code-Validierung

- [ ] `netlify/functions/aiAssistant.cjs` hat keine Syntax-Fehler
- [ ] `netlify/functions/_coins.cjs` hat keine Syntax-Fehler
- [ ] `netlify/functions/_supabase.cjs` hat keine Syntax-Fehler
- [ ] Alle Dependencies sind installiert (`@supabase/supabase-js`, `@google/genai`)

---

## Schnelle Tests

### Test 1: Supabase-Client initialisiert?

```javascript
// In Netlify Function Logs sollte erscheinen:
[Supabase] Client initialized successfully with key type: SERVICE_ROLE
```

### Test 2: Coin-Update funktioniert?

```sql
-- In Supabase SQL Editor:
-- 1. Prüfe aktuellen Coin-Stand
SELECT id, display_name, coins FROM users WHERE id = '<userId>';

-- 2. Manuelles Update testen
UPDATE users SET coins = coins - 5 WHERE id = '<userId>';

-- 3. Prüfe ob coin_ledger Eintrag erstellt wurde
SELECT * FROM coin_ledger WHERE user_id = '<userId>' ORDER BY created_at DESC LIMIT 1;
```

### Test 3: Gemini API funktioniert?

```bash
# In Netlify Function Logs sollte erscheinen:
[aiAssistant] Gemini response received
```

---

## Häufigste Lösungen

### Lösung 1: Environment Variables setzen

1. Netlify Dashboard > Site settings > Environment variables
2. Füge hinzu:
   - `SUPABASE_URL`: Deine Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Dein Supabase Service Role Key
   - `GEMINI_API_KEY`: Dein Google Gemini API Key
3. **Wichtig:** Nach Änderungen Function neu deployen!

### Lösung 2: Datenbank-Schema erstellen

1. Öffne Supabase SQL Editor
2. Führe `docs/supabase_schema.sql` aus
3. Prüfe ob Tabellen erstellt wurden

### Lösung 3: RLS deaktivieren (für Testing)

```sql
-- In Supabase SQL Editor:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE coin_ledger DISABLE ROW LEVEL SECURITY;
```

**⚠️ WICHTIG:** RLS sollte in Production aktiviert sein mit passenden Policies!

### Lösung 4: Function neu deployen

Nach Environment-Variable-Änderungen:

```bash
# Lokal testen:
netlify dev

# Oder neu deployen:
netlify deploy --prod
```

---

## Debugging-Tipps

1. **Aktiviere detailliertes Logging:**

   - In `aiAssistant.cjs` mehr `console.log()` Statements hinzufügen
   - Netlify Function Logs in Echtzeit beobachten

2. **Teste Function lokal:**

   ```bash
   netlify dev
   # Dann Function direkt testen
   ```

3. **Prüfe Network-Requests:**

   - Browser DevTools > Network Tab
   - Prüfe Request/Response zu `/.netlify/functions/aiAssistant`
   - Prüfe Headers (Authorization, x-anon-id, etc.)

4. **Isoliere das Problem:**
   - Teste Coin-Update ohne Gemini-API-Call
   - Teste Gemini-API-Call ohne Coin-Update
   - Identifiziere welcher Teil fehlschlägt

---

## Nächste Schritte

1. **Sammle diese Informationen:**

   - Netlify Function Logs (vollständig)
   - Browser Console Fehler (vollständig)
   - Network Tab Request/Response zu `aiAssistant`
   - Supabase SQL Query Ergebnisse (Tabellen-Struktur)
   - Environment Variables Status (ohne Werte zu zeigen!)

2. **Führe Diagnose-Checkliste durch** (siehe oben)

3. **Teste mit minimalem Setup:**
   - Erstelle Test-User in Supabase
   - Teste Function direkt mit `curl` oder Postman
   - Isoliere das Problem Schritt für Schritt

---

## Code-Referenzen

- **Main Function:** `netlify/functions/aiAssistant.cjs`
- **Coin Logic:** `netlify/functions/_coins.cjs`
- **Supabase Client:** `netlify/functions/_supabase.cjs`
- **User Utils:** `netlify/functions/_utils.cjs`
- **Frontend Service:** `services/geminiService.ts`
- **Frontend Component:** `components/AIHelperChat.tsx`
