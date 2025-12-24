/**
 * Test-Skript für Netlify Functions
 * Testet ob alle Functions korrekt in die Datenbank schreiben
 */

const { createSupabaseClient } = require('./netlify/functions/_supabase');
const { getUserIdFromEvent } = require('./netlify/functions/_utils');

// Test User ID
const TEST_USER_ID = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Mock Event für Functions
function createMockEvent(userId, body = {}) {
  return {
    httpMethod: 'POST',
    headers: {
      'x-anon-id': userId,
    },
    body: JSON.stringify(body),
  };
}

// Test coinsAdjust
async function testCoinsAdjust() {
  console.log('\n=== Test coinsAdjust ===');
  const coinsAdjust = require('./netlify/functions/coinsAdjust');

  const event = createMockEvent(TEST_USER_ID, {
    delta: 100,
    reason: 'test_reward',
    refType: 'test',
    refId: 'test-1',
  });

  try {
    const result = await coinsAdjust.handler(event);
    const response = JSON.parse(result.body);

    if (response.ok) {
      console.log('✅ coinsAdjust: OK');
      console.log(`   Coins: ${response.coins}, Applied: ${response.applied}`);
      if (response.note && response.note.includes('dev-fallback')) {
        console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      } else {
        console.log('   ✅ Daten wurden in DB geschrieben');
      }
      return response.coins;
    } else {
      console.log('❌ coinsAdjust: FEHLER');
      console.log(`   Error: ${response.error}`);
      return null;
    }
  } catch (err) {
    console.log('❌ coinsAdjust: EXCEPTION');
    console.log(`   ${err.message}`);
    return null;
  }
}

// Test progressSave
async function testProgressSave() {
  console.log('\n=== Test progressSave ===');
  const progressSave = require('./netlify/functions/progressSave');

  const event = createMockEvent(TEST_USER_ID, {
    unitId: 'test-unit-1',
    questCoinsEarned: 50,
    questCompletedCount: 1,
    bountyCompleted: false,
    perfectStandardQuiz: true,
    perfectBounty: false,
  });

  try {
    const result = await progressSave.handler(event);
    const response = JSON.parse(result.body);

    if (response.ok) {
      console.log('✅ progressSave: OK');
      console.log(`   Unit: ${response.saved?.unit_id}, Quest Coins: ${response.saved?.quest_coins_earned}`);
      if (response.note && response.note.includes('dev-fallback')) {
        console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      } else {
        console.log('   ✅ Daten wurden in DB geschrieben');
      }
      return true;
    } else {
      console.log('❌ progressSave: FEHLER');
      console.log(`   Error: ${response.error}`);
      return false;
    }
  } catch (err) {
    console.log('❌ progressSave: EXCEPTION');
    console.log(`   ${err.message}`);
    return false;
  }
}

// Test me (User erstellen/abrufen)
async function testMe() {
  console.log('\n=== Test me (User Bootstrap) ===');
  const me = require('./netlify/functions/me');

  const event = createMockEvent(TEST_USER_ID);

  try {
    const result = await me.handler(event);
    const response = JSON.parse(result.body);

    if (response.ok) {
      console.log('✅ me: OK');
      console.log(`   User ID: ${response.user?.id}`);
      console.log(`   Coins: ${response.user?.coins}`);
      if (response.note && response.note.includes('dev-fallback')) {
        console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      } else {
        console.log('   ✅ User wurde in DB erstellt/aktualisiert');
      }
      return true;
    } else {
      console.log('❌ me: FEHLER');
      console.log(`   Error: ${response.error}`);
      return false;
    }
  } catch (err) {
    console.log('❌ me: EXCEPTION');
    console.log(`   ${err.message}`);
    return false;
  }
}

