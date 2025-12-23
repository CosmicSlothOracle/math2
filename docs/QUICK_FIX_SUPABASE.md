# Quick Fix: Supabase in Production aktivieren

## 🚨 Problem
Alle Functions laufen im `dev-fallback` → Daten werden nicht gespeichert.

## ✅ Lösung in 5 Minuten

### Schritt 1: Supabase Keys kopieren

1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt
3. Gehe zu: **Project Settings** → **API**
4. Kopiere:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **service_role key** (secret! unter "Project API keys")

### Schritt 2: Netlify Environment Variables setzen

1. Gehe zu: https://app.netlify.com
2. Wähle Site: `realer-math`
3. Gehe zu: **Site settings** → **Environment variables**
4. Füge hinzu:

   **Variable 1:**
   - Key: `SUPABASE_URL`
   - Value: `<Project URL aus Schritt 1>`
   - Scopes: ✅ Production

   **Variable 2:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `<service_role key aus Schritt 1>`
   - Scopes: ✅ Production

5. **Wichtig:** Klicke "Save"

### Schritt 3: Schema erstellen

1. Gehe zu: Supabase Dashboard → **SQL Editor**
2. Kopiere Inhalt von `docs/supabase_schema.sql`
3. Füge ein und klicke **Run**

### Schritt 4: Redeploy

1. Netlify Dashboard → **Deploys**
2. Klicke **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Warte auf Deployment (ca. 2-3 Minuten)

### Schritt 5: Verifizieren

```bash
# Option 1: Debug Function (im Browser)
https://realer-math.netlify.app/.netlify/functions/debugSupabase

# Option 2: Self-Check Script
node scripts/selfcheck.mjs https://realer-math.netlify.app
```

**Erwartet:**
- ✅ `Client created: Yes`
- ✅ `Test query: Success`
- ✅ Keine `dev-fallback` Warnings

---

## 🔍 Wenn es nicht funktioniert

### Prüfe Debug Function:
```
https://realer-math.netlify.app/.netlify/functions/debugSupabase
```

**Häufige Probleme:**

1. **"SUPABASE_URL: MISSING"**
   → Env Var nicht gesetzt oder falscher Scope (nur Production!)

2. **"SUPABASE_SERVICE_ROLE_KEY: MISSING"**
   → Env Var nicht gesetzt oder falscher Scope

3. **"@supabase/supabase-js: NOT INSTALLED"**
   → `npm install @supabase/supabase-js` → Commit → Push → Redeploy

4. **"Client created: No"**
   → Prüfe ob Keys korrekt sind (keine Leerzeichen!)

5. **"Test query: Failed - PGRST116"**
   → RLS Problem → Verwende SERVICE_ROLE_KEY (umgeht RLS)

---

## 📋 Checkliste

- [ ] Supabase Projekt erstellt/geöffnet
- [ ] Keys kopiert (URL + service_role key)
- [ ] Netlify Env Vars gesetzt (Production Scope!)
- [ ] Schema ausgeführt (`docs/supabase_schema.sql`)
- [ ] Redeploy durchgeführt
- [ ] Debug Function zeigt: `Client created: Yes`
- [ ] Self-Check Script: Alle Tests passieren

---

## 🎯 Nach dem Fix

- ✅ Coins werden gespeichert
- ✅ Progress wird gespeichert
- ✅ Chat-Nachrichten bleiben erhalten
- ✅ Bounty Unlock funktioniert
- ✅ Kein gelber Banner mehr

---

Siehe auch: `docs/SUPABASE_TROUBLESHOOTING.md` für detaillierte Troubleshooting-Anleitung.

