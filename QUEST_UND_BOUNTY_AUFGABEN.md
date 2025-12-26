# Quest- & Bounty-Übersicht (Dez 2025 Update)

Dieses Dokument fasst alle relevanten Quest- und Bounty-Informationen nach der Wirtschaftsumstellung (Quest-Caps, Entry Fees, einmalige Bounty-Payouts) zusammen. Fokus: prüfungsrelevante Geometrie für Klasse 9/10 (Gymnasium Brandenburg).

---

## Economy Rules

- **Quest-Cap pro Unit**:
  u1/u2/u6 → 100 Coins, u3/u4/u5 → 120 Coins. Jede Quest-Vergütung (pro Frage + Abschlussbonus) wird auf den verbleibenden Cap gekürzt.
- **Bounty Entry Fee**: Beim Klick auf „Accept Bounty“ wird 15 % (min 10, max 60) des Bounty-Rewards als Startgebühr abgezogen.
- **Einmalige Bounty-Payouts**: Pro Unit nur eine Auszahlung möglich. Nach perfektem Durchlauf wird `bountyPayoutClaimed[unit] = true` und weitere Runs bleiben „for practice only“.

| Unit | Reward | Entry Fee | Themenfokus |
| --- | --- | --- | --- |
| u1 | 300 Coins | 45 Coins | Figurenhierarchie & Koordinaten |
| u2 | 320 Coins | 48 Coins | Winkelbeziehungen & Thales |
| u3 | 350 Coins | 53 Coins | Flächen-Terme & Gleichsetzungen |
| u4 | 400 Coins | 60 Coins | Volumen/Oberfläche (3D) |
| u5 | 380 Coins | 57 Coins | Ähnlichkeit & Maßstab |
| u6 | 350 Coins | 53 Coins | Kontextaufgaben (Distanz/Modelle) |

---

## Unit u1 – Figuren verstehen

### Quest Highlights
- Wager („Jedes Quadrat ist ein Rechteck?“), Visual-Choice (Kreditkarte, Rampe, Tür), Drag&Drop „Haus der Vierecke“.

### Bounty-Set
1. **Klassenlogik** – Zwei Textfelder (Figurenklasse + Eigenschaft, die nicht zwingend gilt). Validator prüft Keywords („Raute/Rhombus“) sowie Negation zu „rechten Winkeln“.
2. **Aussage-Check** – Drei Felder (Wahr/Falsch, Begründung, korrekte Aussage). Boolean + Keyword-Vergleich („rechte Winkel fehlen“, „Jedes Rechteck ist Parallelogramm“).
3. **Special: Koordinaten-Parallelogramm** – Eingabe eines Koordinatenpaars (D = (3\|4)), Parser akzeptiert `3|4`, `(3,4)` etc.

---

## Unit u2 – Winkel & Beziehungen

### Quest Highlights
- Multi-Angle Throw (Startkosten 10 Coins, 5 Coins pro Treffer), Visual-Winkel, Neben-/Scheitelwinkel, Winkelmessung (±5°).

### Bounty-Set
1. **Parallele Linien** – Drei numerische Felder (Nebenwinkel 142°, Scheitel 38°, Stufenwinkel 38°/142°).
2. **Gleichschenkliges Dreieck** – Einfacher Zahlen-Validator (Basiswinkel 70°).
3. **Special: Thales** – Numerischer Validator (∠CBA = 70°).

---

## Unit u3 – Flächen & Terme

### Quest Highlights
- Rechteck/Dreieck-Flächen, Kreisumfang/-fläche (π≈3,14), Flächenzerlegung mit Klick-Parts.

### Bounty-Set
1. **Garten-Gleichung** – Multi-Input (Gleichung `x(x+5)=300` oder äquivalent, Lösung x=15).
2. **Rahmenterm** – Multiple-Choice („4x² + 140x“).
3. **Special: Gleiche Flächen** – Numeric (x=2) für Rechteck vs. rechtwinkliges Dreieck.

---

## Unit u4 – Körper & Oberflächen

### Quest Highlights
- Volumenaufgaben (dm³→Liter), Cylinder/Oberfläche, Netze, zusammengesetzte Körper.

### Bounty-Set
1. **Zylindervolumen** – Input mit Toleranz ±10 L (6280 L).
2. **Skalierung** – Choice („V×8; O×4“).
3. **Special: Gefräste Oberfläche** – Numeric 404 cm².

---

## Unit u5 – Ähnlichkeit & Maßstab

### Quest Highlights
- Visual Similarity/Scale, Skalierungslogik, Transform-Slider, Strahlensatz-Aufgaben.

### Bounty-Set
1. **Ähnliche Dreiecke** – Numeric (DF = 6 cm).
2. **Maßstab** – Numeric mit Dezimal (3,5 km).
3. **Special: Spiegel/Strahlensatz** – Numeric 6,4 m (Toleranz ±0,1).

---

## Unit u6 – Kontext & Anwendung

### Quest Highlights
- Kontext-Szenarien (Parabel, Drohnenflug, Funktionsgrafen, Pythagoras in Alltag).

### Bounty-Set
1. **Distanz im Koordinatensystem** – Numeric ±0,1 km (≈10,8 km).
2. **Leiter an der Wand** – Choice („4,0 m“).
3. **Special: Dachfläche** – Numeric 100 m².

---

### Validator-Bausteine
- `sanitizeNumberInput` (ersetzt Komma → Punkt, entfernt Sonderzeichen).
- `matchKeywords` + Negationscheck (für textuelle Begründungen).
- `parseCoordinatePair` (extrahiert zwei Zahlen – akzeptiert `|`, `;`, `,`, Leerzeichen).
- `validateAnswer` orchestriert Keywords, Boolean, numeric tolerance, equation patterns.

### Testing
- `npm test` (Vitest) deckt Sanitizer, Keyword-, Koordinaten- und Toleranzlogik ab (23 Specs).
# Quest- und Bounty-Aufgaben Übersicht

