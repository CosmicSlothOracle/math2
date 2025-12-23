# Testing Guide: Supabase + Netlify Functions

## 🧪 Schnelltest-Übersicht

### 1. Lokale Umgebung prüfen

```bash
# Prüfe ob .env Datei existiert (optional für lokale Tests)
# Die Functions haben Dev-Fallbacks, funktionieren also auch ohne Supabase

# Starte Netlify Dev Server
netlify dev

# Sollte starten auf:
# - Frontend: http://localhost:3000
# - Functions: http://localhost:8888/.netlify/functions/*
```

### 2. Function-Endpoints direkt testen

#### Test 1: `/me` Endpoint (User Bootstrap)

**Ohne Supabase (Dev-Fallback):**
```bash
curl http://localhost:8888/.netlify/functions/me
```

**Erwartete Antwort:**
```json
{
  "user": {
    "id": "dev-user",
    "display_name": "Dev",
    "coins": 2000
  },
  "progress": [],
  "serverTime": 1234567890,
  "note": "dev-fallback"
}
```

**Mit Supabase (wenn .env gesetzt):**
```bash
# Setze Header für Dev-User (optional)
curl -H "X-Dev-User: test-user-123" http://localhost:8888/.netlify/functions/me
```

#### Test 2: `/progressGet` Endpoint

```bash
curl http://localhost:8888/.netlify/functions/progressGet?unitId=u1
```

#### Test 3: `/progressSave` Endpoint

```bash
curl -X POST http://localhost:8888/.netlify/functions/progressSave \
  -H "Content-Type: application/json" \
  -H "X-Dev-User: test-user-123" \
  -d '{
    "unitId": "u1",
    "questCoinsEarned": 25,
    "questCompletedCount": 1,
    "bountyCompleted": false
  }'
```

#### Test 4: `/coinsAdjust` Endpoint

```bash
curl -X POST http://localhost:8888/.netlify/functions/coinsAdjust \
  -H "Content-Type: application/json" \
  -H "X-Dev-User: test-user-123" \
  -d '{
    "delta": 50,
    "reason": "test",
    "refType": "test",
    "refId": "test-123"
  }'
```

#### Test 5: Chat Endpoints

```bash
# Chat senden
curl -X POST http://localhost:8888/.netlify/functions/chatSend \
  -H "Content-Type: application/json" \
  -H "X-Dev-User: test-user-123" \
  -d '{
    "channelId": "class",
    "text": "Test-Nachricht",
    "username": "TestUser"
  }'

# Chat abrufen
curl "http://localhost:8888/.netlify/functions/chatPoll?channelId=class"
```

### 3. Supabase-Verbindung testen

#### Schritt 1: Environment Variables prüfen

Erstelle `.env` im Projekt-Root (wird nicht committed):

```env
SUPABASE_URL=https://dein-projekt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
# ODER
SUPABASE_ANON_KEY=dein-anon-key
```

**Wichtig:**
- `SUPABASE_SERVICE_ROLE_KEY` hat Admin-Rechte (für Backend-Functions)
- `SUPABASE_ANON_KEY` hat nur RLS-Rechte (für Frontend)

#### Schritt 2: Supabase Schema prüfen

Führe das SQL-Script aus:
```bash
# Öffne Supabase Dashboard → SQL Editor
# Kopiere Inhalt von docs/supabase_schema.sql
# Führe aus
```

#### Schritt 3: Test-Script ausführen

Erstelle `test-supabase.js`:

```javascript
// test-supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Fehlende Environment Variables!');
  console.log('Setze SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Teste Supabase-Verbindung...\n');

  // Test 1: Users-Tabelle
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Users-Tabelle: OK');
  } catch (err) {
    console.error('❌ Users-Tabelle Fehler:', err.message);
  }

  // Test 2: Progress-Tabelle
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Progress-Tabelle: OK');
  } catch (err) {
    console.error('❌ Progress-Tabelle Fehler:', err.message);
  }

  // Test 3: Coin Ledger
  try {
    const { data, error } = await supabase
      .from('coin_ledger')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Coin Ledger: OK');
  } catch (err) {
    console.error('❌ Coin Ledger Fehler:', err.message);
  }

  // Test 4: User Upsert
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ id: 'test-user', display_name: 'Test', coins: 0 }, { onConflict: 'id' })
      .select();

    if (error) throw error;
    console.log('✅ User Upsert: OK');
  } catch (err) {
    console.error('❌ User Upsert Fehler:', err.message);
  }

  console.log('\n✨ Supabase-Test abgeschlossen!');
}

testConnection();
```

