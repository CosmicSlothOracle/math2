# Netlify Environment Variables Setup

## 🚨 Was lokal funktioniert, aber in Production fehlt

Die meisten Unterschiede zwischen lokal (`netlify dev`) und Production kommen von **fehlenden Environment Variables** in Netlify.

## ✅ Quick Setup Guide

### Schritt 1: Netlify Dashboard öffnen

1. Gehe zu: https://app.netlify.com
2. Wähle deine Site: `realer-math` (oder deine Site-URL)
3. Navigiere zu: **Site settings** → **Environment variables**

### Schritt 2: Environment Variables hinzufügen

Füge folgende Variablen hinzu (für **Production** Scope):

#### Backend Variables (für Netlify Functions):

| Variable Name | Wo findest du den Wert? | Beispiel |
|--------------|------------------------|----------|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role key (secret!) | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI Platform → API Keys (https://platform.openai.com/api-keys) | `sk-...` |
| `GEMINI_API_KEY` | (Optional) Google AI Studio → API Keys (für hint Function) | `AIza...` |

#### Frontend Variables (für Build-Time):

| Variable Name | Wert | Beispiel |
|--------------|------|----------|
| `VITE_SUPABASE_URL` | Gleiche URL wie `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon/public key | `eyJhbGc...` |

### Schritt 3: Supabase Keys finden

1. **Gehe zu:** https://supabase.com/dashboard
2. **Wähle dein Projekt**
3. **Navigiere zu:** Project Settings → **API**
4. **Kopiere:**
   - **Project URL** → `SUPABASE_URL` und `VITE_SUPABASE_URL`
   - **service_role key** (unter "Project API keys", secret!) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Schritt 4: Gemini API Key finden

1. **Gehe zu:** https://aistudio.google.com/app/apikey
2. **Erstelle oder kopiere** deinen API Key
3. **Füge hinzu als:** `GEMINI_API_KEY`

### Schritt 5: In Netlify hinzufügen

Für jede Variable:
1. Klicke **"Add a variable"**
2. **Key:** Name der Variable (z.B. `SUPABASE_URL`)
3. **Value:** Der kopierte Wert
4. **Scopes:** ✅ **Production** (und ggf. Deploy previews/Branch deploys)
5. Klicke **"Save"**

### Schritt 6: Redeploy auslösen

**WICHTIG:** Nach dem Setzen der Env Vars muss ein **Redeploy** erfolgen!

1. Netlify Dashboard → **Deploys**
2. Klicke **"Trigger deploy"**
3. Wähle **"Clear cache and deploy site"**
4. Warte auf Deployment (ca. 2-3 Minuten)

## 🔍 Verifizieren

### Option 1: Debug Function

Öffne im Browser:
```
https://realer-math.netlify.app/.netlify/functions/debugSupabase
```

**Erwartet:**
```json
{
  "debug": {
    "env": {
      "SUPABASE_URL": "SET",
      "SUPABASE_SERVICE_ROLE_KEY": "SET",
      "GEMINI_API_KEY": "SET"
    },
    "clientCreated": true,
    "testQuery": "Success"
  }
}
```

### Option 2: Self-Check Script

```bash
node scripts/selfcheck.mjs https://realer-math.netlify.app
```

**Erwartet:** Alle Tests passieren, keine "dev-fallback" Warnings

## 📋 Checkliste

- [ ] `SUPABASE_URL` gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt
- [ ] `OPENAI_API_KEY` gesetzt (für AI Chat)
- [ ] `GEMINI_API_KEY` gesetzt (optional, für Hints)
- [ ] `VITE_SUPABASE_URL` gesetzt
- [ ] `VITE_SUPABASE_ANON_KEY` gesetzt
- [ ] Redeploy ausgelöst
- [ ] Debug Function zeigt "Client created: Yes"
- [ ] Frontend funktioniert ohne Errors

## ⚠️ Häufige Fehler

### "dev-fallback" in Production
→ Supabase Env Vars fehlen → Siehe Schritt 2

### AI Chat funktioniert nicht
→ `OPENAI_API_KEY` fehlt → Gehe zu https://platform.openai.com/api-keys und erstelle einen Key

### AI Hints funktionieren nicht
→ `GEMINI_API_KEY` fehlt → Siehe Schritt 4

### Realtime/Battle Sync funktioniert nicht
→ `VITE_SUPABASE_*` Env Vars fehlen → Siehe Schritt 2

### Functions geben 500 Error
→ Dependencies fehlen → Prüfe `package.json` (sollte bereits OK sein)

## 🆘 Hilfe

Falls Probleme bestehen:
1. Prüfe Netlify Function Logs: Dashboard → Functions → [Function Name] → Logs
2. Prüfe Build Logs: Dashboard → Deploys → [Latest Deploy] → Build log
3. Teste Debug Function: `/.netlify/functions/debugSupabase`

