# Deployment Checklist - Battle System with Registration

## ✅ Pre-Deployment Validation

### Code Structure
- [x] All battle functions exist and are properly structured
- [x] Registration function created and tested
- [x] TypeScript types defined
- [x] UI components integrated
- [x] No linter errors

### Functions to Deploy
- [x] `netlify/functions/battleCreate.cjs` - Creates battles (requires registration)
- [x] `netlify/functions/battleAccept.cjs` - Accepts battles (requires registration)
- [x] `netlify/functions/battleSubmit.cjs` - Submits battle results (requires registration)
- [x] `netlify/functions/battleList.cjs` - Lists battles
- [x] `netlify/functions/register.cjs` - User registration endpoint

### Database Schema
- [x] `battles` table defined in `docs/supabase_schema.sql`
- [x] `battle_turns` table defined
- [x] Indexes created for performance
- [x] Foreign key constraints in place

### Frontend Integration
- [x] `AuthScreen` updated to register users
- [x] `BattlePanel` shows registration prompts
- [x] Error handling for registration failures
- [x] Registration checks in battle handlers

## 🔧 Deployment Steps

### 1. Database Migration
```sql
-- Run in Supabase SQL Editor
-- Copy contents from docs/supabase_schema.sql
```

**Required Tables:**
- `users` (already exists)
- `battles` (new)
- `battle_turns` (new)
- `coin_ledger` (already exists)

**Required Indexes:**
- `idx_battles_challenger`
- `idx_battles_opponent`
- `idx_battles_status`
- `idx_battles_status_opponent`
- `idx_battles_unit`
- `idx_battles_created_at`
- `idx_battle_turns_battle`
- `idx_battle_turns_player`

### 2. Environment Variables
Ensure these are set in Netlify:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`)

### 3. Function Deployment
All functions are in `netlify/functions/` and will be automatically deployed:
- `battleCreate.cjs`
- `battleAccept.cjs`
- `battleSubmit.cjs`
- `battleList.cjs`
- `register.cjs`

### 4. Frontend Build
```bash
npm run build
```

### 5. Test After Deployment

#### Registration Test
1. Open app in browser
2. Enter username (2-30 chars)
3. Click "Registrieren & Starten"
4. Verify user is created

#### Battle Creation Test
1. Navigate to Community tab
2. Select a battle scenario
3. Click "Battle hosten"
4. Verify battle is created
5. Verify coins are deducted

#### Battle Acceptance Test
1. Open in second browser/incognito
2. Register different user
3. Navigate to Community tab
4. Find open battle
5. Click "Annehmen"
6. Verify battle status changes to "running"

#### Battle Submission Test
1. Both players complete battle
2. Submit results
3. Verify winner determination
4. Verify coin payouts

## 🐛 Known Issues / Notes

### Dev Fallback Mode
- Functions return mock data when Supabase is unavailable
- This allows local development without database

### Registration Requirements
- Username must be 2-30 characters
- Username must be unique
- Required before any battle interaction

### Coin Transactions
- Stakes are deducted when battle is created/accepted
- Winner gets 2x stake
- Loser gets refund
- Ties result in full refund for both

## 📋 Post-Deployment Verification

- [ ] Registration works
- [ ] Battle creation works
- [ ] Battle acceptance works
- [ ] Battle submission works
- [ ] Winner determination works
- [ ] Coin transactions work
- [ ] Error messages are user-friendly
- [ ] UI shows registration prompts correctly

## 🚀 Deployment Command

```bash
# Build and deploy
npm run build
netlify deploy --prod

# Or if using Git integration
git add .
git commit -m "Add battle system with user registration"
git push
```
