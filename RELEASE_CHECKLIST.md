# Release Checklist für Math2 Deployment

Diese Checkliste sollte vor jedem Deployment durchgegangen werden.

---

## Pre-Deployment Checks

### 1. Code-Qualität
- [ ] Alle Functions haben einheitliche Response-Shape (`ok: boolean`)
- [ ] Alle Functions loggen wichtige Events (`console.log('[functionName]', ...)`)
- [ ] Client-Code hat `Number.isFinite()` Guards für numerische Werte
- [ ] Keine `console.error` ohne Handling
- [ ] TypeScript Compilation ohne Errors (`npm run build`)

### 2. Dependencies
- [ ] `package.json` enthält `@supabase/supabase-js` in `dependencies` (nicht `devDependencies`)
- [ ] `package-lock.json` ist aktuell (`npm install`)
- [ ] Keine Security-Vulnerabilities (`npm audit`)

### 3. Supabase Schema
- [ ] Schema ist aktuell (`docs/supabase_schema.sql`)
- [ ] `progress` Tabelle hat `perfect_standard_quiz` und `perfect_bounty` Spalten
- [ ] Indizes sind erstellt
- [ ] Migration wurde in Supabase SQL Editor ausgeführt (falls Schema-Änderungen)

### 4. Environment Variables (Netlify)
- [ ] `SUPABASE_URL` ist gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ist gesetzt (für server-side operations)
- [ ] Keine `SUPABASE_ANON_KEY` für Functions (nur Service Role)
- [ ] Env Vars sind für Production Branch gesetzt

---

## Deployment Steps

### 1. Build & Test lokal
```bash
# Install dependencies
npm install

# Build
npm run build

# Test lokal (falls möglich)
netlify dev
```

### 2. Commit & Push
```bash
git add .
git commit -m "fix: [Beschreibung der Fixes]"
git push origin main
```

### 3. Netlify Deployment
- [ ] Warte auf automatisches Deployment (via Git Hook)
- [ ] Oder trigger manuell: Netlify Dashboard → Deploys → Trigger deploy

### 4. Post-Deployment Verification

#### 4.1 Self-Check Script
```bash
node scripts/selfcheck.mjs https://realer-math.netlify.app
```

**Erwartet:**
- Alle Tests passieren (`✓ Passed: 7`)
- Keine `dev-fallback` Warnings
- Exit Code: 0

**Wenn dev-fallback:**
- Prüfe Netlify Env Vars
- Prüfe Function Logs für Errors
- Redeploy nach Fix

#### 4.2 Manuelle Function Tests
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
```

**Prüfe:**
- Response enthält `"ok": true`
- Keine `"note": "dev-fallback"`
- Numerische Werte sind Zahlen (nicht Strings)

#### 4.3 Supabase Verifikation
Gehe zu Supabase Dashboard → Table Editor:

- [ ] `users` Tabelle: Test-User existiert, `coins` wurde aktualisiert
- [ ] `progress` Tabelle: Test-Progress wurde gespeichert, Flags sind korrekt
- [ ] `messages` Tabelle: Test-Message wurde gespeichert
- [ ] `coin_ledger` Tabelle: Ledger-Eintrag wurde erstellt

#### 4.4 UI Tests (Browser)
1. Öffne https://realer-math.netlify.app
2. Login mit Test-User
3. Prüfe:
   - [ ] Coins werden angezeigt (keine NaN)
   - [ ] Level wird berechnet (keine NaN)
   - [ ] Quest abschließen → Coins steigen
   - [ ] Reload → Coins bleiben erhalten
   - [ ] Perfect Quiz → Bounty wird unlocked
   - [ ] Reload → Bounty bleibt unlocked
   - [ ] Chat: Nachricht senden → erscheint sofort
   - [ ] Chat: Reload → Nachrichten bleiben erhalten

---

## Rollback Plan

Falls Deployment fehlschlägt:

1. **Netlify Rollback:**
   - Gehe zu Netlify Dashboard → Deploys
   - Wähle vorherigen erfolgreichen Deploy
   - Klicke "Publish deploy"

2. **Supabase Rollback:**
   - Falls Schema-Änderungen: Führe Migration rückgängig
   - Oder: Restore aus Backup (falls vorhanden)

3. **Code Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## Known Issues & Workarounds

### Issue: Functions geben dev-fallback zurück
**Workaround:** Prüfe Env Vars, redeploy

### Issue: NaN Coins im UI
**Workaround:** Prüfe Browser Console, prüfe Function Responses

### Issue: Bounty bleibt locked
**Workaround:** Prüfe `progress` Tabelle, prüfe `perfect_standard_quiz` Flag

### Issue: Chat Messages erscheinen nicht
**Workaround:** Prüfe `messages` Tabelle, prüfe `chatPoll` Response

---

## Monitoring

Nach Deployment für 24h überwachen:

1. **Netlify Function Logs:**
   - Prüfe auf Errors oder Warnings
   - Prüfe auf dev-fallback Meldungen
   - Prüfe auf ungewöhnliche Response-Times

2. **Supabase Dashboard:**
   - Prüfe auf DB-Errors
   - Prüfe auf ungewöhnliche Query-Times
   - Prüfe auf fehlgeschlagene Inserts/Updates

3. **User Feedback:**
   - Prüfe auf NaN-Berichte
   - Prüfe auf fehlende Coins/Progress
   - Prüfe auf Chat-Probleme

---

## Success Criteria

Deployment ist erfolgreich wenn:
- ✅ Self-Check Script: Alle Tests passieren ohne dev-fallback
- ✅ Supabase: Daten werden korrekt persistiert
- ✅ UI: Keine NaN-Werte, Coins/Progress funktionieren
- ✅ Chat: Messages werden gesendet und angezeigt
- ✅ Bounty: Unlock funktioniert und persistiert

---

## Kontakt & Support

Bei Problemen:
1. Prüfe `PROBLEMS.md` für bekannte Issues
2. Prüfe `SELF_CHECK.md` für Troubleshooting
3. Prüfe Netlify Function Logs
4. Prüfe Supabase Dashboard für DB-Errors

