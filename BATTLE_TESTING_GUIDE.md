# Battle System Testing Guide

## ✅ Validation Results

All **44 code validations passed**! The battle system code structure is correct.

## 🧪 Testing Methods

### Method 1: Code Validation (✅ Complete)
```bash
node test-battle-validation.mjs
```
**Result**: All 44 validations passed

### Method 2: Database Direct Test
```bash
node test-battles.mjs
```
**Requirements**:
- Set `SUPABASE_URL` and `SUPABASE_KEY` environment variables
- Or it will test dev fallback mode

### Method 3: Netlify Functions Test
```bash
# Terminal 1: Start Netlify Dev
npx netlify dev

# Terminal 2: Run function tests
node test-battle-functions.mjs
```

### Method 4: Manual Browser Testing

1. **Start Dev Server**
   ```bash
   npm run dev
   # or
   npx netlify dev
   ```

2. **Navigate to Community Tab**
   - Open http://localhost:3000 (or http://localhost:8888)
   - Click on "Community" tab
   - Scroll to "Math Battles" section

3. **Test Battle Creation**
   - Select a scenario (e.g., "Speed Polygon Duel")
   - Click "Battle hosten"
   - Verify battle appears in "Meine Battles"
   - Verify coins deducted

4. **Test Battle Acceptance**
   - Open in second browser/incognito window
   - Navigate to Community tab
   - Find your battle in "Offene Battles"
   - Click "Annehmen"
   - Verify battle status changes to "running"

5. **Test Battle Execution**
   - Both players click "Starten"
   - Complete tasks
   - Submit results
   - Verify winner determination
   - Verify coin payout

## 🗄️ Database Schema Verification

### Check if tables exist:
```sql
-- Run in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('battles', 'battle_turns');
```

### Check indexes:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('battles', 'battle_turns');
```

### Verify schema matches:
Compare `docs/supabase_schema.sql` with your Supabase schema.

## 🔍 Manual Database Test

### Create a test battle:
```sql
INSERT INTO battles (
  scenario_id, challenger_id, unit_id, unit_title,
  stake, round_count, status, task_bundle
) VALUES (
  'speed_geometry',
  'test_user_123',
  'u1',
  'Figuren verstehen',
  25,
  3,
  'pending',
  '[
    {"id": "t1", "question": "Test 1", "type": "choice"},
    {"id": "t2", "question": "Test 2", "type": "input"},
    {"id": "t3", "question": "Test 3", "type": "boolean"}
  ]'::jsonb
) RETURNING *;
```

### List open battles:
```sql
SELECT * FROM battles
WHERE status = 'pending'
AND opponent_id IS NULL
ORDER BY created_at DESC;
```

### Accept battle:
```sql
UPDATE battles
SET
  opponent_id = 'test_user_456',
  status = 'running',
  accepted_at = NOW(),
  last_event_at = NOW()
WHERE id = '<battle_id>'
RETURNING *;
```

### Submit battle results:
```sql
-- Insert turn
INSERT INTO battle_turns (
  battle_id, player_id, turn_index,
  is_correct, solve_time_ms, answer_payload
) VALUES (
  '<battle_id>',
  'test_user_123',
  0,
  true,
  45000,
  '{"correctCount": 3, "totalTasks": 3, "percentage": 100}'::jsonb
);

-- Update battle
UPDATE battles
SET
  challenger_summary = '{"correctCount": 3, "totalTasks": 3}'::jsonb,
  challenger_score = 3,
  challenger_time_ms = 45000,
  last_event_at = NOW()
WHERE id = '<battle_id>';
```

## 🐛 Troubleshooting

### Issue: "Supabase credentials not found"
**Solution**: Set environment variables:
```bash
export SUPABASE_URL="your-url"
export SUPABASE_KEY="your-key"
```

### Issue: "Network error: fetch failed"
**Solution**: Start Netlify Dev server:
```bash
npx netlify dev
```

### Issue: "Table does not exist"
**Solution**: Run schema migration:
1. Open Supabase SQL Editor
2. Copy contents of `docs/supabase_schema.sql`
3. Execute in SQL Editor

### Issue: "Function not found"
**Solution**: Verify functions exist:
```bash
ls netlify/functions/battle*.cjs
```

### Issue: "Coins not deducted"
**Solution**: Check `coin_ledger` table:
```sql
SELECT * FROM coin_ledger
WHERE user_id = '<user_id>'
ORDER BY created_at DESC
LIMIT 10;
```

## 📊 Expected Behavior

### Battle Creation
- ✅ Battle inserted into `battles` table
- ✅ Status = `pending`
- ✅ Stake coins deducted from challenger
- ✅ Entry in `coin_ledger` with reason `battle_stake`

### Battle Acceptance
- ✅ Battle status = `running`
- ✅ `accepted_at` timestamp set
- ✅ Opponent stake coins deducted
- ✅ Entry in `coin_ledger` for opponent

### Battle Submission
- ✅ Turn inserted into `battle_turns`
- ✅ Battle summary updated
- ✅ When both submit: winner determined
- ✅ Winner gets 2x stake
- ✅ Loser gets refund
- ✅ Battle status = `finished`

## 🎯 Test Checklist

- [ ] Code validation passes (44/44)
- [ ] Database tables exist
- [ ] Indexes created
- [ ] Battle creation works
- [ ] Battle acceptance works
- [ ] Battle submission works
- [ ] Winner determination correct
- [ ] Coin transactions work
- [ ] UI displays battles correctly
- [ ] Battle list filters work
- [ ] Dev fallback mode works

## 📝 Notes

- **Dev Fallback**: Functions return mock data when Supabase unavailable
- **Coin Transactions**: Check `coin_ledger` for audit trail
- **Battle States**: `pending` → `running` → `finished`
- **Winner Logic**: Score → Time → Tie (refund)

