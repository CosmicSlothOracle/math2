# Tabellen-Verwendung: Registrierung, User-Zuordnung, Relogging & Battles

## 📋 Übersicht der Tabellen

Die App verwendet folgende Supabase-Tabellen:

1. **`users`** - Benutzerdaten (Primary Key: `id`)
2. **`battles`** - Battle-Instanzen (Primary Key: `id`, UUID)
3. **`battle_turns`** - Einzelne Spielzüge in Battles
4. **`progress`** - Fortschrittsdaten pro User/Unit
5. **`coin_ledger`** - Transaktionshistorie für Coins
6. **`messages`** - Chat-Nachrichten

---

## 🔐 1. Registrierung & User-Zuordnung

### Wie wird ein User identifiziert?

**Kernprinzip:** Jeder User hat eine **stabile User-ID**, die über Browser-Sessions hinweg erhalten bleibt.

#### Schritt 1: User-ID Generierung (`_utils.cjs` → `getUserIdFromEvent()`)

Die User-ID wird in folgender Priorität bestimmt:

```javascript
// Priorität 1: Dev Override (nur lokal)
x-dev-user Header → userId

// Priorität 2: JWT Token (Netlify Identity)
Authorization Header → JWT payload.sub/user_id/email → userId

// Priorität 3: Stabile anonyme ID (Standard)
Cookie: mm_anon_id → userId
ODER
Header: x-anon-id → userId
ODER
Neu generiert: anon_<timestamp>_<random>
```

**Wichtig:** Die anonyme ID wird als Cookie gesetzt (1 Jahr Gültigkeit), damit sie beim Relogging wieder verwendet wird.

#### Schritt 2: User in Datenbank speichern (`register.cjs`)

```sql
-- 1. Prüfe ob Username bereits existiert
SELECT id, display_name FROM users WHERE display_name = 'Max123';

-- 2. Falls existiert UND anderer User → Fehler USERNAME_TAKEN
-- 3. Falls existiert UND gleicher User → Erlaubt (Re-Registrierung)

-- 4. Upsert User (erstellt oder aktualisiert)
INSERT INTO users (id, display_name, coins)
VALUES ('anon_1234567890_abc123', 'Max123', 250)
ON CONFLICT (id)
DO UPDATE SET display_name = 'Max123';
-- Wichtig: coins werden nur gesetzt wenn User neu ist!
```

**Tabelle `users`:**
- `id` (TEXT, Primary Key) - Die stabile User-ID
- `display_name` (TEXT) - Der Username (muss ≥2 Zeichen sein)
- `coins` (INTEGER, Default: 250) - Coins des Users
- Weitere Felder: `unlocked_items`, `avatar`, `calculator_skin`, etc.

---

## 🔄 2. Relogging (Wiederanmeldung)

### Wie findet die App den richtigen User beim Relogging?

**Prozess beim App-Start:**

#### Frontend: `bootstrapServerUser()` → `GET /.netlify/functions/me`

1. **Client sendet Request:**
   ```http
   GET /.netlify/functions/me
   Headers:
     Cookie: mm_anon_id=anon_1234567890_abc123
     (ODER)
     x-anon-id: anon_1234567890_abc123
   ```

2. **Backend (`me.cjs`) extrahiert User-ID:**
   ```javascript
   const userId = getUserIdFromEvent(event);
   // → "anon_1234567890_abc123"
   ```

3. **Backend holt User aus Datenbank:**
   ```sql
   -- Upsert: Erstellt User falls nicht vorhanden, sonst aktualisiert
   INSERT INTO users (id, display_name)
   VALUES ('anon_1234567890_abc123', 'User')
   ON CONFLICT (id)
   DO UPDATE SET display_name = COALESCE(users.display_name, 'User');

   -- Hole User-Daten
   SELECT * FROM users WHERE id = 'anon_1234567890_abc123';

   -- Hole Progress
   SELECT * FROM progress WHERE user_id = 'anon_1234567890_abc123';
   ```

4. **Backend setzt Cookie (falls anon ID):**
   ```http
   Set-Cookie: mm_anon_id=anon_1234567890_abc123; Path=/; Max-Age=31536000; SameSite=Lax
   ```

5. **Frontend speichert User in LocalStorage:**
   ```javascript
   db.set('mm_current_user', user); // Nur Cache!
   ```

**Kritisch:** Die User-ID ist **stabil** über Sessions hinweg, solange:
- Cookies nicht gelöscht werden (1 Jahr Gültigkeit)
- ODER JWT Token gültig bleibt
- ODER Dev-Override verwendet wird

---

## ⚔️ 3. Battles: Wie findet man den richtigen User?

### Battle-Erstellung (`battleCreate.cjs`)

**Prozess:**

