# 🚀 Supabase Komplett Neuaufsetzen - Schritt-für-Schritt Anleitung für Dummies

## ⚠️ WICHTIG: Was passiert hier?

Diese Anleitung führt dich durch die **komplette Neuaufsetzung** von Supabase. Das bedeutet:

- ✅ Neues Supabase-Projekt wird erstellt
- ✅ Alle alten Daten werden **gelöscht** (falls du das alte Projekt löschst)
- ✅ Neue Keys werden generiert
- ✅ Datenbank-Schema wird neu erstellt
- ✅ Netlify wird mit neuen Keys konfiguriert

**⚠️ WARNUNG:** Wenn du noch wichtige Daten im alten Projekt hast, **sicher diese zuerst** oder überspringe Schritt 1 und nutze das bestehende Projekt.

---

## 📋 Vorbereitung: Was du brauchst

- ✅ Ein Supabase-Konto (kostenlos): <https://supabase.com>
- ✅ Ein Netlify-Konto (kostenlos): <https://app.netlify.com>
- ✅ Zugriff auf dein Netlify-Projekt
- ✅ 15-20 Minuten Zeit

---

## SCHRITT 1: Altes Supabase-Projekt löschen (OPTIONAL)

**⚠️ NUR wenn du wirklich alles neu starten willst!**

### Option A: Altes Projekt löschen

1. Gehe zu: <https://supabase.com/dashboard>
2. Klicke auf dein **altes Projekt**
3. Gehe zu: **Settings** (Zahnrad-Symbol links unten)
4. Scrolle ganz nach unten zu **"Danger Zone"**
5. Klicke auf **"Delete Project"**
6. Bestätige die Löschung (Tippe den Projektnamen ein)

### Option B: Altes Projekt behalten (empfohlen)

- **Überspringe diesen Schritt**, wenn du das alte Projekt behalten willst
- Erstelle einfach ein **neues Projekt** in Schritt 2

---

## SCHRITT 2: Neues Supabase-Projekt erstellen

### 2.1 Projekt erstellen

1. Gehe zu: <https://supabase.com/dashboard>
2. Klicke auf **"New Project"** (grüner Button oben rechts)
3. Fülle das Formular aus:
   - **Name:** z.B. `mathmaster-neun` oder `mathe-lernplattform`
   - **Database Password:**
     - Wähle ein **sicheres Passwort** (mindestens 12 Zeichen)
     - **⚠️ WICHTIG:** Speichere dieses Passwort! Du brauchst es später.
     - Beispiel: `MeinSicheresPasswort123!`
   - **Region:** Wähle die Region, die am nächsten zu deinen Nutzern ist (z.B. `West EU (Frankfurt)`)
   - **Pricing Plan:** Wähle **Free** (kostenlos)
4. Klicke auf **"Create new project"**
5. **Warte 2-3 Minuten**, bis das Projekt erstellt ist (Fortschrittsbalken oben)

### 2.2 Projekt öffnen

- Nach der Erstellung öffnet sich automatisch das Dashboard
- Falls nicht: Klicke auf dein neues Projekt in der Projektliste

---

## SCHRITT 3: API Keys kopieren

### 3.1 Zu den API Settings navigieren

1. Im Supabase Dashboard, klicke links auf **"Settings"** (Zahnrad-Symbol)
2. Klicke auf **"API"** (unter "Project Settings")

### 3.2 Keys kopieren und notieren

Du siehst jetzt mehrere Bereiche. Kopiere folgende Werte:

#### 🔑 Project URL

- **Wo:** Ganz oben, unter "Project URL"
- **Sieht aus wie:** `https://xxxxxxxxxxxxx.supabase.co`
- **Kopiere diesen Wert** → Speichere ihn als: `SUPABASE_URL`

#### 🔑 service_role key (SECRET!)

- **Wo:** Unter "Project API keys" → "service_role" (SECRET)
- **Sieht aus wie:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (sehr lang)
- **⚠️ WICHTIG:** Dies ist ein **geheimer Schlüssel**! Niemals öffentlich teilen!
- **Kopiere diesen Wert** → Speichere ihn als: `SUPABASE_SERVICE_ROLE_KEY`

#### 🔑 anon/public key

- **Wo:** Unter "Project API keys" → "anon" (public)
- **Sieht aus wie:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (sehr lang)
- **Kopiere diesen Wert** → Speichere ihn als: `VITE_SUPABASE_ANON_KEY`

### 3.3 Checkliste - Hast du alle 3 Werte?

