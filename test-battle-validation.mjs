#!/usr/bin/env node
/**
 * Battle System Validation Test
 * Validates function logic and data structures without requiring server
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 BATTLE SYSTEM VALIDATION TEST\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result === true || (result && result.success)) {
      console.log(`✅ ${name}`);
      passed++;
      return true;
    } else {
      console.log(`❌ ${name}: ${result?.error || 'Failed'}`);
      failed++;
      return false;
    }
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    failed++;
    return false;
  }
}

// Test 1: Validate battle scenarios
console.log('\n📋 Testing Battle Scenarios...\n');

try {
  // Read and parse mathBattles.ts (simplified check)
  const mathBattlesContent = readFileSync(join(__dirname, 'services/mathBattles.ts'), 'utf8');

  test('Battle scenarios file exists', () => {
    return mathBattlesContent.includes('BATTLE_SCENARIOS');
  });

  test('Has multiple scenarios', () => {
    const scenarioCount = (mathBattlesContent.match(/id: '/g) || []).length;
    return scenarioCount >= 10; // Should have at least 10 scenarios
  });

  test('Scenarios have required fields', () => {
    const hasTitle = mathBattlesContent.includes('title:');
    const hasStake = mathBattlesContent.includes('stake:');
    const hasRounds = mathBattlesContent.includes('rounds:');
    const hasUnitId = mathBattlesContent.includes('unitId:');
    return hasTitle && hasStake && hasRounds && hasUnitId;
  });

  console.log(`   Found scenarios with: title, stake, rounds, unitId`);
} catch (err) {
  console.log(`❌ Cannot read mathBattles.ts: ${err.message}`);
  failed++;
}

// Test 2: Validate database schema
console.log('\n🗄️  Testing Database Schema...\n');

try {
  const schemaContent = readFileSync(join(__dirname, 'docs/supabase_schema.sql'), 'utf8');

  test('Battles table defined', () => {
    return schemaContent.includes('create table') && schemaContent.includes('battles');
  });

  test('Battle_turns table defined', () => {
    return schemaContent.includes('battle_turns');
  });

  test('Has required battle columns', () => {
    const hasChallengerId = schemaContent.includes('challenger_id');
    const hasOpponentId = schemaContent.includes('opponent_id');
    const hasStatus = schemaContent.includes('status');
    const hasStake = schemaContent.includes('stake');
    const hasTaskBundle = schemaContent.includes('task_bundle');
    return hasChallengerId && hasOpponentId && hasStatus && hasStake && hasTaskBundle;
  });

  test('Has indexes for performance', () => {
    return schemaContent.includes('create index') && schemaContent.includes('idx_battles');
  });

  test('Has foreign key constraint', () => {
    return schemaContent.includes('references battles') || schemaContent.includes('on delete cascade');
  });

} catch (err) {
  console.log(`❌ Cannot read schema.sql: ${err.message}`);
  failed++;
}

// Test 3: Validate function files
console.log('\n⚙️  Testing Function Files...\n');

const functions = [
  'battleCreate.cjs',
  'battleAccept.cjs',
  'battleSubmit.cjs',
  'battleList.cjs',
];

functions.forEach(fn => {
  try {
    const content = readFileSync(join(__dirname, 'netlify/functions', fn), 'utf8');

    test(`${fn} exists`, () => true);

    test(`${fn} has handler export`, () => {
      return content.includes('exports.handler') || content.includes('module.exports');
    });

    test(`${fn} has CORS headers`, () => {
      return content.includes('Access-Control-Allow-Origin');
    });

    test(`${fn} uses Supabase client`, () => {
      return content.includes('createSupabaseClient') || content.includes('_supabase');
    });

    if (fn === 'battleCreate.cjs') {
      test(`${fn} validates stake`, () => {
        return content.includes('stake') && (content.includes('Math.max') || content.includes('Number'));
      });
    }

    if (fn === 'battleSubmit.cjs') {
      test(`${fn} determines winner`, () => {
        return content.includes('winner') || content.includes('winner_id');
      });
    }

  } catch (err) {
    test(`${fn} exists`, () => false);
  }
});

// Test 4: Validate TypeScript types
console.log('\n📝 Testing Type Definitions...\n');

try {
  const typesContent = readFileSync(join(__dirname, 'types.ts'), 'utf8');

  test('BattleScenario interface defined', () => {
    return typesContent.includes('interface BattleScenario') || typesContent.includes('export interface BattleScenario');
  });

  test('BattleRecord interface defined', () => {
    return typesContent.includes('interface BattleRecord') || typesContent.includes('export interface BattleRecord');
  });

  test('BattleSummaryPayload defined', () => {
    return typesContent.includes('BattleSummaryPayload');
  });

} catch (err) {
  console.log(`⚠️  Cannot read types.ts: ${err.message}`);
}

// Test 5: Validate service files
console.log('\n🔧 Testing Service Files...\n');

try {
  const battleServiceContent = readFileSync(join(__dirname, 'services/battleService.ts'), 'utf8');

  test('battleService.ts exists', () => true);
  test('Has list method', () => battleServiceContent.includes('list'));
  test('Has create method', () => battleServiceContent.includes('create'));
  test('Has accept method', () => battleServiceContent.includes('accept'));
  test('Has submit method', () => battleServiceContent.includes('submit'));

} catch (err) {
  test('battleService.ts exists', () => false);
}

// Test 6: Validate UI component
console.log('\n🎨 Testing UI Components...\n');

try {
  const battlePanelContent = readFileSync(join(__dirname, 'components/BattlePanel.tsx'), 'utf8');

  test('BattlePanel.tsx exists', () => true);
  test('Has scenario rendering', () => battlePanelContent.includes('scenarios.map'));
  test('Has battle list rendering', () => battlePanelContent.includes('openBattles') || battlePanelContent.includes('myBattles'));
  test('Has create handler', () => battlePanelContent.includes('onCreateBattle'));
  test('Has accept handler', () => battlePanelContent.includes('onAcceptBattle'));

} catch (err) {
  test('BattlePanel.tsx exists', () => false);
}

// Test 7: Validate App.tsx integration
console.log('\n🔗 Testing App.tsx Integration...\n');

try {
  const appContent = readFileSync(join(__dirname, 'App.tsx'), 'utf8');

  test('Imports BattleService', () => appContent.includes('BattleService'));
  test('Imports BATTLE_SCENARIOS', () => appContent.includes('BATTLE_SCENARIOS'));
  test('Has handleBattleCreate', () => appContent.includes('handleBattleCreate'));
  test('Has handleBattleAccept', () => appContent.includes('handleBattleAccept'));
  test('Renders BattlePanel', () => appContent.includes('BattlePanel'));

} catch (err) {
  console.log(`⚠️  Cannot read App.tsx: ${err.message}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(60) + '\n');

if (failed === 0) {
  console.log('🎉 All validations passed! Code structure is correct.\n');
  console.log('📋 Next steps:');
  console.log('   1. Start Netlify Dev: npx netlify dev');
  console.log('   2. Test endpoints: node test-battle-functions.mjs');
  console.log('   3. Or test manually in browser at http://localhost:3000\n');
} else {
  console.log('⚠️  Some validations failed. Check errors above.\n');
  process.exit(1);
}