Diese Datei listet alle im Projekt vorhandenen Quest- und Bounty-Aufgaben mit ihren Fragen, Typen, Optionen und richtigen Lösungen auf.

---

## Unit 1: Figuren verstehen (u1)

### Quest-Aufgaben (Standard)

#### 1. Wager-Aufgabe
- **Typ**: `wager`
- **Frage**: "Wette darauf: 'Jedes Quadrat ist automatisch auch ein Rechteck.'"
- **Optionen**: ["Stimmt", "Stimmt nicht"]
- **Wager-Optionen**: [10, 20, 50] Coins
- **Richtige Antwort**: 0 (Stimmt)
- **Erklärung**: "Ein Quadrat hat 4 rechte Winkel und gegenüberliegende Seiten sind parallel. Damit erfüllt es ALLE Bedingungen eines Rechtecks (und ist sogar noch spezieller)."

#### 2. Visuelle Form-Aufgabe (Index 0)
- **Typ**: `visualChoice`
- **Frage**: "Welche geometrische Form hat eine klassische Schallplatte?"
- **Optionen** (visuell, ohne Label):
  - Kreis (id: `circle`)
  - Rechteck (id: `rect`)
  - Dreieck (id: `tri`)
- **Richtige Antwort**: `circle`
- **Erklärung**: "Eine Schallplatte ist ein perfekter Kreis."

#### 3. Form-Aufgabe (Index 0)
- **Typ**: `choice`
- **Frage**: "Ein Mitschüler behauptet: 'Jedes Quadrat ist automatisch auch ein Rechteck'. Hat er Recht?"
- **Optionen**:
  - "Ja, das stimmt."
  - "Nein, falsch."
  - "Nur wenn es rot ist."
  - "Nur in der Geometrie nicht."
- **Richtige Antwort**: 0
- **Erklärung**: "Er hat Recht. Ein Quadrat erfüllt alle Bedingungen eines Rechtecks (rechte Winkel), hat aber zusätzlich vier gleich lange Seiten."

#### 4. Form-Aufgabe (Index 1) - Schiefes Regal
- **Typ**: `choice`
- **Frage**: "Du baust ein Regal auf, aber es ist total schief und wackelig. Die Winkel sind nicht mehr 90°, aber die Seiten noch gleich lang und parallel. Was ist es jetzt?"
- **Optionen**:
  - "Quadrat"
  - "Rechteck"
  - "Raute (Rhombus)"
  - "Kreis"
- **Richtige Antwort**: 2
- **Erklärung**: "Ein 'schiefes Quadrat' nennt man Raute. Alle Seiten sind gleich lang, aber die Winkel sind keine 90° mehr."

#### 5. Form-Aufgabe (Index 2) - Kreditkarte
- **Typ**: `choice`
- **Frage**: "Welche geometrische Form hat eine typische Kreditkarte?"
- **Optionen**:
  - "Raute"
  - "Rechteck"
  - "Trapez"
  - "Drachenviereck"
- **Richtige Antwort**: 1
- **Erklärung**: "Kreditkarten sind Rechtecke. Sie haben vier rechte Winkel und gegenüberliegende Seiten sind parallel."

#### 6. Visuelle Form-Aufgabe (Index 1) - Graffiti-Wand
- **Typ**: `visualChoice`
- **Frage**: "Die markierte Wandfläche für das Graffiti. Welche Form soll hier gefüllt werden?"
- **Optionen** (visuell, ohne Label):
  - Dreieck/Rampe (id: `tri`)
  - Rechteck/Wand (id: `rect`)
  - Parallelogramm (id: `para`)
- **Richtige Antwort**: `rect`
- **Erklärung**: "Die Fläche hat vier rechte Winkel. Es ist ein Rechteck."

#### 7. Visuelle Form-Aufgabe (Index 2) - Skater-Rampe
- **Typ**: `visualChoice`
- **Frage**: "Die Seitenansicht einer Skater-Rampe (Bank). Welche Form erkennst du?"
- **Optionen** (visuell, ohne Label):
  - Kreis/Rad (id: `circle`)
  - Rechteck/Box (id: `rect`)
  - Dreieck/Rampe (id: `tri`)
- **Richtige Antwort**: `tri`
- **Erklärung**: "Von der Seite betrachtet bildet die Rampe ein Dreieck."

#### 8. Visuelle Form-Aufgabe (Index 3) - Tür
- **Typ**: `visualChoice`
- **Frage**: "Welche Form hat eine typische Tür (von vorne betrachtet)?"
- **Optionen** (visuell, ohne Label):
  - Quadrat (id: `square`)
  - Rechteck (id: `rect`)
  - Raute (id: `rhombus`)
- **Richtige Antwort**: `rect`
- **Erklärung**: "Türen sind Rechtecke mit vier rechten Winkeln."

#### 9. Drag-and-Drop Klassifikation (NEU: Echte Drag & Drop)
- **Typ**: `dragDrop`
- **Frage**: "Ordne die Figuren in das 'Haus der Vierecke' ein. Ziehe jede Figur in die richtige Kategorie!"
- **Hinweis**: Jetzt mit echter Drag & Drop Funktionalität (dnd-kit). Mobile: Tippe auf Figur, dann auf Kategorie.
- **Formen**:
  - Quadrat (id: `square`)
  - Rechteck (id: `rect`)
  - Raute (id: `rhombus`)
  - Parallelogramm (id: `para`)
  - Trapez (id: `trapez`)
- **Kategorien**:
  - Allgemeines Viereck (akzeptiert: `trapez`)
  - Parallelogramm (akzeptiert: `para`, `rect`, `rhombus`, `square`)
  - Rechteck (akzeptiert: `rect`, `square`)
  - Raute (akzeptiert: `rhombus`, `square`)
  - Quadrat (akzeptiert: `square`)
