# Math2 - Identifizierte Probleme & Root Causes

## Übersicht
Dieses Dokument listet alle reproduzierbaren Bugs mit Root Causes und Fix-Strategien auf.

---

## Problem 1: NaN Coins/Level im UI

### Repro Steps
1. Quest abschließen (Standard oder Bounty)
2. Coins werden aktualisiert
3. Nach Reload oder mehreren Quests: `coins` oder `level` wird `NaN`

### Root Cause
**H1: Client-State Merge verursacht NaN**
- In `questService.ts` Zeile 37-38: `coins` wird aus Response geparst, aber wenn `json.coins` undefined ist, wird `workingUser.coins + applied` berechnet
- Wenn `workingUser.coins` undefined ist → `undefined + number = NaN`
- In `apiService.ts` Zeile 159: Merge-Logik nutzt `Math.max(existingUser.coins || 0, json.user.coins || 0)`, aber wenn beide undefined sind, wird NaN propagiert
- `totalEarned` wird ähnlich berechnet (Zeile 39, 59): `(workingUser.totalEarned || 0) + applied` kann NaN werden wenn `applied` NaN ist

**H2: Function returns falsche Response-Shape**
- `coinsAdjust.js` Zeile 29: Dev-Fallback gibt `{ result: { user: {...}, applied: ... } }` zurück
- Client erwartet `{ coins: number, applied: number }` direkt im Root
- Client liest `json.coins` → undefined → NaN

### Fix Strategy
1. **Response-Shape vereinheitlichen**: Alle Functions müssen `{ ok: boolean, coins?: number, applied?: number, ... }` zurückgeben
2. **Guards in Client**: `Number.isFinite()` Checks vor jeder Berechnung
3. **Default-Werte**: User-Objekt immer mit `coins: 0, totalEarned: 0, xp: 0` initialisieren

---

## Problem 2: Bounty bleibt locked obwohl Quiz erfolgreich war

### Repro Steps
1. Standard-Quiz perfekt abschließen (keine Fehler)
2. Bounty sollte unlocked sein
3. Bounty bleibt locked

### Root Cause
**H1: perfectStandardQuizUnits wird nicht persistiert**
- In `src/App.tsx` Zeile 3554-3587: `handleQuestComplete` setzt `perfectStandardQuizUnits` lokal
- `progressSave` wird aufgerufen, aber `perfectStandardQuizUnits` ist nicht Teil des Payloads
- Nach Reload: State geht verloren, weil nur `completedUnits` persistiert wird

**H2: DB-Schema fehlt Feld**
- `progress` Tabelle hat kein Feld für `perfect_standard_quiz` oder `perfect_bounty`
- Lock-Logik basiert auf `perfectStandardQuizUnits` Array, aber das wird nicht in DB gespeichert

### Fix Strategy
1. **progressSave erweitern**: `perfectStandardQuiz` und `perfectBounty` als boolean Flags in `progress` Tabelle
2. **me.js erweitern**: Beim Bootstrap `perfectStandardQuizUnits` und `perfectBountyUnits` aus `progress` Tabelle rekonstruieren
3. **Lock-Logik**: UI prüft DB-State (via `progress`), nicht nur localStorage

---

## Problem 3: Coins werden nicht persistiert / Inkonsistenz

### Repro Steps
1. Quest abschließen, Coins steigen lokal
2. Reload → Coins zurück auf alten Wert
3. Oder: Coins steigen, aber DB zeigt andere Werte

### Root Cause
**H1: coinsAdjust Dev-Fallback gibt falsche Response**
- `coinsAdjust.js` Zeile 26-29: Wenn Supabase null, gibt es `{ result: { user: {...}, applied: ... } }` zurück
- Client erwartet `{ coins: number, applied: number }` → liest undefined
- Client berechnet lokal: `workingUser.coins + applied` → kann NaN werden

**H2: User-ID Inkonsistenz**
- `_utils.js` Zeile 9: Wenn kein auth header → `'dev-user'`
- Client generiert random ID (`Math.random().toString(36).substr(2, 9)`)
- Server schreibt unter `'dev-user'`, Client liest unter anderer ID → keine Persistenz

**H3: Merge-Logik überschreibt Server-Werte**
- `apiService.ts` Zeile 159: `coins: Math.max(existingUser.coins || 0, json.user.coins || 0)`
- Wenn Server niedrigere Coins hat (z.B. nach Reload), wird lokaler höherer Wert genommen
- Server-Werte werden ignoriert

### Fix Strategy
1. **Einheitliche Response-Shape**: `coinsAdjust` gibt immer `{ ok: boolean, coins: number, applied: number }` zurück
2. **User-ID Single Source of Truth**: `/me` Function liefert kanonische User-ID, Client nutzt diese
3. **Server-authoritative Coins**: Client zeigt Server-Werte an, keine lokale Berechnung

---

## Problem 4: Chat sendet, aber Nachricht erscheint nicht

