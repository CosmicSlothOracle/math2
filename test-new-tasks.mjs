// Comprehensive test for new task implementations
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the task factory to inspect tasks
const taskFactoryContent = readFileSync(join(__dirname, 'services', 'taskFactory.ts'), 'utf-8');
const bountyCatalogContent = readFileSync(join(__dirname, 'services', 'bountyCatalog.ts'), 'utf-8');

console.log('🧪 Testing New Task Implementations\n');
console.log('=' .repeat(60));

// Test 1: Check for new quest task functions
console.log('\n1️⃣ Checking for new Quest task creation functions...\n');
const newQuestFunctions = [
  'createU1RegalbrettTask',
  'createParallelClearTextTask',
  'createFliesenLTask',
  'createCylinderLiterTask',
  'createMassstabDualTask',
  'createParkPythagorasTask'
];

let foundQuestFunctions = 0;
for (const func of newQuestFunctions) {
  if (taskFactoryContent.includes(func)) {
    console.log(`   ✅ ${func} found`);
    foundQuestFunctions++;
  } else {
    console.log(`   ❌ ${func} NOT found`);
  }
}

console.log(`\n   Summary: ${foundQuestFunctions}/${newQuestFunctions.length} new quest functions found`);

// Test 2: Check for new bounty tasks
console.log('\n2️⃣ Checking for new Bounty tasks in catalog...\n');
const newBountyIds = [
  'u1-bounty-regalbrett',
  'u2-bounty-querlinie-klar',
  'u3-bounty-gartenbeet',
  'u4-bounty-quader-zylinder',
  'u5-bounty-poster',
  'u6-bounty-koordinaten-steigung'
];

let foundBountyTasks = 0;
for (const id of newBountyIds) {
  if (bountyCatalogContent.includes(id)) {
    console.log(`   ✅ ${id} found`);
    foundBountyTasks++;
  } else {
    console.log(`   ❌ ${id} NOT found`);
  }
}

console.log(`\n   Summary: ${foundBountyTasks}/${newBountyIds.length} new bounty tasks found`);

// Test 3: Check for multiInputFields usage
console.log('\n3️⃣ Checking for multiInputFields implementation...\n');
const multiInputPatterns = [
  'multiInputFields',
  'MultiFieldInput',
  'validateAnswer.*field.validator'
];

let foundMultiInput = 0;
for (const pattern of multiInputPatterns) {
  if (taskFactoryContent.includes(pattern) || bountyCatalogContent.includes(pattern)) {
    console.log(`   ✅ Pattern "${pattern}" found`);
    foundMultiInput++;
  }
}

// Count actual multiInputFields usage
const multiInputCount = (taskFactoryContent.match(/multiInputFields:/g) || []).length;
const bountyMultiInputCount = (bountyCatalogContent.match(/multiInputFields:/g) || []).length;

console.log(`\n   Summary: ${multiInputCount} multiInputFields in taskFactory.ts`);
console.log(`            ${bountyMultiInputCount} multiInputFields in bountyCatalog.ts`);

// Test 4: Check for dropdown/options support
console.log('\n4️⃣ Checking for dropdown/options support in MultiInputField...\n');
const typesContent = readFileSync(join(__dirname, 'types.ts'), 'utf-8');
if (typesContent.includes('options?: string[]') && typesContent.includes('MultiInputField')) {
  console.log('   ✅ MultiInputField.options found in types.ts');
} else {
  console.log('   ❌ MultiInputField.options NOT found');
}

const multiFieldInputContent = readFileSync(join(__dirname, 'components', 'MultiFieldInput.tsx'), 'utf-8');
if (multiFieldInputContent.includes('field.options') && multiFieldInputContent.includes('<select')) {
  console.log('   ✅ Dropdown rendering in MultiFieldInput.tsx found');
} else {
  console.log('   ❌ Dropdown rendering NOT found');
}

// Test 5: Check for textvollständige structure (given, asked, instructions)
console.log('\n5️⃣ Checking for textvollständige structure (given, asked, instructions)...\n');
const structurePatterns = [
  'given?:',
  'asked?:',
  'instructions?:'
];

let foundStructure = 0;
for (const pattern of structurePatterns) {
  if (taskFactoryContent.includes(pattern) || bountyCatalogContent.includes(pattern)) {
    console.log(`   ✅ "${pattern}" found`);
    foundStructure++;
  }
}

const givenCount = (taskFactoryContent.match(/given:/g) || []).length;
const askedCount = (taskFactoryContent.match(/asked:/g) || []).length;
const instructionsCount = (taskFactoryContent.match(/instructions:/g) || []).length;

console.log(`\n   Summary: ${givenCount} 'given' fields, ${askedCount} 'asked' fields, ${instructionsCount} 'instructions' fields`);

// Test 6: Check for validators
console.log('\n6️⃣ Checking for validator implementations...\n');
const validatorTypes = [
  'numeric',
  'numericTolerance',
  'keywords',
  'boolean',
  'coordinatePair',
  'equation'
];

let foundValidators = 0;
for (const type of validatorTypes) {
  if (bountyCatalogContent.includes(`type: '${type}'`)) {
    console.log(`   ✅ Validator type '${type}' found`);
    foundValidators++;
  }
}

console.log(`\n   Summary: ${foundValidators}/${validatorTypes.length} validator types found`);

// Final summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 FINAL SUMMARY\n');
console.log(`✅ New Quest Functions: ${foundQuestFunctions}/${newQuestFunctions.length}`);
console.log(`✅ New Bounty Tasks: ${foundBountyTasks}/${newBountyIds.length}`);
console.log(`✅ Multi-Input Fields: ${multiInputCount + bountyMultiInputCount} total`);
console.log(`✅ Structure Fields: ${givenCount + askedCount + instructionsCount} total`);
console.log(`✅ Validator Types: ${foundValidators}/${validatorTypes.length}`);

const allPassed = foundQuestFunctions === newQuestFunctions.length &&
                  foundBountyTasks === newBountyIds.length &&
                  (multiInputCount + bountyMultiInputCount) > 0 &&
                  foundValidators > 0;

if (allPassed) {
  console.log('\n🎉 All critical tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.');
  process.exit(1);
}

