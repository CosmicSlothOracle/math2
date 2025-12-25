#!/usr/bin/env node
/**
 * SUPABASE DIAGNOSTIC TEST SUITE
 * ==============================
 *
 * Dieses Script identifiziert systematisch die Ursachen für:
 * - Shop-Käufe nicht möglich
 * - Coins sammeln nicht möglich
 * - User ist immer NaN
 * - Keine Persistenz für Progress
 * - Chat funktioniert (aber nichts anderes)
 *
 * Verwendung:
 *   node tests/supabase-diagnostic.mjs [BASE_URL]
 *
 * Beispiele:
 *   node tests/supabase-diagnostic.mjs                          # Testet localhost:8888
 *   node tests/supabase-diagnostic.mjs https://realer-math.netlify.app  # Testet Production
 */

const BASE_URL = process.argv[2] || 'http://localhost:8888';
const TEST_USER_ID = `diagnostic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ANSI Colors für Terminal-Output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const log = {
  header: (text) => console.log(`\n${colors.bold}${colors.cyan}${'═'.repeat(60)}${colors.reset}`),
  section: (text) => console.log(`\n${colors.bold}${colors.blue}▶ ${text}${colors.reset}`),
  pass: (text) => console.log(`  ${colors.green}✓ ${text}${colors.reset}`),
  fail: (text) => console.log(`  ${colors.red}✗ ${text}${colors.reset}`),
  warn: (text) => console.log(`  ${colors.yellow}⚠ ${text}${colors.reset}`),
  info: (text) => console.log(`  ${colors.dim}ℹ ${text}${colors.reset}`),
  detail: (text) => console.log(`    ${colors.dim}${text}${colors.reset}`),
  critical: (text) => console.log(`\n${colors.bold}${colors.red}🚨 KRITISCH: ${text}${colors.reset}`),
  recommendation: (text) => console.log(`${colors.yellow}💡 ${text}${colors.reset}`),
};

// Results collector
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  criticalIssues: [],
  recommendations: [],
};

async function fetchJson(path, options = {}) {
  const url = `${BASE_URL}/.netlify/functions/${path}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-anon-id': TEST_USER_ID,
        ...options.headers,
      },
      ...options,
    });

    const text = await resp.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // Not JSON
    }

    return {
      ok: resp.ok,
      status: resp.status,
      text,
      json,
      headers: Object.fromEntries(resp.headers.entries()),
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message,
      text: null,
      json: null,
    };
  }
}

// ==================== TEST SUITES ====================

async function testDebugEndpoint() {
  log.section('1. DEBUG ENDPOINT - Supabase Konfiguration');

  const resp = await fetchJson('debugSupabase');

  if (resp.status === 0) {
    log.fail(`Server nicht erreichbar: ${resp.error}`);
    results.failed++;
    results.criticalIssues.push('Server nicht erreichbar - ist netlify dev gestartet?');
    return false;
  }

  if (!resp.json) {
    log.fail(`Ungültige Antwort: ${resp.text?.slice(0, 100)}`);
    results.failed++;
    return false;
  }

  const debug = resp.json.debug || resp.json;

  // Check Env Vars
  if (debug.env) {
    if (debug.env.SUPABASE_URL) {
      log.pass('SUPABASE_URL ist gesetzt');
      results.passed++;
    } else {
      log.fail('SUPABASE_URL fehlt!');
      results.failed++;
      results.criticalIssues.push('SUPABASE_URL Environment Variable fehlt');
    }

    if (debug.env.KEY_TYPE === 'SERVICE_ROLE') {
      log.pass('SUPABASE_SERVICE_ROLE_KEY ist gesetzt (empfohlen)');
      results.passed++;
    } else if (debug.env.KEY_TYPE === 'ANON') {
      log.warn('Nur ANON KEY gesetzt - RLS könnte Probleme verursachen');
      results.warnings++;
    } else {
      log.fail('Kein Supabase Key gefunden!');
      results.failed++;
      results.criticalIssues.push('Kein Supabase API Key konfiguriert');
    }
  } else {
    log.warn('Debug-Endpoint gibt keine env-Info zurück');
    results.warnings++;
  }

  // Check Client
  if (debug.client) {
    if (debug.client.created) {
      log.pass('Supabase Client erstellt');
      results.passed++;
    } else {
      log.fail('Supabase Client konnte nicht erstellt werden');
      results.failed++;
      results.criticalIssues.push('Supabase Client-Erstellung fehlgeschlagen');
    }

    if (debug.client.testQuery?.success) {
      log.pass('Test-Query erfolgreich');
      results.passed++;
    } else {
      log.fail(`Test-Query fehlgeschlagen: ${debug.client.testQuery?.error || 'unbekannt'}`);
      results.failed++;
    }
  }

  // Check Package
  if (debug.package) {
    if (debug.package.installed) {
      log.pass('@supabase/supabase-js ist installiert');
      results.passed++;
    } else {
      log.fail('@supabase/supabase-js ist nicht installiert!');
      results.failed++;
      results.criticalIssues.push('@supabase/supabase-js Package fehlt');
    }
  }

  // Check for dev-fallback
  if (resp.json.note?.includes('dev-fallback')) {
    log.critical('Server läuft im DEV-FALLBACK Modus!');
    results.criticalIssues.push('Supabase läuft im dev-fallback - keine Persistenz!');
  }

  return !resp.json.note?.includes('dev-fallback');
}