### Repro Steps
1. Chat-Nachricht senden
2. Nachricht erscheint nicht im Chat
3. Nach Reload: Nachricht fehlt

### Root Cause
**H1: chatSend gibt 200 bei DB-Fehler**
- `chatSend.js` Zeile 31-35: Bei Supabase Insert-Error wird trotzdem 200 mit `note: 'dev-fallback-insert-error'` zurückgegeben
- Client prüft nur `resp.ok` → denkt Success
- Nachricht wird nicht in DB geschrieben

**H2: chatPoll filtert falsch**
- `chatPoll.js` Zeile 18: `since` wird als `new Date(Number(params.since))` geparst
- Wenn `since` falsch formatiert ist → filtert nichts oder alle
- Client sendet möglicherweise falsches `since` Format

### Fix Strategy
1. **Error-Handling**: `chatSend` gibt `{ ok: false, error: '...' }` bei DB-Fehler zurück
2. **Client zeigt Error**: Wenn `ok: false`, zeige Toast/Error
3. **since-Parameter validieren**: Korrekte ISO-String oder Timestamp-Format

---

## Problem 5: Supabase läuft im Dev-Fallback (Deployment)

### Repro Steps
1. Deployed App öffnen
2. Alle Functions geben `note: 'dev-fallback'` zurück
3. Keine Daten in Supabase Tables

### Root Cause
**H1: Env Vars fehlen in Netlify**
- `_supabase.js` Zeile 4-8: Prüft `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY`
- Wenn nicht gesetzt → `createSupabaseClient()` gibt null zurück
- Alle Functions laufen im Fallback

**H2: @supabase/supabase-js nicht gebundelt**
- `package.json` Zeile 18: `@supabase/supabase-js` ist in `dependencies`
- Aber Netlify Functions bundling könnte es nicht einschließen
- `require('@supabase/supabase-js')` schlägt fehl → Fallback

### Fix Strategy
1. **Env Vars prüfen**: Netlify Dashboard → Site settings → Environment variables
2. **Bundling prüfen**: `netlify.toml` oder Build-Logs prüfen
3. **Self-Check Script**: Automatischer Test gegen deployed Functions

---

## Problem 6: Progress wird nicht korrekt gespeichert

### Repro Steps
1. Quest abschließen
2. `progressSave` wird aufgerufen
3. Nach Reload: Progress fehlt oder ist falsch

### Root Cause
**H1: progressSave Dev-Fallback gibt falsche Response**
- `progressSave.js` Zeile 29-32: Dev-Fallback gibt `{ saved: row, note: 'dev-fallback' }` zurück
- Client prüft nicht `note` → denkt Success
- Daten werden nicht persistiert

**H2: Upsert-Konflikt**
- `progressSave.js` Zeile 44: `upsert` mit `{ returning: 'representation' }`
- Wenn Primary Key falsch → Fehler, aber Response könnte trotzdem 200 sein

### Fix Strategy
1. **Response-Shape**: `{ ok: boolean, saved?: {...}, error?: string }`
2. **Client prüft `ok`**: Nur bei `ok: true` als Success behandeln
3. **Upsert-Konflikt-Handling**: Prüfe ob `user_id` und `unit_id` korrekt sind

---

## Problem 7: Battle Turns nicht implementiert

### Repro Steps
1. Battle-Feature nutzen (falls vorhanden)
2. Turns werden nicht gespeichert
3. `battle_turns` Tabelle bleibt leer

### Root Cause
**H1: Feature nicht implementiert**
- Keine Function `battleTurnSave` gefunden
- Frontend ruft keine Battle-Endpoints auf
- Tabelle existiert im Schema, aber wird nicht genutzt

### Fix Strategy
1. **Prüfen ob Feature aktiv**: Wenn nicht → dokumentieren als "not wired"
2. **Wenn aktiv**: `battleTurnSave` Function implementieren

---

## Zusammenfassung: Hauptprobleme

1. **Response-Shape Inkonsistenz**: Functions geben unterschiedliche Formate zurück
2. **Dev-Fallback Silent Failures**: 200 OK auch bei DB-Fehlern
3. **User-ID Inkonsistenz**: Client und Server nutzen unterschiedliche IDs
4. **NaN durch undefined Arithmetic**: Keine Guards für numerische Werte
5. **Progress nicht vollständig**: `perfectStandardQuizUnits` wird nicht persistiert
6. **Supabase Connectivity**: Env Vars oder Bundling-Problem im Deployment

---

## Priorisierung

**Kritisch (sofort fixen):**
- Problem 1: NaN Coins (bricht UI)
- Problem 3: Coins nicht persistiert (Datenverlust)
- Problem 5: Supabase Dev-Fallback (nichts funktioniert)

**Hoch (nächste Phase):**
- Problem 2: Bounty Lock (Feature broken)
- Problem 4: Chat (Feature broken)
- Problem 6: Progress (Datenverlust)

**Niedrig:**
- Problem 7: Battle Turns (Feature nicht aktiv)

