# 🏗 MathMaster Architektur-Dokumentation

Diese Dokumentation erklärt den technischen Aufbau der MathMaster-Plattform und dient als Leitfaden für die Integration neuer Inhalte und Funktionen.

## 1. Tech-Stack & Abhängigkeiten

Die Anwendung ist als moderne **Single Page Application (SPA)** konzipiert.

- **Framework:** [React 19](https://react.dev/) (Nutzt moderne Hooks wie `useMemo` und `useRef` für Performance).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-First CSS für schnelles, responsives Design).
- **KI-Engine:** [Google Gemini API](https://ai.google.dev/) (SDK: `@google/genai`) für dynamische Tipps.
- **Laufzeit/Build:** Die App ist für den Einsatz in modernen Browsern via ESM-Modulen optimiert (kein lokaler `node_modules` Ordner im Repository zwingend nötig, da `esm.sh` genutzt wird).

## 2. Projektstruktur

```text
/
├── App.tsx                # Haupt-UI-Logik, State-Management (User, Quests)
├── ui-components.tsx      # Wiederverwendbare UI-Elemente (Buttons, Karten, Rechner)
├── types.ts               # TypeScript Interfaces für Datensicherheit
├── constants.tsx          # Statische Daten (Lerneinheiten, Shop-Items)
├── services/
│   ├── taskFactory.ts     # DER ORT FÜR NEUE AUFGABEN (741 Zeilen, alle Task-Typen)
│   ├── segments.ts        # PreTasks & BountyTasks pro Unit (NEU!)
│   ├── questService.ts    # Belohnungslogik & Fortschritt
│   ├── coinAwardService.ts # Münz-Belohnungssystem (NEU!)
│   ├── tileStateService.ts # Tile-Status-Management (NEU!)
│   ├── apiService.ts      # Datenpersistenz (aktuell localStorage)
│   └── geminiService.ts   # Schnittstelle zur KI
├── ARCHITEKTUR.md         # Diese Dokumentation
└── MIGRATIONS_LOG.md      # Log der übertragenen Inhalte (NEU!)
```

## 3. Neue Aufgaben hinzufügen (Tutorial)

Alle Aufgaben werden in `services/taskFactory.ts` (741 Zeilen) generiert.

### Aufgaben-Typen

**Standard-Aufgaben** (für Quest-Modus):

- `choice` - Multiple Choice
- `input` - Zahleneingabe
- `visualChoice` - Visuelle Multiple Choice mit SVG
- `wager` - Einsatz-Aufgaben
- `dragDrop` - Drag & Drop Klassifikation
- `angleMeasure` - Winkel messen
- `sliderTransform` - Transformation mit Slider
- `areaDecomposition` - Flächen-Zerlegung

**PreTasks** (in `services/segments.ts`):

- Spielerische Voraufgaben pro Unit
- 4-5 interaktive Mini-Games
- Bereiten auf Standard-Quiz vor

**BountyTasks** (in `services/segments.ts`):

- 3 klassische Prüfungsaufgaben pro Unit
- Schwierigkeitsgrad: Mittel bis Schwer
- Müssen alle in einem Durchlauf korrekt sein

### Neue Standard-Aufgabe hinzufügen

1. Öffne `services/taskFactory.ts`.
2. Suche die Funktion `getTaskPool(unitId: string)`.
3. Füge Aufgabe zum entsprechenden Unit-Array hinzu:

   ```typescript
   case 'u1': return [
     this.createWagerTask(1, seed),
     this.createVisualShapeTask(0, seed),
     // ... DEINE NEUE AUFGABE:
     this.createShapeTask(3, seed) // Neue Variante
   ];
   ```

## 4. Neue Funktionen integrieren

Die App folgt dem **Service-Pattern**. Möchtest du z.B. ein "Erfolgssystem" hinzufügen:

1. **Service erstellen:** Erstelle `services/achievementService.ts`.
2. **State in App.tsx:** Füge den neuen State in der Hauptkomponente hinzu.
3. **UI-Komponente:** Erstelle ein Widget in `ui-components.tsx`.
4. **Integration:** Rufe den Service bei relevanten Ereignissen (z.B. `handleQuestComplete`) in `App.tsx` auf.

## 5. Deployment & Hosting

Am einfachsten lässt sich die App auf **Netlify** oder **Vercel** hosten:

1. **Voraussetzung:** Ein GitHub-Repository mit dem Code.
2. **Build-Einstellungen:**
   - Build Command: `npm run build` (falls ein Bundler wie Vite genutzt wird) oder einfach die `index.html` direkt ausliefern.
   - Publish Directory: `.` oder `dist`.
3. **Umgebungsvariablen:** Füge `API_KEY` (für Gemini) in den Hosting-Einstellungen hinzu.

## 6. Tipps für die Entwicklung

- **Auren/Effekte:** Diese liegen in `App.tsx` ganz oben im DOM. Achte darauf, dass sie `pointer-events-none` besitzen, damit Buttons darunter klickbar bleiben.
- **Mobile First:** Teste immer in der Responsive-Ansicht (Chrome DevTools).
- **Persistenz:** Um von `localStorage` auf eine echte Datenbank (z.B. Supabase oder Firebase) umzusteigen, müssen nur die Funktionen in `services/apiService.ts` angepasst werden.
