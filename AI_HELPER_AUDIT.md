# PHASE 1: AUDIT REPORT - KI-Hilfesystem

## Komponenten-Übersicht

### 1. AIHelperPanel.tsx

**Was funktioniert:**
- Input-Validierung (400 Zeichen Limit) funktioniert
- Error-State wird angezeigt
- UI-Flow: Frage → Tipp → "Mehr fragen" Button
- Form-Submission mit Loading-State

**Fragile/Unsaubere Stellen:**
- ❌ P0: `onOpenChat()` wird ohne Parameter aufgerufen (Zeile 158), obwohl `handleOpenAIChat` in App.tsx Parameter akzeptiert → initialQuestion/Topic gehen verloren beim Übergang
- ⚠️ P1: Keine XSS-Sanitization für `hint` Content (wird direkt gerendert)
- ⚠️ P2: Kein Timeout-Handling für API-Call

**Fehlt für Production:**
- Keine Retry-Logic bei Netzwerk-Fehlern
- Keine Analytics/Logging für Nutzung
- Accessibility: fehlende ARIA-Labels für Screen Reader

---

### 2. AIHelperChat.tsx

**Was funktioniert:**
- Multi-Message Chat mit Historie
- Coin-Bestätigungsdialog vor Abzug
- Input-Validation
- Scroll-to-Bottom bei neuen Messages

**Fragile/Unsaubere Stellen:**
- ❌ P0: Auto-send useEffect (Zeile 46-50): `handleSendMessage` fehlt in Dependency-Array → kann zu stale closure/Infinit-Loop führen
- ❌ P0: `handleOpenAIChat` wird mit initialQuestion/Topic aufgerufen, aber AIHelperPanel übergibt diese nicht
- ❌ P0: Coin-Check vor Submit ist client-side only → Race Condition möglich (Server-Check passiert später)
- ⚠️ P1: `user` prop wird nicht aktualisiert nach Coin-Abzug → Coin-Anzeige kann stale sein
- ⚠️ P1: Keine XSS-Sanitization für Message-Content
- ⚠️ P1: Confirmation-Dialog zeigt "Nicht genug Coins" wenn canAfford=false, aber Dialog wird trotzdem geöffnet (Zeile 99-102: Logik-Fehler)

**Fehlt für Production:**
- Kein Message-Persistence (bei Reload ist Chat weg)
- Kein Loading-State für einzelne Messages
- Keine Retry bei Failed Sends
- Accessibility: Keyboard-Navigation für Messages

---

### 3. netlify/functions/aiAssistant.cjs

**Was funktioniert:**
- Rate-Limiting implementiert (30/h)
- Coin-Check und Abzug
- Ledger-Logging
- Gemini-API-Integration mit Fallback-Models
- No-Solution-Prompt-Template

**Fragile/Unsaubere Stellen:**
- ❌ P0: **KRITISCH**: Coin-Abzug passiert VOR Gemini-API-Call (Zeile 190-216 vor 234-305) → wenn API fehlschlägt, sind Coins weg aber keine Antwort → User verliert Coins ohne Service
- ❌ P0: Race Condition bei Coin-Abzug: Kein Transaction-Lock zwischen Check (Zeile 176) und Update (Zeile 193) → zwei parallele Requests können beide durchlaufen
- ❌ P0: Rate-Limit verwendet in-memory Store (`_rateLimit.cjs`) → nicht persistent über Lambda-Instanzen → User kann Limit umgehen durch mehrere Instanzen
- ⚠️ P1: No-Solution-Policy: Nur Prompt-basiert, kein Post-Processing-Check ob Antwort Lösung enthält (z.B. Regex für "x =", numerische Lösungen)
- ⚠️ P1: Error-Handling: Bei Gemini-Error nach Coin-Abzug werden Coins nicht zurückerstattet (Zeile 306-317)
- ⚠️ P1: `existingMessages` wird nicht validiert (Länge, Struktur) → könnte zu Prompt-Injection oder Token-Limit-Überschreitung führen
- ⚠️ P1: Kein Timeout für Gemini-API-Call → kann hängen bleiben
- ⚠️ P2: Persona wird nicht validiert → unbekannte Personas werden zu "default" geändert, aber nicht geloggt

**Fehlt für Production:**
- Keine Structured Logging (z.B. JSON-Logs für Analytics)
- Keine Monitoring/Alerts bei Fehlerraten
- Keine Request-ID für Tracing
- Keine Input-Sanitization gegen Prompt-Injection
- Kein Circuit-Breaker bei wiederholten API-Fehlern

---

### 4. services/geminiService.ts

**Was funktioniert:**
- Error-Handling mit Fallback-Messages
- Headers werden korrekt übergeben

