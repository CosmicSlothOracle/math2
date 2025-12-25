# 🔍 Diagnose-Report: Supabase Persistenz-Probleme

## Symptome (vom User berichtet)
- ❌ Shop-Käufe nicht möglich
- ❌ Coins sammeln nicht möglich
- ❌ User ist immer NaN
- ❌ Keine Persistenz für Progress
- ✅ Chat-Nachrichten werden korrekt geschrieben

## Root Cause Analyse

### Beweis aus Query-Statistiken:
| Tabelle | Queries | Status |
|---------|---------|--------|
| `messages` | 3222 | ✅ Funktioniert |
| `users` | 0 | ❌ Keine Queries! |
| `progress` | 0 | ❌ Keine Queries! |
| `coin_ledger` | 0 | ❌ Keine Queries! |

### Warum Chat funktioniert, aber nichts anderes:

**`chatSend.cjs`** macht nur einen einfachen INSERT:
```javascript
const payload = { channel_id, sender_id, username, text };
await supabase.from('messages').insert(payload).select();
```
→ Kein SELECT vorher, keine komplexen Spalten = funktioniert!

**`shopBuy.cjs`** versucht `unlocked_items` zu lesen:
```javascript
const { data } = await supabase
  .from('users')
  .select('coins, unlocked_items')  // ← PROBLEM!
  .eq('id', userId);
```
→ Spalte `unlocked_items` existiert nicht = Query schlägt fehl!

### Das Problem in einem Satz:
> Die `users`-Tabelle hat nur `id`, `display_name`, `coins`, `created_at` - aber der Code erwartet auch `unlocked_items`.

## Schema-Diskrepanz

### Erwartetes Schema (laut Code):
```sql
CREATE TABLE users (
  id text PRIMARY KEY,
  display_name text,
  coins int DEFAULT 250,
  unlocked_items text[] DEFAULT ARRAY[]::text[],  -- ← FEHLT!
  created_at timestamp with time zone DEFAULT now()
);
```

### Aktuelles Schema (laut Screenshot):
```sql
CREATE TABLE users (
  id text PRIMARY KEY,
  display_name text,
  coins int4,
  created_at timestamptz
);
```

## Lösungs-Schritte

### Schritt 1: Migration ausführen
Führe `docs/migration_fix_schema.sql` im Supabase SQL Editor aus.

### Schritt 2: Verifizieren
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
```
Erwartete Spalten: `id`, `display_name`, `coins`, `unlocked_items`, `created_at`

### Schritt 3: Test
```bash
node tests/supabase-diagnostic.mjs https://realer-math.netlify.app
```

## Alternative: Supabase Auth nutzen?

Du hast gefragt ob Auth/Identity einfacher wäre. Hier meine Einschätzung:

### Vorteile von Supabase Auth:
- Stabile User-IDs (kein Cookie/LocalStorage-Problem)
- Eingebaute Session-Verwaltung
- RLS-Policies können User automatisch identifizieren

### Nachteile:
- Erfordert Login-UI (Email/Password oder OAuth)
- Komplexere Implementierung
- Benutzer müssen sich registrieren

### Meine Empfehlung:
**Erst das aktuelle Problem fixen** (Migration ausführen), dann funktioniert alles.
Supabase Auth ist nur nötig wenn du echte User-Accounts willst.

Das anonyme System funktioniert, sobald:
1. Das Schema vollständig ist (Migration)
2. Die User-ID konsistent übergeben wird (x-anon-id Header)

## Checkliste

- [ ] Migration `docs/migration_fix_schema.sql` ausführen
- [ ] Prüfen ob `unlocked_items` Spalte existiert
- [ ] App testen: Shop-Kauf versuchen
- [ ] App testen: Quest abschließen, Coins prüfen
- [ ] Diagnostic Script ausführen für vollständigen Test