async function testMeEndpoint() {
  log.section('2. /me ENDPOINT - User-Erstellung & ID-Konsistenz');

  const resp = await fetchJson('me');

  if (!resp.ok) {
    log.fail(`/me Fehler: Status ${resp.status}`);
    results.failed++;
    return null;
  }

  const data = resp.json;

  // Check for dev-fallback
  if (data.note?.includes('dev-fallback')) {
    log.warn(`Dev-Fallback aktiv: ${data.note}`);
    results.warnings++;
    log.detail(`Grund: ${data.warning || 'unbekannt'}`);
    if (data.error) log.detail(`Error: ${data.error}`);
  } else {
    log.pass('Echte Supabase-Verbindung');
    results.passed++;
  }

  // Check User object
  if (!data.user) {
    log.fail('Kein User-Objekt in Response');
    results.failed++;
    return null;
  }

  const user = data.user;

  // Check User ID
  if (user.id) {
    log.pass(`User ID vorhanden: ${user.id.slice(0, 30)}...`);
    results.passed++;

    // Prüfe ob ID mit gesendeter ID übereinstimmt
    if (user.id === TEST_USER_ID || user.id.startsWith('anon_')) {
      log.pass('User ID ist konsistent mit Request');
      results.passed++;
    } else {
      log.warn(`User ID weicht ab! Gesendet: ${TEST_USER_ID.slice(0, 20)}, Erhalten: ${user.id.slice(0, 20)}`);
      results.warnings++;
    }
  } else {
    log.fail('User ID fehlt!');
    results.failed++;
    results.criticalIssues.push('User-Objekt hat keine ID');
  }

  // Check Coins - THE CRITICAL NaN CHECK
  if (typeof user.coins === 'number' && Number.isFinite(user.coins)) {
    log.pass(`Coins sind gültige Zahl: ${user.coins}`);
    results.passed++;
  } else {
    log.critical(`COINS SIND UNGÜLTIG: ${user.coins} (Type: ${typeof user.coins})`);
    results.failed++;
    results.criticalIssues.push(`User.coins ist ${user.coins} (NaN/undefined) - Dies verursacht die NaN-Probleme!`);
  }

  // Check Set-Cookie Header
  if (resp.headers['set-cookie']?.includes('mm_anon_id')) {
    log.pass('Set-Cookie Header für mm_anon_id vorhanden');
    results.passed++;
  } else {
    log.warn('Kein Set-Cookie Header - ID-Persistenz könnte fehlschlagen');
    results.warnings++;
  }

  return user;
}

