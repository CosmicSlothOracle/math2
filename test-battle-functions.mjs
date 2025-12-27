#!/usr/bin/env node
/**
 * Test Netlify Functions for Battle System
 * Tests the actual function endpoints
 */

const NETLIFY_DEV_URL = 'http://localhost:8888';
const TEST_USER_ID = `test_${Date.now()}`;

console.log('🧪 TESTING NETLIFY BATTLE FUNCTIONS\n');
console.log('='.repeat(60));
console.log(`Target: ${NETLIFY_DEV_URL}`);
console.log(`Test User ID: ${TEST_USER_ID}`);
console.log('='.repeat(60) + '\n');

async function testEndpoint(name, path, method = 'GET', body = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-anon-id': TEST_USER_ID,
    };

    const options = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const url = `${NETLIFY_DEV_URL}${path}`;
    console.log(`\n📡 Testing ${name}...`);
    console.log(`   ${method} ${path}`);

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok && data.ok !== false) {
      console.log(`   ✅ Status: ${response.status}`);
      if (data.note) {
        console.log(`   ℹ️  Note: ${data.note}`);
      }
      return { success: true, data };
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   Error: ${data.error || data.message || 'Unknown error'}`);
      return { success: false, data };
    }
  } catch (err) {
    console.log(`   ❌ Network error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function runTests() {
  console.log('⚠️  Make sure Netlify Dev is running: npx netlify dev\n');

  const results = {
    battleCreate: null,
    battleList: null,
    battleAccept: null,
    battleSubmit: null,
  };

  // Test 1: Create Battle
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Battle Creation');
  console.log('='.repeat(60));

  results.battleCreate = await testEndpoint(
    'battleCreate',
    '/.netlify/functions/battleCreate',
    'POST',
    {
      scenarioId: 'speed_geometry',
      unitId: 'u1',
      unitTitle: 'Figuren verstehen',
      stake: 25,
      rounds: 3,
      taskIds: ['t1', 't2', 't3'],
      taskBundle: [
        { id: 't1', question: 'Test 1', type: 'choice', correctAnswer: 1 },
        { id: 't2', question: 'Test 2', type: 'input', correctAnswer: '42' },
        { id: 't3', question: 'Test 3', type: 'boolean', correctAnswer: true },
      ],
    }
  );

  const battleId = results.battleCreate.data?.battle?.id;

  // Test 2: List Battles
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Battle List (mine)');
  console.log('='.repeat(60));

  results.battleList = await testEndpoint(
    'battleList (mine)',
    '/.netlify/functions/battleList?view=mine',
    'GET'
  );

  // Test 3: List Open Battles
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Battle List (open)');
  console.log('='.repeat(60));

  results.battleList = await testEndpoint(
    'battleList (open)',
    '/.netlify/functions/battleList?view=open',
    'GET'
  );

  // Test 4: Accept Battle (if we have a battle ID)
  if (battleId) {
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: Battle Acceptance');
    console.log('='.repeat(60));

    // Create second user for opponent
    const opponentId = `test_opponent_${Date.now()}`;

    results.battleAccept = await testEndpoint(
      'battleAccept',
      '/.netlify/functions/battleAccept',
      'POST',
      { battleId },
      { 'x-anon-id': opponentId }
    );

    // Test 5: Submit Battle (if accepted)
    if (results.battleAccept.success) {
      console.log('\n' + '='.repeat(60));
      console.log('TEST 5: Battle Submission');
      console.log('='.repeat(60));

      // Submit challenger
      results.battleSubmit = await testEndpoint(
        'battleSubmit (challenger)',
        '/.netlify/functions/battleSubmit',
        'POST',
        {
          battleId,
          submission: {
            correctCount: 3,
            totalTasks: 3,
            percentage: 100,
            solveTimeMs: 45000,
            isPerfectRun: true,
          },
        }
      );

      // Submit opponent
      await testEndpoint(
        'battleSubmit (opponent)',
        '/.netlify/functions/battleSubmit',
        'POST',
        {
          battleId,
          submission: {
            correctCount: 2,
            totalTasks: 3,
            percentage: 67,
            solveTimeMs: 60000,
            isPerfectRun: false,
          },
        },
        { 'x-anon-id': opponentId }
      );
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const tests = [
    { name: 'Battle Create', result: results.battleCreate },
    { name: 'Battle List', result: results.battleList },
    { name: 'Battle Accept', result: results.battleAccept },
    { name: 'Battle Submit', result: results.battleSubmit },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(({ name, result }) => {
    if (result) {
      if (result.success) {
        console.log(`✅ ${name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${name}: FAILED`);
        failed++;
      }
    } else {
      console.log(`⚠️  ${name}: SKIPPED`);
    }
  });

  console.log('='.repeat(60));
  console.log(`Total: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0 && passed > 0) {
    console.log('🎉 All tests passed! Battle functions are working.\n');
  } else if (passed === 0) {
    console.log('⚠️  No tests ran. Is Netlify Dev running?\n');
    console.log('   Start it with: npx netlify dev\n');
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n');
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Node.js 18+ required for fetch API');
  console.log('   Current version:', process.version);
  process.exit(1);
}

runTests().catch(err => {
  console.error('\n❌ Test suite crashed:', err);
  process.exit(1);
});

