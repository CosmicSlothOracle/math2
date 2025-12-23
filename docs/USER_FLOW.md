# User Flow - Wie funktioniert die App für einen neuen User?

Diese Dokumentation erklärt Schritt für Schritt, was passiert, wenn ein neuer User die App nutzt.

---

## 🎯 Übersicht: Zwei-Wege-System

Die App funktioniert mit einem **Hybrid-System**:
1. **Client-seitig**: LocalStorage für schnelle UI-Updates (Cache)
2. **Server-seitig**: Supabase für persistente Daten (Single Source of Truth)

---

## 📋 Schritt 1: Erster Besuch / Login

### Was der User sieht:
- User öffnet `https://realer-math.netlify.app`
- Login-Screen erscheint
- User gibt Username ein (z.B. "Max123")

### Was technisch passiert:

#### 1.1 Client-seitiger Login (`AuthService.login`)
```typescript
// services/apiService.ts
AuthService.login("Max123")
```

**Ablauf:**
1. Prüft LocalStorage (`mm_users`) ob User existiert
2. **Wenn NEIN** (neuer User):
   - Erstellt lokalen User-Objekt:
     ```javascript
     {
       id: "abc123xyz",  // Random ID (temporär!)
       username: "Max123",
       coins: 250,
       completedUnits: [],
       // ... weitere Felder
     }
     ```
   - Speichert in LocalStorage (`mm_users`, `mm_current_user`)
3. **Wenn JA** (bestehender User):
   - Lädt User aus LocalStorage

**Wichtig:** Diese ID ist **temporär** und wird später durch Server-ID ersetzt!

---

## 📋 Schritt 2: Bootstrap-Prozess (App-Start)

### Was technisch passiert:

#### 2.1 App lädt (`App.tsx` useEffect)
```typescript
// src/App.tsx Zeile 3495-3518
useEffect(() => {
  const res = await bootstrapServerUser();
  // ...
}, []);
```

#### 2.2 `bootstrapServerUser()` wird aufgerufen
```typescript
// services/apiService.ts Zeile 184-305
bootstrapServerUser()
```

**Ablauf:**

1. **Client liest anonyme ID** (Cookie oder LocalStorage):
   ```javascript
   // Versucht Cookie zu lesen: mm_anon_id
   // Falls nicht vorhanden: liest localStorage.getItem('mm_anon_id')
   // Falls nicht vorhanden: null (Server generiert neue)
   ```

2. **Client sendet Request an `/me` Function**:
   ```http
   GET /.netlify/functions/me
   Headers:
     x-anon-id: <cookie-value oder null>
   ```

3. **Server (`me.js`) verarbeitet Request**:

   **a) User-ID bestimmen** (`_utils.js`):
   ```javascript
   // Priorität:
   // 1. x-dev-user Header (nur für lokales Testing)
   // 2. Authorization JWT (Netlify Identity - falls eingeloggt)
   // 3. Anonyme ID aus Cookie/Header (für anonyme User)
   ```

   **b) Wenn keine anonyme ID vorhanden:**
   ```javascript
   // Server generiert neue stabile ID:
   userId = "anon_1704123456789_abc123"
   // Format: anon_<timestamp>_<random>
   ```

   **c) Supabase Query:**
   ```sql
   -- Prüft ob User existiert
   SELECT * FROM users WHERE id = 'anon_1704123456789_abc123';

   -- Falls nicht vorhanden: INSERT
   INSERT INTO users (id, display_name, coins, created_at)
   VALUES ('anon_1704123456789_abc123', 'User', 0, NOW());

   -- Lädt Progress
   SELECT * FROM progress WHERE user_id = 'anon_...';
   ```

   **d) Server Response:**
   ```json
   {
     "ok": true,
     "user": {
       "id": "anon_1704123456789_abc123",  // ← Server-ID!
       "coins": 0,
       "completedUnits": [],
       "perfectStandardQuizUnits": [],
       // ...
     },
     "progress": [
       {
         "unit_id": "u1",
         "quest_completed_count": 0,
         "perfect_standard_quiz": false
       }
     ]
   }
   ```

   **e) Set-Cookie Header:**
   ```http
   Set-Cookie: mm_anon_id=anon_1704123456789_abc123; Path=/; Max-Age=31536000; SameSite=Lax
   ```

4. **Client verarbeitet Response**:

   **a) Speichert anonyme ID:**
   ```javascript
   // Liest Set-Cookie Header
   // Speichert in localStorage: mm_anon_id = "anon_..."
   ```

   **b) Merge-Logik** (wenn lokaler User existiert):
   ```javascript
   // Server-Werte sind AUTHORITATIV für:
   // - coins (Server sagt: 0, nicht lokale 250!)
   // - totalEarned

   // Arrays werden gemerged:
   // - completedUnits: Server || Lokal
   // - perfectStandardQuizUnits: Server || Lokal

   // Lokale temporäre ID wird durch Server-ID ersetzt!
   ```

   **c) UI Update:**
   ```javascript
   setUser(mergedUser);  // React State Update
   ```

