/**
 * Persistence Test Suite
 *
 * Tests user state persistence across refresh/device:
 * - User identity (anon ID)
 * - Coins balance
 * - Progress (quest completion)
 * - Shop purchases (unlocked items)
 *
 * Run with: node tests/persistence.test.js <BASE_URL>
 * Example: node tests/persistence.test.js https://realer-math.netlify.app
 * Example (local): node tests/persistence.test.js http://localhost:8888
 */

const BASE_URL = process.argv[2] || 'http://localhost:8888';

console.log('='.repeat(60));
console.log('PERSISTENCE TEST SUITE');
console.log('Target:', BASE_URL);
console.log('='.repeat(60));

let testsPassed = 0;
let testsFailed = 0;

function pass(testName) {
  console.log(`✅ PASS: ${testName}`);
  testsPassed++;
}

function fail(testName, reason) {
  console.error(`❌ FAIL: ${testName}`);
  console.error(`   Reason: ${reason}`);
  testsFailed++;
}

async function test(name, fn) {
  console.log(`\n🧪 Running: ${name}`);
  try {
    await fn();
  } catch (err) {
    fail(name, err.message);
  }
}

// Helper to make API calls with cookie persistence
class TestClient {
  constructor() {
    this.cookies = {};
    this.anonId = null;
  }

  getCookieHeader() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  parseCookies(setCookieHeader) {
    if (!setCookieHeader) return;
    const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
    const match = cookieStr.match(/([^=]+)=([^;]+)/);
    if (match) {
      this.cookies[match[1]] = match[2];
      if (match[1] === 'mm_anon_id') {
        this.anonId = match[2];
      }
    }
  }

  async get(path) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.anonId) {
      headers['x-anon-id'] = this.anonId;
    }
    const cookie = this.getCookieHeader();
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const resp = await fetch(`${BASE_URL}${path}`, { headers });
    this.parseCookies(resp.headers.get('set-cookie'));

    if (!resp.ok) {
      throw new Error(`GET ${path} failed: ${resp.status}`);
    }

    return resp.json();
  }

  async post(path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.anonId) {
      headers['x-anon-id'] = this.anonId;
    }
    const cookie = this.getCookieHeader();
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const resp = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    this.parseCookies(resp.headers.get('set-cookie'));

    if (!resp.ok) {
      throw new Error(`POST ${path} failed: ${resp.status}`);
    }

    return resp.json();
  }
}

// TEST 1: User creation and identity persistence
await test('User creation and identity persistence', async () => {
  const client1 = new TestClient();

  // First call to /me should create user with 250 coins
  const resp1 = await client1.get('/.netlify/functions/me');

  if (!resp1.ok) {
    throw new Error('Initial /me call failed');
  }

  if (!resp1.user || !resp1.user.id) {
    throw new Error('No user ID returned');
  }

  const userId1 = resp1.user.id;
  const coins1 = resp1.user.coins;

  if (coins1 !== 250 && coins1 !== 2000) { // 2000 for dev fallback
    throw new Error(`Expected 250 or 2000 coins, got ${coins1}`);
  }

  console.log(`   User created: ${userId1}, coins: ${coins1}`);

  // Second call with same anon ID should return same user and coins
  const client2 = new TestClient();
  client2.anonId = client1.anonId; // Simulate same device

  const resp2 = await client2.get('/.netlify/functions/me');

  if (resp2.user.id !== userId1) {
    throw new Error(`User ID changed from ${userId1} to ${resp2.user.id}`);
  }

  if (resp2.user.coins !== coins1) {
    throw new Error(`Coins changed from ${coins1} to ${resp2.user.coins}`);
  }

  console.log(`   User identity persisted across requests`);
  pass('User creation and identity persistence');
});

// TEST 2: Coin persistence after adjustment
await test('Coin persistence after coinsAdjust', async () => {
  const client = new TestClient();

  // Get initial state
  const initial = await client.get('/.netlify/functions/me');
  const initialCoins = initial.user.coins;

  console.log(`   Initial coins: ${initialCoins}`);

  // Adjust coins (+50)
  const adjustResp = await client.post('/.netlify/functions/coinsAdjust', {
    delta: 50,
    reason: 'test_reward',
    refType: 'test',
    refId: 'test_001',
  });

  if (!adjustResp.ok) {
    throw new Error('coinsAdjust failed: ' + adjustResp.error);
  }

  const newCoins = adjustResp.coins;
  const expectedCoins = initialCoins + 50;

  if (newCoins !== expectedCoins) {
    throw new Error(`Expected ${expectedCoins} coins, got ${newCoins}`);
  }

  console.log(`   Coins adjusted: ${initialCoins} + 50 = ${newCoins}`);

  // Refresh from /me - should return same coins
  const refreshed = await client.get('/.netlify/functions/me');

  if (refreshed.user.coins !== newCoins) {
    throw new Error(`Coins not persisted: expected ${newCoins}, got ${refreshed.user.coins}`);
  }

  console.log(`   Coins persisted after refresh`);
  pass('Coin persistence after coinsAdjust');
});

