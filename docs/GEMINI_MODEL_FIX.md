# Gemini Model Fix - gemini-pro entfernt

## Problem

Die Logs zeigen:
```
ApiError: {"error":{"code":404,"message":"models/gemini-pro is not found for API version v1beta, or is not supported for generateContent...
```

Das Model `gemini-pro` existiert nicht mehr oder wird nicht mehr für `generateContent` unterstützt.

## Lösung

### 1. Model-Liste aktualisiert
**Vorher:**
```javascript
'gemini-1.5-flash,gemini-1.5-pro,gemini-pro'
```

**Nachher:**
```javascript
'gemini-1.5-flash,gemini-1.5-pro'
```

### 2. Verbesserte 404-Fehler-Erkennung
Die Fehlerbehandlung wurde verbessert, um 404-Fehler auch in verschachtelten Strukturen zu erkennen:

```javascript
// Prüft jetzt:
- err.status === 404
- err.code === 404
- err.error.code === 404 (verschachtelte Struktur)
- err.error.status === 'NOT_FOUND'
- errMsg.includes('NOT_FOUND')
- errMsg.includes('not found')
```

## Betroffene Dateien

- ✅ `netlify/functions/aiAssistant.cjs` - Model-Liste aktualisiert, Fehlerbehandlung verbessert
- ✅ `netlify/functions/hint.cjs` - Model-Liste aktualisiert (konsistent)

## Verfügbare Gemini Models (Stand 2024)

- ✅ `gemini-1.5-flash` - Schnell, kostengünstig
- ✅ `gemini-1.5-pro` - Hochwertig, langsamer
- ❌ `gemini-pro` - **DEPRECATED/NICHT VERFÜGBAR**

## Custom Model-Liste

Falls du andere Models verwenden möchtest, setze die Environment Variable:
```
GEMINI_MODELS=gemini-1.5-flash,gemini-1.5-pro,dein-anderes-model
```

## Nächste Schritte

1. **Function neu deployen:**
   ```bash
   netlify deploy --prod
   ```

2. **Testen:** AI-Chat sollte jetzt funktionieren, da `gemini-1.5-flash` oder `gemini-1.5-pro` verwendet werden

3. **Prüfen:** Netlify Function Logs sollten zeigen:
   - `[aiAssistant] Trying Gemini model "gemini-1.5-flash"`
   - `[aiAssistant] Successfully got response from model "gemini-1.5-flash"`

## Erwartetes Verhalten

1. Function versucht zuerst `gemini-1.5-flash`
2. Falls das fehlschlägt (nicht 404), versucht es `gemini-1.5-pro`
3. Falls beide fehlschlagen, wird ein Fehler zurückgegeben

## Fallback-Verhalten

Die Function hat jetzt besseres Fallback-Verhalten:
- Bei 404-Fehler: Wechselt automatisch zum nächsten Model
- Bei anderen Fehlern: Versucht auch das nächste Model (außer beim letzten)
- Nur beim letzten Model wird der Fehler geworfen