Führe aus:
```bash
node test-supabase.js
```

### 4. Frontend-Integration testen

#### Im Browser (DevTools Console):

```javascript
// Test 1: Bootstrap User
fetch('/.netlify/functions/me')
  .then(r => r.json())
  .then(data => {
    console.log('✅ /me Response:', data);
    if (data.note && data.note.includes('dev-fallback')) {
      console.warn('⚠️ Läuft im Dev-Fallback-Modus (kein Supabase)');
    } else {
      console.log('✅ Läuft mit Supabase!');
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
  .then(data => console.log('✅ Progress Save:', data));

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
  .then(data => console.log('✅ Coins Adjust:', data));
```

### 5. Checkliste für Probleme

#### ❌ Function gibt 500 Error zurück

**Mögliche Ursachen:**
1. `@supabase/supabase-js` nicht installiert
   ```bash
   npm install @supabase/supabase-js
   ```

2. Environment Variables fehlen
   - Prüfe `.env` Datei
   - Prüfe Netlify Dashboard → Site Settings → Environment Variables

3. Supabase Client Initialisierung fehlgeschlagen
   - Prüfe `netlify/functions/_supabase.js`
   - Schau in `netlify dev` Terminal-Logs

#### ❌ "dev-fallback" wird immer angezeigt

**Ursache:** Supabase Environment Variables nicht gesetzt

**Lösung:**
1. Erstelle `.env` mit `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY`
2. Oder setze in Netlify Dashboard (für Production)

#### ❌ Supabase Query Fehler

**Mögliche Ursachen:**
1. Tabellen existieren nicht → Führe `docs/supabase_schema.sql` aus
2. RLS (Row Level Security) blockiert → Prüfe Supabase Dashboard → Authentication → Policies
3. Falscher Key verwendet → Verwende `SERVICE_ROLE_KEY` für Backend-Functions

#### ❌ CORS Fehler

**Lösung:** Functions haben bereits CORS-Headers. Falls trotzdem Probleme:
- Prüfe `Access-Control-Allow-Origin` Header in Function-Response
- Prüfe Browser Console für genaue Fehlermeldung

### 6. Production-Test (nach Deploy)

```bash
# Deploy zu Netlify
netlify deploy --prod

# Teste Production-Endpoints
curl https://deine-site.netlify.app/.netlify/functions/me
```

**Wichtig:** Setze Environment Variables im Netlify Dashboard:
- Site Settings → Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 7. Debug-Modus aktivieren

In `netlify/functions/me.js` (oder anderen Functions):
```javascript
console.log('🔍 Debug Info:', {
  hasSupabaseEnv: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
  authHeader: event.headers?.Authorization ? 'PRESENT' : 'MISSING'
});
```

Schau dann in `netlify dev` Terminal-Output.

---

## 🚀 Quick Start Test

```bash
# 1. Starte Netlify Dev
netlify dev

# 2. Öffne Browser Console auf http://localhost:3000
# 3. Führe aus:
fetch('/.netlify/functions/me').then(r => r.json()).then(console.log)

# 4. Erwarte: { user: {...}, progress: [], note: "dev-fallback" }
#    Oder: { user: {...}, progress: [...] } wenn Supabase läuft
```

---

## 📝 Test-Log

Führe diese Tests in dieser Reihenfolge aus:

- [ ] `netlify dev` startet ohne Fehler
- [ ] `/me` Endpoint gibt 200 zurück
- [ ] `/progressGet` gibt leeres Array oder Daten zurück
- [ ] `/progressSave` speichert erfolgreich
- [ ] `/coinsAdjust` passt Coins an
- [ ] Frontend zeigt Coins/Progress korrekt an
- [ ] Chat senden/abrufen funktioniert
- [ ] Supabase-Tabellen existieren (SQL Editor)
- [ ] Production-Deploy funktioniert

