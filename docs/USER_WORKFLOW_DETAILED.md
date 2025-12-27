# User-Workflow: Detaillierte Erklärung

## 1. Seitenerstzugriff (Erstes Laden der App)

### Schritt 1: User ID Generierung
**Wo:** `netlify/functions/_utils.cjs` → `getUserIdFromEvent()`

**Prozess:**
1. **Priority 1: Dev Override** (nur für lokales Testen)
   - Header `x-dev-user` wird verwendet falls vorhanden

2. **Priority 2: JWT Token** (Netlify Identity - falls aktiviert)
   - Authorization Header wird geparst
   - `payload.sub` oder `payload.user_id` oder `payload.email` wird extrahiert
   - Wird als `userId` verwendet

3. **Priority 3: Stable Anonymous ID** (Standard-Fallback)
   - Zuerst wird nach Cookie `mm_anon_id` gesucht
   - Falls nicht vorhanden: Header `x-anon-id` wird geprüft
   - Falls auch nicht vorhanden: Neue ID wird generiert: `anon_<timestamp>_<random>`
   - Diese ID wird als Cookie `mm_anon_id` im Response gesetzt (Max-Age: 1 Jahr)

**Wichtig:** Die User ID ist STABIL über Browser-Sessions hinweg, solange Cookies nicht gelöscht werden.

---

## 2. Benutzer-Registrierung (Username setzen)

### Frontend: `App.tsx` → `AuthScreen`
- User gibt Namen ein (2-30 Zeichen)
- `AuthService.register(username)` wird aufgerufen

### Backend: `netlify/functions/register.cjs`

**Prozess:**
1. User ID wird via `getUserIdFromEvent(event)` extrahiert (siehe Schritt 1)
2. Username wird validiert:
   - Mindestens 2 Zeichen
   - Maximal 30 Zeichen
   - Trim (keine führenden/nachgestellten Leerzeichen)
3. **Username-Eindeutigkeit prüfen:**
   ```javascript
   // Prüft ob display_name bereits existiert
   SELECT id, display_name FROM users WHERE display_name = username
   ```
   - Falls existiert UND anderer User → Fehler `USERNAME_TAKEN`
   - Falls existiert UND gleicher User → Erlaubt (Re-Registrierung)
4. **User Upsert in Supabase:**
   ```sql
   INSERT INTO users (id, display_name, coins)
   VALUES (userId, username, 250)
   ON CONFLICT (id)
   DO UPDATE SET display_name = username
   ```
   - **Wichtig:** `coins` werden nur gesetzt wenn User neu ist (existingUser Check)
   - Bestehende User behalten ihre Coins
5. **Response:** User-Objekt wird zurückgegeben

### Frontend: `services/apiService.ts` → `AuthService.register()`
- Response wird als `normalizeUser()` normalisiert
- User wird in LocalStorage gecacht: `db.set('mm_current_user', user)`

---

## 3. Daten-Persistenz

### Architektur-Prinzip: **Server ist Single Source of Truth**

**Lokaler Cache (LocalStorage):**
- Key: `mm_current_user`
- **Nur Cache** - nie Quelle der Wahrheit
- Wird aktualisiert nach jedem Server-Request

**Server (Supabase):**
- Tabelle: `users`
- Primary Key: `id` (Text - die User ID von Schritt 1)
- Felder:
  - `id` (Text, Primary Key)
  - `display_name` (Text) - **Das ist der Username**
  - `coins` (Integer, Default: 250)
  - `unlocked_items` (Text Array)
  - `avatar`, `calculator_skin`, etc.
  - `created_at` (Timestamp)

### Bootstrapping beim App-Start
**Wo:** `App.tsx` → `useEffect` → `bootstrapServerUser()`

**Prozess:**
1. GET Request zu `/.netlify/functions/me`
2. Backend (`me.cjs`):
   - Extrahiert User ID via `getUserIdFromEvent()`
   - Upsert User (falls nicht vorhanden → 250 Coins)
   - Holt User-Daten aus Supabase
   - Gibt User + Progress zurück
3. Frontend:
   - Normalisiert User-Daten
   - Aktualisiert LocalStorage Cache
   - Setzt React State: `setUser(res.user)`

---

## 4. Battle-Verknüpfung

### Battle-Erstellung: `netlify/functions/battleCreate.cjs`

**Prozess:**
1. **User ID Extraktion:**
   ```javascript
   const userId = getUserIdFromEvent(event);
   ```
2. **Registration Check:**
   ```javascript
   // Holt User-Daten aus Supabase
   const { data: userData } = await supabase
     .from('users')
     .select('display_name')
     .eq('id', userId)
     .limit(1)
     .single();

   // Prüft ob display_name gesetzt ist
   if (!displayName || displayName === 'User' || displayName.length < 2) {
     return { error: 'USER_NOT_REGISTERED' };
   }
   ```
