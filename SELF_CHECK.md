# Self-Check Anleitung für Math2 Functions

Diese Anleitung beschreibt, wie man die Netlify Functions lokal und deployed testet.

## Voraussetzungen

- Node.js 18+ installiert
- Zugriff auf Netlify Dashboard (für deployed Tests)
- Optional: Supabase Account für DB-Verifikation

---

## Lokale Tests (netlify dev)

### 1. Setup

```bash
# Dependencies installieren
npm install

# Netlify CLI installieren (falls nicht vorhanden)
npm install -g netlify-cli

# Lokale .env Datei erstellen (optional, für Supabase Tests)
# Erstelle .env.local mit:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Functions lokal starten

```bash
netlify dev
```

Die App läuft dann auf `http://localhost:8888` und Functions sind unter `/.netlify/functions/` verfügbar.

### 3. Manuelle Tests

#### Test coinsAdjust
```bash
curl -X POST http://localhost:8888/.netlify/functions/coinsAdjust \
  -H "Content-Type: application/json" \
  -H "x-dev-user: test-user-123" \
  -d '{"delta": 50, "reason": "test", "refType": "unit", "refId": "u1"}'
```

**Erwartete Response:**
```json
{
  "ok": true,
  "coins": 2050,
  "applied": 50,
  "userId": "test-user-123"
}
```

**Wenn dev-fallback:**
```json
{
  "ok": true,
  "coins": 2050,
  "applied": 50,
  "userId": "test-user-123",
  "note": "dev-fallback",
  "warning": "Data not persisted - Supabase not configured"
}
```

#### Test progressSave
```bash
curl -X POST http://localhost:8888/.netlify/functions/progressSave \
  -H "Content-Type: application/json" \
  -H "x-dev-user: test-user-123" \
  -d '{
    "unitId": "u1",
    "questCoinsEarned": 10,
    "questCompletedCount": 1,
    "bountyCompleted": false,
    "perfectStandardQuiz": true,
    "perfectBounty": false
  }'
```

**Erwartete Response:**
```json
{
  "ok": true,
  "saved": {
    "user_id": "test-user-123",
    "unit_id": "u1",
    "quest_coins_earned": 10,
    "quest_completed_count": 1,
    "bounty_completed": false,
    "perfect_standard_quiz": true,
    "perfect_bounty": false
  },
  "userId": "test-user-123"
}
```

#### Test chatSend
```bash
curl -X POST http://localhost:8888/.netlify/functions/chatSend \
  -H "Content-Type: application/json" \
  -H "x-dev-user: test-user-123" \
  -d '{
    "text": "Test message",
    "channelId": "class:global",
    "username": "TestUser"
  }'
```

#### Test chatPoll
```bash
curl "http://localhost:8888/.netlify/functions/chatPoll?channelId=class:global" \
  -H "x-dev-user: test-user-123"
```

#### Test me
```bash
curl "http://localhost:8888/.netlify/functions/me" \
  -H "x-dev-user: test-user-123"
```

### 4. Logs prüfen

Im Terminal, wo `netlify dev` läuft, sollten Logs erscheinen:
```
[coinsAdjust] { userId: 'test-user-123', delta: 50, ... }
[progressSave] { userId: 'test-user-123', unitId: 'u1', ... }
```

---

## Deployed Tests (Production)

### 1. Automatischer Test mit Self-Check Script

```bash
# Test gegen deployed App
node scripts/selfcheck.mjs

# Oder mit custom URL
node scripts/selfcheck.mjs https://realer-math.netlify.app
```

**Erwartete Ausgabe:**
```
=== Math2 Functions Self-Check ===

Base URL: https://realer-math.netlify.app

ℹ Testing progressGet...
✓ progressGet: OK (200)
ℹ Testing progressSave...
✓ progressSave: OK (200)
...
=== Summary ===

Total tests: 7
✓ Passed: 7
✅ All tests passed!
```

**Wenn dev-fallback:**
```
⚠ progressGet: Dev fallback detected - Supabase not configured
...
=== Summary ===

Total tests: 7
✓ Passed: 0
⚠ Warnings (dev-fallback): 7
⚠️  Tests passed but dev-fallback detected. Supabase may not be configured.
```

### 2. Manuelle Tests mit curl

```bash
# coinsAdjust
curl -X POST https://realer-math.netlify.app/.netlify/functions/coinsAdjust \
  -H "Content-Type: application/json" \
  -H "x-dev-user: test-user-123" \
  -d '{"delta": 50, "reason": "test", "refType": "unit", "refId": "u1"}'

# progressSave
curl -X POST https://realer-math.netlify.app/.netlify/functions/progressSave \
  -H "Content-Type: application/json" \
  -H "x-dev-user: test-user-123" \
  -d '{"unitId": "u1", "questCoinsEarned": 10, "questCompletedCount": 1, "bountyCompleted": false, "perfectStandardQuiz": true, "perfectBounty": false}'

# chatSend
curl -X POST https://realer-math.netlify.app/.netlify/functions/chatSend \
  -H "Content-Type: application/json" \
  -H "x-dev-user: test-user-123" \
  -d '{"text": "Test", "channelId": "class:global", "username": "Test"}'

# chatPoll
curl "https://realer-math.netlify.app/.netlify/functions/chatPoll?channelId=class:global" \
  -H "x-dev-user: test-user-123"

# me
curl "https://realer-math.netlify.app/.netlify/functions/me" \
  -H "x-dev-user: test-user-123"
```