async function testCoinsAdjust(user) {
  log.section('3. /coinsAdjust ENDPOINT - Coin-Operationen');

  if (!user?.id) {
    log.warn('Überspringe - kein User vorhanden');
    return false;
  }

  // Test: Add coins
  const addResp = await fetchJson('coinsAdjust', {
    method: 'POST',
    body: JSON.stringify({
      delta: 100,
      reason: 'diagnostic_test',
      refType: 'test',
      refId: 'diagnostic',
    }),
  });

  if (!addResp.ok) {
    log.fail(`coinsAdjust Fehler: Status ${addResp.status}`);
    log.detail(JSON.stringify(addResp.json || addResp.text, null, 2));
    results.failed++;
    return false;
  }

  const addData = addResp.json;

  // Check for dev-fallback
  if (addData.note?.includes('dev-fallback')) {
    log.warn('Dev-Fallback aktiv - Coins werden nicht persistiert!');
    results.warnings++;
    results.recommendations.push('Supabase-Verbindung reparieren für Coin-Persistenz');
  } else {
    log.pass('Echte Supabase-Operation');
    results.passed++;
  }

  // Check response shape
  if (typeof addData.coins === 'number' && Number.isFinite(addData.coins)) {
    log.pass(`Coins nach +100: ${addData.coins}`);
    results.passed++;
  } else {
    log.fail(`Ungültiger Coins-Wert: ${addData.coins}`);
    results.failed++;
    results.criticalIssues.push('coinsAdjust gibt ungültigen Coins-Wert zurück');
  }

  if (typeof addData.applied === 'number') {
    log.pass(`Applied delta: ${addData.applied}`);
    results.passed++;
  } else {
    log.fail(`Kein 'applied' Wert: ${JSON.stringify(addData)}`);
    results.failed++;
  }

  // Check userId consistency
  if (addData.userId) {
    if (addData.userId === TEST_USER_ID) {
      log.pass('UserId in Response konsistent');
      results.passed++;
    } else {
      log.warn(`UserId-Mismatch! Gesendet: ${TEST_USER_ID.slice(0, 15)}, Response: ${addData.userId.slice(0, 15)}`);
      results.warnings++;
    }
  }

  return addData;
}

async function testShopBuy(user) {
  log.section('4. /shopBuy ENDPOINT - Shop-Käufe');

  if (!user?.id) {
    log.warn('Überspringe - kein User vorhanden');
    return false;
  }

  const buyResp = await fetchJson('shopBuy', {
    method: 'POST',
    body: JSON.stringify({
      itemId: 'test_item_diagnostic',
      itemCost: 10,
    }),
  });

  const buyData = buyResp.json;

  if (!buyResp.ok && buyResp.status !== 400) {
    log.fail(`shopBuy Fehler: Status ${buyResp.status}`);
    log.detail(JSON.stringify(buyData, null, 2));
    results.failed++;

    // Check for specific errors
    if (buyData?.error === 'USER_FETCH_FAILED') {
      log.critical('User konnte nicht aus DB geladen werden!');
      results.criticalIssues.push('shopBuy: USER_FETCH_FAILED - User existiert nicht in users-Tabelle');
    }

    if (buyData?.error === 'USER_NOT_FOUND') {
      log.critical('User existiert nicht in der Datenbank!');
      log.detail(`UserId: ${buyData.userId}`);
      results.criticalIssues.push('shopBuy: User wurde nicht gefunden - /me erstellt User nicht korrekt');
    }

    if (buyData?.details?.includes('unlocked_items')) {
      log.critical('Spalte "unlocked_items" fehlt in users-Tabelle!');
      results.criticalIssues.push('DB-Schema unvollständig: "unlocked_items" Spalte fehlt');
      results.recommendations.push('Migration ausführen: ALTER TABLE users ADD COLUMN unlocked_items text[] DEFAULT ARRAY[]::text[];');
    }

    return false;
  }

  // Check for dev-fallback
  if (buyData.note?.includes('dev-fallback')) {
    log.warn('Dev-Fallback aktiv - Shop-Käufe werden nicht persistiert!');
    results.warnings++;
  } else if (buyData.error === 'INSUFFICIENT_COINS') {
    log.info('Nicht genug Coins (erwartet für neuen User)');
    log.pass('Shop-Validierung funktioniert');
    results.passed++;
  } else if (buyData.error === 'ITEM_ALREADY_OWNED') {
    log.info('Item bereits gekauft');
    log.pass('Shop-Duplikat-Check funktioniert');
    results.passed++;
  } else if (buyData.ok) {
    log.pass(`Shop-Kauf erfolgreich: Coins jetzt ${buyData.coins}`);
    results.passed++;
  }

  return buyData;
}