1. **User-ID extrahieren:**
   ```javascript
   const userId = getUserIdFromEvent(event);
   // → "anon_1234567890_abc123"
   ```

2. **Registration Check:**
   ```sql
   SELECT display_name FROM users WHERE id = 'anon_1234567890_abc123';

   -- Prüfung:
   -- display_name muss existieren, ≥2 Zeichen, nicht "User"
   IF display_name IS NULL OR length(display_name) < 2 OR display_name = 'User'
     → Fehler: USER_NOT_REGISTERED
   ```

3. **Coins abziehen (wenn stake > 0):**
   ```sql
   -- Via coin_ledger (Transaktionshistorie)
   INSERT INTO coin_ledger (user_id, delta, reason, ref_type)
   VALUES ('anon_1234567890_abc123', -25, 'battle_stake', 'battle');

   UPDATE users SET coins = coins - 25 WHERE id = 'anon_1234567890_abc123';
   ```

4. **Battle erstellen:**
   ```sql
   INSERT INTO battles (
     challenger_id,      -- ← userId vom Request
     opponent_id,        -- NULL für öffentliche Battles
     unit_id,
     stake,
     task_bundle,
     status
   ) VALUES (
     'anon_1234567890_abc123',
     NULL,
     'u1',
     25,
     '{"tasks": [...]}',
     'pending'
   );
   ```

**Tabelle `battles`:**
- `id` (UUID, Primary Key) - Eindeutige Battle-ID
- `challenger_id` (TEXT) - User-ID des Herausforderers → **Referenz auf `users.id`**
- `opponent_id` (TEXT, nullable) - User-ID des Gegners → **Referenz auf `users.id`**
- `status` (TEXT) - 'pending', 'accepted', 'finished'
- Weitere Felder: `stake`, `task_bundle`, `challenger_score`, `opponent_score`, etc.

### Battle-Annahme (`battleAccept.cjs`)

**Prozess:**

1. **User-ID extrahieren:**
   ```javascript
   const userId = getUserIdFromEvent(event);
   // → "anon_9876543210_xyz789" (Gegner)
   ```

2. **Registration Check** (gleicher Prozess wie oben)

3. **Battle updaten:**
   ```sql
   UPDATE battles
   SET opponent_id = 'anon_9876543210_xyz789',  -- ← userId vom Request
       status = 'accepted',
       accepted_at = NOW()
   WHERE id = '<battle-uuid>';
   ```

**Wichtig:** `opponent_id` wird mit der User-ID des annehmenden Users gesetzt.

### Battle-Submit (`battleSubmit.cjs`)

**Prozess:**

1. **User-ID extrahieren:**
   ```javascript
   const userId = getUserIdFromEvent(event);
   ```

2. **Registration Check**

3. **Berechtigung prüfen:**
   ```sql
   SELECT challenger_id, opponent_id FROM battles WHERE id = '<battle-uuid>';

   -- Nur Challenger oder Opponent dürfen submiten
   IF userId != challenger_id AND userId != opponent_id
     → Fehler: NOT_PARTICIPANT
   ```

4. **Turn speichern:**
   ```sql
   INSERT INTO battle_turns (
     battle_id,
     player_id,    -- ← userId vom Request
     is_correct,
     solve_time_ms,
     answer_payload
   ) VALUES (
     '<battle-uuid>',
     'anon_1234567890_abc123',  -- ← userId
     true,
     5000,
     '{"correctCount": 3, "totalTasks": 3, ...}'
   );
   ```

5. **Battle-Status updaten:**
   ```sql
   -- Wenn beide Spieler submitted haben:
   UPDATE battles
   SET status = 'finished',
       winner_id = '<user-id-des-gewinner>',
       challenger_score = 3,
       opponent_score = 2,
       finished_at = NOW()
   WHERE id = '<battle-uuid>';
   ```

**Tabelle `battle_turns`:**
- `id` (UUID, Primary Key)
- `battle_id` (UUID) - **Foreign Key → `battles.id`**
- `player_id` (TEXT) - **User-ID des Spielers → Referenz auf `users.id`**
- `is_correct`, `solve_time_ms`, `answer_payload`

### Battle-Liste (`battleList.cjs`)

**Wie findet man Battles für einen User?**

```sql
-- Alle Battles, an denen der User beteiligt ist:
SELECT * FROM battles
WHERE challenger_id = 'anon_1234567890_abc123'
   OR opponent_id = 'anon_1234567890_abc123'
ORDER BY created_at DESC;

-- Offene Battles (noch kein Gegner):
SELECT * FROM battles
WHERE status = 'pending'
  AND opponent_id IS NULL
  AND challenger_id != 'anon_1234567890_abc123'  -- Nicht eigene Battles
ORDER BY created_at DESC;
```

---

## 🔍 Zusammenfassung: User-Zuordnung bei Battles

