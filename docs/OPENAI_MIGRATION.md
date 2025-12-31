# OpenAI Migration Guide

## Übersicht

Die AI-Chat-Funktion wurde von Google Gemini auf OpenAI umgestellt.

## Änderungen

### 1. Package-Abhängigkeit

**Hinzugefügt:**
- `openai` Package (^4.0.0)

**Hinweis:** Das `@google/genai` Package bleibt vorerst in den Dependencies (kann später entfernt werden, falls nicht mehr benötigt).

### 2. Environment Variables

**Neue Variable:**
- `OPENAI_API_KEY` (empfohlen)
- Oder `OPENAI_KEY` (Fallback)
- Oder `API_KEY` (Fallback)

**Optional:**
- `OPENAI_MODEL` - Standard ist `gpt-4o-mini` (kostengünstig, schnell, gute Qualität)

**Entfernt:**
- `GEMINI_API_KEY` wird nicht mehr verwendet
- `GEMINI_MODELS` wird nicht mehr verwendet

### 3. Code-Änderungen

**`netlify/functions/aiAssistant.cjs`:**

- **Import geändert:**
  ```javascript
  // VORHER:
  const { GoogleGenAI } = require("@google/genai");

  // NACHHER:
  const OpenAI = require("openai");
  ```

- **API-Key-Prüfung geändert:**
  ```javascript
  // VORHER:
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  // NACHHER:
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY;
  ```

- **Prompt-Struktur geändert:**
  - `buildContextPrompt()` → `buildOpenAIMessages()`
  - Gibt jetzt ein Messages-Array zurück (für Chat Completions API)
  - Format: `[{ role: 'system', content: '...' }, { role: 'user', content: '...' }]`

- **API-Aufruf geändert:**
  ```javascript
  // VORHER (Gemini):
  const ai = new GoogleGenAI({ apiKey });
  response = await ai.models.generateContent({...});

  // NACHHER (OpenAI):
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.7,
  });
  ```

- **Response-Extraktion vereinfacht:**
  ```javascript
  // VORHER (komplex, viele Fallbacks):
  let responseText = '';
  if (response && typeof response.text === 'function') { ... }
  // ... viele weitere Checks

  // NACHHER (einfach):
  const responseText = completion.choices[0]?.message?.content;
  ```

### 4. Standard-Model

**Verwendet:** `gpt-3.5-turbo`

**Gründe:**
- Sehr kostengünstig
- Schnell
- Gute Qualität (für Mathe-Hilfe ausreichend)
- Verfügbar für Chat Completions

**Alternative Models (via `OPENAI_MODEL` env var):**
- `gpt-4o-mini` - Etwas höhere Qualität, etwas teurer
- `gpt-4o` - Höhere Qualität, teurer
- `gpt-4` - Höchste Qualität, am teuersten

## Setup-Schritte

### 1. OpenAI API Key erstellen

1. Gehe zu https://platform.openai.com/api-keys
2. Klicke auf "Create new secret key"
3. Kopiere den API Key (wird nur einmal angezeigt!)

### 2. Environment Variable in Netlify setzen

1. Gehe zu Netlify Dashboard → Deine Site → Site settings → Environment variables
2. Klicke auf "Add variable"
3. Setze:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Dein OpenAI API Key (z.B. `sk-...`)
4. Speichere

### 3. Package installieren

```bash
npm install openai
```

### 4. Deployen

```bash
# Lokal testen:
netlify dev

# Oder deployen:
netlify deploy --prod
```

## Testing

### 1. Funktionstest

1. Öffne die App
2. Öffne den AI-Chat
3. Sende eine Test-Nachricht
4. Prüfe ob Antwort kommt

### 2. Logs prüfen

In Netlify Dashboard → Functions → `aiAssistant` → Logs sollte erscheinen:
```
[aiAssistant] Using OpenAI model "gpt-3.5-turbo"
[aiAssistant] Successfully got response from OpenAI, length: XXX
```

### 3. Fehlerbehandlung

Falls Fehler auftreten, prüfe:
- ✅ `OPENAI_API_KEY` ist gesetzt
- ✅ API Key ist gültig (in OpenAI Dashboard prüfen)
- ✅ API Key hat Credits/Quota
- ✅ `openai` Package ist installiert

## Kosten-Hinweise

**gpt-3.5-turbo Preise (Stand 2024):**
- Input: ~$0.50 / 1M tokens
- Output: ~$1.50 / 1M tokens

**Beispiel:**
- 1 Chat-Nachricht ≈ 500 tokens (input) + 200 tokens (output)
- ≈ $0.00025 + $0.0003 = **$0.00055 pro Nachricht**
- 1000 Nachrichten ≈ **$0.55**

**Hinweis:** `gpt-3.5-turbo` ist sehr kostengünstig und für die meisten Anwendungsfälle ausreichend.

**Tipp:** Setze ein Usage Limit in OpenAI Dashboard, um unerwartete Kosten zu vermeiden.

## Troubleshooting

### Problem: "Missing OpenAI API key"

**Lösung:**
- Prüfe ob `OPENAI_API_KEY` in Netlify Environment Variables gesetzt ist
- Stelle sicher, dass nach dem Setzen neu deployed wurde

### Problem: "Invalid API key"

**Lösung:**
- Prüfe ob der API Key korrekt kopiert wurde (beginnt mit `sk-`)
- Prüfe ob der API Key in OpenAI Dashboard aktiv ist
- Erstelle einen neuen API Key falls nötig

### Problem: "Rate limit exceeded"

**Lösung:**
- Prüfe dein OpenAI Quota/Limit
- Warte kurz und versuche es erneut
- Erwäge ein Upgrade deines OpenAI Plans

### Problem: "Model not found"

**Lösung:**
- Prüfe ob `OPENAI_MODEL` einen gültigen Model-Namen enthält
- Standard-Model (`gpt-3.5-turbo`) sollte immer verfügbar sein
- Prüfe OpenAI Dokumentation für verfügbare Models

## Migration Checklist

- [x] `openai` Package zur `package.json` hinzugefügt
- [x] Code von Gemini auf OpenAI umgestellt
- [x] `buildOpenAIMessages()` Funktion erstellt
- [x] API-Aufrufe angepasst
- [x] Response-Extraktion vereinfacht
- [ ] `OPENAI_API_KEY` in Netlify gesetzt
- [ ] Package installiert (`npm install`)
- [ ] Function getestet
- [ ] Deployed

## Rückmigration zu Gemini

Falls du zurück zu Gemini möchtest:
1. Revertiere die Code-Änderungen (git)
2. Setze `GEMINI_API_KEY` in Netlify
3. Deploye erneut

Oder verwende eine Feature-Flag, um zwischen beiden zu wechseln.

## Weitere Verbesserungen

Mögliche zukünftige Verbesserungen:
- [ ] Streaming-Responses für bessere UX
- [ ] Token-Usage-Tracking
- [ ] Fallback zu Gemini wenn OpenAI fehlschlägt
- [ ] Model-Auswahl basierend auf Kontext

