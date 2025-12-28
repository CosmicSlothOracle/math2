# PHASE 4: RELEASE-PLAN

## STATUS: ❌ **RELEASE GESTOPPT**

### Begründung

**5 P0-kritische Issues blockieren den Release:**

1. **Coin-Abzug vor API-Call** (TICKET-001)
   - **Risiko:** User verlieren Coins ohne Service
   - **Impact:** Finanzieller Schaden, Vertrauensverlust
   - **Fix-Zeit:** ~2-3h

2. **Race Condition bei Coin-Abzug** (TICKET-002)
   - **Risiko:** Double-Spending möglich
   - **Impact:** Wirtschaftlicher Schaden, Inkonsistenzen
   - **Fix-Zeit:** ~3-4h

3. **Rate-Limit nicht persistent** (TICKET-003)
   - **Risiko:** User können Limit umgehen
   - **Impact:** Server-Overload, Kosten-Explosion
   - **Fix-Zeit:** ~4-6h (abhängig von Redis-Setup)

4. **Auto-send useEffect Dependency** (TICKET-004)
   - **Risiko:** Potentieller Infinit-Loop, React-Warnings
   - **Impact:** Performance-Probleme, schlechte UX
   - **Fix-Zeit:** ~1h

5. **getApiHeaders() TypeScript-Kompatibilität** (TICKET-005)
   - **Risiko:** Build-Fehler in Production
   - **Impact:** Deployment unmöglich
   - **Fix-Zeit:** ~1-2h

**Gesamt-Fix-Zeit P0:** ~11-16h

---

## RELEASE-PLAN (NACH P0-FIXES)

### Version: v1.0.0 (KI-Hilfesystem)

#### Changelog

**Features:**
- ✅ KI-Hilfe-Button im Header (persistent sichtbar)
- ✅ Kostenloser erster Tipp pro Frage
- ✅ Chat-Modus für Folge-Nachrichten (5 Coins pro Nachricht)
- ✅ Persona-System (Standard, Tutor, Coach) - Shop-Items
- ✅ Skin-System für UI (Standard, Neon, Minimal) - Shop-Items
- ✅ Rate-Limiting (30 Nachrichten/Stunde)
- ✅ Input-Validation (400 Zeichen Limit)
- ✅ No-Solution-Policy (Prompt-basiert)

**Fixes:**
- Coin-Abzug nur nach erfolgreichem API-Call
- Race Condition bei Coin-Abzug behoben
- Rate-Limit persistent über Lambda-Instanzen
- TypeScript-Build-Kompatibilität
- Auto-send useEffect Dependency-Array

**Known Issues:**
- Post-Processing-Check für No-Solution-Policy noch nicht implementiert (P1)
- XSS-Sanitization noch nicht implementiert (P1)
- Message-Persistence noch nicht implementiert (P2)

---

### Pre-Release Checklist

#### Code-Qualität
- [ ] Alle P0-Issues gefixt und getestet
- [ ] Linter-Fehler = 0
- [ ] TypeScript-Compilation erfolgreich
- [ ] Build erfolgreich (`npm run build`)
- [ ] Unit-Tests: >80% Coverage für kritische Funktionen
- [ ] Integration-Tests: Alle P0-relevanten Tests grün

#### Sicherheit
- [ ] Security-Review durchgeführt
- [ ] XSS-Sanitization implementiert (P1, aber empfohlen)
- [ ] Prompt-Injection-Schutz (Input-Validation)
- [ ] Rate-Limit funktioniert persistent
- [ ] Coin-Transaktionen sind atomar

#### Testing
- [ ] Alle Tests aus `AI_HELPER_TEST_CHECKLIST.md` durchgeführt
- [ ] Manuelle Tests: A-H Kategorien abgedeckt
- [ ] Edge-Cases getestet (Offline, Timeout, Race Conditions)
- [ ] Browser-Tests: Chrome, Firefox, Safari, Mobile
- [ ] Performance-Tests: API-Response-Zeit < 5s

#### Dokumentation
- [ ] README aktualisiert mit KI-Hilfe-Feature
- [ ] User-Dokumentation: Wie nutze ich KI-Hilfe?
- [ ] Developer-Dokumentation: Architecture, API-Docs
- [ ] Changelog aktualisiert

#### Deployment-Vorbereitung
- [ ] Environment Variables gesetzt (GEMINI_API_KEY)
- [ ] Supabase-Schema aktualisiert (falls nötig für Rate-Limit)
- [ ] Redis/Upstash konfiguriert (falls Rate-Limit in Redis)
- [ ] Monitoring/Alerts konfiguriert (optional)

---

### Deployment-Schritte

#### 1. Pre-Deployment
```bash
# 1. Branch erstellen
git checkout -b release/ai-helper-v1.0.0

# 2. Alle P0-Fixes committen
git add .
git commit -m "fix: P0 critical issues (coin-deduction, race-condition, rate-limit)"

# 3. Build testen
npm run build

# 4. Tests ausführen
npm test

# 5. Linter prüfen
npm run lint
```

