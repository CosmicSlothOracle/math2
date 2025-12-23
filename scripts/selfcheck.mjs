#!/usr/bin/env node
/**
 * Self-Check Script for Math2 Netlify Functions
 *
 * Tests all deployed Functions and reports results.
 * Usage: node scripts/selfcheck.mjs [baseUrl]
 *
 * Base URL defaults to https://realer-math.netlify.app
 */

const BASE_URL = process.argv[2] || 'https://realer-math.netlify.app';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function testFunction(name, method, path, body = null, headers = {}) {
  try {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    logInfo(`Testing ${name}...`);
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      logError(`${name}: Response is not JSON (${response.status})`);
      log(`  Response: ${text.substring(0, 200)}`, 'yellow');
      return { ok: false, error: 'NOT_JSON', status: response.status };
    }

    const json = await response.json();

    // Check for dev-fallback
    if (json.note && json.note.includes('dev-fallback')) {
      logWarning(`${name}: Dev fallback detected - Supabase not configured`);
      return { ok: false, error: 'DEV_FALLBACK', note: json.note, data: json };
    }

    // Check for ok field
    if (json.ok === false) {
      logError(`${name}: Function returned ok: false`);
      log(`  Error: ${json.error}`, 'yellow');
      log(`  Details: ${json.details || 'none'}`, 'yellow');
      return { ok: false, error: json.error, details: json.details, data: json };
    }

    if (json.ok === true || response.ok) {
      logSuccess(`${name}: OK (${response.status})`);
      return { ok: true, data: json };
    }

    logError(`${name}: Unexpected response (${response.status})`);
    return { ok: false, error: 'UNEXPECTED', status: response.status, data: json };
  } catch (err) {
    logError(`${name}: Exception - ${err.message}`);
    return { ok: false, error: 'EXCEPTION', message: err.message };
  }
}