3. **Battle erstellen:**
   ```sql
   INSERT INTO battles (
     challenger_id,      -- userId vom Request
     opponent_id,        -- optional (null für öffentliche Battles)
     unit_id,
     stake,
     task_bundle,
     status
   ) VALUES (...)
   ```

### Battle-Accept: `netlify/functions/battleAccept.cjs`

**Prozess:**
1. User ID wird extrahiert
2. **Registration Check** (gleicher Prozess wie oben)
3. Battle wird geupdatet:
   ```sql
   UPDATE battles
   SET opponent_id = userId,
       status = 'accepted',
       accepted_at = NOW()
   WHERE id = battleId
   ```

### Battle-Submit: `netlify/functions/battleSubmit.cjs`

**Prozess:**
1. User ID wird extrahiert
2. **Registration Check**
3. **Berechtigung prüfen:**
   ```javascript
   // Nur Challenger oder Opponent dürfen submiten
   if (battle.challenger_id !== userId && battle.opponent_id !== userId) {
     return { error: 'UNAUTHORIZED' };
   }
   ```
4. Turn wird gespeichert in `battle_turns`:
   ```sql
   INSERT INTO battle_turns (
     battle_id,
     player_id,    -- userId
     is_correct,
     solve_time_ms,
     answer_payload
   ) VALUES (...)
   ```

---

## 5. Battle-Datenstruktur in Supabase

### Tabelle: `battles`
```sql
id                  UUID (Primary Key)
challenger_id       TEXT (Foreign Key → users.id)
opponent_id         TEXT (Foreign Key → users.id, nullable)
unit_id             TEXT
stake               INTEGER
task_bundle         JSONB
status              TEXT ('pending', 'accepted', 'finished')
challenger_score    INTEGER
opponent_score      INTEGER
winner_id           TEXT (Foreign Key → users.id)
created_at          TIMESTAMP
accepted_at         TIMESTAMP
finished_at         TIMESTAMP
```

### Tabelle: `battle_turns`
```sql
id            UUID (Primary Key)
battle_id     UUID (Foreign Key → battles.id)
player_id     TEXT (Foreign Key → users.id)
turn_index    INTEGER
is_correct    BOOLEAN
solve_time_ms INTEGER
answer_payload JSONB
submitted_at  TIMESTAMP
```

**Verknüpfung:**
- `battles.challenger_id` → `users.id`
- `battles.opponent_id` → `users.id`
- `battle_turns.player_id` → `users.id`
- `battles.winner_id` → `users.id`

---

## 6. Zusammenfassung: User-Flow Diagramm

```
1. SEITENAUFRUF
   ↓
   Frontend: bootstrapServerUser()
   ↓
   GET /.netlify/functions/me
   ↓
   Backend: getUserIdFromEvent()
   ├─→ x-dev-user Header? → userId
   ├─→ JWT Token? → payload.sub
   └─→ Cookie mm_anon_id? → userId
       └─→ NEIN? → Generiere: anon_<timestamp>_<random>
   ↓
   Backend: Supabase users.upsert({ id: userId, coins: 250 })
   ↓
   Response: { user: { id, display_name: 'User', coins: 250 } }
   ↓
   Frontend: Cache in LocalStorage

2. REGISTRIERUNG
   ↓
   User gibt Namen ein: "Max"
   ↓
   Frontend: AuthService.register("Max")
   ↓
   POST /.netlify/functions/register { username: "Max" }
   ↓
   Backend: getUserIdFromEvent() → userId
   ↓
   Backend: Prüfe display_name Eindeutigkeit
   ├─→ Bereits vergeben? → USERNAME_TAKEN (wenn anderer User)
   └─→ OK
   ↓
   Backend: Supabase users.upsert({ id: userId, display_name: "Max" })
   ├─→ User existiert? → Update nur display_name (Coins bleiben)
   └─→ User neu? → Insert mit 250 Coins
   ↓
   Response: { user: { id, display_name: "Max", coins: ... } }
   ↓
   Frontend: Cache in LocalStorage

3. BATTLE ERSTELLEN
   ↓
   Frontend: BattleService.create(...)
   ↓
   POST /.netlify/functions/battleCreate { ... }
   ↓
   Backend: getUserIdFromEvent() → userId
   ↓
   Backend: Prüfe Registration
   ├─→ users.display_name gesetzt? → OK
   └─→ NEIN → USER_NOT_REGISTERED (401)
   ↓
   Backend: Coins abziehen (wenn stake > 0)
   ↓
   Backend: Supabase battles.insert({
     challenger_id: userId,
     unit_id: ...,
     stake: ...,
     status: 'pending'
   })
   ↓
   Response: { battle: { id, challenger_id: userId, ... } }

4. BATTLE ANNEHMEN
   ↓
   Frontend: BattleService.accept(battleId)
   ↓
   POST /.netlify/functions/battleAccept { battleId }
   ↓
   Backend: getUserIdFromEvent() → opponentUserId
   ↓
   Backend: Prüfe Registration
   ↓
   Backend: Supabase battles.update({
     opponent_id: opponentUserId,
     status: 'accepted'
   })
   ↓
   Response: { battle: { challenger_id, opponent_id: opponentUserId, ... } }
```