- **Richtige Zuordnung**:
  - `square` → `quadrat`
  - `rect` → `rechteck`
  - `rhombus` → `raute`
  - `para` → `parallelogramm`
  - `trapez` → `viereck`
- **Erklärung**: "Das Haus der Vierecke zeigt die Hierarchie: Jedes Quadrat ist auch ein Rechteck und eine Raute. Jedes Rechteck und jede Raute ist auch ein Parallelogramm."

#### 10. Text-Aufgabe ohne Bild – Verzogenen Regalbrett
- **Typ**: `choice`
- **Frage**: "Verzogenes Regalbrett: Vier Seiten gleich lang, Gegenseiten parallel, Winkel 110°/70°, kein rechter Winkel. Welche Figurenklasse passt?"
- **Optionen**: Quadrat, Rechteck, Raute, Parallelogramm, Trapez
- **Richtige Antwort**: Raute
- **Antwortformat**: Dropdown, genau eine Auswahl
- **Erklärung**: "Vier gleiche Seiten + parallele Gegenseiten → Raute. Keine 90° → kein Rechteck/Quadrat."

### Bounty-Aufgaben (Update Dez 2025)

1. **Bounty A – Figurenklassifikation (Medium)**
   - Typ: `input` mit zwei Textfeldern.
   - Prompt: „Ein Viereck hat vier gleich lange Seiten und parallele Gegenseiten. a) Zu welcher Figurenklasse gehört es? b) Nenne eine Eigenschaft, die nicht zwingend gilt.“
   - Validator: Keywords für „Raute/Rhombus“ sowie Negation zu „rechten Winkeln“.
   - Fokus: Hierarchie im Haus der Vierecke, typische Fehlannahmen zu rechtwinkligen Rauten.

2. **Bounty B – Aussage prüfen (Medium)**
   - Typ: `input` mit drei Feldern (Wahr/Falsch, Begründung, korrekte Aussage).
   - Prompt: „‚Jedes Parallelogramm ist ein Rechteck‘ – bewerte, begründe und formuliere die korrekte Aussage.“
   - Validator: Boolean + Keyword-Begründung (rechte Winkel fehlen) + Korrektur („Jedes Rechteck ist ein Parallelogramm“, „Jedes Quadrat ist …“).

3. **Special Bounty – Koordinaten-Parallelogramm (Schwer)**
   - Typ: `input`
   - Prompt: „Parallelogramm ABCD mit A(1\|1), B(4\|2), C(6\|5). Bestimme D.“
   - Validator: Koordinatenpaar (D = (3\|4)), toleranter Parser akzeptiert Formate wie `3|4`, `(3,4)` etc.

4. **Neu: Verzoge­nes Regalbrett (Mittel)**
   - Typ: `input` mit drei Feldern (Dropdown + Dropdown + Freitext kurz)
   - Prompt: „Viereck mit vier gleich langen Seiten, Winkel 110°/70°. a) Figurenklasse? b) Eine zwingende Eigenschaft? c) Eine nicht zwingende Eigenschaft?“
   - Validator: a) Keywords „Raute/Rhombus“ (Dropdown), b) Keywords „gleich lange Seiten“ oder „Gegenseiten parallel“, c) Negation zu „rechten Winkeln“.

- **Entry Fee**: 45 Coins (automatisch bei „Accept Bounty ⚔️“ abgezogen).
- **Bounty Reward**: 300 Coins einmalig pro Unit; nach Abschluss wird die Auszahlung gesperrt.

---

## Unit 2: Winkel & Beziehungen (u2)

### Neue Aufgaben (Phase 3)

#### 10. Parallele Geraden + Querlinie
- **Typ**: `input`
- **Frage**: "Zwei parallele Geraden werden von einer Querlinie geschnitten. Ein Winkel beträgt X°. Berechne alle weiteren Winkel."
- **Richtige Antwort**: Komma-getrennte Winkelwerte
- **Erklärung**: Verwendet Nebenwinkel, Scheitelwinkel und Stufenwinkel

#### 11. Thales-Theorem + Pythagoras
- **Typ**: `input`
- **Frage**: "Ein rechtwinkliges Dreieck hat die Katheten a=Xcm und b=Ycm. Berechne die Hypotenuse c mit dem Satz des Pythagoras."
- **Richtige Antwort**: Numerischer Wert in cm
- **Erklärung**: Anwendung des Satzes des Pythagoras

---

## Unit 2: Winkel & Beziehungen (u2)

### Quest-Aufgaben (Standard)

#### 1. Multi-Angle Throw Training
- **Typ**: `multiAngleThrow`
- **Frage**: "Werfe die Flasche mit bis zu 5 verschiedenen Winkeln und versuche, den [Zielwinkel]° Winkel zu treffen!\n\n💰 Kosten: 10 Coins zu Beginn\n⭐ Belohnung: 5 Coins pro Treffer"
- **Zielwinkel**: Variiert (45°, 30°, 60°, 35°)
- **Maximale Versuche**: 5
- **Toleranz**: ±5°
- **Erklärung**: "Durch wiederholtes Experimentieren lernst du, wie unterschiedliche Winkel die Flugbahn beeinflussen. Jeder Treffer in der Nähe des Ziels zählt!"

#### 2. Visuelle Winkel-Aufgabe (Index 0)
- **Typ**: `visualChoice`
- **Frage**: "Eine Flasche wird geworfen. Welcher Abwurfwinkel wäre 'stumpf' (>90°)?"
- **Optionen** (visuell, ohne Label):
  - Spitz <90° (id: `a`, Winkel: 45°)
  - Recht 90° (id: `b`, Winkel: 90°)
  - Stumpf >90° (id: `c`, Winkel: 135°)
- **Richtige Antwort**: `c`
- **Erklärung**: "Ein stumpfer Winkel ist weiter geöffnet als ein rechter Winkel (größer als 90 Grad)."

