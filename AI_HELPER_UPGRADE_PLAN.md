# PHASE 2: UPGRADE-PLAN

## Ticket-Backlog (Priorisiert)

### P0: KRITISCHE FIXES (MUSS vor Release)

#### TICKET-001: Coin-Abzug nach erfolgreichem API-Call verschieben

**Ziel:** Coins werden erst abgezogen NACHDEM Gemini-API erfolgreich geantwortet hat.
**Akzeptanzkriterien:**

- Coin-Check bleibt vor API-Call (early return wenn nicht genug Coins)
- Coin-Abzug + Ledger-Eintrag passieren NACH erfolgreichem Gemini-Response (Zeile 290+ in aiAssistant.cjs)
- Bei API-Fehler werden KEINE Coins abgezogen
- Unit-Test: Mock API-Fehler → keine Coin-Abzug

#### TICKET-002: Transaction-Lock für Coin-Abzug implementieren

**Ziel:** Race Condition verhindern durch atomare Coin-Updates.
**Akzeptanzkriterien:**

- Supabase verwendet `.update()` mit `coins >= COINS_PER_MESSAGE` Condition (Row-Level-Lock)
- ODER: PostgreSQL Transaction mit SELECT FOR UPDATE
- Unit-Test: 2 parallele Requests → nur einer erfolgreich
- Integration-Test: 10 parallele Requests → genau 10\*COINS_PER_MESSAGE abgezogen

#### TICKET-003: Rate-Limit persistent über Lambda-Instanzen

**Ziel:** Rate-Limit funktioniert auch bei mehreren Lambda-Instanzen.
**Akzeptanzkriterien:**

- Rate-Limit wird in Supabase-Tabelle gespeichert (z.B. `ai_rate_limits: {user_id, count, reset_at}`)
- ODER: Redis/Upstash Redis für distributed Rate-Limiting
- Integration-Test: 31 Requests innerhalb 1h → 30 erfolgreich, 1 blocked
- Cleanup-Job für alte Einträge (optional, kann später)

#### TICKET-004: Auto-send useEffect Dependency-Array fixen

**Ziel:** `handleSendMessage` in Dependency-Array oder useEffect entfernen.
**Akzeptanzkriterien:**

- `handleSendMessage` wird mit `useCallback` gememoized ODER
- Auto-send wird mit `useRef` Flag gesteuert (nur einmal beim Mount)
- Linter-Warnung verschwindet
- Test: initialQuestion wird genau 1x gesendet beim Mount

#### TICKET-005: getApiHeaders() TypeScript-kompatibel machen

**Ziel:** `require()` funktioniert in Build/Production.
**Akzeptanzkriterien:**

- `getApiHeaders` wird direkt aus `src/lib/userId.ts` importiert (ESM-Import)
- ODER: CommonJS-Wrapper wird verwendet
- Build-Test: `npm run build` schlägt nicht fehl
- Runtime-Test: Headers werden korrekt gesetzt

#### TICKET-006: initialQuestion/Topic zwischen Panel→Chat übergeben

**Ziel:** Wenn User "Mehr fragen" klickt, wird initialQuestion/Topic an Chat übergeben.
**Akzeptanzkriterien:**

- `AIHelperPanel.onOpenChat()` erhält aktuelles `question` und `topic` als Parameter
- `handleOpenAIChat(initialQuestion, initialTopic)` wird mit diesen Werten aufgerufen
- Chat zeigt initialQuestion in Messages-Liste
- Auto-send funktioniert mit initialQuestion

---

### P1: WICHTIGE VERBESSERUNGEN (Sollte vor Release)

#### TICKET-007: No-Solution-Policy Post-Processing-Check

**Ziel:** Antworten werden auf Lösungen geprüft und abgelehnt falls Lösung enthalten.
**Akzeptanzkriterien:**

- Regex-Pattern erkennt numerische Lösungen ("x = 5", "Ergebnis: 42")
- Regex-Pattern erkennt Schritt-für-Schritt-Lösungen ("Schritt 1: ... Schritt 2: ...")
- Wenn Lösung erkannt → Antwort wird abgelehnt mit "Bitte stelle eine spezifischere Frage"
- Test: Prompt mit "Gib mir die Lösung" → Antwort enthält KEINE Lösung
- Test: Normaler Hint-Prompt → Antwort wird akzeptiert

#### TICKET-008: Coin-Refund bei API-Fehler nach Abzug

**Ziel:** Falls API nach Coin-Abzug fehlschlägt, werden Coins zurückerstattet (nur wenn TICKET-001 noch nicht gefixt).
**Akzeptanzkriterien:**

- Wenn Gemini-API fehlschlägt NACH Coin-Abzug → Reverse-Transaction (coins += COINS_PER_MESSAGE)
- Ledger-Eintrag mit `reason: 'ai_assistant_refund'`
- Error-Response enthält Info dass Coins zurückerstattet wurden
- Unit-Test: API-Fehler → Coins werden zurückerstattet

#### TICKET-009: Error-Handling in UI mit Toasts

**Ziel:** User sieht Fehler-Messages in UI, nicht nur Console.
**Akzeptanzkriterien:**

- `handleSendAIMessage` zeigt Toast bei Error (INSUFFICIENT_COINS, NETWORK_ERROR, API_ERROR)
- `handleGetFirstHint` zeigt Toast bei Error
- Toasts haben unterschiedliche Types (error/warning/info)
- Error-Messages sind user-friendly (nicht technisch)