### 3. Netlify Function Logs prüfen

1. Gehe zu Netlify Dashboard → Deploys → Latest Deploy
2. Klicke auf "Functions" Tab
3. Wähle eine Function aus (z.B. `coinsAdjust`)
4. Prüfe Logs für:
   - `[coinsAdjust]` Log-Einträge
   - Errors oder Warnings
   - Dev-fallback Meldungen

---

## Supabase Verifikation

### 1. Prüfe Tabellen

Gehe zu Supabase Dashboard → Table Editor:

#### users Tabelle
- Prüfe ob `users` Tabelle Einträge hat
- Prüfe `coins` Werte nach `coinsAdjust` Calls
- Prüfe ob `id` mit `userId` aus Functions übereinstimmt

#### progress Tabelle
- Prüfe ob `progress` Tabelle Einträge hat
- Prüfe `perfect_standard_quiz` und `perfect_bounty` Flags
- Prüfe `quest_completed_count` und `quest_coins_earned`

#### messages Tabelle
- Prüfe ob `messages` Tabelle Einträge hat nach `chatSend`
- Prüfe `channel_id`, `sender_id`, `text` Felder

#### coin_ledger Tabelle
- Prüfe ob `coin_ledger` Einträge hat nach `coinsAdjust`
- Prüfe `delta`, `reason`, `ref_type`, `ref_id` Felder

### 2. SQL Queries für Verifikation

```sql
-- Prüfe User Coins
SELECT id, coins, display_name FROM users WHERE id = 'test-user-123';

-- Prüfe Progress
SELECT * FROM progress WHERE user_id = 'test-user-123';

-- Prüfe Perfect Quiz Flags
SELECT user_id, unit_id, perfect_standard_quiz, perfect_bounty
FROM progress
WHERE user_id = 'test-user-123'
  AND (perfect_standard_quiz = true OR perfect_bounty = true);

-- Prüfe Chat Messages
SELECT * FROM messages
WHERE channel_id = 'class:global'
ORDER BY created_at DESC
LIMIT 10;

-- Prüfe Coin Ledger
SELECT * FROM coin_ledger
WHERE user_id = 'test-user-123'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Troubleshooting

### Problem: Alle Tests zeigen "dev-fallback"

**Ursache:** Supabase ist nicht konfiguriert oder Env Vars fehlen.

**Lösung:**
1. Prüfe Netlify Dashboard → Site settings → Environment variables
2. Stelle sicher, dass folgende Vars gesetzt sind:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (oder `SUPABASE_ANON_KEY`)
3. Redeploy nach Änderung der Env Vars

### Problem: Functions geben 500 Errors

**Ursache:** Supabase Client kann nicht erstellt werden oder DB-Fehler.

**Lösung:**
1. Prüfe Function Logs in Netlify Dashboard
2. Prüfe ob `@supabase/supabase-js` in `package.json` dependencies ist
3. Prüfe ob Supabase URL und Key korrekt sind

### Problem: Response-Shape ist falsch

**Ursache:** Alte Function-Version deployed oder Code nicht aktualisiert.

**Lösung:**
1. Stelle sicher, dass alle Functions `ok: boolean` in Response haben
2. Redeploy Functions
3. Prüfe ob `netlify.toml` korrekt konfiguriert ist

### Problem: NaN Coins im UI

**Ursache:** Client berechnet Coins falsch oder Response-Werte sind undefined.

**Lösung:**
1. Prüfe Browser Console für Errors
2. Prüfe ob `Number.isFinite()` Guards vorhanden sind
3. Prüfe ob Function Response `coins` und `applied` als Zahlen zurückgibt

---

## Checkliste für Deployment

- [ ] `package.json` enthält `@supabase/supabase-js` in dependencies
- [ ] Netlify Env Vars sind gesetzt (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Supabase Schema ist aktuell (inkl. `perfect_standard_quiz`, `perfect_bounty` Spalten)
- [ ] Alle Functions geben `ok: boolean` zurück
- [ ] Self-Check Script läuft ohne Errors
- [ ] Supabase Tabellen enthalten Test-Daten nach Tests
- [ ] UI zeigt keine NaN Werte
- [ ] Chat Messages erscheinen nach Send
- [ ] Bounty Lock funktioniert nach Perfect Quiz

---

## Nächste Schritte

Nach erfolgreichen Tests:
1. Dokumentiere alle Fixes in `PROBLEMS.md`
2. Update `RELEASE_CHECKLIST.md` mit Deployment-Schritten
3. Teste End-to-End Flow: Quest → Coins → Progress → Bounty Unlock
4. Prüfe Cross-Browser Kompatibilität

