# Deployment & Backend-Plan

## 1. Deployment via Netlify (Empfohlen)
Netlify ist die ideale Wahl, da es CD (Continuous Deployment) direkt aus GitHub ermöglicht.
- **Build-Command**: `npm run build`
- **Publish-Directory**: `dist`

## 2. Backend & Persistenz (Einfachste Lösung)
Um ein komplexes Node.js-Backend zu vermeiden, schlage ich folgende Kombination vor:

### Option A: Netlify Functions + Netlify Blobs
- **Vorteil**: Alles bleibt in einem Account.
- **Funktion**: Kleine Serverless Functions übernehmen das Speichern der Chat-Nachrichten und des Leaderboards.

### Option B: Supabase (Empfehlung für "echten" Social-Speed)
- **Vorteil**: Bietet eine fertige Echtzeit-Datenbank für den Chat.
- **Aufwand**: Erfordert nur das Ersetzen der `localStorage`-Aufrufe im `apiService.ts` durch Supabase-Queries.
- **Traffic-Monitoring**: Supabase bietet ein Dashboard, auf dem man genau sieht, wie viele User gerade aktiv sind und welche Aktionen (Interaktionen) sie ausführen.

## 3. Traffic & Analytics
Nutze **Netlify Analytics**. Es ist serverbasiert, benötigt keine Cookies und zeigt genau, wie oft die App genutzt wird, ohne die Performance zu beeinträchtigen.