---

## 📋 Schritt 3: User macht ein Quiz

### Was der User sieht:
- Wählt eine Unit aus (z.B. "Geometrie - Dreiecke")
- Startet Standard-Quiz
- Beantwortet alle Fragen perfekt (keine Fehler)
- Quiz wird abgeschlossen

### Was technisch passiert:

#### 3.1 Quiz-Abschluss (`handleQuestComplete`)
```typescript
// src/App.tsx Zeile 3566-3587
const { updatedUser, coinsAwarded } = await QuestService.completeStandardQuest(
  user,
  unitId,
  coinsReward,
  isPerfectRun
);
```

#### 3.2 `QuestService.completeStandardQuest()` (`questService.ts`)

**Ablauf:**

1. **Client-seitige Cap-Logik** (`economyService.ts`):
   ```javascript
   // Prüft ob User bereits Coins für diese Unit verdient hat
   // MAX_QUEST_COINS_PER_UNIT = 50 (Beispiel)
   // Wenn bereits 50 Coins → awarded = 0
   ```

2. **Coins anpassen** (`coinsAdjust` Function):
   ```http
   POST /.netlify/functions/coinsAdjust
   Headers:
     x-anon-id: anon_1704123456789_abc123
   Body:
     {
       "delta": 50,
       "reason": "quest_reward",
       "refType": "unit",
       "refId": "u1"
     }
   ```

   **Server (`coinsAdjust.js`):**
   ```javascript
   // 1. Liest aktuelle Coins aus DB
   SELECT coins FROM users WHERE id = 'anon_...';
   // Ergebnis: coins = 0

   // 2. Berechnet neue Coins
   newCoins = Math.max(0, 0 + 50) = 50
   applied = 50

   // 3. Update DB
   UPDATE users SET coins = 50 WHERE id = 'anon_...';

   // 4. Insert Ledger (optional, non-fatal)
   INSERT INTO coin_ledger (user_id, delta, reason, ...)
   VALUES ('anon_...', 50, 'quest_reward', ...);

   // 5. Response
   {
     "ok": true,
     "coins": 50,
     "applied": 50,
     "userId": "anon_..."
   }
   ```

3. **Progress speichern** (`progressSave` Function):
   ```http
   POST /.netlify/functions/progressSave
   Headers:
     x-anon-id: anon_1704123456789_abc123
   Body:
     {
       "unitId": "u1",
       "questCoinsEarned": 50,
       "questCompletedCount": 1,
       "bountyCompleted": false,
       "perfectStandardQuiz": true,  // ← Wichtig!
       "perfectBounty": false
     }
   ```

   **Server (`progressSave.js`):**
   ```javascript
   // Upsert in progress Tabelle
   INSERT INTO progress (
     user_id, unit_id, quest_coins_earned,
     quest_completed_count, perfect_standard_quiz, ...
   ) VALUES (
     'anon_...', 'u1', 50, 1, true, ...
   )
   ON CONFLICT (user_id, unit_id)
   DO UPDATE SET
     quest_coins_earned = 50,
     quest_completed_count = 1,
     perfect_standard_quiz = true,  // ← Wichtig für Bounty Unlock!
     updated_at = NOW();
   ```

4. **Client aktualisiert UI:**
   ```javascript
   // updatedUser hat:
   // - coins: 50 (von Server)
   // - completedUnits: ["u1"]
   // - perfectStandardQuizUnits: ["u1"]  // ← Für Bounty Unlock!

   setUser(updatedUser);
   addToast("Quiz perfekt! +50 Coins", "success");
   ```

---

## 📋 Schritt 4: Bounty Unlock

### Was der User sieht:
- Nach Perfect Standard Quiz
- Bounty-Button wird **unlocked** (nicht mehr grau)
- User kann Bounty starten

### Was technisch passiert:

#### 4.1 Lock-Logik (`isBountyLocked`)
```typescript
// Irgendwo in App.tsx
const isBountyLocked = !user.perfectStandardQuizUnits?.includes(unitId);
```

**Ablauf:**
1. UI prüft `user.perfectStandardQuizUnits` Array
2. Wenn `unitId` enthalten → **unlocked**
3. Wenn nicht enthalten → **locked**

#### 4.2 Datenfluss:
```
Perfect Quiz → progressSave(perfectStandardQuiz: true)
            → DB: progress.perfect_standard_quiz = true
            → me.js lädt Progress
            → Rekonstruiert perfectStandardQuizUnits Array
            → UI zeigt Bounty als unlocked
```

---

## 📋 Schritt 5: Reload / Neuer Tab