async function testProgressSave(user) {
  log.section('5. /progressSave ENDPOINT - Progress-Speicherung');

  if (!user?.id) {
    log.warn('Überspringe - kein User vorhanden');
    return false;
  }

  const saveResp = await fetchJson('progressSave', {
    method: 'POST',
    body: JSON.stringify({
      unitId: 'test_unit_diagnostic',
      questCoinsEarned: 50,
      questCompletedCount: 1,
      bountyCompleted: false,
      perfectStandardQuiz: true,
      perfectBounty: false,
    }),
  });

  const saveData = saveResp.json;

  if (!saveResp.ok) {
    log.fail(`progressSave Fehler: Status ${saveResp.status}`);
    log.detail(JSON.stringify(saveData, null, 2));
    results.failed++;

    if (saveData?.details?.includes('perfect_standard_quiz') || saveData?.details?.includes('perfect_bounty')) {
      log.critical('Spalten perfect_standard_quiz/perfect_bounty fehlen!');
      results.criticalIssues.push('DB-Schema unvollständig: perfect_* Spalten fehlen in progress-Tabelle');
      results.recommendations.push('Migration ausführen: docs/migration_add_perfect_flags.sql');
    }

    return false;
  }

  // Check for dev-fallback
  if (saveData.note?.includes('dev-fallback')) {
    log.warn('Dev-Fallback aktiv - Progress wird nicht persistiert!');
    results.warnings++;
  } else {
    log.pass('Progress erfolgreich gespeichert');
    results.passed++;
  }

  // Verify with progressGet
  const getResp = await fetchJson('progressGet');
  if (getResp.ok && getResp.json) {
    const progress = getResp.json.progress || [];
    const saved = progress.find(p => p.unit_id === 'test_unit_diagnostic');

    if (saved) {
      log.pass('Progress kann wieder geladen werden');
      results.passed++;

      if (saved.perfect_standard_quiz === true) {
        log.pass('perfect_standard_quiz wurde korrekt gespeichert');
        results.passed++;
      } else {
        log.fail(`perfect_standard_quiz ist ${saved.perfect_standard_quiz}, erwartet true`);
        results.failed++;
      }
    } else if (!saveData.note?.includes('dev-fallback')) {
      log.fail('Gespeicherter Progress nicht gefunden!');
      results.failed++;
    }
  }

  return saveData;
}

async function testChatSend(user) {
  log.section('6. /chatSend ENDPOINT - Chat (funktioniert laut User)');

  const sendResp = await fetchJson('chatSend', {
    method: 'POST',
    body: JSON.stringify({
      text: `Diagnostic test message ${Date.now()}`,
      channelId: 'class:global',
      username: 'Diagnostic',
    }),
  });

  const sendData = sendResp.json;

  if (!sendResp.ok) {
    log.fail(`chatSend Fehler: Status ${sendResp.status}`);
    results.failed++;
    return false;
  }

  if (sendData.note?.includes('dev-fallback')) {
    log.warn('Dev-Fallback aktiv');
    results.warnings++;
  } else {
    log.pass('Chat-Nachricht gesendet');
    results.passed++;

    if (sendData.message?.id) {
      log.pass(`Message ID: ${sendData.message.id}`);
      results.passed++;
    }
  }

  return sendData;
}

async function testSchemaCompleteness() {
  log.section('7. SCHEMA-PRÜFUNG - Fehlende Spalten identifizieren');

  // Diese Tests laufen nur wenn Debug-Endpoint verfügbar ist
  const resp = await fetchJson('debugSupabase');

  if (!resp.json?.debug?.client?.testQuery?.success) {
    log.warn('Kann Schema nicht direkt prüfen - keine DB-Verbindung');
    return;
  }

  // Wir prüfen indirekt durch die Fehler der anderen Endpoints
  log.info('Schema-Probleme werden durch andere Tests identifiziert');

  // Empfehlungen basierend auf bekanntem Schema
  const knownIssues = [
    {
      check: 'unlocked_items Spalte in users',
      recommendation: 'ALTER TABLE users ADD COLUMN unlocked_items text[] DEFAULT ARRAY[]::text[];'
    }
  ];

  for (const issue of knownIssues) {
    log.info(`Bekanntes potenzielles Problem: ${issue.check}`);
    if (!results.recommendations.includes(issue.recommendation)) {
      results.recommendations.push(issue.recommendation);
    }
  }
}

// ==================== MAIN ====================

