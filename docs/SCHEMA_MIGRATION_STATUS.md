# Schema Migration Status - Was muss ausgeführt werden?

## ✅ Analyse: Welche Migrations sind noch nötig?

### Vergleich: `supabase_schema.sql` vs. Migrations

| Feature                               | `supabase_schema.sql` | Migration                                | Status                   |
| ------------------------------------- | --------------------- | ---------------------------------------- | ------------------------ |
| `unlocked_items` in `users`           | ✅ Zeile 12           | `migration_fix_schema.sql`               | ✅ **BEREITS ENTHALTEN** |
| `perfect_standard_quiz` in `progress` | ✅ Zeile 31           | `migration_add_perfect_flags.sql`        | ✅ **BEREITS ENTHALTEN** |
| `perfect_bounty` in `progress`        | ✅ Zeile 32           | `migration_add_perfect_flags.sql`        | ✅ **BEREITS ENTHALTEN** |
| `username` in `messages`              | ✅ Zeile 45           | `migration_add_username_to_messages.sql` | ✅ **BEREITS ENTHALTEN** |
| `ai_persona` in `users`               | ❌ **FEHLT**          | `migration_add_ai_columns.sql`           | ⚠️ **NOCH NÖTIG**        |
| `ai_skin` in `users`                  | ❌ **FEHLT**          | `migration_add_ai_columns.sql`           | ⚠️ **NOCH NÖTIG**        |

---

## 🎯 Empfehlung: Was muss ausgeführt werden?

### Option 1: Neues Setup (frische Datenbank)

**Nur diese Datei ausführen:**

1. ✅ `supabase_schema.sql` (enthält fast alles)
2. ✅ `migration_add_ai_columns.sql` (fügt fehlende AI-Spalten hinzu)

**Oder:** Aktualisiertes Schema verwenden (siehe unten)

---

### Option 2: Bestehende Datenbank aktualisieren

**Prüfe zuerst, welche Spalten fehlen:**

```sql
-- Prüfe ob ai_persona und ai_skin in users existieren
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('ai_persona', 'ai_skin');

-- Prüfe ob unlocked_items existiert
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'unlocked_items';

-- Prüfe ob perfect_* Spalten in progress existieren
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'progress'
  AND column_name IN ('perfect_standard_quiz', 'perfect_bounty');

-- Prüfe ob username in messages existiert
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name = 'username';
```

**Dann führe nur die fehlenden Migrations aus:**

- ❌ `migration_fix_schema.sql` - **NICHT nötig** (wenn `unlocked_items` existiert)
- ❌ `migration_add_perfect_flags.sql` - **NICHT nötig** (wenn `perfect_*` Spalten existieren)
- ❌ `migration_add_username_to_messages.sql` - **NICHT nötig** (wenn `username` existiert)
- ✅ `migration_add_ai_columns.sql` - **NUR DIESE** (wenn `ai_persona`/`ai_skin` fehlen)

---

## 🔧 Lösung: Aktualisiertes Schema erstellen

**Besser:** Aktualisiere `supabase_schema.sql`, damit es alles enthält, dann brauchst du nur noch diese eine Datei.

Siehe: `supabase_schema_complete.sql` (wird erstellt)

---

## 📋 Quick Check: Welche Migrations wurden bereits ausgeführt?

Führe diese Query aus, um zu sehen, was fehlt:

```sql
-- Vollständiger Check aller benötigten Spalten
SELECT
  'users' as table_name,
  column_name,
  CASE
    WHEN column_name IN ('unlocked_items', 'ai_persona', 'ai_skin') THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('unlocked_items', 'ai_persona', 'ai_skin')

UNION ALL

SELECT
  'progress' as table_name,
  column_name,
  CASE
    WHEN column_name IN ('perfect_standard_quiz', 'perfect_bounty') THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.columns
WHERE table_name = 'progress'
  AND column_name IN ('perfect_standard_quiz', 'perfect_bounty')

UNION ALL

SELECT
  'messages' as table_name,
  column_name,
  CASE
    WHEN column_name = 'username' THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name = 'username';
```

---

## 🚀 Empfohlene Vorgehensweise

### Für neue Datenbank

1. Führe `supabase_schema.sql` aus
2. Führe `migration_add_ai_columns.sql` aus
3. Fertig!

### Für bestehende Datenbank

1. Führe den "Quick Check" aus (siehe oben)
2. Führe nur die Migrations aus, die fehlende Spalten hinzufügen
3. In den meisten Fällen: Nur `migration_add_ai_columns.sql` nötig