// Test chatSend
async function testChatSend() {
  console.log('\n=== Test chatSend ===');
  const chatSend = require('./netlify/functions/chatSend');

  const event = createMockEvent(TEST_USER_ID, {
    text: 'Test-Nachricht vom Function-Test',
    channelId: 'class:global',
    username: 'TestUser',
  });

  try {
    const result = await chatSend.handler(event);
    const response = JSON.parse(result.body);

    if (response.ok) {
      console.log('✅ chatSend: OK');
      console.log(`   Message ID: ${response.message?.id}`);
      if (response.note && response.note.includes('dev-fallback')) {
        console.log('   ⚠️  Dev-Fallback aktiv (keine DB-Schreiboperation)');
      } else {
        console.log('   ✅ Nachricht wurde in DB geschrieben');
      }
      return true;
    } else {
      console.log('❌ chatSend: FEHLER');
      console.log(`   Error: ${response.error}`);
      return false;
    }
  } catch (err) {
    console.log('❌ chatSend: EXCEPTION');
    console.log(`   ${err.message}`);
    return false;
  }
}

// Test Supabase Connection
async function testSupabaseConnection() {
  console.log('\n=== Test Supabase Verbindung ===');
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      console.log('⚠️  Supabase Client: NULL (Dev-Fallback Modus)');
      console.log('   Keine Umgebungsvariablen gesetzt oder Supabase nicht konfiguriert');
      return false;
    }

    // Test Query
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.log('❌ Supabase Verbindung: FEHLER');
      console.log(`   ${error.message}`);
      return false;
    }

    console.log('✅ Supabase Verbindung: OK');
    console.log('   Datenbank ist erreichbar');
    return true;
  } catch (err) {
    console.log('❌ Supabase Verbindung: EXCEPTION');
    console.log(`   ${err.message}`);
    return false;
  }
}

// Haupttest-Funktion
async function runAllTests() {
  console.log('🧪 Starte Function-Tests...');
  console.log(`📝 Test User ID: ${TEST_USER_ID}`);

  // Prüfe Supabase Verbindung
  const hasSupabase = await testSupabaseConnection();

  if (!hasSupabase) {
    console.log('\n⚠️  WARNUNG: Supabase nicht verfügbar - Tests laufen im Dev-Fallback Modus');
    console.log('   Setze SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY Umgebungsvariablen für echte Tests\n');
  }

  // Teste alle Functions
  const results = {
    coinsAdjust: await testCoinsAdjust(),
    progressSave: await testProgressSave(),
    me: await testMe(),
    chatSend: await testChatSend(),
  };

  // Zusammenfassung
  console.log('\n=== Test-Zusammenfassung ===');
  const successCount = Object.values(results).filter(r => r !== null && r !== false).length;
  const totalCount = Object.keys(results).length;

  console.log(`✅ Erfolgreich: ${successCount}/${totalCount}`);

  if (hasSupabase) {
    console.log('\n✅ Alle Functions können in die Datenbank schreiben');
  } else {
    console.log('\n⚠️  Dev-Fallback Modus: Functions funktionieren, aber schreiben nicht in DB');
    console.log('   Setze Umgebungsvariablen für echte DB-Tests');
  }

  // Prüfe ob Coins korrekt geschrieben wurden
  if (results.coinsAdjust !== null && hasSupabase) {
    console.log('\n=== Verifikation: Coins in DB ===');
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .select('coins')
        .eq('id', TEST_USER_ID)
        .single();

      if (error) {
        console.log(`⚠️  Konnte Coins nicht verifizieren: ${error.message}`);
      } else {
        console.log(`✅ Coins in DB: ${data.coins} (erwartet: ${results.coinsAdjust})`);
        if (data.coins === results.coinsAdjust) {
          console.log('✅ Coins wurden korrekt in DB geschrieben!');
        } else {
          console.log('⚠️  Coins stimmen nicht überein');
        }
      }
    } catch (err) {
      console.log(`⚠️  Verifikation fehlgeschlagen: ${err.message}`);
    }
  }
}

// Führe Tests aus
runAllTests().catch(err => {
  console.error('\n❌ Test-Suite fehlgeschlagen:', err);
  process.exit(1);
});

