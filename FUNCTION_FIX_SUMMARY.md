# Fix: Netlify Functions CommonJS/ES Module Konflikt

## Problem
Die Netlify Functions verwendeten CommonJS Syntax (`exports.handler`, `module.exports`), aber das Projekt ist als ES Module konfiguriert (`"type": "module"` in package.json). Dies führte zu:
- Warnungen: "CommonJS variable is treated as a global variable in an ECMAScript module"
- Fehler: "lambdaFunc[lambdaHandler] is not a function"

## Lösung
Alle Function-Dateien wurden von `.js` zu `.cjs` umbenannt, damit sie als CommonJS behandelt werden:

### Umbenannte Dateien:
- `coinsAdjust.js` → `coinsAdjust.cjs`
- `progressSave.js` → `progressSave.cjs`
- `me.js` → `me.cjs`
- `chatSend.js` → `chatSend.cjs`
- `chatPoll.js` → `chatPoll.cjs`
- `progressGet.js` → `progressGet.cjs`
- `debugSupabase.js` → `debugSupabase.cjs`
- `_supabase.js` → `_supabase.cjs`
- `_utils.js` → `_utils.cjs`

### Aktualisierte require-Statements:
Alle `require('./_supabase')` und `require('./_utils')` wurden zu:
- `require('./_supabase.cjs')`
- `require('./_utils.cjs')`

## Nächste Schritte
1. Starte `netlify dev` neu
2. Teste die Functions mit `node test-functions-simple.mjs`
3. Die Functions sollten jetzt korrekt funktionieren und in die DB schreiben können