**Fragile/Unsaubere Stellen:**
- ❌ P0: `getApiHeaders()` verwendet `require()` in TypeScript/ESM-Context (Zeile 140) → kann in Build/Production fehlschlagen
- ⚠️ P1: Keine Timeout-Konfiguration für Fetch-Requests
- ⚠️ P1: Error-Messages sind zu generisch ("nicht verfügbar") → keine Unterscheidung zwischen Rate-Limit, Auth-Error, API-Error
- ⚠️ P2: `getTopicExplanation` nutzt noch direkt `process.env.API_KEY` (Zeile 38) statt Netlify Function → sollte konsistent sein

**Fehlt für Production:**
- Keine Retry-Logic bei transienten Fehlern (Network, 429, 503)
- Keine Request-ID-Propagation
- Kein Client-Side Rate-Limiting als Fallback

---

### 5. App.tsx Integration

**Was funktioniert:**
- State-Management für AI-Panel/Chat
- Coin-Refresh nach Message
- Persona wird aus User-State gelesen

**Fragile/Unsaubere Stellen:**
- ❌ P0: `handleOpenAIChat` akzeptiert `initialQuestion/Topic`, aber AIHelperPanel ruft `onOpenChat()` ohne diese auf (Zeile 4047)
- ⚠️ P1: Coin-Refresh passiert nur wenn `isOnline && !isDevFallback` (Zeile 3794) → Offline-Modus zeigt stale Coins
- ⚠️ P1: `refreshUserFromServer()` kann fehlschlagen → keine Fallback-Logic, User-State bleibt inkonsistent
- ⚠️ P1: Persona/Skin werden nicht in `normalizeUser` gesetzt (apiService.ts Zeile 91-92) → Defaults werden gesetzt, aber nur wenn undefined
- ⚠️ P2: Keine Error-Toast bei `handleSendAIMessage` Fehlern → User sieht nur Console-Error

**Fehlt für Production:**
- Keine Analytics-Events für AI-Nutzung
- Keine A/B-Testing-Hooks für Personas
- Keine Persistence für Chat-State bei Tab-Wechsel

---

### 6. Types & Shop Integration

**Was funktioniert:**
- Types sind korrekt definiert
- Shop-Items für Persona/Skin sind vorhanden
- InventoryModal zeigt Persona/Skin-Auswahl

**Fragile/Unsaubere Stellen:**
- ⚠️ P1: `aiPersona`/`aiSkin` sind optional in User-Interface → sollten Defaults sein ("default")
- ⚠️ P1: Shop-Integration: Persona/Skin werden nicht in Supabase-Schema persistiert (müssen in `users`-Table als Spalten existieren)
- ⚠️ P2: Keine Migration für bestehende Users → `aiPersona`/`aiSkin` bleiben undefined

**Fehlt für Production:**
- Keine Validierung dass gekaufte Persona/Skin auch im `unlockedItems` Array ist
- Keine Preview-Funktion für Personas (wie bei anderen Shop-Items)

---

## PRIORISIERUNG

### P0 (KRITISCH - Blockiert Release)
1. Coin-Abzug vor API-Call → User verliert Coins bei API-Fehler
2. Race Condition bei Coin-Abzug → Double-Spending möglich
3. Auto-send useEffect Dependency Array fehlt → Potentieller Infinit-Loop
4. `getApiHeaders()` require() in TS-Context → Build-Fehler möglich
5. initialQuestion/Topic werden nicht zwischen Panel→Chat übergeben

### P1 (WICHTIG - Sollte vor Release gefixt werden)
1. No-Solution-Policy: Kein Post-Processing-Check
2. Rate-Limit nicht persistent über Lambda-Instanzen
3. Coin-Refund bei API-Fehler fehlt
4. Error-Handling in UI (keine Toasts, stale State)
5. Confirmation-Dialog Logik-Fehler (wird geöffnet auch wenn nicht genug Coins)
6. XSS-Sanitization fehlt
7. Timeout-Handling fehlt

### P2 (POLISH - Kann nach Release)
1. Analytics/Logging
2. Retry-Logic
3. Accessibility-Verbesserungen
4. Message-Persistence
5. Persona-Preview

---

## ZUSAMMENFASSUNG

**Status:** ❌ **NICHT RELEASE-READY**

**P0-Count:** 5 kritische Issues
**P1-Count:** 7 wichtige Issues
**P2-Count:** 5 Polish-Issues

**Größte Risiken:**
1. Finanzieller Verlust für User (Coins weg bei API-Fehler)
2. Security (XSS, Prompt-Injection, Race Conditions)
3. UX (stale State, fehlende Error-Feedback)
4. No-Solution-Policy kann umgangen werden (nur Prompt-basiert)

