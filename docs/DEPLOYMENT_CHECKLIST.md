# Deployment Checklist - OpenAI Integration

## ✅ Deployment erfolgreich

Die Function wurde erfolgreich deployed:
- ✅ Code-Änderungen deployed
- ✅ OpenAI Package integriert
- ✅ Functions gebundelt und deployed

## 🔑 WICHTIG: Environment Variable setzen

**Bevor der AI-Chat funktioniert, muss die Environment Variable gesetzt werden:**

### Schritt 1: OpenAI API Key holen

1. Gehe zu: https://platform.openai.com/api-keys
2. Klicke auf "Create new secret key"
3. Kopiere den API Key (beginnt mit `sk-...`)
4. **WICHTIG:** Der Key wird nur einmal angezeigt!

### Schritt 2: In Netlify setzen

1. Gehe zu: https://app.netlify.com/projects/realer-math
2. Klicke auf: **Site settings** (links)
3. Klicke auf: **Environment variables** (unter "Build & deploy")
4. Klicke auf: **Add variable** (oder "Edit variables")
5. Setze:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Dein OpenAI API Key (z.B. `sk-...`)
   - **Scopes:** Wähle "All scopes" oder "Functions"
6. Klicke auf: **Save**

### Schritt 3: (Optional) Trigger Redeploy

Falls die Variable nach dem Setzen nicht sofort funktioniert:
- Gehe zu: **Deploys** → Klicke auf den letzten Deploy → **Trigger deploy** → **Deploy site**

Oder committe und pushe eine kleine Änderung (z.B. README-Update).

## ✅ Testen

1. Öffne: https://realer-math.netlify.app
2. Öffne den AI-Chat
3. Sende eine Test-Nachricht
4. Prüfe ob Antwort kommt

## 📊 Logs prüfen

Falls es nicht funktioniert, prüfe die Function Logs:

1. Gehe zu: https://app.netlify.com/projects/realer-math/logs/functions
2. Filtere nach: `aiAssistant`
3. Prüfe die letzten Logs

**Erwartete Logs bei Erfolg:**
```
[aiAssistant] Using OpenAI model "gpt-3.5-turbo"
[aiAssistant] Successfully got response from OpenAI, length: XXX
```

**Fehler bei fehlendem API Key:**
```
[aiAssistant] Missing OpenAI API key
```

## 🔍 Troubleshooting

### Problem: "Missing OpenAI API key"

**Lösung:**
- ✅ Prüfe ob `OPENAI_API_KEY` in Netlify Environment Variables gesetzt ist
- ✅ Prüfe ob der Scope korrekt ist (sollte "Functions" oder "All scopes" sein)
- ✅ Trigger einen neuen Deploy nach dem Setzen der Variable

### Problem: "Invalid API key"

**Lösung:**
- ✅ Prüfe ob der API Key korrekt kopiert wurde (beginnt mit `sk-`)
- ✅ Prüfe ob der API Key in OpenAI Dashboard aktiv ist
- ✅ Erstelle einen neuen API Key falls nötig

### Problem: "Rate limit exceeded"

**Lösung:**
- ✅ Prüfe dein OpenAI Quota/Limit
- ✅ Warte kurz und versuche es erneut
- ✅ Erwäge ein Upgrade deines OpenAI Plans

## ✅ Checkliste

- [ ] OpenAI API Key erstellt
- [ ] `OPENAI_API_KEY` in Netlify Environment Variables gesetzt
- [ ] (Optional) Redeploy getriggert
- [ ] AI-Chat getestet
- [ ] Function Logs geprüft
- [ ] Alles funktioniert! 🎉