#### 3. Winkel-Aufgabe (Index 0) - Nebenwinkel
- **Typ**: `input`
- **Frage**: "Du lehnst an einer Wand. Dein Rücken und die Wand bilden [α]°. Ein anderer Winkel liegt auf der gleichen Geraden direkt daneben (Nebenwinkel). Wie groß ist dieser?"
- **α**: Zufällig zwischen 100-140°
- **Richtige Antwort**: `180 - α` (z.B. wenn α=120°, dann Antwort: `60`)
- **Erklärung**: "Nebenwinkel an einer Geraden ergänzen sich immer zu 180°."

#### 4. Winkel-Aufgabe (Index 1) - Scheitelwinkel
- **Typ**: `choice`
- **Frage**: "Ein Scheinwerfer ist im 45°-Winkel ausgerichtet. Sein gegenüberliegender Winkel (Scheitelwinkel) hat wie viel Grad?"
- **Optionen**:
  - "45°"
  - "90°"
  - "135°"
  - "180°"
- **Richtige Antwort**: 0
- **Erklärung**: "Scheitelwinkel liegen sich gegenüber und sind immer exakt gleich groß."

#### 5. Winkel-Aufgabe (Index 2) - Rechtwinkliges Dreieck
- **Typ**: `input`
- **Frage**: "Konstruktion einer Rampe: Es entsteht ein rechtwinkliges Dreieck. Unten beträgt der Winkel [α]°. Wie groß ist der dritte Winkel oben?"
- **α**: Zufällig zwischen 20-60°
- **Richtige Antwort**: `90 - α` (z.B. wenn α=30°, dann Antwort: `60`)
- **Erklärung**: "In einem rechtwinkligen Dreieck müssen die beiden spitzen Winkel zusammen 90° ergeben."

#### 6. Visuelle Winkel-Aufgabe (Index 1)
- **Typ**: `visualChoice`
- **Frage**: "Du lehnst an einer Wand. Welcher Winkel zeigt die richtige Neigung (spitz)?"
- **Optionen** (visuell, ohne Label):
  - Spitz (id: `a`, Winkel: 60°)
  - Recht (id: `b`, Winkel: 90°)
  - Stumpf (id: `c`, Winkel: 120°)
- **Richtige Antwort**: `a`
- **Erklärung**: "Ein spitzer Winkel ist kleiner als 90 Grad - perfekt zum Anlehnen!"

#### 7. Winkel-Messung
- **Typ**: `angleMeasure`
- **Frage**: "Messe den markierten Winkel im Dreieck. Bewege die Maus über die Figur!"
- **Mögliche Winkel**: 90°, 45°, 135°
- **Toleranz**: ±5°
- **Erklärung**: Variiert je nach Winkel (z.B. "Das ist ein rechter Winkel!" für 90°)

#### 8. Parallele Geraden klar im Text
- **Typ**: `input` mit drei Feldern
- **Frage**: "Zwei parallele Geraden, Querlinie schneidet sie. Ein Innenwinkel ist 128°. a) Nebenwinkel? b) Scheitelwinkel? c) Stufenwinkel?"
- **Antwortformat**: Drei Zahlenfelder (Grad, nur Zahl), Toleranz 0
- **Richtige Antwort**: 52°, 128°, 128°/52° je nach Lage
- **Erklärung**: Nebenwinkel ergänzen zu 180°. Scheitelwinkel entspricht dem gegebenen. Stufenwinkel entspricht dem gegebenen bzw. seinem Ergänzungswinkel.

### Bounty-Aufgaben (Update Dez 2025)

1. **Bounty A – Parallelen + Querlinie (Medium)**
   - Typ: `input` mit drei Zahlenfeldern.
   - Prompt: „Zwei parallele Geraden werden von einer Querlinie geschnitten. Ein Winkel beträgt 38°. a) Nebenwinkel? b) Scheitelwinkel? c) Ein Stufenwinkel?“
   - Validator: numerische Felder (142°, 38°, Stufenwinkel 38° oder 142°).

2. **Bounty B – Gleichschenkliges Dreieck (Medium)**
   - Typ: `input`
   - Prompt: „Gleichschenkliges Dreieck, Scheitelwinkel 40°. Wie groß ist ein Basiswinkel?“
   - Validator: numeric 70°.

3. **Special Bounty – Thales-Anwendung (Schwer)**
   - Typ: `input`
   - Prompt: „ΔABC auf einem Thaleskreis, ∠CAB = 20°. Bestimme ∠CBA.“
   - Validator: numeric 70°.

4. **Neu: Querlinie Klartext (Mittel)**
   - Typ: `input` mit drei Feldern
   - Prompt: „Parallele Schienen, Querbrücke, Innenwinkel 52°. a) Nebenwinkel? b) Stufenwinkel? c) Wechselwinkel?“
   - Validator: 128°, 52°, 52° (numerisch)

- **Entry Fee**: 48 Coins.
- **Einmalige Bounty-Auszahlung**: 320 Coins nach perfektem Durchlauf.

---

## Unit 3: Flächen & Terme (u3)

### Neue Aufgaben (Phase 3)

#### 8. Kreis-Umfang/Fläche
- **Typ**: `input`
- **Frage**: "Ein Kreis hat den Radius r=Xcm. Berechne den Umfang/Flächeninhalt (π≈3,14)."
- **Richtige Antwort**: Numerischer Wert in cm oder cm²
- **Erklärung**: Verwendet Formeln U = 2πr bzw. A = πr²

#### 9. Algebra-Geometrie
- **Typ**: `input`
- **Frage**: "Ein Rechteck/Dreieck hat Seitenlängen mit Variable x. Berechne die Fläche für x=X."
- **Richtige Antwort**: Numerischer Wert in cm²
- **Erklärung**: Terme mit Variablen, dann Einsetzen

---

## Unit 3: Flächen & Terme (u3)

### Quest-Aufgaben (Standard)