#### 2. Staging-Deployment
```bash
# 1. Merge zu develop/staging
git checkout develop
git merge release/ai-helper-v1.0.0

# 2. Netlify Deploy (staging)
# - Via Netlify Dashboard ODER
# - Via CLI: netlify deploy --branch develop

# 3. Smoke-Test auf Staging
# - Alle Tests aus Checklist durchführen
# - Besonders: Coin-Flow, Rate-Limit, No-Solution-Policy
```

#### 3. Production-Deployment
```bash
# 1. Merge zu main/master
git checkout main
git merge develop
git tag v1.0.0

# 2. Netlify Deploy (production)
# - Via Netlify Dashboard ODER
# - Via CLI: netlify deploy --prod

# 3. Monitoring aktivieren
# - Logs prüfen: netlify logs:functions
# - Error-Rate beobachten
# - Coin-Transaktionen prüfen
```

#### 4. Post-Deployment
```bash
# 1. Smoke-Test auf Production
# - Kritische User-Flows testen
# - Coin-Abzug prüfen (eigener Test-Account)

# 2. Monitoring prüfen
# - Error-Logs
# - API-Response-Times
# - Rate-Limit-Hits

# 3. User-Feedback sammeln
# - Support-Tickets beobachten
# - Analytics prüfen (AI-Usage)
```

---

### Rollback-Plan

**Trigger für Rollback:**
- Error-Rate > 5% in ersten 30 Minuten
- Coin-Transaktionen funktionieren nicht
- Rate-Limit umgangen wird
- Kritische Sicherheitslücke gefunden

**Rollback-Schritte:**
```bash
# 1. Netlify: Previous Deployment aktivieren
# - Via Dashboard: Deploys → Previous → Publish

# 2. ODER: Git-Revert
git revert v1.0.0
git push origin main

# 3. Netlify: Redeploy
netlify deploy --prod

# 4. Monitoring prüfen
# - Error-Rate normalisiert
# - User können wieder normal nutzen

# 5. Post-Mortem
# - Issue analysieren
# - Fix entwickeln
# - Erneut deployen
```

---

### Monitoring & Alerts

**Metriken zu überwachen:**
- API-Error-Rate (Ziel: < 1%)
- Coin-Transaktionen-Fehlerrate (Ziel: 0%)
- Rate-Limit-Hits (Anzahl pro Stunde)
- API-Response-Time (Ziel: < 5s P95)
- User-Feedback (Support-Tickets)

**Alerts:**
- Error-Rate > 5% → PagerDuty/Slack-Notification
- Coin-Transaktionen-Fehler → Sofort-Alert
- Rate-Limit umgangen → Warnung (möglicher Abuse)

---

### Success-Kriterien für Release

**Minimum (MUSS erfüllt sein):**
- ✅ Alle P0-Issues gefixt
- ✅ Alle P0-Tests grün
- ✅ Build erfolgreich
- ✅ Coin-Transaktionen funktionieren korrekt
- ✅ Rate-Limit funktioniert persistent

**Optimal (SOLLTE erfüllt sein):**
- ✅ P1 kritische Issues gefixt (No-Solution-Check, XSS-Sanitization)
- ✅ Error-Handling in UI (Toasts)
- ✅ Monitoring aktiviert
- ✅ Dokumentation vollständig

**Nice-to-Have (KANN nach Release):**
- ✅ P2 Features (Analytics, Retry-Logic, Persistence)
- ✅ Performance-Optimierungen
- ✅ Accessibility-Verbesserungen

---

## AKTUELLER STATUS

**P0 Issues:** 5 (alle müssen gefixt werden)
**P1 Issues:** 7 (kritische sollten gefixt werden)
**P2 Issues:** 5 (können später gefixt werden)

**Empfohlene Vorgehensweise:**
1. **STOP** - Kein Release bis P0 gefixt
2. Fix P0-Issues (11-16h geschätzt)
3. Re-Test alle P0-relevanten Tests
4. Fix kritische P1-Issues (No-Solution-Check, XSS) - weitere 6-8h
5. Erneuter Review
6. Release vorbereiten (Deployment-Steps)
7. Staging-Deploy + Smoke-Test
8. Production-Deploy

**Geschätzte Gesamtzeit bis Release-ready:** 17-24h Arbeit

---

## NÄCHSTE SCHRITTE

1. **SOFORT:** P0-Issues fixen (TICKET-001 bis TICKET-006)
2. **DANN:** Kritische P1-Issues fixen (TICKET-007, TICKET-012)
3. **DANACH:** Re-Audit durchführen
4. **SCHLIEẞLICH:** Release-Prozess starten

**Verantwortlich:** Development Team
**Deadline:** Nach P0-Fixes + Re-Test
**Blockiert durch:** P0-kritische Issues

