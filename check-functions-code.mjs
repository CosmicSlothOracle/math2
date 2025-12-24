/**
 * Code-Analyse für Netlify Functions
 * Prüft ob alle Functions korrekt implementiert sind und in die DB schreiben können
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const FUNCTIONS_DIR = 'netlify/functions';

// Prüfe Function-Datei
function checkFunction(fileName, checkFn) {
  console.log(`\n=== Prüfe ${fileName} ===`);

  try {
    const filePath = join(FUNCTIONS_DIR, fileName);
    const content = readFileSync(filePath, 'utf-8');

    // Rufe die Check-Funktion auf, die ein Objekt mit Checks zurückgibt
    const checks = checkFn(content);
    const results = {};

    for (const [checkName, checkResult] of Object.entries(checks)) {
      try {
        results[checkName] = checkResult;
        if (checkResult.pass) {
          console.log(`✅ ${checkName}: ${checkResult.message || 'OK'}`);
        } else {
          console.log(`❌ ${checkName}: ${checkResult.message || 'FEHLER'}`);
        }
      } catch (err) {
        console.log(`⚠️  ${checkName}: Exception - ${err.message}`);
        results[checkName] = { pass: false, message: err.message };
      }
    }

    return results;
  } catch (err) {
    console.log(`❌ Datei nicht gefunden: ${fileName}`);
    return null;
  }
}

// Checks für coinsAdjust
function checkCoinsAdjust(content) {
  const checks = {
    hasSupabaseCheck: {
      pass: content.includes('createSupabaseClient()'),
      message: 'Verwendet Supabase Client'
    },
    hasUpdate: {
      pass: content.includes('.update(') && content.includes('users'),
      message: 'Aktualisiert users Tabelle'
    },
    hasLedgerInsert: {
      pass: content.includes('coin_ledger') && content.includes('.insert('),
      message: 'Schreibt in coin_ledger Tabelle'
    },
    hasErrorHandling: {
      pass: content.includes('error') && content.includes('catch'),
      message: 'Hat Error-Handling'
    },
    hasDevFallback: {
      pass: content.includes('dev-fallback') || content.includes('dev fallback'),
      message: 'Hat Dev-Fallback'
    },
    returnsCorrectShape: {
      pass: content.includes('coins:') && content.includes('applied:'),
      message: 'Gibt korrekte Response-Form zurück'
    }
  };
  return checks;
}

// Checks für progressSave
function checkProgressSave(content) {
  const checks = {
    hasSupabaseCheck: {
      pass: content.includes('createSupabaseClient()'),
      message: 'Verwendet Supabase Client'
    },
    hasUpsert: {
      pass: content.includes('.upsert(') && content.includes('progress'),
      message: 'Upsert in progress Tabelle'
    },
    hasConflictHandling: {
      pass: content.includes('onConflict') || content.includes('user_id,unit_id'),
      message: 'Behandelt Konflikte korrekt'
    },
    hasErrorHandling: {
      pass: content.includes('error') && content.includes('catch'),
      message: 'Hat Error-Handling'
    },
    hasDevFallback: {
      pass: content.includes('dev-fallback') || content.includes('dev fallback'),
      message: 'Hat Dev-Fallback'
    },
    hasAllFields: {
      pass: content.includes('perfect_standard_quiz') && content.includes('perfect_bounty'),
      message: 'Speichert alle erforderlichen Felder'
    }
  };
  return checks;
}

// Checks für me
function checkMe(content) {
  const checks = {
    hasSupabaseCheck: {
      pass: content.includes('createSupabaseClient()'),
      message: 'Verwendet Supabase Client'
    },
    hasUpsert: {
      pass: content.includes('.upsert(') && content.includes('users'),
      message: 'Erstellt/aktualisiert User'
    },
    hasProgressFetch: {
      pass: content.includes('progress') && content.includes('.select('),
      message: 'Lädt Progress-Daten'
    },
    hasErrorHandling: {
      pass: content.includes('error') && content.includes('catch'),
      message: 'Hat Error-Handling'
    },
    hasDevFallback: {
      pass: content.includes('dev-fallback') || content.includes('dev fallback'),
      message: 'Hat Dev-Fallback'
    },
    reconstructsArrays: {
      pass: content.includes('perfectStandardQuizUnits') && content.includes('perfectBountyUnits'),
      message: 'Rekonstruiert Arrays aus Progress'
    }
  };
  return checks;
}

// Checks für chatSend
function checkChatSend(content) {
  const checks = {
    hasSupabaseCheck: {
      pass: content.includes('createSupabaseClient()'),
      message: 'Verwendet Supabase Client'
    },
    hasInsert: {
      pass: content.includes('.insert(') && content.includes('messages'),
      message: 'Schreibt in messages Tabelle'
    },
    hasErrorHandling: {
      pass: content.includes('error') && content.includes('catch'),
      message: 'Hat Error-Handling'
    },
    hasDevFallback: {
      pass: content.includes('dev-fallback') || content.includes('dev fallback'),
      message: 'Hat Dev-Fallback'
    },
    validatesInput: {
      pass: content.includes('text') && (content.includes('trim()') || content.includes('toString()')),
      message: 'Validiert Eingabe'
    }
  };
  return checks;
}

// Hauptprüfung
console.log('🔍 Prüfe Netlify Functions Code...\n');

const results = {
  coinsAdjust: checkFunction('coinsAdjust.js', checkCoinsAdjust),
  progressSave: checkFunction('progressSave.js', checkProgressSave),
  me: checkFunction('me.js', checkMe),
  chatSend: checkFunction('chatSend.js', checkChatSend),
};

// Zusammenfassung
console.log('\n=== Zusammenfassung ===');

let allPass = true;
for (const [functionName, functionResults] of Object.entries(results)) {
  if (!functionResults) {
    console.log(`❌ ${functionName}: Datei nicht gefunden`);
    allPass = false;
    continue;
  }

  const passCount = Object.values(functionResults).filter(r => r.pass).length;
  const totalCount = Object.keys(functionResults).length;

  if (passCount === totalCount) {
    console.log(`✅ ${functionName}: Alle Checks bestanden (${passCount}/${totalCount})`);
  } else {
    console.log(`⚠️  ${functionName}: ${passCount}/${totalCount} Checks bestanden`);
    allPass = false;
  }
}

// Prüfe _supabase.js
console.log('\n=== Prüfe _supabase.js ===');
try {
  const supabaseContent = readFileSync(join(FUNCTIONS_DIR, '_supabase.js'), 'utf-8');
  const hasEnvCheck = supabaseContent.includes('SUPABASE_URL') && supabaseContent.includes('process.env');
  const hasClientCreation = supabaseContent.includes('createClient');
  const hasNullFallback = supabaseContent.includes('return null');

  console.log(hasEnvCheck ? '✅ Prüft Umgebungsvariablen' : '❌ Prüft Umgebungsvariablen nicht');
  console.log(hasClientCreation ? '✅ Erstellt Supabase Client' : '❌ Erstellt keinen Supabase Client');
  console.log(hasNullFallback ? '✅ Hat Null-Fallback' : '❌ Hat keinen Null-Fallback');
} catch (err) {
  console.log('❌ _supabase.js nicht gefunden');
}

// Prüfe _utils.js
console.log('\n=== Prüfe _utils.js ===');
try {
  const utilsContent = readFileSync(join(FUNCTIONS_DIR, '_utils.js'), 'utf-8');
  const hasGetUserId = utilsContent.includes('getUserIdFromEvent');
  const hasAnonId = utilsContent.includes('anon_');
  const hasCookieSupport = utilsContent.includes('cookie') || utilsContent.includes('Cookie');

  console.log(hasGetUserId ? '✅ Hat getUserIdFromEvent' : '❌ Hat kein getUserIdFromEvent');
  console.log(hasAnonId ? '✅ Unterstützt anonyme IDs' : '❌ Unterstützt keine anonymen IDs');
  console.log(hasCookieSupport ? '✅ Unterstützt Cookies' : '❌ Unterstützt keine Cookies');
} catch (err) {
  console.log('❌ _utils.js nicht gefunden');
}

console.log('\n=== Ergebnis ===');
if (allPass) {
  console.log('✅ Alle Functions sind korrekt implementiert!');
  console.log('\n📝 Nächste Schritte:');
  console.log('   1. Starte netlify dev: netlify dev');
  console.log('   2. Führe aus: node test-functions-simple.mjs');
  console.log('   3. Prüfe ob Functions in die DB schreiben');
} else {
  console.log('⚠️  Einige Functions haben Probleme - siehe Details oben');
}