#### 1. Flächen-Aufgabe (Index 0) - Rechteck
- **Typ**: `input`
- **Frage**: "Eine Wandfläche ist [g]m breit und [h]m hoch (Rechteck). Wie viel Quadratmeter (m²) müssen gestaltet werden?"
- **g**: Zufällig 4-8m
- **h**: Zufällig 2-4m
- **Richtige Antwort**: `g * h` (z.B. wenn g=6, h=3, dann: `18`)
- **Erklärung**: "Fläche A = Breite * Höhe."

#### 2. Flächen-Aufgabe (Index 1) - Dreieck
- **Typ**: `input`
- **Frage**: "Ein Wimpel (Dreieck): Grundseite [g*5] cm, Höhe [h*5] cm. Fläche?"
- **g**: Zufällig 4-8
- **h**: Zufällig 2-4
- **Richtige Antwort**: `(g*5 * h*5) / 2` (z.B. wenn g=6, h=3: `(30 * 15) / 2 = 225`)
- **Erklärung**: "Dreieck: (g * h) / 2."

#### 3-5. Weitere Flächen-Aufgaben
- Variieren zwischen Rechteck- und Dreiecks-Aufgaben
- Gleiche Logik wie oben

#### 6. Flächen-Zerlegung
- **Typ**: `areaDecomposition`
- **Frage**: "Klicke auf alle Teilflächen, um die Gesamtfläche zu berechnen!"
- **Form**: L-förmige Figur
- **Teilflächen**:
  - Rechteck A: 80cm × 60cm = 4800 cm²
  - Rechteck B: 80cm × 30cm = 2400 cm²
- **Richtige Antwort**: `7200` (Gesamtfläche in cm²)
- **Erklärung**: "Die Gesamtfläche ist die Summe der Teilflächen: 4800 cm² + 2400 cm² = 7200 cm²."

#### 7. L-Form nur per Text
- **Typ**: `input`
- **Frage**: "Badezimmerboden als L-Form: Rechteck A 2,4 m × 1,6 m; Rechteck B 1,0 m × 1,6 m. Gesamtfläche?"
- **Richtige Antwort**: `5.44`
- **Antwortformat**: Zahl ohne Einheit, zwei Nachkommastellen
- **Erklärung**: "A=3,84 m², B=1,60 m², Summe 5,44 m²."

### Bounty-Aufgaben (Update Dez 2025)

1. **Bounty A – Garten-Gleichung (Medium)**
   - Typ: `input` mit zwei Feldern (Gleichung + Lösung).
   - Prompt: „Rechteckiger Garten: Länge = x+5, Breite = x, Fläche 300 m².“
   - Validator: Gleichung `x(x+5)=300` bzw. äquivalent + positive Lösung `x=15`.

2. **Bounty B – Rahmen-Term (Medium)**
   - Typ: `choice`
   - Prompt: „Bild 30×40 cm, Rahmenbreite x. Welcher Term beschreibt die Rahmenfläche?“
   - Richtige Option: `4x² + 140x`.

3. **Special Bounty – Gleich große Flächen (Schwer)**
   - Typ: `input`
   - Prompt: „Rechteck (x, x+10) vs. rechtwinkliges Dreieck (x+2, x+10). Finde x bei gleicher Fläche.“
   - Validator: numeric 2.

4. **Neu: Gartenbeet mit Gleichung (Schwer)**
   - Typ: `input` mit drei Feldern
   - Prompt: „Länge x+3, Breite x−1, Fläche 120 m². a) Gleichung, b) x (0,1-genau), c) Rahmen 0,5 m rundum (m²).“
   - Validator: Gleichung (x+3)(x-1)=120; x≈10,16; Rahmen≈23,8 (Toleranzen gesetzt)

- **Entry Fee**: 53 Coins.
- **Bounty Reward**: 350 Coins (einmalig).

---

## Unit 4: Körper & Oberflächen (u4)

### Neue Aufgaben (Phase 3)

#### 6. Netze
- **Typ**: `visualChoice`
- **Frage**: "Welches Netz gehört zu einem Würfel?"
- **Richtige Antwort**: Visuelle Auswahl des korrekten Netzes
- **Erklärung**: Ein Würfelnetz hat genau 6 Quadrate

#### 7. Zylinder Volumen/Oberfläche
- **Typ**: `input`
- **Frage**: "Ein Zylinder hat den Radius r=Xcm und die Höhe h=Ycm. Berechne das Volumen/die Oberfläche (π≈3,14)."
- **Richtige Antwort**: Numerischer Wert in cm³ oder cm²
- **Erklärung**: Verwendet Formeln V = πr²h bzw. O = 2πr² + 2πrh

#### 8. Zusammengesetzte Körper
- **Typ**: `input`
- **Frage**: "Ein zusammengesetzter Körper besteht aus einem Würfel und einem Quader. Berechne das Gesamtvolumen."
- **Richtige Antwort**: Numerischer Wert in cm³
- **Erklärung**: Volumen additiv berechnen

---

## Unit 4: Körper & Oberflächen (u4)

### Quest-Aufgaben (Standard)

#### 1-5. Volumen-Aufgaben
- **Typ**: `input`
- **Frage**: "Eine Box: [a]dm x [a]dm x [a]dm. Volumen in Liter?"
- **a**: Zufällig 3-6
- **Richtige Antwort**: `a * a * a` (z.B. wenn a=4, dann: `64`)
- **Erklärung**: "Volumen = a * a * a."

#### 6. Regenfass in Litern (Text)
- **Typ**: `input`
- **Frage**: "Zylinder mit r=0,35 m und h=0,9 m, π≈3,14. Volumen in Litern (gerundet)?"
- **Antwortformat**: Zahl ohne Einheit, Toleranz ±1
- **Richtige Antwort**: `346`
- **Erklärung**: "V ≈0,346 m³ → 346 L."

### Bounty-Aufgaben

