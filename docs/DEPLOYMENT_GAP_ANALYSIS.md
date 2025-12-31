# Deployment Gap Analysis - Was fehlt im Netlify Deploy?

## 🔍 Häufige Unterschiede: Lokal vs. Production

### 1. Environment Variables (KRITISCH)

**Lokal:** Werden aus `.env` Datei geladen (nicht in Git)
**Production:** Müssen in Netlify Dashboard gesetzt werden

#### Benötigte Environment Variables

**Backend (Netlify Functions):**

- ✅ `SUPABASE_URL` - Supabase Project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (empfohlen)
- ✅ `GEMINI_API_KEY` - Gemini API Key für AI Features
- ⚠️ `SUPABASE_ANON_KEY` - Optional (falls Service Role nicht verwendet wird)

**Frontend (Build-Time):**

- ✅ `VITE_SUPABASE_URL` - Für Realtime Client
- ✅ `VITE_SUPABASE_ANON_KEY` - Für Realtime Client

**Optional:**

- `GEMINI_MODELS` - Comma-separated list (default: `gemini-1.5-flash,gemini-1.5-pro,gemini-pro`)

### 2. Statische Dateien

**Prüfen ob committed:**

```bash
git ls-files public/
git ls-files robots.txt
```

**Sollten vorhanden sein:**

- `public/robots.txt` - Bot-Schutz
- `robots.txt` (Root) - Fallback

### 3. Dependencies

**Prüfen:**

```bash
# Lokal installiert
npm list @supabase/supabase-js @google/genai

# In package.json
grep -E "@supabase|@google" package.json
```

**Sollten in `dependencies` (nicht `devDependencies`) sein:**

- `@supabase/supabase-js`
- `@google/genai`

### 4. Netlify Functions

**Alle Functions sollten committed sein:**

```bash
git ls-files netlify/functions/
```

**Sollten vorhanden sein:**

- `_coins.cjs`
- `_rateLimit.cjs`
- `_supabase.cjs`
- `_utils.cjs`
- `aiAssistant.cjs`
- `hint.cjs`
- `me.cjs`
- `register.cjs`
- `battleCreate.cjs`
- `battleAccept.cjs`
- `battleSubmit.cjs`
- `battleList.cjs`
- `chatSend.cjs`
- `chatPoll.cjs`
- `coinsAdjust.cjs`
- `progressGet.cjs`
- `progressSave.cjs`
- `shopBuy.cjs`
- `updateUser.cjs`
- `usersList.cjs`
- `debugSupabase.cjs`

### 5. Build-Konfiguration

**`netlify.toml` sollte enthalten:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

## 🚀 Quick Fix Checklist

### Schritt 1: Environment Variables in Netlify setzen

1. Gehe zu: **Netlify Dashboard** → **Site Settings** → **Environment variables**
2. Füge hinzu (für Production):

```
SUPABASE_URL = <deine-supabase-url>
SUPABASE_SERVICE_ROLE_KEY = <dein-service-role-key>
GEMINI_API_KEY = <dein-gemini-key>
VITE_SUPABASE_URL = <deine-supabase-url>
VITE_SUPABASE_ANON_KEY = <dein-anon-key>
```

1. **Wichtig:** Nach Änderung → **Redeploy** erforderlich!

### Schritt 2: Dependencies prüfen

```bash
# Prüfe package.json
cat package.json | grep -A 5 "dependencies"

# Sollte enthalten:
# "@supabase/supabase-js": "^2.x.x"
# "@google/genai": "^1.x.x"
```

Falls fehlt:

```bash
npm install @supabase/supabase-js @google/genai
git add package.json package-lock.json
git commit -m "fix: Add missing dependencies"
git push
```

### Schritt 3: Statische Dateien prüfen

```bash
# Prüfe ob robots.txt committed ist
git ls-files robots.txt public/robots.txt

# Falls nicht:
git add robots.txt public/robots.txt
git commit -m "fix: Add robots.txt for bot protection"
git push
```

### Schritt 4: Functions prüfen

```bash
# Liste alle Functions
ls netlify/functions/

# Prüfe ob alle in Git sind
git ls-files netlify/functions/ | wc -l
ls netlify/functions/ | wc -l

# Falls Unterschiede:
git add netlify/functions/
git commit -m "fix: Add missing functions"
git push
```

### Schritt 5: Build testen

```bash
# Lokaler Build (sollte Production simulieren)
npm run build

# Prüfe dist/ Output
ls -la dist/

# Sollte enthalten:
# - index.html
# - assets/ (JS/CSS files)
```

### Schritt 6: Debug Function testen

**Nach Deployment:**

```
https://deine-site.netlify.app/.netlify/functions/debugSupabase
```

**Erwartet:**

- ✅ `Client created: Yes`
- ✅ `Test query: Success`
- ✅ Alle Env Vars gesetzt

## 🔧 Häufige Probleme & Lösungen

### Problem: "dev-fallback" in Production

**Ursache:** Supabase Env Vars fehlen
**Lösung:** Siehe Schritt 1

### Problem: Functions geben 500 Error

**Ursache:** Dependencies fehlen
**Lösung:** Siehe Schritt 2

### Problem: AI Features funktionieren nicht

**Ursache:** `GEMINI_API_KEY` fehlt
**Lösung:** Siehe Schritt 1

### Problem: Realtime/Battle Sync funktioniert nicht

**Ursache:** `VITE_SUPABASE_*` Env Vars fehlen
**Lösung:** Siehe Schritt 1

### Problem: Statische Dateien fehlen

**Ursache:** Nicht committed oder falscher Pfad
**Lösung:** Siehe Schritt 3

## 📋 Deployment Verification

Nach allen Fixes:

1. **Trigger Redeploy:**

   - Netlify Dashboard → Deploys → "Trigger deploy" → "Clear cache and deploy site"

2. **Test Endpoints:**

   ```bash
   # Debug
   curl https://deine-site.netlify.app/.netlify/functions/debugSupabase

   # Me
   curl https://deine-site.netlify.app/.netlify/functions/me

   # Hint (sollte 401 geben wenn nicht registriert)
   curl -X POST https://deine-site.netlify.app/.netlify/functions/hint \
     -H "Content-Type: application/json" \
     -d '{"topic":"test","question":"test"}'
   ```

3. **Frontend testen:**
   - Öffne Site im Browser
   - Prüfe Browser Console (keine 500 Errors)
   - Teste AI Chat
   - Teste Battle System
   - Teste Registration

## ✅ Final Checklist

- [ ] Alle Environment Variables in Netlify gesetzt
- [ ] Dependencies in package.json (dependencies, nicht devDependencies)
- [ ] Alle Functions committed
- [ ] Statische Dateien committed
- [ ] Build funktioniert lokal (`npm run build`)
- [ ] Redeploy ausgelöst
- [ ] Debug Function zeigt "Client created: Yes"
- [ ] Frontend funktioniert ohne Errors
