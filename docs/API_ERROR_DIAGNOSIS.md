# API Error Diagnosis Guide

## 🔍 Wie man API Errors diagnostiziert

### Schritt 1: Debug Function aufrufen

**Production:**
```
https://realer-math.netlify.app/.netlify/functions/debugSupabase
```

**Lokal:**
```
http://localhost:8888/.netlify/functions/debugSupabase
```

**Was prüfen:**
- ✅ `debug.env.SUPABASE_URL` = "SET"
- ✅ `debug.env.SUPABASE_SERVICE_ROLE_KEY` = "SET"
- ✅ `debug.client.created` = true
- ✅ `debug.client.testQuery.success` = true
- ✅ `debug.package.installed` = true

### Schritt 2: Browser Console prüfen

**Öffne Developer Tools (F12) → Console**

**Häufige Errors:**

1. **"Failed to fetch"**
   - Ursache: Network Error, CORS, oder Function nicht erreichbar
   - Lösung: Prüfe Netlify Function Logs

2. **"500 Internal Server Error"**
   - Ursache: Function Crash, Supabase Error, oder Timeout
   - Lösung: Prüfe Function Logs in Netlify Dashboard

3. **"dev-fallback" in Response**
   - Ursache: Supabase nicht konfiguriert
   - Lösung: Setze Environment Variables (siehe `NETLIFY_ENV_SETUP.md`)

4. **"COIN_UPDATE_CONFLICT" (409)**
   - Ursache: Race Condition bei Coin Updates
   - Lösung: Sollte durch Retry-Logik behoben sein

5. **"USERNAME_TAKEN" (409)**
   - Ursache: Username bereits vergeben
   - Lösung: Normales Verhalten, User sollte anderen Namen wählen

6. **499 Timeout**
   - Ursache: Function braucht zu lange (>10 Sekunden)
   - Lösung: Function optimieren (siehe Optimierungen unten)

### Schritt 3: Netlify Function Logs prüfen

1. Gehe zu: **Netlify Dashboard** → **Functions** → **[Function Name]** → **Logs**
2. Suche nach:
   - `ERROR`
   - `WARN`
   - `Failed`
   - `Exception`

**Beispiel Log-Analyse:**

```
[me.js] Supabase upsert error: ...
→ Supabase Query fehlgeschlagen

[aiAssistant] Coin update conflict
→ Race Condition (sollte durch Retry behoben sein)

[register] Username check error
→ Query Error (möglicherweise Schema Problem)
```

### Schritt 4: Supabase Schema prüfen

**In Supabase SQL Editor:**

```sql
-- Prüfe ob Tabellen existieren
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'progress', 'messages', 'coin_ledger', 'battles', 'battle_turns');

-- Prüfe ob Spalten existieren
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('id', 'display_name', 'coins', 'unlocked_items');

-- Prüfe RLS Policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## 🐛 Häufige Errors & Fixes

### Error: "Supabase client could not be created"

**Symptome:**
- Alle Functions geben `dev-fallback` zurück
- Debug Function zeigt `client.created = false`

**Lösung:**
1. Prüfe Environment Variables in Netlify
2. Prüfe ob `@supabase/supabase-js` in `package.json` dependencies ist
3. Redeploy nach Änderung der Env Vars

### Error: "PGRST116" (RLS Policy Violation)

**Symptome:**
- Functions geben 200, aber Daten werden nicht gespeichert
- Test Query in Debug Function schlägt fehl mit Code `PGRST116`

**Lösung:**
1. Verwende `SUPABASE_SERVICE_ROLE_KEY` (umgeht RLS)
2. Oder: Setze RLS Policies in Supabase richtig

### Error: "Column does not exist"

**Symptome:**
- Functions geben 500 Error
- Logs zeigen: "column X does not exist"

**Lösung:**
1. Führe `docs/supabase_schema.sql` aus
2. Oder: Führe Migration aus (z.B. `docs/migration_fix_schema.sql`)

### Error: Timeout (499)

**Symptome:**
- Requests dauern >10 Sekunden
- Function gibt 499 zurück

**Lösung:**
1. Function optimieren (weniger Queries, bessere Indizes)
2. Timeout reduzieren (bereits auf 5s gesetzt)
3. Queries parallelisieren wo möglich

### Error: "COIN_UPDATE_CONFLICT" (409)

**Symptome:**
- AI Assistant gibt 409 zurück
- "Kontoänderung erkannt" Fehlermeldung

**Lösung:**
- Sollte durch Retry-Logik behoben sein
- Falls weiterhin auftritt: Supabase Performance prüfen

## 🔧 Error Handling Best Practices

### In Functions:

```javascript
try {
  // Operation
} catch (err) {
  console.error('[functionName] Error:', err);
  return {
    statusCode: 500,
    headers: HEADERS,
    body: JSON.stringify({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: err.message || 'Unknown error',
    }),
  };
}
```

### Im Frontend:

```typescript
try {
  const result = await apiCall();
} catch (err: any) {
  console.error('[Component] API Error:', err);
  // Zeige User-freundliche Fehlermeldung
  addToast(err.message || 'Fehler aufgetreten', 'error');
}
```

## 📋 Quick Checklist

Wenn Errors auftreten:

- [ ] Debug Function aufrufen und prüfen
- [ ] Browser Console auf Errors prüfen
- [ ] Netlify Function Logs prüfen
- [ ] Environment Variables prüfen
- [ ] Supabase Schema prüfen
- [ ] Dependencies prüfen (`package.json`)
- [ ] Redeploy nach Änderungen

## 🆘 Hilfe bekommen

Wenn du Hilfe brauchst, sammle folgende Infos:

1. **Debug Function Output:**
   ```
   https://realer-math.netlify.app/.netlify/functions/debugSupabase
   ```

2. **Browser Console Errors:**
   - Screenshot oder kopierte Error Messages

3. **Netlify Function Logs:**
   - Relevant Log Lines aus Netlify Dashboard

4. **Betroffene Function:**
   - Welche Function gibt den Error?
   - Welche HTTP Method (GET/POST)?
   - Request Body (falls POST)?

5. **Schritte zum Reproduzieren:**
   - Was hast du gemacht bevor der Error auftrat?
   - Tritt der Error immer auf oder nur manchmal?

