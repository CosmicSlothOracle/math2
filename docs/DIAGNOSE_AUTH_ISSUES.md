# Diagnose Authentication Issues

## Problem
User cannot log in after registration, getting "username must be at least 2 characters" error even though valid values were entered.

## Steps to Diagnose

### 1. Check Supabase Database Schema

Run this in Supabase SQL Editor:

```sql
-- Check if login_name column exists
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('login_name', 'display_name');

-- Check for constraints on display_name
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND (conname LIKE '%display%' OR conname LIKE '%username%' OR conname LIKE '%name%');

-- Check if any users have login_name set
SELECT id, display_name, login_name, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Check Netlify Function Logs

Look for:
- `[register] Attempting upsert with payload:` - Should show the data being saved
- `[register] Upsert successful, result:` - Should show what was actually saved
- `[register] Upsert error:` - Any database errors

### 3. Verify Supabase Connection

Check if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Netlify environment variables.

### 4. Test Registration Directly

Try registering with:
- Display Name: "TestUser123" (12 characters)
- Login Name: "testlogin123" (12 characters)

Then check in Supabase if the user was created:
```sql
SELECT * FROM users WHERE login_name = 'testlogin123';
```

### 5. Common Issues

#### Issue: Column doesn't exist
**Solution**: Run the migration script `docs/migration_add_login_name.sql` in Supabase SQL Editor.

#### Issue: RLS (Row Level Security) blocking writes
**Solution**: Check if RLS is enabled on `users` table. If yes, either:
- Disable RLS for now (for testing)
- Or create policies that allow inserts/updates

#### Issue: Unique constraint violation
**Solution**: The `login_name` must be unique. Try a different login name.

#### Issue: Permission denied
**Solution**: Check if the `SUPABASE_ANON_KEY` has write permissions. You might need to use the service role key for server-side operations.

