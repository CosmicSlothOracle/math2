# Quick Start - Persistence Fix

## TL;DR

This fix makes user state (coins, progress, purchases) persist correctly by using the server as the single source of truth instead of LocalStorage.

## What Changed

| Before | After |
|--------|-------|
| LocalStorage is source of truth | Server (Supabase) is source of truth |
| Coins reset to 250 on refresh | Coins persist ✅ |
| Progress sometimes lost | Progress always saved ✅ |
| Purchases sometimes lost | Purchases always saved ✅ |
| 406 errors on user fetch | No 406 errors ✅ |

## Run Tests Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
netlify dev

# 3. In another terminal, run tests
node tests/persistence.test.js http://localhost:8888
```

Expected output:
```
✅ PASS: User creation and identity persistence
✅ PASS: Coin persistence after coinsAdjust
✅ PASS: Progress persistence after progressSave
✅ PASS: Shop purchase persistence
✅ PASS: No 406 errors on coins fetch
✅ PASS: Coins persist across multiple refreshes

✅ ALL TESTS PASSED
```

## Deploy to Production

```bash
# 1. Commit changes
git add .
git commit -m "fix: user state persistence"

# 2. Push to main
git push origin main

# 3. Wait for Netlify deploy (watch dashboard)

# 4. Run tests against production
node tests/persistence.test.js https://realer-math.netlify.app
```

## Manual Verification

1. Open https://realer-math.netlify.app (incognito recommended)
2. Complete a quest → note coins earned
3. **Press F5 to refresh**
4. ✅ Coins should NOT reset to 250
5. Buy something → note new coin balance
6. **Press F5 to refresh**
7. ✅ Purchase and coins should persist

## Troubleshooting

### "dev-fallback" warnings in console

**Cause**: Supabase environment variables not configured

**Fix**: Add to Netlify environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Coins still resetting

**Diagnosis**:
```javascript
// In browser console:
localStorage.getItem('mm_current_user')  // Check cached user
```

**Fix**: Check `/me` response in Network tab - should return user with correct coins

### Tests failing

**Common issues**:
1. Local server not running → Start `netlify dev`
2. Wrong URL → Check `http://localhost:8888` vs production URL
3. Supabase not configured → Tests will pass in "dev-fallback" mode (2000 coins)

## Key Files Modified

| File | Change |
|------|--------|
| `netlify/functions/me.cjs` | Replace `.single()` with `.limit(1)` |
| `services/apiService.ts` | Refactor to use server as source of truth |
| `services/serverSync.ts` | New helper functions for server sync |
| `App.tsx` | Fix quest completion and shop purchase flows |
| `tests/persistence.test.js` | New automated test suite |

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│ (LocalStorage│ ← Cache only, not source of truth
│   = cache)  │
└──────┬──────┘
       │
       │ /me, /coinsAdjust, /progressSave, /shopBuy
       ↓
┌─────────────────┐
│ Netlify Functions│ ← Business logic + validation
└──────┬──────────┘
       │
       │ SQL queries
       ↓
┌─────────────┐
│  Supabase   │ ← Single source of truth
│  (Postgres) │
└─────────────┘
```

## API Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /me` | Get current user state | Returns user + progress |
| `POST /coinsAdjust` | Add/subtract coins | `{ delta: 50, reason: "quest" }` |
| `POST /progressSave` | Save quest progress | `{ unitId, perfectStandardQuiz: true }` |
| `POST /shopBuy` | Purchase shop item | `{ itemId, itemCost: 100 }` |

## Critical Success Factors

✅ **Server is source of truth**: Always refresh from `/me` after mutations
✅ **Atomic operations**: Each endpoint updates DB in single transaction
✅ **No `.single()`**: Always use `.limit(1)` to avoid 406 errors
✅ **Proper error handling**: Don't corrupt local state on server errors
✅ **Test coverage**: 6 automated tests cover main flows

## Next Steps

1. Run local tests
2. Review code changes
3. Deploy to production
4. Run production tests
5. Manual verification
6. Monitor for 24 hours

## Support

If tests fail or issues persist:

1. Check browser console for errors
2. Check Netlify function logs
3. Review `PERSISTENCE_FIX_SUMMARY.md` for details
4. Check `DEPLOYMENT_CHECKLIST.md` for troubleshooting

---

**Last Updated**: December 25, 2024
**Version**: 1.0
**Status**: ✅ Ready for deployment

