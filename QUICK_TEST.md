# 🚀 Quick Test Guide

## 1. Netlify Functions lokal testen

```bash
# Terminal 1: Starte Netlify Dev
netlify dev

# Terminal 2: Teste Endpoints
curl http://localhost:8888/.netlify/functions/me
```

**Erwartete Antwort (ohne Supabase):**
```json
{
  "user": {"id": "dev-user", "display_name": "Dev", "coins": 2000},
  "progress": [],
  "note": "dev-fallback"
}
```

## 2. Supabase-Verbindung testen

### Option A: Mit Test-Script (empfohlen)

```bash
# Installiere dotenv (optional, für .env Support)
npm install --save-dev dotenv

# Erstelle .env Datei im Projekt-Root:
# SUPABASE_URL=https://dein-projekt.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=dein-key

# Führe Test aus
npm run test:supabase
```

### Option B: Manuell im Browser

1. Öffne `http://localhost:3000`
2. Öffne Browser Console (F12)
3. Führe aus:

```javascript
// Test 1: User Bootstrap
fetch('/.netlify/functions/me')
  .then(r => r.json())
  .then(data => {
    console.log('✅ /me:', data);
    if (data.note?.includes('dev-fallback')) {
      console.warn('⚠️ Dev-Fallback aktiv (kein Supabase)');
    }
  });

// Test 2: Progress speichern
fetch('/.netlify/functions/progressSave', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    unitId: 'u1',
    questCoinsEarned: 10,
    questCompletedCount: 1,
    bountyCompleted: false
  })
})
  .then(r => r.json())
  .then(console.log);

// Test 3: Coins anpassen
fetch('/.netlify/functions/coinsAdjust', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    delta: 25,
    reason: 'test',
    refType: 'test',
    refId: 'test-123'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## 3. Supabase Schema prüfen

1. Öffne Supabase Dashboard → SQL Editor
2. Kopiere Inhalt von `docs/supabase_schema.sql`
3. Führe aus
4. Prüfe Tables → `users`, `progress`, `coin_ledger`, `messages` existieren

## 4. Checkliste

- [ ] `netlify dev` startet ohne Fehler
- [ ] `/me` gibt 200 zurück
- [ ] Browser Console zeigt keine CORS-Fehler
- [ ] Progress wird gespeichert (prüfe Supabase Dashboard)
- [ ] Coins werden angepasst (prüfe `coin_ledger` Tabelle)
- [ ] Chat funktioniert (wenn implementiert)

## 5. Häufige Probleme

### ❌ "dev-fallback" wird immer angezeigt
**Lösung:** Setze `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` in `.env` oder Netlify Dashboard

### ❌ Function gibt 500 Error
**Lösung:**
- Prüfe `netlify dev` Terminal-Logs
- Installiere `@supabase/supabase-js`: `npm install @supabase/supabase-js`

### ❌ Supabase Query Fehler
**Lösung:** Führe `docs/supabase_schema.sql` im Supabase SQL Editor aus

---

**Vollständige Anleitung:** Siehe `docs/TESTING.md`