- [ ] `SUPABASE_URL` (z.B. `https://xxxxx.supabase.co`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (sehr langer String)
- [ ] `VITE_SUPABASE_ANON_KEY` (sehr langer String)

**✅ Wenn ja, weiter zu Schritt 4!**

---

## SCHRITT 4: Datenbank-Schema erstellen

### 4.1 SQL Editor öffnen

1. Im Supabase Dashboard, klicke links auf **"SQL Editor"** (SQL-Symbol)
2. Klicke auf **"New query"** (Button oben links)

### 4.2 Schema-Datei öffnen

#### Option A: Schema aus Projekt-Datei verwenden (empfohlen)

1. Öffne in deinem Projekt die Datei: `docs/supabase_schema.sql`
2. **Kopiere den gesamten Inhalt** (Strg+A, dann Strg+C)

#### Option B: Schema aus altem Supabase-Projekt exportieren

**⚠️ WARNUNG:** Der "Copy as SQL" Button im Schema Visualizer exportiert Code **nur zur Ansicht**. Dieser Code ist **nicht direkt ausführbar** und fehlt wichtige Teile (Indexes, Extensions, etc.).

**Empfehlung:** Verwende immer die `docs/supabase_schema.sql` Datei (Option A), da sie vollständig und korrekt formatiert ist.

Falls du trotzdem den exportierten Code verwenden möchtest:

1. Öffne dein **altes Supabase-Projekt** im Dashboard
2. Gehe zu **"Database"** → **"Schema Visualizer"**
3. Klicke auf **"Copy as SQL"** (Button oben rechts)
4. **Prüfe den Code:** Er sollte eine Warnung enthalten: "This schema is for context only..."
5. **Manuell ergänzen:** Du musst Extensions, Indexes und `IF NOT EXISTS` Klauseln hinzufügen
6. **Besser:** Verwende stattdessen Option A (empfohlen)

### 4.3 Schema in Supabase einfügen

1. Gehe zurück zum Supabase SQL Editor
2. **Füge den kopierten SQL-Code ein** (Strg+V) in das große Textfeld
3. **Prüfe den Code:**
   - Er sollte mit `-- Supabase schema for Math2 app` beginnen
   - Er sollte mehrere `CREATE TABLE` Statements enthalten
   - Er sollte mit `create index` Statements enden

### 4.4 Schema ausführen

1. Klicke auf **"Run"** (Button unten rechts, oder drücke Strg+Enter)
2. **Warte 5-10 Sekunden**
3. **Prüfe die Ausgabe:**
   - Unten sollte stehen: **"Success. No rows returned"** oder ähnlich
   - **KEINE Fehlermeldungen** sollten erscheinen

### 4.5 Tabellen verifizieren

Du kannst die Tabellen auf zwei Wegen prüfen:

#### Option A: Schema Visualizer (empfohlen - visuelle Übersicht)

1. Klicke links auf **"Database"** → **"Schema Visualizer"**
2. Du siehst jetzt eine **visuelle Darstellung** aller Tabellen und ihrer Beziehungen
3. **Prüfe, ob folgende Tabellen sichtbar sind:**
   - [ ] `users`
   - [ ] `progress`
   - [ ] `coin_ledger`
   - [ ] `messages`
   - [ ] `battles`
   - [ ] `battle_turns`
4. Die Tabellen sollten durch Linien verbunden sein (zeigt Beziehungen)

#### Option B: Table Editor (alternative Methode)

1. Klicke links auf **"Table Editor"** (Tabellen-Symbol)
2. **Prüfe, ob folgende Tabellen in der Liste stehen:**
   - [ ] `users`
   - [ ] `progress`
   - [ ] `coin_ledger`
   - [ ] `messages`
   - [ ] `battles`
   - [ ] `battle_turns`

**✅ Wenn alle 6 Tabellen sichtbar sind, weiter zu Schritt 5!**

**❌ Wenn Tabellen fehlen:** Gehe zurück zu Schritt 4.3 und führe das Schema erneut aus.

---

## SCHRITT 5: Netlify Environment Variables setzen

### 5.1 Netlify Dashboard öffnen

1. Gehe zu: <https://app.netlify.com>
2. **Logge dich ein** (falls nötig)
3. Klicke auf deine **Site** (z.B. `realer-math` oder deine Site-URL)

### 5.2 Zu Environment Variables navigieren

1. Klicke oben auf **"Site settings"** (oder "Site configuration")
2. Scrolle nach unten zu **"Environment variables"**
3. Klicke auf **"Environment variables"**

### 5.3 Alte Supabase-Variablen löschen (falls vorhanden)

**⚠️ WICHTIG:** Wenn du alte, korrupte Keys hast, lösche diese zuerst!

1. Suche nach folgenden Variablen:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_KEY` (falls vorhanden)
   - `SUPABASE_ANON_KEY` (falls vorhanden)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Für jede gefundene Variable:
   - Klicke auf das **Mülleimer-Symbol** (löschen)
   - Bestätige die Löschung

### 5.4 Neue Variablen hinzufügen

Füge **4 neue Variablen** hinzu (eine nach der anderen):

#### Variable 1: SUPABASE_URL (Backend)

1. Klicke auf **"Add a variable"** (oder "Add variable")
2. Fülle aus:
   - **Key:** `SUPABASE_URL`
   - **Values:** Füge deine **Project URL** ein (aus Schritt 3.2)
   - **Scopes:** ✅ Aktiviere **"Production"** (und "Deploy previews" / "Branch deploys" falls gewünscht)
3. Klicke auf **"Save"**

#### Variable 2: SUPABASE_SERVICE_ROLE_KEY (Backend)

1. Klicke auf **"Add a variable"**
2. Fülle aus:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Values:** Füge deinen **service_role key** ein (aus Schritt 3.2)
   - **Scopes:** ✅ Aktiviere **"Production"** (und andere falls gewünscht)
3. Klicke auf **"Save"**

#### Variable 3: VITE_SUPABASE_URL (Frontend)

1. Klicke auf **"Add a variable"**
2. Fülle aus:
   - **Key:** `VITE_SUPABASE_URL`
   - **Values:** Füge **dieselbe Project URL** ein wie bei Variable 1
   - **Scopes:** ✅ Aktiviere **"Production"** (und andere falls gewünscht)
3. Klicke auf **"Save"**

#### Variable 4: VITE_SUPABASE_ANON_KEY (Frontend)

1. Klicke auf **"Add a variable"**
2. Fülle aus:
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Values:** Füge deinen **anon/public key** ein (aus Schritt 3.2)
   - **Scopes:** ✅ Aktiviere **"Production"** (und andere falls gewünscht)
3. Klicke auf **"Save"**

### 5.5 Checkliste - Alle Variablen gesetzt?

- [ ] `SUPABASE_URL` (Production Scope aktiviert)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Production Scope aktiviert)
- [ ] `VITE_SUPABASE_URL` (Production Scope aktiviert)
- [ ] `VITE_SUPABASE_ANON_KEY` (Production Scope aktiviert)

**✅ Wenn ja, weiter zu Schritt 6!**

---

## SCHRITT 6: Netlify Redeploy durchführen

### 6.1 Zu Deploys navigieren

1. Im Netlify Dashboard, klicke oben auf **"Deploys"** (oder "Deployments")
2. Du siehst eine Liste deiner Deployments

### 6.2 Neues Deployment triggern

1. Klicke auf **"Trigger deploy"** (Button oben rechts)
2. Wähle **"Clear cache and deploy site"** (wichtig: Cache löschen!)
3. Klicke auf **"Deploy site"**
4. **Warte 2-5 Minuten**, bis das Deployment fertig ist
   - Du siehst einen Fortschrittsbalken
   - Status sollte auf **"Published"** wechseln

**✅ Wenn das Deployment erfolgreich ist, weiter zu Schritt 7!**

---

## SCHRITT 7: Verifizierung - Funktioniert alles?

### 7.1 Debug Function testen

1. Öffne im Browser: `https://deine-site.netlify.app/.netlify/functions/debugSupabase`

   - Ersetze `deine-site` mit deiner tatsächlichen Netlify-URL
   - Beispiel: `https://realer-math.netlify.app/.netlify/functions/debugSupabase`

2. **Was du sehen solltest:**

   ```json
   {
     "clientCreated": true,
     "testQuery": "Success",
     "env": {
       "SUPABASE_URL": "SET",
       "SUPABASE_SERVICE_ROLE_KEY": "SET"
     }
   }
   ```

3. **✅ ERFOLG wenn:**

   - `clientCreated: true`
   - `testQuery: "Success"`
   - Keine Fehlermeldungen

4. **❌ FEHLER wenn:**
   - `clientCreated: false` → Keys sind falsch oder fehlen
   - `testQuery: "Failed"` → Schema fehlt oder Keys sind falsch
   - `SUPABASE_URL: MISSING` → Environment Variable nicht gesetzt

### 7.2 App testen

1. Öffne deine App: `https://deine-site.netlify.app`
2. **Teste folgende Funktionen:**
   - [ ] Registrierung funktioniert
   - [ ] Coins werden gespeichert
   - [ ] Progress wird gespeichert
   - [ ] Chat-Nachrichten bleiben erhalten
   - [ ] Keine Fehlermeldungen in der Konsole (F12 → Console)

### 7.3 Checkliste - Alles funktioniert?

- [ ] Debug Function zeigt `clientCreated: true`
- [ ] Debug Function zeigt `testQuery: "Success"`
- [ ] App lädt ohne Fehler
- [ ] Daten werden gespeichert (z.B. Coins, Progress)
- [ ] Keine "dev-fallback" Warnungen in der Konsole

**✅ Wenn alles funktioniert: GLÜCKWUNSCH! Supabase ist erfolgreich neu aufgesetzt!**

---

## 🚨 Troubleshooting - Wenn etwas nicht funktioniert

### Problem 1: "SUPABASE_URL: MISSING" in Debug Function

**Lösung:**

1. Gehe zu Netlify → Site settings → Environment variables
2. Prüfe, ob `SUPABASE_URL` existiert
3. Prüfe, ob **Production Scope** aktiviert ist
4. Falls nicht: Füge die Variable hinzu (siehe Schritt 5.4)
5. **Redeploy** durchführen (Schritt 6)

### Problem 2: "SUPABASE_SERVICE_ROLE_KEY: MISSING"

**Lösung:**

1. Gehe zu Netlify → Site settings → Environment variables
2. Prüfe, ob `SUPABASE_SERVICE_ROLE_KEY` existiert
3. Prüfe, ob der Wert korrekt ist (keine Leerzeichen am Anfang/Ende!)
4. Falls nicht: Füge die Variable hinzu (siehe Schritt 5.4)
5. **Redeploy** durchführen (Schritt 6)

### Problem 3: "Client created: false"

**Lösung:**

1. Prüfe, ob die Keys korrekt kopiert wurden:
   - Keine Leerzeichen am Anfang/Ende
   - Vollständiger Key (sehr lang, beginnt mit `eyJ...`)
2. Prüfe in Supabase Dashboard → Settings → API, ob die Keys noch gültig sind
3. Falls nötig: Kopiere die Keys erneut (Schritt 3) und aktualisiere in Netlify
4. **Redeploy** durchführen (Schritt 6)

### Problem 4: "Test query: Failed" oder "PGRST116"

**Lösung:**

1. Prüfe, ob das Schema korrekt ausgeführt wurde:
   - Gehe zu Supabase → Table Editor
   - Prüfe, ob alle 6 Tabellen existieren (siehe Schritt 4.5)
2. Falls Tabellen fehlen: Führe das Schema erneut aus (Schritt 4)
3. Prüfe, ob du `SUPABASE_SERVICE_ROLE_KEY` verwendest (nicht `SUPABASE_ANON_KEY`)

### Problem 5: Tabellen fehlen nach Schema-Ausführung

**Lösung:**

1. Gehe zu Supabase → SQL Editor
2. Führe folgende Abfrage aus, um zu prüfen, welche Tabellen existieren:

   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

3. Falls Tabellen fehlen: Kopiere das Schema erneut aus `docs/supabase_schema.sql` und führe es aus
4. Prüfe auf Fehlermeldungen im SQL Editor

### Problem 6: Deployment schlägt fehl

**Lösung:**

1. Prüfe die Deployment-Logs in Netlify:
   - Gehe zu Deploys → Klicke auf das fehlgeschlagene Deployment
   - Scrolle zu den Logs
2. Suche nach Fehlermeldungen:
   - "Environment variable not found" → Variable fehlt oder falscher Scope
   - "Build failed" → Anderes Problem, prüfe die Build-Logs
3. Falls nötig: Kontaktiere Support oder prüfe die Netlify-Dokumentation

---

## 📋 Finale Checkliste

Vor dem Abschluss, stelle sicher:

- [ ] Neues Supabase-Projekt erstellt
- [ ] Alle 3 Keys kopiert (URL, service_role, anon)
- [ ] Schema erfolgreich ausgeführt (6 Tabellen vorhanden)
- [ ] Alle 4 Environment Variables in Netlify gesetzt
- [ ] Production Scope für alle Variablen aktiviert
- [ ] Redeploy durchgeführt ("Clear cache and deploy site")
- [ ] Debug Function zeigt `clientCreated: true` und `testQuery: "Success"`
- [ ] App funktioniert ohne Fehler
- [ ] Daten werden gespeichert (Coins, Progress, etc.)

---

## 🎉 Fertig

Wenn alle Schritte erfolgreich waren, ist Supabase jetzt komplett neu aufgesetzt und funktionsfähig.

**Nächste Schritte:**

- Teste alle Features deiner App
- Überwache die Supabase-Dashboard für Fehler
- Prüfe regelmäßig die Netlify-Logs

**Bei Fragen oder Problemen:**

- Siehe: `docs/SUPABASE_TROUBLESHOOTING.md`
- Siehe: `docs/QUICK_FIX_SUPABASE.md`

---

## 📝 Notizen für später

**Wichtige Informationen, die du speichern solltest:**

- **Supabase Project URL:** `_____________________________`
- **Database Password:** `_____________________________` (aus Schritt 2.1)
- **Netlify Site URL:** `_____________________________`
- **Datum der Neuaufsetzung:** `_____________________________`

**⚠️ WICHTIG:** Speichere diese Informationen sicher! Du brauchst sie möglicherweise später.

---

_Erstellt: [Datum] | Version: 1.0_
