// Test-Script für Supabase-Verbindung
// Führe aus mit: node test-supabase.js
// Oder: npm run test:supabase

const { createClient } = require('@supabase/supabase-js');

// Optional: Lade .env wenn dotenv installiert ist
try {
  require('dotenv').config();
} catch (e) {
  // dotenv nicht installiert - verwende Environment Variables direkt
  console.log('💡 Tipp: Installiere dotenv für .env Support: npm install --save-dev dotenv');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Fehlende Environment Variables!');
  console.log('\n📝 Setze in .env:');
  console.log('   SUPABASE_URL=https://dein-projekt.supabase.co');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key');
  console.log('\n💡 Oder verwende SUPABASE_ANON_KEY für Frontend-Tests');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Teste Supabase-Verbindung...\n');
  console.log(`📍 URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...\n`);

  let allTestsPassed = true;

  // Test 1: Users-Tabelle
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Users-Tabelle: OK');
  } catch (err) {
    console.error('❌ Users-Tabelle Fehler:', err.message);
    allTestsPassed = false;
  }

  // Test 2: Progress-Tabelle
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Progress-Tabelle: OK');
  } catch (err) {
    console.error('❌ Progress-Tabelle Fehler:', err.message);
    allTestsPassed = false;
  }

  // Test 3: Coin Ledger
  try {
    const { data, error } = await supabase
      .from('coin_ledger')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Coin Ledger: OK');
  } catch (err) {
    console.error('❌ Coin Ledger Fehler:', err.message);
    allTestsPassed = false;
  }

  // Test 4: Messages-Tabelle (optional)
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Messages-Tabelle: OK');
  } catch (err) {
    console.error('❌ Messages-Tabelle Fehler:', err.message);
    // Nicht kritisch, nur Warnung
  }

  // Test 5: User Upsert (Schreibtest)
  try {
    const testUserId = 'test-user-' + Date.now();
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: testUserId,
        display_name: 'Test User',
        coins: 0
      }, { onConflict: 'id' })
      .select();

    if (error) throw error;
    console.log('✅ User Upsert: OK (Test-User erstellt)');

    // Cleanup: Lösche Test-User
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('   🧹 Test-User gelöscht');
  } catch (err) {
    console.error('❌ User Upsert Fehler:', err.message);
    allTestsPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('✨ Alle Tests bestanden! Supabase ist bereit.');
  } else {
    console.log('⚠️  Einige Tests fehlgeschlagen. Prüfe Fehlermeldungen oben.');
    console.log('\n💡 Tipp: Führe docs/supabase_schema.sql im Supabase SQL Editor aus.');
  }
  console.log('='.repeat(50));
}

testConnection().catch(err => {
  console.error('💥 Unerwarteter Fehler:', err);
  process.exit(1);
});

