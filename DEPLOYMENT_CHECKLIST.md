# Deployment Checklist - User State Persistence Fix

## Pre-Deployment

### 1. Code Review
- [x] All backend `.single()` calls replaced with `.limit(1)`
- [x] AuthService refactored to use `/me` endpoint
- [x] Bootstrap logic uses server as source of truth
- [x] Quest completion calls `progressSave`
- [x] Shop purchases use `/shopBuy` endpoint
- [x] No linting errors

### 2. Local Testing
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Start local dev server: `netlify dev`
- [ ] Open app at http://localhost:8888
- [ ] Test user creation (should get stable anon ID)
- [ ] Test coin earning (complete a quest)
- [ ] Test coin persistence (refresh page, coins should not reset)
- [ ] Test shop purchase
- [ ] Test purchase persistence (refresh page, item should still be owned)
- [ ] Check browser console for errors

### 3. Automated Tests
- [ ] Run test suite locally:
```bash
node tests/persistence.test.js http://localhost:8888
```
- [ ] All tests should pass (6/6)
- [ ] No 406 errors in console
- [ ] No "dev-fallback" warnings (unless Supabase not configured locally)

## Deployment

### 1. Commit and Push
```bash
git add .
git commit -m "fix: make server source of truth for user state persistence

- Fixed 406 errors by replacing .single() with .limit(1)
- Refactored AuthService to call /me endpoint instead of LocalStorage
- Updated quest completion to use QuestService return values
- Rewrote shop purchase flow to use /shopBuy endpoint
- Added automated persistence tests
- Updated documentation

Fixes: coins reset, progress not saved, purchases lost
"
git push origin main
```

### 2. Monitor Netlify Deploy
- [ ] Open https://app.netlify.com (your dashboard)
- [ ] Watch deploy logs for errors
- [ ] Wait for "Published" status
- [ ] Check deploy summary for any warnings

### 3. Verify Environment Variables
In Netlify dashboard → Site settings → Environment variables:
- [ ] `SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY` is set
- [ ] No typos in variable names
- [ ] Variables are available to Functions

## Post-Deployment Testing

### 1. Automated Tests (Production)
```bash
node tests/persistence.test.js https://realer-math.netlify.app
```
Expected: All 6 tests pass

### 2. Manual Verification (Critical Path)

#### Test A: New User Flow
- [ ] Open https://realer-math.netlify.app in incognito window
- [ ] Note starting coins (should be 250)
- [ ] Complete one quest
- [ ] Verify coins increased
- [ ] **Refresh page (F5)**
- [ ] ✅ Coins should NOT reset to 250
- [ ] ✅ Coins should match pre-refresh value

#### Test B: Shop Purchase
- [ ] Buy cheapest shop item
- [ ] Note new coin balance
- [ ] Verify item appears in owned items
- [ ] **Refresh page**
- [ ] ✅ Coins should match pre-refresh value
- [ ] ✅ Item should still be owned

#### Test C: Quest Progress
- [ ] Start a new learning unit quest
- [ ] Complete with perfect run (no errors, no hints)
- [ ] Verify gold unlock animation/status
- [ ] **Refresh page**
- [ ] ✅ Unit should still show gold unlocked status

#### Test D: Bounty
- [ ] Start bounty for a gold-unlocked unit
- [ ] Note entry fee deducted
- [ ] Complete bounty
- [ ] Note bounty reward added
- [ ] **Refresh page**
- [ ] ✅ Coins should match (fee + reward persisted)
- [ ] ✅ Bounty completion status should persist

#### Test E: Multi-Device (Optional)
- [ ] Note anon ID in browser console: `localStorage.getItem('mm_anon_id')`
- [ ] Open app on different device/browser with same anon ID
- [ ] ⚠️ Note: Without proper cookie/auth sync, this may create new user
- [ ] This is expected behavior - full cross-device requires auth

### 3. Check for Errors

#### Browser Console
- [ ] Open DevTools → Console
- [ ] Look for red errors
- [ ] Should NOT see 406 errors
- [ ] Should NOT see "INSUFFICIENT_COINS" unless user actually has insufficient coins
- [ ] Should NOT see "dev-fallback" warnings (production should use Supabase)

#### Netlify Function Logs
- [ ] Netlify dashboard → Functions
- [ ] Click on `me`, `coinsAdjust`, `progressSave`, `shopBuy`
- [ ] Check recent invocations for errors
- [ ] Verify 200 status codes
- [ ] Look for warning logs about missing data

#### Network Tab
- [ ] Open DevTools → Network
- [ ] Filter: XHR
- [ ] Perform actions (quest, shop, etc.)
- [ ] Verify all `/.netlify/functions/*` calls return 200
- [ ] Check response bodies for `"ok": true`
- [ ] Verify no 406, 500, or other error status codes

## Rollback Plan (If Issues Found)

### Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Partial Rollback (Keep Backend Fixes)
```bash
# Revert only frontend changes
git checkout HEAD~1 -- App.tsx services/apiService.ts
git commit -m "rollback: revert frontend persistence changes"
git push origin main
```

Backend changes (`.single()` → `.limit(1)`) are safe to keep as they only fix bugs.

## Troubleshooting

### Issue: Coins still resetting to 250
**Diagnosis**:
1. Check if "dev-fallback" appears in console
2. Verify Supabase env vars in Netlify
3. Check `/me` response in Network tab

**Fix**:
- If dev-fallback: Supabase not configured → add env vars
- If not dev-fallback but still resetting: Check `me.cjs` logs in Netlify

### Issue: 406 errors still appearing
**Diagnosis**:
1. Check which endpoint is throwing 406
2. Look for any remaining `.single()` calls

**Fix**:
```bash
# Search for remaining .single() calls
grep -r "\.single\(\)" netlify/functions/
```

### Issue: Progress not saving
**Diagnosis**:
1. Check Network tab for `/progressSave` call
2. Check response: should have `"ok": true`
3. Check Netlify function logs for errors

**Fix**:
- If call not happening: Check `QuestService` call sites
- If call failing: Check Supabase schema (progress table)

### Issue: Purchases not persisting
**Diagnosis**:
1. Check Network tab for `/shopBuy` call
2. Check response for `unlockedItems` array
3. Check if item appears immediately but disappears on refresh

**Fix**:
- If immediate appearance: Local cache update working
- If refresh loses it: Server not persisting → check `shopBuy.cjs` logs

## Success Metrics

After deployment, monitor for 24 hours:

- [ ] Zero 406 errors in Netlify logs
- [ ] Zero "coins reset" user reports
- [ ] Zero "progress lost" user reports
- [ ] Zero "purchase lost" user reports
- [ ] Function error rate < 1%
- [ ] Average response time < 500ms

## Communication

### If Successful
Post in team chat / user announcement:
```
✅ Bug fix deployed: User progress and coins now persist correctly across sessions!

What's fixed:
- Coins no longer reset to 250 on refresh
- Quest progress is saved reliably
- Shop purchases persist across devices
- No more 406 errors

Please report any issues you notice!
```

### If Issues Found
Post in team chat:
```
⚠️ Investigating persistence fix deployment - may experience temporary issues.
We're monitoring and will update shortly.
```

## Final Checklist

Before marking deployment complete:

- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No errors in browser console
- [ ] No errors in Netlify function logs
- [ ] Coins persist across refresh
- [ ] Progress persists across refresh
- [ ] Purchases persist across refresh
- [ ] No 406 errors observed
- [ ] Documentation updated
- [ ] Team notified

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Status**: ⬜ Success  ⬜ Partial  ⬜ Rolled Back
**Notes**: _____________