#### Bounty 1 (aus taskFactory.ts)
- **Typ**: `input`
- **Frage**: "BOUNTY FRAGE: Ein Würfel hat eine Kantenlänge von 4 cm. Berechne das Volumen."
- **Richtige Antwort**: `64`
- **Erklärung**: "V = a * a * a = 4 * 4 * 4 = 64."

#### Bounty 2 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Quader hat die Maße 8 cm × 5 cm × 4 cm. a) Berechne das Volumen. b) Berechne die Oberfläche."
- **Richtige Antwort**: JSON-Objekt:
  - a: `160`
  - b: `184`
- **Erklärung**: "Volumen: 8 × 5 × 4 = 160 cm³. Oberfläche: 2×(8×5 + 8×4 + 5×4) = 2×(40+32+20) = 184 cm²"
- **Schwierigkeit**: Mittel

#### Bounty 3 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Zylinder hat den Radius r=3 cm und die Höhe h=10 cm (π≈3,14). a) Berechne das Volumen. b) Berechne die Oberfläche."
- **Richtige Antwort**: JSON-Objekt:
  - a: `282.6`
  - b: `245.04`
- **Erklärung**: "Volumen: π × r² × h = 3,14 × 9 × 10 = 282,6 cm³. Oberfläche: 2×π×r² + 2×π×r×h = 2×3,14×9 + 2×3,14×3×10 = 56,52 + 188,52 = 245,04 cm²"
- **Schwierigkeit**: Mittel

#### Bounty 4 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein zusammengesetzter Körper besteht aus einem Quader und einem Zylinder. a) Erkläre den Rechenweg für das Volumen. b) Erkläre, warum die Oberflächen nicht einfach addiert werden können."
- **Richtige Antwort**: JSON-Objekt:
  - a: `volumen quader + volumen zylinder`
  - b: `berührungsflächen werden doppelt gezählt`
- **Erklärung**: "Volumen: Einfach addieren. Oberfläche: Berührungsflächen müssen abgezogen werden, da sie nicht zur äußeren Oberfläche gehören."
- **Schwierigkeit**: Schwer

#### Bounty 5 (neu, textbasiert)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Quader 12×8×5 cm, oben Zylinder r=3 cm, h=5 cm, Kontaktfläche nicht sichtbar. a) Gesamtvolumen? b) sichtbare Oberfläche?"
- **Richtige Antwort**: Volumen ≈621,3 cm³ (±0,5); Oberfläche ≈486,2 cm² (±1)
- **Erklärung**: "V: 480 + π·3²·5 ≈ 621,3. O: Quader 392 − Kreis 28,3 + Zylinder-Mantel 94,2 + Kreis oben 28,3 ≈ 486,2."

---

## Unit 5: Ähnlichkeit (u5)

### Neue Aufgaben (Phase 3)

#### 9. Ähnliche Dreiecke
- **Typ**: `input`
- **Frage**: "Zwei ähnliche Dreiecke: Das erste hat die Seiten a=Xcm, b=Ycm. Das zweite ist k-mal so groß. Wie lang ist Seite c im zweiten Dreieck?"
- **Richtige Antwort**: Numerischer Wert in cm
- **Erklärung**: Bei Ähnlichkeit werden alle Seiten mit dem gleichen Faktor k gestreckt

#### 10. Strahlensatz
- **Typ**: `input`
- **Frage**: "Ein Mensch (Xcm) wirft einen Schatten von Ycm. Ein Turm wirft einen Schatten von Zcm. Wie hoch ist der Turm?"
- **Richtige Antwort**: Numerischer Wert in cm
- **Erklärung**: Anwendung des Strahlensatzes: h₁/s₁ = h₂/s₂

---

## Unit 5: Ähnlichkeit (u5)

### Quest-Aufgaben (Standard)

#### 1. Visuelle Ähnlichkeit (Index 0)
- **Typ**: `visualChoice`
- **Frage**: "Welches Dreieck ist eine echte Vergrößerung (ähnlich) zum Referenz-Dreieck?"
- **Optionen** (visuell, ohne Label):
  - Referenz-Dreieck (id: `ref`)
  - Nur in X-Richtung gestreckt (id: `wrong`)
  - Proportional vergrößert (id: `correct`)
- **Richtige Antwort**: `correct`
- **Erklärung**: "Bei Ähnlichkeit müssen ALLE Seiten mit dem gleichen Faktor k gestreckt werden. Figur A wurde nur breiter gemacht, Figur B ist proportional vergrößert."

#### 2. Visuelle Ähnlichkeit (Index 1)
- **Typ**: `visualChoice`
- **Frage**: "Das Quadrat wurde mit Faktor k=0.5 verkleinert. Welches Bild stimmt?"
- **Optionen** (visuell, ohne Label):
  - Start-Quadrat (id: `ref`)
  - Halbe Größe (Quadrat) (id: `correct`)
  - Dünnes Rechteck (id: `wrong`)
- **Richtige Antwort**: `correct`
- **Erklärung**: "k=0.5 bedeutet, jede Seite ist nur noch halb so lang. Aus einem Quadrat wird wieder ein Quadrat, nur kleiner."

#### 3. Skalierungs-Logik (Index 0)
- **Typ**: `choice`
- **Frage**: "Du verdoppelst die Seitenlänge eines Quadrats (k=2). Was passiert mit der Fläche?"
- **Optionen**:
  - "Sie verdoppelt sich (x2)"
  - "Sie vervierfacht sich (x4)"
  - "Sie bleibt gleich"
  - "Sie wird 8-mal so groß"
- **Richtige Antwort**: 1
- **Erklärung**: "Die Fläche wächst im Quadrat: k² = 2² = 4. Es passen also 4 kleine Quadrate in das große."

#### 4. Skalierungs-Logik (Index 1)
- **Typ**: `choice`
- **Frage**: "Ein Würfel wird verdreifacht (k=3). Wie verändert sich das Volumen?"
- **Optionen**:
  - "x3"
  - "x9"
  - "x27"
  - "x6"
