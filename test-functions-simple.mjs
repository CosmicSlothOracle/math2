/**
 * Einfaches Test-Skript für Netlify Functions
 * Testet ob alle Functions korrekt schreiben
 *
 * Verwendung:
 * 1. Starte netlify dev in einem Terminal
 * 2. Führe aus: node test-functions-simple.mjs
 */

const BASE_URL = 'http://localhost:8888';
const TEST_USER_ID = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Helper: HTTP Request
async function request(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-anon-id': TEST_USER_ID,
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return { status: response.status, data };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

// Test 1: Supabase Connection (via /me)
async function testMe() {
  console.log('\n=== Test 1: /me (User Bootstrap) ===');
  const result = await request('GET', '/.netlify/functions/me');

  if (result.status === 200 && result.data?.ok) {
    console.log('✅ /me: OK');
    console.log(`   User ID: ${result.data.user?.id}`);
    console.log(`   Coins: ${result.data.user?.coins}`);
    if (result.data.note?.includes('dev-fallback')) {
      console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      return { success: true, hasSupabase: false };
    } else {
      console.log('   ✅ User wurde in DB erstellt/aktualisiert');
      return { success: true, hasSupabase: true, userId: result.data.user?.id };
    }
  } else {
    console.log('❌ /me: FEHLER');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data?.error || result.error}`);
    return { success: false };
  }
}

// Test 2: coinsAdjust
async function testCoinsAdjust(userId) {
  console.log('\n=== Test 2: /coinsAdjust ===');
  const result = await request('POST', '/.netlify/functions/coinsAdjust', {
    delta: 100,
    reason: 'test_reward',
    refType: 'test',
    refId: 'test-1',
  });

  if (result.status === 200 && result.data?.ok) {
    console.log('✅ coinsAdjust: OK');
    console.log(`   Coins: ${result.data.coins}, Applied: ${result.data.applied}`);
    if (result.data.note?.includes('dev-fallback')) {
      console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      return { success: true, hasSupabase: false, coins: result.data.coins };
    } else {
      console.log('   ✅ Coins wurden in DB geschrieben');
      return { success: true, hasSupabase: true, coins: result.data.coins };
    }
  } else {
    console.log('❌ coinsAdjust: FEHLER');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data?.error || result.error}`);
    return { success: false };
  }
}

// Test 3: progressSave
async function testProgressSave(userId) {
  console.log('\n=== Test 3: /progressSave ===');
  const result = await request('POST', '/.netlify/functions/progressSave', {
    unitId: 'test-unit-1',
    questCoinsEarned: 50,
    questCompletedCount: 1,
    bountyCompleted: false,
    perfectStandardQuiz: true,
    perfectBounty: false,
  });

  if (result.status === 200 && result.data?.ok) {
    console.log('✅ progressSave: OK');
    console.log(`   Unit: ${result.data.saved?.unit_id}, Quest Coins: ${result.data.saved?.quest_coins_earned}`);
    if (result.data.note?.includes('dev-fallback')) {
      console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      return { success: true, hasSupabase: false };
    } else {
      console.log('   ✅ Progress wurde in DB geschrieben');
      return { success: true, hasSupabase: true };
    }
  } else {
    console.log('❌ progressSave: FEHLER');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data?.error || result.error}`);
    return { success: false };
  }
}

// Test 4: chatSend
async function testChatSend(userId) {
  console.log('\n=== Test 4: /chatSend ===');
  const result = await request('POST', '/.netlify/functions/chatSend', {
    text: 'Test-Nachricht vom Function-Test',
    channelId: 'class:global',
    username: 'TestUser',
  });

  if (result.status === 200 && result.data?.ok) {
    console.log('✅ chatSend: OK');
    console.log(`   Message ID: ${result.data.message?.id}`);
    if (result.data.note?.includes('dev-fallback')) {
      console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      return { success: true, hasSupabase: false };
    } else {
      console.log('   ✅ Nachricht wurde in DB geschrieben');
      return { success: true, hasSupabase: true };
    }
  } else {
    console.log('❌ chatSend: FEHLER');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data?.error || result.error}`);
    return { success: false };
  }
}

// Test 5: progressGet
async function testProgressGet(userId) {
  console.log('\n=== Test 5: /progressGet ===');
  const result = await request('GET', '/.netlify/functions/progressGet?unitId=test-unit-1');

  if (result.status === 200 && result.data?.ok !== false) {
    console.log('✅ progressGet: OK');
    console.log(`   Progress: ${JSON.stringify(result.data)}`);
    return { success: true };
  } else {
    console.log('❌ progressGet: FEHLER');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data?.error || result.error}`);
    return { success: false };
  }
}

// Haupttest
async function runAllTests() {
  console.log('🧪 Starte Function-Tests...');
  console.log(`📝 Test User ID: ${TEST_USER_ID}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('\n⚠️  Stelle sicher, dass "netlify dev" in einem anderen Terminal läuft!');
  console.log('   Warte 2 Sekunden...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 1: User Bootstrap
  const meResult = await testMe();
  if (!meResult.success) {
    console.log('\n❌ /me Test fehlgeschlagen - kann nicht fortfahren');
    console.log('   Stelle sicher, dass netlify dev läuft!');
    process.exit(1);
  }

  const userId = meResult.userId || TEST_USER_ID;
  const hasSupabase = meResult.hasSupabase;

  // Test 2-5: Andere Functions
  const results = {
    coinsAdjust: await testCoinsAdjust(userId),
    progressSave: await testProgressSave(userId),
    chatSend: await testChatSend(userId),
    progressGet: await testProgressGet(userId),
  };

  // Zusammenfassung
  console.log('\n=== Test-Zusammenfassung ===');
  const successCount = Object.values(results).filter(r => r?.success).length;
  const totalCount = Object.keys(results).length;

  console.log(`✅ Erfolgreich: ${successCount + 1}/${totalCount + 1} (inkl. /me)`);

  if (hasSupabase) {
    console.log('\n✅ Supabase ist konfiguriert - Functions schreiben in die Datenbank');
  } else {
    console.log('\n⚠️  Dev-Fallback Modus: Functions funktionieren, aber schreiben nicht in DB');
    console.log('   Setze SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY für echte DB-Tests');
  }

  // Verifikation: Prüfe ob Coins korrekt geschrieben wurden
  if (results.coinsAdjust?.hasSupabase && results.coinsAdjust?.coins) {
    console.log('\n=== Verifikation: Coins in DB ===');
    const verifyResult = await request('GET', '/.netlify/functions/me');
    if (verifyResult.data?.user?.coins === results.coinsAdjust.coins) {
      console.log(`✅ Coins wurden korrekt in DB geschrieben: ${verifyResult.data.user.coins}`);
    } else {
      console.log(`⚠️  Coins stimmen nicht überein:`);
      console.log(`   Erwartet: ${results.coinsAdjust.coins}`);
      console.log(`   Aktuell: ${verifyResult.data?.user?.coins}`);
    }
  }

  console.log('\n✅ Tests abgeschlossen!');
}

// Führe Tests aus
runAllTests().catch(err => {
  console.error('\n❌ Test-Suite fehlgeschlagen:', err);
  console.error('\nMögliche Ursachen:');
  console.error('1. netlify dev läuft nicht - starte es mit: netlify dev');
  console.error('2. Port 8888 ist nicht erreichbar');
  console.error('3. Functions haben einen Fehler');
  process.exit(1);
});