#### TICKET-010: User-State Refresh nach Coin-Abzug

**Ziel:** Coin-Anzeige wird sofort aktualisiert nach Chat-Message.
**Akzeptanzkriterien:**

- `handleSendAIMessage` optimistically updates `user.coins` vor API-Call
- Bei Erfolg: Server-State wird refreshed
- Bei Fehler: Optimistic Update wird revertiert
- UI zeigt sofort korrekte Coin-Anzahl

#### TICKET-011: Confirmation-Dialog Logik-Fix

**Ziel:** Dialog wird nur geöffnet wenn genug Coins vorhanden.
**Akzeptanzkriterien:**

- `handleSubmit` prüft `canAfford` VOR `setShowConfirmDialog(true)`
- Wenn nicht genug Coins → Toast "Nicht genug Coins" statt Dialog
- Dialog wird nur geöffnet wenn `userCoins >= COINS_PER_MESSAGE`

#### TICKET-012: XSS-Sanitization für AI-Responses

**Ziel:** HTML/JS in AI-Responses wird sanitized.
**Akzeptanzkriterien:**

- AI-Response wird durch `DOMPurify` oder ähnliche Library gesanitized
- ODER: Content wird als Plain-Text gerendert (kein `dangerouslySetInnerHTML`)
- Test: Prompt mit `<script>alert('XSS')</script>` → wird escaped, nicht ausgeführt
- Markdown-Rendering (falls gewünscht) nutzt sichere Parser

#### TICKET-013: Timeout-Handling für API-Calls

**Ziel:** Gemini-API-Calls haben Timeout (30s), User sieht Feedback.
**Akzeptanzkriterien:**

- Fetch-Request hat `signal: AbortSignal` mit 30s Timeout
- Frontend zeigt "Wird geladen..." → "Timeout, bitte erneut versuchen" bei Timeout
- Backend: Gemini-API-Call hat Timeout (falls SDK unterstützt)
- Retry-Logic nach Timeout (optional, kann später)

#### TICKET-014: Rate-Limit UI-Feedback

**Ziel:** User sieht wenn Rate-Limit erreicht ist.
**Akzeptanzkriterien:**

- Rate-Limit-Response (429) wird im Frontend gefangen
- Toast: "Zu viele Anfragen. Bitte warte X Minuten."
- Oder: Button zeigt "Rate-Limit erreicht (warte X min)"
- Retry-After wird aus Header gelesen und angezeigt

---

### P2: POLISH (Kann nach Release)

#### TICKET-015: Analytics/Logging für AI-Nutzung

**Ziel:** Track AI-Interactions für Analytics.
**Akzeptanzkriterien:**

- Event-Logging: `ai_first_hint_requested`, `ai_chat_message_sent`, `ai_error_occurred`
- Events enthalten: userId, persona, topic, messageLength, coinsCharged
- Logs werden in Supabase-Tabelle oder externem Analytics-Service gespeichert
- Dashboard zeigt: Requests/Tag, Fehlerrate, Durchschnittliche Coins/Request

#### TICKET-016: Retry-Logic bei transienten Fehlern

**Ziel:** Automatischer Retry bei Network-Errors (3x mit Exponential Backoff).
**Akzeptanzkriterien:**

- Retry bei: Network-Error, 429 (Rate-Limit), 503 (Service Unavailable)
- Kein Retry bei: 400 (Bad Request), 401 (Unauthorized), 500 (Server Error)
- Exponential Backoff: 1s, 2s, 4s
- UI zeigt "Erneut versuchen..." während Retry

#### TICKET-017: Message-Persistence (LocalStorage)

**Ziel:** Chat-Historie wird in LocalStorage gespeichert.
**Akzeptanzkriterien:**

- Messages werden in LocalStorage gespeichert (key: `ai_chat_${userId}`)
- Beim Reload wird Historie geladen
- Max 50 Messages (ältere werden gelöscht)
- Optional: Sync mit Server (kann später)

#### TICKET-018: Persona-Preview im Shop

**Ziel:** User kann Persona vor Kauf testen (kostenlos, limitiert).
**Akzeptanzkriterien:**

- Shop-Item hat "Vorschau"-Button (wie bei anderen Items)
- Vorschau öffnet Chat mit gewählter Persona (max 1 Nachricht kostenlos)
- Nach Vorschau: "Jetzt kaufen" Button erscheint

#### TICKET-019: Accessibility-Verbesserungen

**Ziel:** Screen-Reader-kompatibel, Keyboard-Navigation.
**Akzeptanzkriterien:**

- Alle Buttons haben `aria-label`
- Modal hat `aria-labelledby` für Titel
- Keyboard-Navigation: Tab durch Formular, Enter für Submit, Escape für Close
- Focus-Management: Focus bleibt im Modal, wird auf Close-Button gesetzt beim Öffnen

---

## SCHÄTZUNG

**P0:** 6 Tickets × 2-4h = 12-24h
**P1:** 8 Tickets × 1-3h = 8-24h
**P2:** 5 Tickets × 2-4h = 10-20h

**Gesamt:** 30-68h

**Empfohlenes Vorgehen:**

1. P0 komplett fixen (blockiert Release)
2. P1 kritische Teile (TICKET-007, TICKET-009, TICKET-010, TICKET-012) → Release
3. P1 Rest + P2 → Post-Release Iteration
