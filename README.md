# MathMaster Neun - Architektur & Dokumentation

Diese Plattform ist eine hochmoderne Lernumgebung für Geometrie (9. Klasse), die auf eine schnelle Skalierung und Backend-Integration vorbereitet ist.

## 🏗 Architektur

Die Anwendung folgt dem **Service-Layer-Pattern**, um die Geschäftslogik von der UI (React) zu trennen.

### 1. Frontend (UI Layer)
- **React 19**: Nutzt moderne Hooks (`useMemo`, `useRef`, `useState`) für ein flüssiges Erlebnis.
- **Tailwind CSS**: Für ein responsives "High-End" Design mit Glasmorphismus-Effekten.
- **Gemini API**: Integrierter KI-Tutor für kontextuelle Tipps ohne direktes Vorsagen der Lösung.

### 2. Service Layer (Mock Backend)
Alle API-Aufrufe sind in `services/` gekapselt und geben `Promises` zurück.
- **AuthService**: Handhabt Login/Logout. Aktuell via `localStorage`.
- **DataService**: Synchronisiert User-Fortschritt (XP, Coins, Quests).
- **SocialService**: Verwaltet das Leaderboard, den Chat und das **Math Battle System**.
- **Logger**: Zeichnet alle kritischen Aktionen (Quest-Erfolg, Käufe, Battles) auf.

### 3. Math Battle System
Ein kompetitives Feature, das Schüler motiviert:
- **Herausforderung**: Über das Leaderboard können andere User (oder Bots) zum Duell gefordert werden.
- **Einsatz**: Coins können gesetzt werden, um den "Pot" zu füllen.
- **Siegbedingungen**: 
  1. Anzahl korrekter Antworten (höchste Priorität).
  2. Zeit (Tie-Breaker bei gleicher Korrektheit).

## 🚀 Backend-Integration (z.B. Netlify / Supabase)

Um die App auf ein echtes Multi-User-System umzustellen:

1. **API Endpoints**: Erstelle Netlify Functions für `/login`, `/updateUser`, `/sendMessage` und `/battle`.
2. **Datenbank**: Verbinde eine Datenbank (z.B. MongoDB oder PostgreSQL via Supabase).
3. **Service Update**: Ersetze in `services/apiService.ts` die `localStorage`-Logik durch standardmäßige `fetch()` oder `axios()` Aufrufe.
   *Beispiel:*
   ```typescript
   // Von:
   let users = db.get('mm_users');
   // Zu:
   const users = await fetch('/api/leaderboard').then(res => res.json());
   ```
4. **WebSockets**: Für den Live-Chat und Real-time Battles empfiehlt sich die Integration von Socket.io oder Supabase Realtime.

## 🛠 Features
- **Quest Map**: Strukturierter Lernpfad nach Lehrplan.
- **Spickzettel**: Kontextueller Splitscreen-Modus während Quests.
- **KI-Tutor**: Intelligente Hilfestellungen via Gemini Flash 2.5.
- **Shop**: Gamification durch Avatare und visuelle Effekte.