- **Richtige Antwort**: 2
- **Erklärung**: "Das Volumen wächst hoch drei: k³ = 3³ = 3 * 3 * 3 = 27."

#### 5. Skalierungs-Logik (Index 2)
- **Typ**: `choice`
- **Frage**: "Ein Modellauto hat den Maßstab 1:10. Das echte Auto ist 4 Meter lang. Wie lang ist das Modell?"
- **Optionen**:
  - "4 cm"
  - "40 cm"
  - "10 cm"
  - "1 Meter"
- **Richtige Antwort**: 1
- **Erklärung**: "4 Meter = 400 cm. Geteilt durch 10 sind das 40 cm."

#### 6. Skalierungs-Logik (Index 3)
- **Typ**: `choice`
- **Frage**: "Zwei Figuren sind ähnlich, wenn..."
- **Optionen**:
  - "sie die gleiche Farbe haben."
  - "sie gleich groß sind."
  - "ihre Winkel gleich sind und Seitenverhältnisse stimmen."
  - "sie beide Vierecke sind."
- **Richtige Antwort**: 2
- **Erklärung**: "Ähnlichkeit bedeutet: Gleiche Form (Winkel), aber unterschiedliche Größe (skaliert)."

#### 7. Transformations-Aufgabe
- **Typ**: `input`
- **Frage**: "Zoom 200% (k=2). Länge war 10cm. Neu?"
- **Richtige Antwort**: `20`
- **Erklärung**: "Länge * k."

#### 8. Slider-Transformation
- **Typ**: `sliderTransform`
- **Frage**: Variiert zwischen:
  - "Verwende den Slider, um das Quadrat mit Faktor k=2 zu vergrößern!"
  - "Strecke das Dreieck mit Faktor k=1.5!"
- **Slider-Bereich**: 0.5 - 3.0
- **Richtige k-Werte**: 2.0 oder 1.5
- **Toleranz**: ±0.1
- **Erklärung**: Variiert je nach Aufgabe

#### 9. Maßstab doppelt prüfen (m und km)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Maßstab 1:25 000, Kartenstrecke 3,2 cm. a) Meter? b) Kilometer?"
- **Antwortformat**: Zwei Zahlenfelder, erst Meter, dann Kilometer
- **Richtige Antwort**: 800 m; 0,8 km
- **Erklärung**: "3,2 cm · 25 000 = 80 000 cm = 800 m = 0,8 km."

### Bounty-Aufgaben

#### Bounty 1 (aus taskFactory.ts)
- **Typ**: `input`
- **Frage**: "BOUNTY FRAGE: Eine Landkarte hat den Maßstab 1:25.000. Du misst eine Strecke von 4 cm auf der Karte. Wie viele KILOMETER sind das in der Realität?"
- **Richtige Antwort**: `1`
- **Erklärung**: "4 cm * 25.000 = 100.000 cm. 100.000 cm = 1.000 m = 1 km."

#### Bounty 2 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Modellauto ist im Maßstab 1:20 gebaut. Das echte Auto ist 4,2 m lang. a) Wie lang ist das Modellauto? b) Begründe deine Rechnung."
- **Richtige Antwort**: JSON-Objekt:
  - a: `21`
  - b: `4.2 m geteilt durch 20`
- **Erklärung**: "Modelllänge = 4,2 m ÷ 20 = 0,21 m = 21 cm"
- **Schwierigkeit**: Mittel

#### Bounty 3 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Zwei ähnliche Dreiecke haben Seiten, die beim zweiten Dreieck doppelt so lang sind wie beim ersten. a) Wie verhält sich die Fläche? b) Begründe deine Antwort."
- **Richtige Antwort**: JSON-Objekt:
  - a: `4`
  - b: `flächen ändern sich mit dem quadrat`
- **Erklärung**: "Wenn Seiten doppelt so lang → Fläche wird 2² = 4× so groß!"
- **Schwierigkeit**: Mittel

#### Bounty 4 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Mensch (1,80 m) wirft einen Schatten von 2,4 m. Ein Turm wirft einen Schatten von 12 m. a) Wie hoch ist der Turm? b) Erkläre deinen Rechenweg."
- **Richtige Antwort**: JSON-Objekt:
  - a: `9`
  - b: `strahlensatz oder dreisatz`
- **Erklärung**: "Verhältnis: 1,80 m / 2,4 m = Turmhöhe / 12 m → Turmhöhe = 9 m"
- **Schwierigkeit**: Schwer

#### Bounty 5 (neu)
- **Typ**: `input` mit drei Feldern
- **Frage**: "Foto 30×20 cm → Poster, lange Seite 90 cm. a) k? b) kurze Seite? c) Flächenfaktor?"
- **Richtige Antwort**: k=3; 60 cm; 9
- **Erklärung**: "k = 90/30 = 3. Neue kurze Seite: 20·3 = 60. Fläche skaliert mit k² → 9."

---

## Unit 6: Kontext & Anwendung (u6)

### Quest-Aufgaben (Standard)

#### 1. Kontext-Aufgabe (Index 0) - Zeitreise 1972
- **Typ**: `choice`
- **Frage**: "Zeitreise in den Matheunterricht 1972: An der Tafel steht 'y = x + 2', aber der Lehrer wirft plötzlich seinen Schlüsselbund durch die Klasse. Die Flugbahn ist eine Parabel. Was beschreibt der Scheitelpunkt?"
- **Optionen**:
  - "Den Abwurfpunkt."
  - "Den höchsten Punkt der Flugbahn."
  - "Den Aufprallpunkt."
  - "Die Geschwindigkeit."
- **Richtige Antwort**: 1
- **Erklärung**: "Egal ob 1972 oder heute: Der Scheitelpunkt einer Wurfparabel ist immer das Maximum (der höchste Punkt)."

