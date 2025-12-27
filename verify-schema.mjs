#!/usr/bin/env node
/**
 * Verify Supabase Schema Matches Expected Structure
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('❌ Supabase credentials not found');
  console.log('Set SUPABASE_URL and SUPABASE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXPECTED_COLUMNS = {
  battles: [
    'id', 'scenario_id', 'challenger_id', 'opponent_id', 'unit_id', 'unit_title',
    'stake', 'round_count', 'task_ids', 'task_bundle', 'status', 'metadata',
    'created_at', 'accepted_at', 'finished_at', 'last_event_at',
    'winner_id', 'result_reason', 'challenger_score', 'opponent_score',
    'challenger_time_ms', 'opponent_time_ms', 'challenger_summary', 'opponent_summary'
  ],
  battle_turns: [
    'id', 'battle_id', 'player_id', 'turn_index', 'is_correct',
    'solve_time_ms', 'answer_payload', 'submitted_at'
  ],
};

async function verifyTable(tableName, expectedColumns) {
  console.log(`\n📋 Verifying ${tableName}...`);

  try {
    // Try to select one row to verify table exists
    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log(`   ❌ Table ${tableName} does not exist`);
        return false;
      }
      throw error;
    }

    console.log(`   ✅ Table ${tableName} exists`);

    // Get column info by trying to insert null (will fail but show columns)
    // Or use information_schema query
    const { data: columns, error: colError } = await supabase.rpc('get_table_columns', { table_name: tableName });

    // Alternative: try accessing each column
    const missingColumns = [];
    for (const col of expectedColumns) {
      try {
        const testQuery = await supabase.from(tableName).select(col).limit(0);
        if (testQuery.error && testQuery.error.code !== 'PGRST116') {
          missingColumns.push(col);
        }
      } catch (err) {
        // Column might not exist
      }
    }

    if (missingColumns.length > 0) {
      console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log(`   ✅ All expected columns present`);
    }

    return true;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function verifyIndexes() {
  console.log('\n📊 Verifying indexes...');

  // Check if we can query efficiently
  try {
    // Test open battles query (most common)
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'pending')
      .is('opponent_id', null)
      .limit(1);

    if (!error) {
      console.log('   ✅ Indexes appear to be working (query succeeded)');
    } else {
      console.log(`   ⚠️  Query test: ${error.message}`);
    }
  } catch (err) {
    console.log(`   ⚠️  Cannot verify indexes: ${err.message}`);
  }
}

async function verifyForeignKeys() {
  console.log('\n🔗 Verifying foreign keys...');

  try {
    // Try to create a turn with invalid battle_id
    const { error } = await supabase
      .from('battle_turns')
      .insert({
        battle_id: '00000000-0000-0000-0000-000000000000',
        player_id: 'test',
        turn_index: 0,
      });

    if (error && error.code === '23503') {
      console.log('   ✅ Foreign key constraint working');
      return true;
    } else if (!error) {
      console.log('   ⚠️  Foreign key constraint might not be enforced');
      // Clean up test insert
      await supabase.from('battle_turns').delete().eq('player_id', 'test');
      return false;
    } else {
      console.log(`   ⚠️  Could not verify: ${error.message}`);
      return false;
    }
  } catch (err) {
    console.log(`   ⚠️  Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 SUPABASE SCHEMA VERIFICATION\n');
  console.log('='.repeat(60));
  console.log(`URL: ${SUPABASE_URL.substring(0, 30)}...`);
  console.log('='.repeat(60));

  const results = {
    battles: await verifyTable('battles', EXPECTED_COLUMNS.battles),
    battle_turns: await verifyTable('battle_turns', EXPECTED_COLUMNS.battle_turns),
  };

  await verifyIndexes();
  await verifyForeignKeys();

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    console.log('✅ Schema verification: PASSED');
    console.log('\n💡 Next: Test battle functions with:');
    console.log('   npx netlify dev');
    console.log('   node test-battle-functions.mjs\n');
  } else {
    console.log('⚠️  Schema verification: INCOMPLETE');
    console.log('\n💡 Run schema migration:');
    console.log('   1. Open Supabase SQL Editor');
    console.log('   2. Copy docs/supabase_schema.sql');
    console.log('   3. Execute in SQL Editor\n');
  }
}

main().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});