async function runDiagnostic() {
  console.log(`
${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════╗
║     SUPABASE DIAGNOSTIC TEST SUITE                         ║
║     Identifiziert Persistenz-Probleme                      ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

📍 Target: ${BASE_URL}
🆔 Test User ID: ${TEST_USER_ID}
🕐 Started: ${new Date().toISOString()}
`);

  // Run all tests
  const supabaseWorking = await testDebugEndpoint();
  const user = await testMeEndpoint();
  await testCoinsAdjust(user);
  await testShopBuy(user);
  await testProgressSave(user);
  await testChatSend(user);
  await testSchemaCompleteness();

  // Summary
  console.log(`
${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════╗
║     ZUSAMMENFASSUNG                                         ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.green}✓ Bestanden: ${results.passed}${colors.reset}
${colors.yellow}⚠ Warnungen: ${results.warnings}${colors.reset}
${colors.red}✗ Fehlgeschlagen: ${results.failed}${colors.reset}
`);

  if (results.criticalIssues.length > 0) {
    console.log(`${colors.bold}${colors.red}🚨 KRITISCHE PROBLEME:${colors.reset}`);
    for (const issue of results.criticalIssues) {
      console.log(`   ${colors.red}• ${issue}${colors.reset}`);
    }
    console.log('');
  }

  if (results.recommendations.length > 0) {
    console.log(`${colors.bold}${colors.yellow}💡 EMPFOHLENE AKTIONEN:${colors.reset}`);
    for (let i = 0; i < results.recommendations.length; i++) {
      console.log(`   ${i + 1}. ${results.recommendations[i]}`);
    }
    console.log('');
  }

  // Root Cause Analysis
  console.log(`${colors.bold}${colors.cyan}🔍 ROOT CAUSE ANALYSE:${colors.reset}`);

  if (results.criticalIssues.some(i => i.includes('dev-fallback'))) {
    console.log(`
${colors.yellow}HAUPTURSACHE: Supabase läuft im Dev-Fallback-Modus${colors.reset}

Das bedeutet: ALLE Daten werden nur lokal simuliert und NICHT persistiert!

Ursachen (in Reihenfolge der Wahrscheinlichkeit):
1. Environment Variables fehlen in Netlify
2. @supabase/supabase-js ist nicht installiert
3. Supabase-Keys sind falsch

LÖSUNG:
1. Gehe zu Netlify → Site Settings → Environment Variables
2. Setze: SUPABASE_URL = https://mpenextswatceazmhczb.supabase.co
3. Setze: SUPABASE_SERVICE_ROLE_KEY = [dein service role key]
4. Triggere einen Redeploy
`);
  }

  if (results.criticalIssues.some(i => i.includes('NaN') || i.includes('undefined'))) {
    console.log(`
${colors.yellow}HAUPTURSACHE: User-Objekt hat ungültige Werte (NaN/undefined)${colors.reset}

Das passiert wenn:
1. /me gibt kein korrektes User-Objekt zurück
2. User existiert nicht in der DB und wird nicht korrekt erstellt
3. Coins-Wert ist null statt 0

LÖSUNG:
1. Prüfe ob /me User korrekt in users-Tabelle upserted
2. Stelle sicher dass coins DEFAULT 250 hat
3. Prüfe Client-Code für Number.isFinite() Guards
`);
  }

  if (results.criticalIssues.some(i => i.includes('unlocked_items'))) {
    console.log(`
${colors.yellow}HAUPTURSACHE: DB-Schema ist unvollständig${colors.reset}

Die users-Tabelle fehlt die "unlocked_items" Spalte.

LÖSUNG - Führe diese Migration in Supabase SQL Editor aus:

ALTER TABLE users ADD COLUMN IF NOT EXISTS unlocked_items text[] DEFAULT ARRAY[]::text[];
`);
  }

  if (results.criticalIssues.some(i => i.includes('USER_NOT_FOUND'))) {
    console.log(`
${colors.yellow}HAUPTURSACHE: User-ID Inkonsistenz${colors.reset}

Der Client sendet eine User-ID, aber /me erstellt den User nicht korrekt
oder die ID wird zwischen Requests nicht beibehalten.

LÖSUNG:
1. Prüfe ob x-anon-id Header korrekt übertragen wird
2. Prüfe ob mm_anon_id Cookie gesetzt wird
3. Prüfe ob /me den User tatsächlich upserted (nicht nur SELECT)
`);
  }

  console.log(`
${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}
🏁 Diagnostic abgeschlossen: ${new Date().toISOString()}

Nächste Schritte:
1. Behebe kritische Probleme (rot markiert)
2. Führe diesen Test erneut aus
3. Prüfe die Live-Site im Browser

Für detaillierte Logs: Öffne Netlify Dashboard → Functions → [function name]
${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}
`);

  process.exit(results.failed > 0 ? 1 : 0);
}

runDiagnostic().catch(err => {
  console.error('Unerwarteter Fehler:', err);
  process.exit(1);
});