#### 2. Kontext-Aufgabe (Index 1) - Flugkurve
- **Typ**: `input`
- **Frage**: "Ein Ball fliegt in einer Kurve: Höhe y = -x² + 4x. Wie hoch ist der Ball bei einer Entfernung von x=2 Metern? (Rechne: -2² + 4*2)"
- **Richtige Antwort**: `4`
- **Erklärung**: "Einsetzen: -2² ergibt -4. 4 mal 2 ist 8. Addiert (-4 + 8) ergibt das 4 Meter Höhe."

#### 3. Kontext-Aufgabe (Index 2) - Instagram Reel / Drohne
- **Typ**: `input`
- **Frage**: "Für ein Insta-Reel fliegt deine Drohne erst 30m geradeaus, dann exakt 40m im rechten Winkel nach oben für den 'Dramatic Zoom'. Wie weit ist sie Luftlinie vom Start entfernt?"
- **Richtige Antwort**: `50`
- **Erklärung**: "Satz des Pythagoras (3-4-5 Dreieck): 30² + 40² = 900 + 1600 = 2500. Die Wurzel daraus ist 50."

#### 4. Kontext-Aufgabe (Index 3) - Sneaker Reselling
- **Typ**: `choice`
- **Frage**: "Du kaufst limitierte Sneaker für 200€. Der Sammlerwert steigt linear um 20€ pro Monat. Wie lautet die Funktionsgleichung?"
- **Optionen**:
  - "y = 200x + 20"
  - "y = 20x + 200"
  - "y = x² + 200"
  - "y = 200 - 20x"
- **Richtige Antwort**: 1
- **Erklärung**: "Startwert 200 (y-Achsenabschnitt), Anstieg 20 (pro Monat x). Also y = 20x + 200."

#### 5. Kontext-Aufgabe (Index 4) - Handy Display
- **Typ**: `choice`
- **Frage**: "Ein Smartphone-Display hat ein 18:9 Format (Verhältnis Höhe zu Breite). Wenn es 7cm breit ist, wie hoch ist es dann?"
- **Optionen**:
  - "14 cm"
  - "18 cm"
  - "9 cm"
  - "21 cm"
- **Richtige Antwort**: 0
- **Erklärung**: "Das Verhältnis 18 zu 9 lässt sich kürzen auf 2 zu 1. Die Höhe ist also doppelt so groß wie die Breite. 7 * 2 = 14."

#### 6. Drohnenflug im Park (Pythagoras)
- **Typ**: `input`
- **Frage**: "Start A, 120 m nach Osten zu B, dann 50 m nach Norden zu C (rechter Winkel bei B). Wie lang ist AC?"
- **Antwortformat**: Eine ganze Zahl, ohne Einheit
- **Richtige Antwort**: 130
- **Erklärung**: "AC = √(120² + 50²) = √16900 = 130."

### Bounty-Aufgaben

#### Bounty 1 (aus taskFactory.ts)
- **Typ**: `input`
- **Frage**: "BOUNTY FRAGE: Ein rechtwinkliges Dreieck hat die Katheten a=6cm und b=8cm. Berechne die Hypotenuse c."
- **Richtige Antwort**: `10`
- **Erklärung**: "Satz des Pythagoras: a² + b² = c². 36 + 64 = 100. Wurzel aus 100 ist 10."

#### Bounty 2 (neu)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "L(-2|1) zu K(7|9), 1 Einheit = 100 m. a) Luftlinie in km (auf 0,1 runden) b) Steigung m = Δy/Δx (1 Nachkommastelle)"
- **Richtige Antwort**: 1,2 km; 0,9
- **Erklärung**: "Δx=9, Δy=8 → Distanz √145 ≈12,0 → 1,2 km. Steigung 8/9 ≈0,9."

---

## Hinweise zur Verwendung

### Task-Typen

- **`choice`**: Multiple-Choice mit Text-Optionen
- **`boolean`**: Ja/Nein oder Wahr/Falsch
- **`input`**: Freitext-Eingabe (Zahlen oder Text)
- **`shorttext`**: Kurze Texteingabe
- **`visualChoice`**: Visuelle Auswahl (SVG-Formen ohne Labels)
- **`wager`**: Wette-Aufgabe mit Coin-Einsatz
- **`dragDrop`**: Drag-and-Drop Klassifikation
- **`angleMeasure`**: Winkel-Messung mit Toleranz ±5°
- **`sliderTransform`**: Transformation mit Slider (Toleranz ±0.1)
- **`areaDecomposition`**: Flächen-Zerlegung mit Teilflächen
- **`multiAngleThrow`**: Multi-Angle Wurf-Training

### Validierung

- **Input-Aufgaben**: Akzeptieren mehrere Antworten (komma-separiert), Groß-/Kleinschreibung wird ignoriert, Leerzeichen werden entfernt
- **Winkel-Messung**: Toleranz ±5°
- **Slider-Transformation**: Toleranz ±0.1
- **Flächen-Zerlegung**: Toleranz ±1 cm²

### Zufällige Werte

Viele Aufgaben verwenden zufällige Werte (z.B. `getRandomInt(4, 8)`). Die hier angegebenen Werte sind Beispiele. Die tatsächlichen Werte variieren bei jedem Aufruf.

### Bounty-Aufgaben

Bounty-Aufgaben kommen aus zwei Quellen:
1. **taskFactory.ts** (`createBountyTask`): Einfache Bounty-Aufgaben
2. **segments.ts**: Detaillierte Bounty-Aufgaben mit mehreren Teilaufgaben (JSON-Format)

Die Bounty-Aufgaben aus `segments.ts` haben eine höhere Komplexität und erfordern strukturierte Antworten im JSON-Format.

---

**Stand**: Aktueller Projektstand (Dezember 2024)
**Letzte Aktualisierung**: Nach Fix der visuellen Auswahloptionen (Labels entfernt)

