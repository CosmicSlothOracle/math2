# Fix: Coins werden auf 0 gesetzt statt 250

## Problem
Neue User starteten mit 0 Coins statt 250 Coins. Dies passierte an mehreren Stellen:

1. **me.cjs**: Beim Upsert wurde `coins: 0` für neue User gesetzt
2. **apiService.ts**: Fallback-Werte waren 0 statt 250
3. **src/services/apiService.ts**: Gleiche Probleme
4. **Supabase Schema**: Default-Wert in DB war 0 statt 250

## Lösung

### 1. me.cjs (User Bootstrap)
- ✅ Zeile 139: `upsertPayload.coins = 250` (statt 0) für neue User
- ✅ Zeile 184: Fallback `coins: 250` (statt 0)

### 2. services/apiService.ts
- ✅ Zeile 48: `getCurrentUser()` setzt jetzt 250 statt 0 wenn coins undefined
- ✅ Zeile 298: `bootstrapServerUser()` setzt jetzt 250 statt 0 für neue User

### 3. src/services/apiService.ts
- ✅ Zeile 65: `getCurrentUser()` setzt jetzt 250 statt 0
- ✅ Zeile 150-151: Fallback-Werte sind jetzt 250 statt 0
- ✅ Zeile 179: Neue User bekommen 250 statt 0

### 4. docs/supabase_schema.sql
- ✅ Zeile 11: Default-Wert in DB ist jetzt 250 statt 0

## Verhalten nach Fix

- **Neue User**: Starten mit 250 Coins
- **Bestehende User**: Behalten ihre aktuellen Coins
- **User ohne Coins-Wert**: Bekommen 250 Coins (statt 0)
- **DB Default**: Neue Einträge ohne expliziten Wert bekommen 250

## Wichtig

Wenn die Supabase-Datenbank bereits existiert, muss das Schema aktualisiert werden:

```sql
ALTER TABLE users ALTER COLUMN coins SET DEFAULT 250;
```

Falls bereits User mit 0 Coins existieren, können diese manuell aktualisiert werden:

```sql
UPDATE users SET coins = 250 WHERE coins = 0 OR coins IS NULL;
```

