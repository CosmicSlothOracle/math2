-- ============================================================
-- MIGRATION: Fix Schema für Shop/Coins/Progress Probleme
-- ============================================================
--
-- PROBLEM:
-- - Shop-Käufe nicht möglich
-- - Coins sammeln nicht möglich
-- - User ist immer NaN
-- - Keine Persistenz für Progress
-- - Chat funktioniert (einziges was geht)
--
-- URSACHE:
-- Die users-Tabelle fehlt die 'unlocked_items' Spalte, die shopBuy.cjs erwartet.
-- Wenn shopBuy versucht auf unlocked_items zuzugreifen, schlägt der Query fehl
-- und die Function gibt einen 500 Error zurück.
--
-- AUSFÜHREN:
-- 1. Gehe zu Supabase Dashboard → SQL Editor
-- 2. Kopiere diesen gesamten Inhalt
-- 3. Klicke "Run"
-- ============================================================

-- 1. Füge 'unlocked_items' Spalte zur users-Tabelle hinzu
-- Das ist die HAUPTURSACHE für Shop-Fehler!
ALTER TABLE users ADD COLUMN IF NOT EXISTS unlocked_items text[] DEFAULT ARRAY[]::text[];

-- 2. Stelle sicher dass coins einen sinnvollen Default hat (verhindert NaN)
ALTER TABLE users ALTER COLUMN coins SET DEFAULT 250;

-- 3. Update existierende User ohne coins auf 250 (verhindert NaN)
UPDATE users SET coins = 250 WHERE coins IS NULL OR coins = 0;

-- 4. Stelle sicher dass unlocked_items nie NULL ist (verhindert Fehler)
UPDATE users SET unlocked_items = ARRAY[]::text[] WHERE unlocked_items IS NULL;

-- 5. Prüfe ob progress-Tabelle die perfect_* Spalten hat
-- (Diese sollten schon existieren durch migration_add_perfect_flags.sql)
ALTER TABLE progress ADD COLUMN IF NOT EXISTS perfect_standard_quiz boolean DEFAULT false;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS perfect_bounty boolean DEFAULT false;

-- ============================================================
-- VERIFICATION: Prüfe ob alles geklappt hat
-- ============================================================

-- Zeige users-Schema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Zeige progress-Schema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'progress'
ORDER BY ordinal_position;

-- Zeige erste 5 Users (prüfe ob coins nicht NULL sind)
SELECT id, display_name, coins, unlocked_items, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