// TEST 3: Progress persistence after progressSave
await test('Progress persistence after progressSave', async () => {
  const client = new TestClient();

  // Get initial state
  const initial = await client.get('/.netlify/functions/me');
  const userId = initial.user.id;

  // Save progress for a test unit
  const testUnitId = 'test_unit_' + Date.now();
  const saveResp = await client.post('/.netlify/functions/progressSave', {
    unitId: testUnitId,
    questCoinsEarned: 100,
    questCompletedCount: 1,
    bountyCompleted: false,
    perfectStandardQuiz: true,
    perfectBounty: false,
  });

  if (!saveResp.ok) {
    throw new Error('progressSave failed: ' + saveResp.error);
  }

  console.log(`   Progress saved for unit: ${testUnitId}`);

  // Refresh from /me - should include the unit in perfectStandardQuizUnits
  const refreshed = await client.get('/.netlify/functions/me');

  if (!refreshed.progress || refreshed.progress.length === 0) {
    throw new Error('No progress data returned');
  }

  const unitProgress = refreshed.progress.find(p => p.unit_id === testUnitId);
  if (!unitProgress) {
    throw new Error(`Progress for ${testUnitId} not found`);
  }

  if (unitProgress.quest_completed_count !== 1) {
    throw new Error(`Expected quest_completed_count=1, got ${unitProgress.quest_completed_count}`);
  }

  if (unitProgress.perfect_standard_quiz !== true) {
    throw new Error(`Expected perfect_standard_quiz=true, got ${unitProgress.perfect_standard_quiz}`);
  }

  console.log(`   Progress persisted and returned in /me`);
  pass('Progress persistence after progressSave');
});

// TEST 4: Shop purchase persistence
await test('Shop purchase persistence', async () => {
  const client = new TestClient();

  // Get initial state
  const initial = await client.get('/.netlify/functions/me');
  const initialCoins = initial.user.coins;
  const initialItems = initial.user.unlockedItems || [];

  console.log(`   Initial coins: ${initialCoins}, items: ${initialItems.length}`);

  // Purchase a test item (cost 10 coins)
  const testItemId = 'test_item_' + Date.now();
  const itemCost = 10;

  if (initialCoins < itemCost) {
    // Add coins first
    await client.post('/.netlify/functions/coinsAdjust', {
      delta: itemCost,
      reason: 'test_setup',
    });
  }

  const buyResp = await client.post('/.netlify/functions/shopBuy', {
    itemId: testItemId,
    itemCost: itemCost,
  });

  if (!buyResp.ok) {
    throw new Error('shopBuy failed: ' + buyResp.error);
  }

  const newCoins = buyResp.coins;
  const newItems = buyResp.unlockedItems;

  console.log(`   Item purchased: ${testItemId}, coins after: ${newCoins}`);

  if (!newItems.includes(testItemId)) {
    throw new Error(`Item ${testItemId} not in unlockedItems`);
  }

  // Refresh from /me - should still have the item
  const refreshed = await client.get('/.netlify/functions/me');

  if (!refreshed.user.unlockedItems || !refreshed.user.unlockedItems.includes(testItemId)) {
    throw new Error(`Item ${testItemId} not persisted in unlocked items`);
  }

  console.log(`   Purchase persisted after refresh`);
  pass('Shop purchase persistence');
});

// TEST 5: No 406 errors on coins fetch
await test('No 406 errors on coins fetch', async () => {
  const client = new TestClient();

  try {
    const resp = await client.get('/.netlify/functions/me');

    if (!resp.ok) {
      throw new Error('Expected ok: true, got: ' + JSON.stringify(resp));
    }

    console.log(`   /me returned successfully without 406`);
    pass('No 406 errors on coins fetch');
  } catch (err) {
    if (err.message.includes('406')) {
      throw new Error('Got 406 error: ' + err.message);
    }
    throw err;
  }
});

// TEST 6: Coins don't reset to 250 on refresh (unless new user)
await test('Coins persist across multiple refreshes', async () => {
  const client = new TestClient();

  // Get initial state
  const initial = await client.get('/.netlify/functions/me');
  const initialCoins = initial.user.coins;

  // Add 77 coins
  await client.post('/.netlify/functions/coinsAdjust', {
    delta: 77,
    reason: 'test_persistence',
  });

  const after1 = await client.get('/.netlify/functions/me');
  const coins1 = after1.user.coins;

  if (coins1 !== initialCoins + 77) {
    throw new Error(`Expected ${initialCoins + 77} coins after first adjust, got ${coins1}`);
  }

  // Refresh 3 more times
  for (let i = 0; i < 3; i++) {
    const refresh = await client.get('/.netlify/functions/me');
    if (refresh.user.coins !== coins1) {
      throw new Error(`Coins changed on refresh ${i + 1}: expected ${coins1}, got ${refresh.user.coins}`);
    }
  }

  console.log(`   Coins remained stable at ${coins1} across multiple refreshes`);
  pass('Coins persist across multiple refreshes');
});

// SUMMARY
console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  console.error('\n❌ SOME TESTS FAILED - Please review the errors above');
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED - User state persistence is working correctly!');
  process.exit(0);
}