async function runTests() {
  log('\n=== Math2 Functions Self-Check ===\n', 'blue');
  log(`Base URL: ${BASE_URL}\n`, 'blue');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // Test 1: progressGet
  results.total++;
  const progressGetResult = await testFunction(
    'progressGet',
    'GET',
    '/.netlify/functions/progressGet',
    null,
    { 'x-dev-user': 'test-user-123' }
  );
  if (progressGetResult.ok) {
    results.passed++;
  } else if (progressGetResult.error === 'DEV_FALLBACK') {
    results.warnings++;
  } else {
    results.failed++;
  }

  // Test 2: progressSave
  results.total++;
  const progressSaveResult = await testFunction(
    'progressSave',
    'POST',
    '/.netlify/functions/progressSave',
    {
      unitId: 'u1',
      questCoinsEarned: 10,
      questCompletedCount: 1,
      bountyCompleted: false,
      perfectStandardQuiz: false,
      perfectBounty: false,
    },
    { 'x-dev-user': 'test-user-123' }
  );
  if (progressSaveResult.ok) {
    results.passed++;
  } else if (progressSaveResult.error === 'DEV_FALLBACK') {
    results.warnings++;
  } else {
    results.failed++;
  }

  // Test 3: coinsAdjust (positive)
  results.total++;
  const coinsAdjustPosResult = await testFunction(
    'coinsAdjust (positive)',
    'POST',
    '/.netlify/functions/coinsAdjust',
    {
      delta: 50,
      reason: 'test_reward',
      refType: 'unit',
      refId: 'u1',
    },
    { 'x-dev-user': 'test-user-123' }
  );
  if (coinsAdjustPosResult.ok) {
    results.passed++;
    if (coinsAdjustPosResult.data && typeof coinsAdjustPosResult.data.coins === 'number') {
      log(`  Coins: ${coinsAdjustPosResult.data.coins}`, 'green');
    }
  } else if (coinsAdjustPosResult.error === 'DEV_FALLBACK') {
    results.warnings++;
  } else {
    results.failed++;
  }

  // Test 4: coinsAdjust (negative)
  results.total++;
  const coinsAdjustNegResult = await testFunction(
    'coinsAdjust (negative)',
    'POST',
    '/.netlify/functions/coinsAdjust',
    {
      delta: -10,
      reason: 'test_deduct',
      refType: 'unit',
      refId: 'u1',
    },
    { 'x-dev-user': 'test-user-123' }
  );
  if (coinsAdjustNegResult.ok) {
    results.passed++;
  } else if (coinsAdjustNegResult.error === 'DEV_FALLBACK') {
    results.warnings++;
  } else {
    results.failed++;
  }

  // Test 5: chatSend
  results.total++;
  const chatSendResult = await testFunction(
    'chatSend',
    'POST',
    '/.netlify/functions/chatSend',
    {
      text: `Test message ${Date.now()}`,
      channelId: 'class:global',
      username: 'TestUser',
    },
    { 'x-dev-user': 'test-user-123' }
  );
  if (chatSendResult.ok) {
    results.passed++;
  } else if (chatSendResult.error === 'DEV_FALLBACK') {
    results.warnings++;
  } else {
    results.failed++;
  }

  // Test 6: chatPoll
  results.total++;
  const chatPollResult = await testFunction(
    'chatPoll',
    'GET',
    '/.netlify/functions/chatPoll?channelId=class:global',
    null,
    { 'x-dev-user': 'test-user-123' }
  );
  if (chatPollResult.ok) {
    results.passed++;
    if (chatPollResult.data && Array.isArray(chatPollResult.data.messages)) {
      log(`  Messages: ${chatPollResult.data.messages.length}`, 'green');
    }
  } else if (chatPollResult.error === 'DEV_FALLBACK') {
    results.warnings++;
  } else {
    results.failed++;
  }

  // Test 7: me
  results.total++;
  const meResult = await testFunction(
    'me',
    'GET',
    '/.netlify/functions/me',
    null,
    { 'x-dev-user': 'test-user-123' }
  );
  if (meResult.ok) {
    results.passed++;
    if (meResult.data && meResult.data.user) {
      log(`  User ID: ${meResult.data.user.id}`, 'green');
      log(`  Coins: ${meResult.data.user.coins || 0}`, 'green');
    }
    // Check for dev-fallback
    if (meResult.data && meResult.data.note && meResult.data.note.includes('dev-fallback')) {
      logWarning('  ⚠️  me returned dev-fallback - Supabase not configured');
      results.warnings++;
    }
  } else if (meResult.error === 'DEV_FALLBACK') {
    results.warnings++;
  } else {
    results.failed++;
  }

  // Test 8: debugSupabase (diagnostic)
  results.total++;
  logInfo('\n=== Supabase Configuration Check ===');
  const debugResult = await testFunction(
    'debugSupabase',
    'GET',
    '/.netlify/functions/debugSupabase',
    null,
    {}
  );
  if (debugResult.ok && debugResult.data && debugResult.data.debug) {
    const dbg = debugResult.data.debug;
    log('\nEnvironment Variables:', 'blue');
    log(`  SUPABASE_URL: ${dbg.env.SUPABASE_URL}`, dbg.env.SUPABASE_URL === 'SET' ? 'green' : 'red');
    log(`  SUPABASE_SERVICE_ROLE_KEY: ${dbg.env.SUPABASE_SERVICE_ROLE_KEY}`, dbg.env.SUPABASE_SERVICE_ROLE_KEY === 'SET' ? 'green' : 'yellow');
    log(`  SUPABASE_ANON_KEY: ${dbg.env.SUPABASE_ANON_KEY}`, dbg.env.SUPABASE_ANON_KEY === 'SET' ? 'green' : 'yellow');

    log('\nPackage:', 'blue');
    if (dbg.package && dbg.package.installed) {
      logSuccess('  @supabase/supabase-js: Installed');
    } else {
      logError(`  @supabase/supabase-js: NOT INSTALLED - ${dbg.package?.error || 'unknown'}`);
    }

    log('\nClient:', 'blue');
    if (dbg.client && dbg.client.created) {
      logSuccess('  Client created: Yes');
      if (dbg.client.testQuery) {
        if (dbg.client.testQuery.success) {
          logSuccess(`  Test query: Success (${dbg.client.testQuery.rowCount} rows)`);
        } else {
          logError(`  Test query: Failed - ${dbg.client.testQuery.error}`);
        }
      }
    } else {
      logError(`  Client created: No - ${dbg.client?.error || 'unknown'}`);
    }

    if (debugResult.data.recommendations && debugResult.data.recommendations.length > 0) {
      log('\nRecommendations:', 'yellow');
      debugResult.data.recommendations.forEach((rec) => {
        log(`  • ${rec}`, 'yellow');
      });
    }

    results.passed++;
  } else {
    logError('debugSupabase: Failed to get debug info');
    results.failed++;
  }

  // Summary
  log('\n=== Summary ===\n', 'blue');
  log(`Total tests: ${results.total}`, 'blue');
  logSuccess(`Passed: ${results.passed}`);
  if (results.warnings > 0) {
    logWarning(`Warnings (dev-fallback): ${results.warnings}`);
  }
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }

  // Exit code
  if (results.failed > 0) {
    log('\n❌ Some tests failed. Check Supabase configuration.', 'red');
    process.exit(1);
  } else if (results.warnings > 0) {
    log('\n⚠️  Tests passed but dev-fallback detected. Supabase may not be configured.', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ All tests passed!', 'green');
    process.exit(0);
  }
}

runTests().catch((err) => {
  logError(`\nFatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});

