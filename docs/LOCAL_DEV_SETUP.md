# Local Development Setup mit Supabase

## Problem: "Unregistered API key" Fehler

Wenn du `netlify dev` lokal startest und den Fehler "Unregistered API key" bekommst, fehlen die Supabase Environment Variables.

## Lösung: Environment Variables für netlify dev setzen

### Option 1: .env.local Datei erstellen (Empfohlen)

1. Erstelle eine Datei `.env.local` im Projekt-Root (gleiche Ebene wie `package.json`)

2. Füge folgende Variablen hinzu:

```bash
# Supabase Configuration
SUPABASE_URL=https://dein-projekt-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key-hier

# Optional: Für Frontend Realtime
VITE_SUPABASE_URL=https://dein-projekt-id.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
```

1. **Wichtig:** Die `.env.local` Datei ist bereits in `.gitignore` und wird nicht committed.

2. Starte `netlify dev` neu (die Environment Variables werden automatisch geladen).

### Option 2: Environment Variables direkt setzen (Windows)

```cmd
set SUPABASE_URL=https://dein-projekt-id.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key-hier
netlify dev
```

### Option 3: netlify.toml [dev] Section

Du kannst auch die Variablen in `netlify.toml` unter `[dev]` hinzufügen:

```toml
[dev]
  command = "npm run dev"
  targetPort = 3000
  port = 8888
  framework = "vite"
  functions = "netlify/functions"
  environment = { SUPABASE_URL = "https://dein-projekt-id.supabase.co", SUPABASE_SERVICE_ROLE_KEY = "dein-key" }
```

**⚠️ WARNUNG:** Füge KEINE echten Keys in `netlify.toml` ein, da diese Datei committed wird! Verwende Option 1 oder 2.

## Supabase Keys finden

1. Gehe zu: <https://supabase.com/dashboard>
2. Wähle dein Projekt
3. Gehe zu: **Project Settings** → **API**
4. Kopiere:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## Verifizieren

Nach dem Setzen der Variablen:

1. Starte `netlify dev` neu
2. Öffne: <http://localhost:8888/.netlify/functions/debugSupabase>
3. Prüfe, ob `"Client created": true` und `"Test query": "Success"` angezeigt wird

## Troubleshooting

### Problem: "Invalid API key"

- Prüfe, ob der Key korrekt kopiert wurde (keine Leerzeichen am Anfang/Ende)
- Prüfe, ob der Key zum richtigen Supabase-Projekt gehört
- Prüfe, ob der Key noch gültig ist (nicht rotiert)

### Problem: Environment Variables werden nicht geladen

- Stelle sicher, dass die Datei `.env.local` heißt (nicht `.env`)
- Stelle sicher, dass die Datei im Projekt-Root liegt (gleiche Ebene wie `package.json`)
- Starte `netlify dev` neu (nicht nur den Browser refreshen)

