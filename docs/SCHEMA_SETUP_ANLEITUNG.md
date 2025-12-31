# Schema Setup - Kurzanleitung

## ✅ Antwort auf deine Frage

**Nein, nicht alle Dateien müssen ausgeführt werden!**

### Für eine NEUE Datenbank (empfohlen):

**Nur diese EINE Datei ausführen:**
```
✅ docs/supabase_schema.sql
```

Das aktualisierte Schema enthält jetzt **alle** benötigten Spalten:
- ✅ `unlocked_items` (war schon drin)
- ✅ `perfect_standard_quiz` / `perfect_bounty` (waren schon drin)
- ✅ `username` in messages (war schon drin)
- ✅ `ai_persona` / `ai_skin` (neu hinzugefügt)

**Die Migrations sind NICHT nötig**, wenn du `supabase_schema.sql` ausführst!

---

### Für eine BESTEHENDE Datenbank:

**Prüfe zuerst, was fehlt:**

```sql
-- Führe diese Query im Supabase SQL Editor aus
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'ai_persona'
    ) THEN '✅ ai_persona vorhanden'
    ELSE '❌ ai_persona FEHLT'
  END as ai_persona_status,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'ai_skin'
    ) THEN '✅ ai_skin vorhanden'
    ELSE '❌ ai_skin FEHLT'
  END as ai_skin_status;
```

**Dann führe nur aus, was fehlt:**

- Wenn `ai_persona` oder `ai_skin` fehlen → `migration_add_ai_columns.sql`
- Die anderen Migrations sind **nicht nötig** (Spalten existieren bereits)

---

## 📋 Zusammenfassung

| Datei | Für neue DB? | Für bestehende DB? |
|-------|--------------|-------------------|
| `supabase_schema.sql` | ✅ **JA** (alles drin) | ❌ Nein (würde Tabellen neu erstellen) |
| `migration_fix_schema.sql` | ❌ Nicht nötig | ❌ Nicht nötig (wenn `unlocked_items` existiert) |
| `migration_add_perfect_flags.sql` | ❌ Nicht nötig | ❌ Nicht nötig (wenn `perfect_*` existiert) |
| `migration_add_username_to_messages.sql` | ❌ Nicht nötig | ❌ Nicht nötig (wenn `username` existiert) |
| `migration_add_ai_columns.sql` | ❌ Nicht nötig | ✅ **Nur wenn** `ai_persona`/`ai_skin` fehlen |

---

## 🚀 Empfohlene Vorgehensweise

### Szenario 1: Neue Datenbank
1. Gehe zu Supabase Dashboard → SQL Editor
2. Kopiere **nur** `supabase_schema.sql`
3. Klicke "Run"
4. Fertig! ✅

### Szenario 2: Bestehende Datenbank
1. Führe die Check-Query aus (siehe oben)
2. Wenn `ai_persona`/`ai_skin` fehlen → Führe `migration_add_ai_columns.sql` aus
3. Fertig! ✅

---

## ⚠️ Wichtig

**`supabase_schema.sql` verwendet `CREATE TABLE IF NOT EXISTS`** - das bedeutet:
- Wenn Tabellen bereits existieren, werden sie **NICHT** überschrieben
- Fehlende Spalten werden **NICHT** automatisch hinzugefügt
- Für bestehende Datenbanken: Verwende die Migrations!

**Für bestehende Datenbanken:** Die Migrations sind idempotent (können mehrfach ausgeführt werden) dank `ADD COLUMN IF NOT EXISTS`.