### Was technisch passiert:

#### 5.1 User lädt Seite neu:
```javascript
// 1. LocalStorage hat noch User-Daten (Cache)
// 2. App startet bootstrapServerUser()
// 3. Server lädt aktuelle Daten aus Supabase
// 4. Merge: Server-Werte überschreiben lokale Werte
// 5. UI zeigt Server-Werte an
```

**Wichtig:**
- **Coins**: Server-Wert ist autoritativ (keine lokale Berechnung)
- **Progress**: Server-Werte werden gemerged
- **Perfect Flags**: Werden aus DB rekonstruiert

#### 5.2 Anonyme ID bleibt erhalten:
```javascript
// Cookie: mm_anon_id=anon_1704123456789_abc123
// → Server erkennt User wieder
// → Gleiche User-ID in allen Requests
```

---

## 📋 Schritt 6: Chat-Nachricht senden

### Was technisch passiert:

#### 6.1 User sendet Nachricht:
```http
POST /.netlify/functions/chatSend
Headers:
  x-anon-id: anon_1704123456789_abc123
Body:
  {
    "text": "Hallo!",
    "channelId": "class:global",
    "username": "Max123"
  }
```

#### 6.2 Server (`chatSend.js`):
```javascript
// Insert in messages Tabelle
INSERT INTO messages (channel_id, sender_id, username, text, created_at)
VALUES ('class:global', 'anon_...', 'Max123', 'Hallo!', NOW());

// Response
{
  "ok": true,
  "message": { id: "...", text: "Hallo!", ... },
  "userId": "anon_..."
}
```

#### 6.3 Client (`chatPoll`):
```http
GET /.netlify/functions/chatPoll?channelId=class:global
Headers:
  x-anon-id: anon_1704123456789_abc123
```

**Server lädt alle Messages:**
```sql
SELECT * FROM messages
WHERE channel_id = 'class:global'
ORDER BY created_at ASC
LIMIT 200;
```

---

## 🔄 Zusammenfassung: Datenfluss

```
┌─────────────┐
│   Browser   │
│ (Client)    │
└──────┬──────┘
       │
       │ 1. Login (lokal)
       ▼
┌─────────────────┐
│  LocalStorage   │
│  - mm_users     │
│  - mm_anon_id   │
└──────┬──────────┘
       │
       │ 2. Bootstrap (/me)
       ▼
┌─────────────────┐
│  Netlify        │
│  Functions      │
│  - /me          │
│  - coinsAdjust  │
│  - progressSave │
│  - chatSend     │
└──────┬──────────┘
       │
       │ 3. Supabase Queries
       ▼
┌─────────────────┐
│   Supabase      │
│   (Postgres)    │
│   - users       │
│   - progress    │
│   - messages    │
│   - coin_ledger │
└─────────────────┘
```

---

## 🎯 Wichtige Punkte

### 1. **Anonyme ID ist stabil**
- Wird einmal generiert (Server)
- Wird als Cookie gespeichert (1 Jahr Gültigkeit)
- Wird auch in LocalStorage gesichert (Backup)
- Bleibt über Reloads/Tabs hinweg erhalten

### 2. **Server ist Single Source of Truth**
- Coins: Server-Wert ist autoritativ
- Progress: Server-Werte werden gemerged
- Lokale Werte sind nur Cache

### 3. **Dev-Fallback Detection**
- Wenn Supabase nicht verfügbar → Banner oben
- User sieht: "⚠️ Backend offline / Dev Fallback"
- Daten werden nicht persistiert

### 4. **NaN Prevention**
- Alle numerischen Werte werden validiert (`Number.isFinite()`)
- Default-Werte: `coins: 0`, `totalEarned: 0`, `xp: 0`
- Server-Responses werden validiert bevor Verwendung

---

## 🐛 Troubleshooting

### Problem: User-ID ändert sich bei jedem Reload
**Ursache:** Cookie wird nicht gesetzt oder nicht gelesen
**Lösung:** Prüfe Browser-Console für Cookie-Warnings, prüfe CORS-Header

### Problem: Coins werden nicht gespeichert
**Ursache:** Supabase nicht konfiguriert oder dev-fallback aktiv
**Lösung:** Prüfe Netlify Env Vars, prüfe Banner oben

### Problem: Bounty bleibt locked nach Perfect Quiz
**Ursache:** `perfectStandardQuiz` Flag wird nicht gespeichert
**Lösung:** Prüfe `progressSave` Response, prüfe DB `progress.perfect_standard_quiz`

---

## 📚 Weitere Dokumentation

- `PROBLEMS.md` - Bekannte Bugs und Fixes
- `SELF_CHECK.md` - Test-Anleitung
- `RELEASE_CHECKLIST.md` - Deployment-Checkliste
- `docs/supabase_schema.sql` - Datenbank-Schema

