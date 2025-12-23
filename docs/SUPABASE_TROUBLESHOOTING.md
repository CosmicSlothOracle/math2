# Supabase Troubleshooting Guide

Dieses Dokument hilft bei der Diagnose und Behebung von Supabase-Konfigurationsproblemen.

---

## 🔍 Schnelldiagnose

### 1. Debug-Function aufrufen

```bash
# Lokal
curl http://localhost:8888/.netlify/functions/debugSupabase

# Production
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase
```

**Oder im Browser:**
```
https://realer-math.netlify.app/.netlify/functions/debugSupabase
```

Die Function gibt zurück:
- Welche Environment Variables gesetzt sind
- Ob `@supabase/supabase-js` installiert ist
- Ob der Supabase Client erstellt werden kann
- Ob eine Test-Query funktioniert
- Empfehlungen zur Behebung

---

## 🐛 Häufige Probleme

### Problem 1: Alle Functions geben `dev-fallback` zurück

**Symptome:**
- Coins bleiben bei 0
- Progress wird nicht gespeichert
- Chat-Nachrichten verschwinden
- Gelber Banner oben: "⚠️ Backend offline / Dev Fallback"

**Ursachen:**

#### A) Environment Variables fehlen in Netlify

**Lösung:**
1. Gehe zu Netlify Dashboard → Site Settings → Environment Variables
2. Prüfe, ob folgende Variablen gesetzt sind:
   - `SUPABASE_URL` (z.B. `https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (empfohlen) ODER `SUPABASE_ANON_KEY`
3. **Wichtig:** Nach Änderung der Env Vars → **Redeploy** erforderlich!

**Prüfen:**
```bash
# Mit debugSupabase Function
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase | jq '.debug.env'
```

#### B) `@supabase/supabase-js` nicht installiert

**Lösung:**
1. Prüfe `package.json`:
   ```json
   {
     "dependencies": {
       "@supabase/supabase-js": "^2.x.x"
     }
   }
   ```
2. Installiere lokal:
   ```bash
   npm install @supabase/supabase-js
   ```
3. Commit und Push:
   ```bash
   git add package.json package-lock.json
   git commit -m "fix: Add @supabase/supabase-js dependency"
   git push origin main
   ```

**Prüfen:**
```bash
# Mit debugSupabase Function
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase | jq '.debug.package'
```

#### C) Falsche Supabase Keys

**Lösung:**
1. Gehe zu Supabase Dashboard → Project Settings → API
2. Kopiere:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`
   - ODER **anon public key** → `SUPABASE_ANON_KEY`
3. **Wichtig:** Service Role Key umgeht RLS, Anon Key benötigt RLS Policies!

**Prüfen:**
```bash
# Mit debugSupabase Function - Test Query sollte funktionieren
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase | jq '.debug.client.testQuery'
```

---

### Problem 2: Functions geben 500 Errors

**Symptome:**
- Browser Console zeigt: `500 Internal Server Error`
- Terminal Logs zeigen Stack Traces

**Ursachen:**

#### A) Supabase Schema fehlt

**Lösung:**
1. Gehe zu Supabase Dashboard → SQL Editor
2. Führe `docs/supabase_schema.sql` aus
3. Oder führe Migration aus: `docs/migration_add_perfect_flags.sql`

**Prüfen:**
```sql
-- In Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'progress', 'messages', 'coin_ledger');
```

#### B) RLS Policies blockieren Zugriff

**Lösung:**
1. Option 1: RLS deaktivieren (nur für Debug):
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
   ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
   ```

2. Option 2: Service Role Key verwenden (empfohlen):
   - Service Role Key umgeht RLS automatisch
   - Setze `SUPABASE_SERVICE_ROLE_KEY` in Netlify Env Vars

**Prüfen:**
```bash
# Mit debugSupabase Function
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase | jq '.debug.client.testQuery'
# Wenn error.code === 'PGRST116' → RLS Problem
```

---

### Problem 3: Coins/Progress werden nicht persistiert

**Symptome:**
- Coins steigen lokal, aber nach Reload wieder bei 0
- Progress wird nicht gespeichert

**Ursachen:**

#### A) User-ID Inkonsistenz

**Lösung:**
1. Prüfe Browser Console für User-ID Logs
2. Prüfe Supabase `users` Tabelle:
   ```sql
   SELECT id, coins, display_name FROM users ORDER BY created_at DESC LIMIT 10;
   ```
3. Prüfe ob Client `x-anon-id` Header sendet (Browser DevTools → Network)

**Prüfen:**
```bash
# Mit debugSupabase Function
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase | jq '.debug.client.testQuery'
```

#### B) Functions laufen im dev-fallback

**Lösung:**
- Siehe Problem 1

---

## ✅ Checkliste für Deployment

### Pre-Deployment

- [ ] `package.json` enthält `@supabase/supabase-js` in `dependencies`
- [ ] Supabase Schema ist aktuell (`docs/supabase_schema.sql`)
- [ ] Migration ausgeführt (falls Schema-Änderungen)

### Netlify Environment Variables

- [ ] `SUPABASE_URL` ist gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ist gesetzt (empfohlen)
- [ ] ODER `SUPABASE_ANON_KEY` ist gesetzt
- [ ] Env Vars sind für **Production** Branch gesetzt

### Post-Deployment Verification

```bash
# 1. Self-Check Script
node scripts/selfcheck.mjs https://realer-math.netlify.app

# 2. Debug Function
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase

# 3. Manueller Test
curl -X POST https://realer-math.netlify.app/.netlify/functions/coinsAdjust \
  -H "Content-Type: application/json" \
  -H "x-dev-user: test-123" \
  -d '{"delta": 50, "reason": "test"}'
```

**Erwartet:**
- `ok: true` in Response
- **Kein** `note: 'dev-fallback'`
- Coins werden in Supabase gespeichert

---

## 🔧 Schritt-für-Schritt Fix

### Schritt 1: Supabase Projekt erstellen/öffnen

1. Gehe zu https://supabase.com
2. Öffne dein Projekt (oder erstelle neues)
3. Gehe zu Project Settings → API

### Schritt 2: Keys kopieren

1. **Project URL** kopieren (z.B. `https://xxxxx.supabase.co`)
2. **service_role key** kopieren (secret! nicht öffentlich teilen)

### Schritt 3: Netlify Environment Variables setzen

1. Gehe zu Netlify Dashboard → Site Settings → Environment Variables
2. Füge hinzu:
   - Key: `SUPABASE_URL`, Value: `<Project URL>`
   - Key: `SUPABASE_SERVICE_ROLE_KEY`, Value: `<service_role key>`
3. **Wichtig:** Scopes auf "Production" setzen!

### Schritt 4: Schema erstellen

1. Gehe zu Supabase Dashboard → SQL Editor
2. Kopiere Inhalt von `docs/supabase_schema.sql`
3. Führe aus (Run)

### Schritt 5: Redeploy

1. Netlify Dashboard → Deploys
2. Klicke "Trigger deploy" → "Clear cache and deploy site"
3. Oder: Push zu main branch

### Schritt 6: Verifizieren

```bash
# Self-Check
node scripts/selfcheck.mjs https://realer-math.netlify.app

# Debug
curl https://realer-math.netlify.app/.netlify/functions/debugSupabase | jq
```

**Erwartet:**
- Alle Tests: `✓ Passed`
- Debug: `Client created: Yes`, `Test query: Success`
- **Keine** `dev-fallback` Warnings

---

## 📊 Monitoring

### Netlify Function Logs

1. Netlify Dashboard → Functions → `coinsAdjust` (oder andere)
2. Prüfe Logs für:
   - `[Supabase] Client initialized successfully`
   - `[coinsAdjust] Success:`
   - **Keine** `Dev fallback` Meldungen

### Supabase Dashboard

1. Gehe zu Supabase Dashboard → Table Editor
2. Prüfe Tabellen:
   - `users`: Sollte Einträge haben nach `/me` Call
   - `progress`: Sollte Einträge haben nach Quiz
   - `messages`: Sollte Einträge haben nach Chat-Send
   - `coin_ledger`: Sollte Einträge haben nach Coins-Änderung

---

## 🆘 Wenn nichts funktioniert

1. **Prüfe Debug Function:**
   ```
   https://realer-math.netlify.app/.netlify/functions/debugSupabase
   ```

2. **Prüfe Netlify Build Logs:**
   - Netlify Dashboard → Deploys → Latest Deploy → Build Logs
   - Suche nach `@supabase/supabase-js`

3. **Prüfe Function Logs:**
   - Netlify Dashboard → Functions → `me` (oder andere)
   - Prüfe auf Errors oder Warnings

4. **Prüfe Supabase Logs:**
   - Supabase Dashboard → Logs → Postgres Logs
   - Prüfe auf Connection Errors

5. **Teste lokal:**
   ```bash
   # Erstelle .env.local mit Supabase Credentials
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=xxxxx

   # Starte lokal
   netlify dev

   # Teste
   curl http://localhost:8888/.netlify/functions/debugSupabase
   ```

---

## 📚 Weitere Ressourcen

- `PROBLEMS.md` - Bekannte Bugs und Fixes
- `SELF_CHECK.md` - Test-Anleitung
- `RELEASE_CHECKLIST.md` - Deployment-Checkliste
- `docs/USER_FLOW.md` - User-Flow Dokumentation

