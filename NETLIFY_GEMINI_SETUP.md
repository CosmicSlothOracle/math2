# Gemini API Setup für Netlify

## 1. API-Key in Google AI Studio erstellen

1. Gehe zu [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Klicke auf **"Get API key"** (oder "Create API key")
3. Erstelle einen neuen API-Key für dein Projekt
4. **Wichtig:** Kopiere den Key sofort - er wird nur einmal angezeigt!

## 2. API-Key in Netlify Environment Variables setzen

### Option A: Via Netlify Dashboard (Empfohlen)

1. Gehe zu deinem Netlify Dashboard
2. Wähle dein Projekt aus
3. Navigiere zu: **Site settings** → **Environment variables**
4. Klicke auf **"Add a variable"**
5. Füge folgende Variable hinzu:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Dein Gemini API-Key (aus Schritt 1)
   - **Scopes:** Wähle "All scopes" oder "Production, Deploy previews, Branch deploys" je nach Bedarf
6. Klicke auf **"Save"**

### Option B: Via Netlify CLI

```bash
# Installiere Netlify CLI (falls noch nicht geschehen)
npm install -g netlify-cli

# Login zu Netlify
netlify login

# Setze die Environment Variable
netlify env:set GEMINI_API_KEY "dein-api-key-hier"
```

## 3. Verwendung im Code

### Netlify Functions (Server-Side)

Die Netlify Functions lesen automatisch aus `process.env.GEMINI_API_KEY`:

```javascript
// netlify/functions/hint.cjs
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({
  model: "gemini-1.5-flash",  // Immer Flash verwenden
  contents: "..."
});
```

### Frontend (Client-Side)

⚠️ **WICHTIG:** API-Keys sollten **NIEMALS** im Frontend-Code oder im Build hardcodiert sein!

Der API-Key wird nur in Netlify Functions verwendet. Das Frontend ruft die Netlify Functions auf:

```typescript
// services/geminiService.ts
export async function getMatheHint(topic: string, question: string) {
  // Ruft Netlify Function auf, die den API-Key verwendet
  const res = await fetch("/.netlify/functions/hint", {
    method: "POST",
    body: JSON.stringify({ topic, question })
  });
  // ...
}
```

## 4. Modell-Konfiguration

Das Projekt verwendet **immer Gemini 1.5 Flash** für:
- Schnellere Antwortzeiten
- Kosteneffizienz
- Gute Performance für Lerninhalte

**Modell-Name:** `gemini-1.5-flash`

## 5. Testing

Nach dem Setzen der Environment Variable:

1. **Redeploy** deine Site in Netlify (oder warte auf den nächsten Deploy)
2. Teste die Hint-Funktion in der App
3. Prüfe die Netlify Function Logs bei Problemen:
   - Dashboard → **Functions** → **hint** → **Logs**

## 6. Troubleshooting

### "Missing Gemini API key" Error

- ✅ Prüfe, ob `GEMINI_API_KEY` in Netlify Environment Variables gesetzt ist
- ✅ Stelle sicher, dass die Variable für den richtigen Scope verfügbar ist (Production/Preview)
- ✅ Redeploy die Site nach dem Setzen der Variable

### API Key funktioniert lokal nicht

- Lokal benötigst du eine `.env` Datei (nicht committen!):
  ```env
  GEMINI_API_KEY=dein-api-key-hier
  ```
- Für lokale Netlify Functions: `netlify dev` lädt automatisch `.env`

### Modell-Name ändern

Falls du ein anderes Modell testen möchtest, ändere den `model` Parameter:
- `gemini-1.5-flash` (aktuell, empfohlen)
- `gemini-1.5-pro` (langsamer, aber präziser)
- `gemini-pro` (ältere Version)

**Hinweis:** Ändere den Modell-Namen in:
- `netlify/functions/hint.cjs` (Zeile 40)
- `services/geminiService.ts` (Zeile 30, falls verwendet)

## 7. Sicherheit

- ✅ API-Key **niemals** in Git committen
- ✅ API-Key nur in Netlify Environment Variables speichern
- ✅ Frontend ruft immer Netlify Functions auf (keine direkten API-Calls)
- ✅ Regelmäßig API-Key Usage in Google Cloud Console prüfen

