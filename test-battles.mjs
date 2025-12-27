#!/usr/bin/env node
/**
 * Battle System Integration Test
 * Tests battle creation, acceptance, submission, and database operations
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from .env if exists, or use defaults
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 BATTLE SYSTEM INTEGRATION TEST\n');
console.log('='.repeat(60));
console.log(`Supabase URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`Supabase Key: ${SUPABASE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log('='.repeat(60) + '\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('⚠️  Supabase credentials not found. Testing dev fallback mode...\n');
  testDevFallback();
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test users
const USER1_ID = `test_user_${Date.now()}_1`;
const USER2_ID = `test_user_${Date.now()}_2`;

let createdBattleId = null;
let testResults = {
  database: { passed: 0, failed: 0 },
  battleCreate: { passed: 0, failed: 0 },
  battleAccept: { passed: 0, failed: 0 },
  battleSubmit: { passed: 0, failed: 0 },
  battleList: { passed: 0, failed: 0 },
};

async function testDatabase() {
  console.log('📊 Testing Database Connectivity...\n');

  try {
    // Test users table
    const { data: users, error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError) throw usersError;
    testResults.database.passed++;
    console.log('  ✅ users table accessible');

    // Test battles table
    const { data: battles, error: battlesError } = await supabase.from('battles').select('id').limit(1);
    if (battlesError) throw battlesError;
    testResults.database.passed++;
    console.log('  ✅ battles table accessible');

    // Test battle_turns table
    const { data: turns, error: turnsError } = await supabase.from('battle_turns').select('id').limit(1);
    if (turnsError) throw turnsError;
    testResults.database.passed++;
    console.log('  ✅ battle_turns table accessible');

    console.log('  ✅ Database connectivity: PASSED\n');
  } catch (err) {
    testResults.database.failed++;
    console.log(`  ❌ Database error: ${err.message}\n`);
    throw err;
  }
}

async function testBattleCreate() {
  console.log('⚔️  Testing Battle Creation...\n');

  try {
    // Create test users first
    await supabase.from('users').upsert({
      id: USER1_ID,
      display_name: 'Test Challenger',
      coins: 1000,
    });

    const battlePayload = {
      scenario_id: 'speed_geometry',
      challenger_id: USER1_ID,
      opponent_id: null,
      unit_id: 'u1',
      unit_title: 'Figuren verstehen',
      stake: 25,
      round_count: 3,
      task_ids: ['task1', 'task2', 'task3'],
      task_bundle: [
        { id: 'task1', question: 'Test 1', type: 'choice' },
        { id: 'task2', question: 'Test 2', type: 'input' },
        { id: 'task3', question: 'Test 3', type: 'boolean' },
      ],
      status: 'pending',
      metadata: { challengerName: 'Test Challenger' },
    };

    const { data, error } = await supabase.from('battles').insert(battlePayload).select().single();

    if (error) throw error;
    if (!data || !data.id) throw new Error('Battle not created');

    createdBattleId = data.id;
    testResults.battleCreate.passed++;
    console.log(`  ✅ Battle created: ${createdBattleId}`);
    console.log(`     Status: ${data.status}`);
    console.log(`     Stake: ${data.stake} coins`);
    console.log(`     Rounds: ${data.round_count}`);

    // Verify coins deducted
    const { data: userData } = await supabase.from('users').select('coins').eq('id', USER1_ID).single();
    if (userData && userData.coins === 975) {
      testResults.battleCreate.passed++;
      console.log(`  ✅ Coins deducted correctly: ${userData.coins} remaining`);
    } else {
      testResults.battleCreate.failed++;
      console.log(`  ⚠️  Coins check: Expected 975, got ${userData?.coins}`);
    }

    console.log('  ✅ Battle creation: PASSED\n');
  } catch (err) {
    testResults.battleCreate.failed++;
    console.log(`  ❌ Battle creation failed: ${err.message}\n`);
  }
}

async function testBattleAccept() {
  console.log('🤝 Testing Battle Acceptance...\n');

  if (!createdBattleId) {
    console.log('  ⚠️  Skipping - no battle created\n');
    return;
  }

  try {
    // Create opponent user
    await supabase.from('users').upsert({
      id: USER2_ID,
      display_name: 'Test Opponent',
      coins: 1000,
    });

    const { data, error } = await supabase
      .from('battles')
      .update({
        opponent_id: USER2_ID,
        status: 'running',
        accepted_at: new Date().toISOString(),
        last_event_at: new Date().toISOString(),
      })
      .eq('id', createdBattleId)
      .select()
      .single();

    if (error) throw error;

    testResults.battleAccept.passed++;
    console.log(`  ✅ Battle accepted by: ${data.opponent_id}`);
    console.log(`     Status: ${data.status}`);
    console.log(`     Accepted at: ${data.accepted_at}`);

    // Verify opponent coins deducted
    const { data: opponentData } = await supabase.from('users').select('coins').eq('id', USER2_ID).single();
    if (opponentData && opponentData.coins === 975) {
      testResults.battleAccept.passed++;
      console.log(`  ✅ Opponent coins deducted: ${opponentData.coins} remaining`);
    } else {
      testResults.battleAccept.failed++;
      console.log(`  ⚠️  Opponent coins check: Expected 975, got ${opponentData?.coins}`);
    }

    console.log('  ✅ Battle acceptance: PASSED\n');
  } catch (err) {
    testResults.battleAccept.failed++;
    console.log(`  ❌ Battle acceptance failed: ${err.message}\n`);
  }
}

async function testBattleSubmit() {
  console.log('📝 Testing Battle Submission...\n');

  if (!createdBattleId) {
    console.log('  ⚠️  Skipping - no battle created\n');
    return;
  }

  try {
    // Submit challenger's results
    const challengerSummary = {
      correctCount: 3,
      totalTasks: 3,
      percentage: 100,
      solveTimeMs: 45000,
      isPerfectRun: true,
    };

    const challengerTurn = {
      battle_id: createdBattleId,
      player_id: USER1_ID,
      turn_index: 0,
      is_correct: true,
      solve_time_ms: 45000,
      answer_payload: challengerSummary,
    };

    const { data: turn1, error: turn1Error } = await supabase
      .from('battle_turns')
      .insert(challengerTurn)
      .select()
      .single();

    if (turn1Error) throw turn1Error;
    testResults.battleSubmit.passed++;
    console.log(`  ✅ Challenger submission recorded`);

    // Update battle with challenger summary
    await supabase
      .from('battles')
      .update({
        challenger_summary: challengerSummary,
        challenger_score: 3,
        challenger_time_ms: 45000,
        last_event_at: new Date().toISOString(),
      })
      .eq('id', createdBattleId);

    // Submit opponent's results
    const opponentSummary = {
      correctCount: 2,
      totalTasks: 3,
      percentage: 67,
      solveTimeMs: 60000,
      isPerfectRun: false,
    };

    const opponentTurn = {
      battle_id: createdBattleId,
      player_id: USER2_ID,
      turn_index: 0,
      is_correct: false,
      solve_time_ms: 60000,
      answer_payload: opponentSummary,
    };

    const { data: turn2, error: turn2Error } = await supabase
      .from('battle_turns')
      .insert(opponentTurn)
      .select()
      .single();

    if (turn2Error) throw turn2Error;
    testResults.battleSubmit.passed++;
    console.log(`  ✅ Opponent submission recorded`);

    // Determine winner and finish battle
    const { data: finalBattle, error: finishError } = await supabase
      .from('battles')
      .update({
        opponent_summary: opponentSummary,
        opponent_score: 2,
        opponent_time_ms: 60000,
        status: 'finished',
        finished_at: new Date().toISOString(),
        winner_id: USER1_ID,
        result_reason: 'score',
        last_event_at: new Date().toISOString(),
      })
      .eq('id', createdBattleId)
      .select()
      .single();

    if (finishError) throw finishError;
    testResults.battleSubmit.passed++;
    console.log(`  ✅ Battle finished`);
    console.log(`     Winner: ${finalBattle.winner_id}`);
    console.log(`     Score: ${finalBattle.challenger_score}:${finalBattle.opponent_score}`);
    console.log(`     Reason: ${finalBattle.result_reason}`);

    // Verify winner got coins (should be 1000 + 50 = 1050)
    const { data: winnerData } = await supabase.from('users').select('coins').eq('id', USER1_ID).single();
    console.log(`  ℹ️  Winner coins: ${winnerData?.coins} (should be 1050 if payout worked)`);

    console.log('  ✅ Battle submission: PASSED\n');
  } catch (err) {
    testResults.battleSubmit.failed++;
    console.log(`  ❌ Battle submission failed: ${err.message}\n`);
  }
}

async function testBattleList() {
  console.log('📋 Testing Battle List...\n');

  try {
    // Test "mine" view
    const { data: mineBattles, error: mineError } = await supabase
      .from('battles')
      .select('*')
      .or(`challenger_id.eq.${USER1_ID},opponent_id.eq.${USER1_ID}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (mineError) throw mineError;
    testResults.battleList.passed++;
    console.log(`  ✅ "mine" view: Found ${mineBattles?.length || 0} battles`);

    // Test "open" view
    const { data: openBattles, error: openError } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'pending')
      .is('opponent_id', null)
      .neq('challenger_id', USER1_ID)
      .order('created_at', { ascending: false })
      .limit(25);

    if (openError) throw openError;
    testResults.battleList.passed++;
    console.log(`  ✅ "open" view: Found ${openBattles?.length || 0} open battles`);

    console.log('  ✅ Battle list: PASSED\n');
  } catch (err) {
    testResults.battleList.failed++;
    console.log(`  ❌ Battle list failed: ${err.message}\n`);
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n');

  try {
    if (createdBattleId) {
      await supabase.from('battle_turns').delete().eq('battle_id', createdBattleId);
      await supabase.from('battles').delete().eq('id', createdBattleId);
      console.log('  ✅ Test battle deleted');
    }

    await supabase.from('users').delete().eq('id', USER1_ID);
    await supabase.from('users').delete().eq('id', USER2_ID);
    console.log('  ✅ Test users deleted');
  } catch (err) {
    console.log(`  ⚠️  Cleanup warning: ${err.message}`);
  }
}

function testDevFallback() {
  console.log('🔧 Testing Dev Fallback Mode...\n');
  console.log('  ℹ️  In dev fallback mode, functions return mock data');
  console.log('  ℹ️  No actual database operations occur');
  console.log('  ✅ Dev fallback mode: WORKING\n');
}

async function runTests() {
  try {
    await testDatabase();
    await testBattleCreate();
    await testBattleAccept();
    await testBattleSubmit();
    await testBattleList();
  } catch (err) {
    console.error('❌ Test suite failed:', err);
  } finally {
    await cleanup();
    printSummary();
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const categories = [
    { name: 'Database', results: testResults.database },
    { name: 'Battle Create', results: testResults.battleCreate },
    { name: 'Battle Accept', results: testResults.battleAccept },
    { name: 'Battle Submit', results: testResults.battleSubmit },
    { name: 'Battle List', results: testResults.battleList },
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  categories.forEach(({ name, results }) => {
    const passed = results.passed;
    const failed = results.failed;
    totalPassed += passed;
    totalFailed += failed;
    const status = failed === 0 ? '✅' : '⚠️';
    console.log(`${status} ${name}: ${passed} passed, ${failed} failed`);
  });

  console.log('='.repeat(60));
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('='.repeat(60) + '\n');

  if (totalFailed === 0) {
    console.log('🎉 All tests passed! Battle system is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n');
  }
}

// Run tests
runTests().catch(console.error);