---

## 7. Kritische Punkte für Battles

### ✅ User muss registriert sein
- Alle Battle-Endpoints prüfen: `display_name` muss gesetzt sein
- Frontend prüft: `user.username && user.username.length >= 2 && user.username !== 'User'`

### ✅ User ID ist stabil
- Cookie-basiert (1 Jahr Gültigkeit)
- Oder JWT-basiert (Netlify Identity)
- Oder Dev-Override (nur lokal)

### ✅ Battle-Verknüpfung
- `battles.challenger_id` = User ID des Herausforderers
- `battles.opponent_id` = User ID des Gegners
- `battle_turns.player_id` = User ID des Spielers
- Alle IDs referenzieren `users.id`

### ✅ Username-Eindeutigkeit
- `users.display_name` ist nicht unique in DB
- Backend prüft Eindeutigkeit manuell
- Gleicher User kann Username ändern (Re-Registrierung)
- Anderer User mit gleichem Username → Fehler

---

## 8. Beispiel-Datenfluss

**Scenario: Max erstellt Battle, Lisa nimmt an**

```
1. Max öffnet App
   → Cookie: mm_anon_id = "anon_1234567890_abc123"
   → Supabase: users.upsert({ id: "anon_1234567890_abc123", display_name: "User" })
   → Frontend: user = { id: "anon_1234567890_abc123", username: "User" }

2. Max registriert sich
   → POST /register { username: "Max" }
   → Backend: userId = "anon_1234567890_abc123"
   → Supabase: users.upsert({ id: "anon_1234567890_abc123", display_name: "Max" })
   → Frontend: user = { id: "anon_1234567890_abc123", username: "Max" }

3. Max erstellt Battle
   → POST /battleCreate { unitId: "potenzen", stake: 50 }
   → Backend: userId = "anon_1234567890_abc123"
   → Backend: Prüft display_name = "Max" → OK
   → Supabase: battles.insert({
       challenger_id: "anon_1234567890_abc123",
       status: "pending"
     })
   → Battle ID: "battle-uuid-123"

4. Lisa öffnet App
   → Cookie: mm_anon_id = "anon_9876543210_xyz789"
   → Supabase: users.upsert({ id: "anon_9876543210_xyz789", display_name: "User" })

5. Lisa registriert sich
   → POST /register { username: "Lisa" }
   → Backend: userId = "anon_9876543210_xyz789"
   → Supabase: users.upsert({ id: "anon_9876543210_xyz789", display_name: "Lisa" })

6. Lisa nimmt Battle an
   → POST /battleAccept { battleId: "battle-uuid-123" }
   → Backend: userId = "anon_9876543210_xyz789"
   → Backend: Prüft display_name = "Lisa" → OK
   → Supabase: battles.update({
       id: "battle-uuid-123",
       opponent_id: "anon_9876543210_xyz789",
       status: "accepted"
     })

7. Max und Lisa spielen Battle
   → Jeder Submit: POST /battleSubmit { battleId, answer, ... }
   → Backend: userId wird extrahiert
   → Backend: Prüft ob userId = challenger_id ODER opponent_id
   → Supabase: battle_turns.insert({ player_id: userId, ... })
```

---

## 9. Troubleshooting

### Problem: User kann keine Battles erstellen
**Check:**
1. Ist `display_name` in Supabase gesetzt? (`users.display_name != 'User'`)
2. Ist `display_name` >= 2 Zeichen?
3. Frontend-Check: `user.username && user.username !== 'User'`

### Problem: User ID ändert sich bei jedem Refresh
**Check:**
1. Cookies werden akzeptiert? (Browser Settings)
2. Cookie `mm_anon_id` wird gesetzt? (Dev Tools → Application → Cookies)
3. Cookie wird bei Requests gesendet?

### Problem: Battle kann nicht zugeordnet werden
**Check:**
1. `battles.challenger_id` und `battles.opponent_id` referenzieren `users.id`
2. User IDs stimmen überein? (getUserIdFromEvent() gibt gleiche ID zurück?)
3. Registration Check erfolgreich? (display_name gesetzt?)

### Problem: Username bereits vergeben
**Aktuelles Verhalten:**
- Backend prüft `display_name` Eindeutigkeit
- Gleicher User kann Re-Registrierung machen (Username ändern)
- Anderer User mit gleichem Username → Fehler `USERNAME_TAKEN`

**Hinweis:** `display_name` ist aktuell NICHT unique in DB-Schema. Eindeutigkeit wird nur per Backend-Logik geprüft.