### Wie findet man den richtigen User für einen Battle?

**Antwort:** Über die **User-ID** (`users.id`), die in den Battle-Tabellen referenziert wird:

1. **`battles.challenger_id`** → `users.id` (Herausforderer)
2. **`battles.opponent_id`** → `users.id` (Gegner)
3. **`battle_turns.player_id`** → `users.id` (Spieler, der einen Zug gemacht hat)

**Beispiel-Abfrage:**
```sql
-- Hole Battle mit User-Details:
SELECT
  b.*,
  challenger.display_name AS challenger_name,
  opponent.display_name AS opponent_name
FROM battles b
LEFT JOIN users challenger ON b.challenger_id = challenger.id
LEFT JOIN users opponent ON b.opponent_id = opponent.id
WHERE b.id = '<battle-uuid>';

-- Hole alle Turns eines Battles mit Spieler-Namen:
SELECT
  bt.*,
  u.display_name AS player_name
FROM battle_turns bt
JOIN users u ON bt.player_id = u.id
WHERE bt.battle_id = '<battle-uuid>';
```

### Kritische Punkte

✅ **User-ID ist stabil:** Cookie-basiert (1 Jahr) oder JWT-basiert
✅ **Registration erforderlich:** `display_name` muss ≥2 Zeichen sein
✅ **Foreign Keys:** `battles.challenger_id` und `battles.opponent_id` referenzieren `users.id`
✅ **Berechtigung:** Nur Challenger/Opponent können Battle-Submits machen

---

## 📊 Datenfluss-Diagramm

```
1. APP START
   ↓
   Cookie: mm_anon_id = "anon_123..."
   ↓
   GET /.netlify/functions/me
   ↓
   Backend: getUserIdFromEvent() → userId
   ↓
   SELECT * FROM users WHERE id = userId
   ↓
   Response: { user: {...}, progress: [...] }
   ↓
   Frontend: db.set('mm_current_user', user)

2. REGISTRIERUNG
   ↓
   POST /.netlify/functions/register { username: "Max123" }
   ↓
   Backend: getUserIdFromEvent() → userId
   ↓
   SELECT display_name FROM users WHERE display_name = "Max123"
   ↓
   IF existiert UND anderer User → USERNAME_TAKEN
   ↓
   UPSERT users (id, display_name) ON CONFLICT (id)
   ↓
   Response: { user: { id, display_name: "Max123", ... } }

3. BATTLE ERSTELLEN
   ↓
   POST /.netlify/functions/battleCreate { unitId, stake, ... }
   ↓
   Backend: getUserIdFromEvent() → userId
   ↓
   SELECT display_name FROM users WHERE id = userId
   ↓
   IF display_name < 2 Zeichen → USER_NOT_REGISTERED
   ↓
   INSERT INTO battles (challenger_id: userId, ...)
   ↓
   Response: { battle: { id, challenger_id: userId, ... } }

4. BATTLE ANNEHMEN
   ↓
   POST /.netlify/functions/battleAccept { battleId }
   ↓
   Backend: getUserIdFromEvent() → opponentUserId
   ↓
   SELECT display_name FROM users WHERE id = opponentUserId
   ↓
   IF display_name < 2 Zeichen → USER_NOT_REGISTERED
   ↓
   UPDATE battles SET opponent_id = opponentUserId WHERE id = battleId
   ↓
   Response: { battle: { challenger_id, opponent_id: opponentUserId, ... } }

5. BATTLE SUBMIT
   ↓
   POST /.netlify/functions/battleSubmit { battleId, submission }
   ↓
   Backend: getUserIdFromEvent() → userId
   ↓
   SELECT challenger_id, opponent_id FROM battles WHERE id = battleId
   ↓
   IF userId != challenger_id AND userId != opponent_id → NOT_PARTICIPANT
   ↓
   INSERT INTO battle_turns (battle_id, player_id: userId, ...)
   ↓
   IF beide Spieler submitted → UPDATE battles SET status = 'finished', winner_id = ...
   ↓
   Response: { completed: true, winnerId, ... }
```

---

## 🎯 Quick Reference

### User-ID finden
```javascript
// Backend
const userId = getUserIdFromEvent(event);
```

### User aus DB holen
```sql
SELECT * FROM users WHERE id = '<userId>';
```

### Battle für User finden
```sql
SELECT * FROM battles
WHERE challenger_id = '<userId>' OR opponent_id = '<userId>';
```

### Turns eines Battles mit User-Namen
```sql
SELECT bt.*, u.display_name
FROM battle_turns bt
JOIN users u ON bt.player_id = u.id
WHERE bt.battle_id = '<battleId>';
```

### Registration prüfen
```sql
SELECT display_name FROM users WHERE id = '<userId>';
-- display_name muss existieren, ≥2 Zeichen, nicht "User"
```



