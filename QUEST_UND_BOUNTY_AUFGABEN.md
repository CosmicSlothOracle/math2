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

#### 5. Form-Aufgabe (Index 2) - Smartphone
- **Typ**: `choice`
- **Frage**: "Welche geometrische Form hat ein typisches Smartphone-Display?"
- **Optionen**:
  - "Raute"
  - "Rechteck"
  - "Trapez"
  - "Drachenviereck"
- **Richtige Antwort**: 1
- **Erklärung**: "Displays sind Rechtecke. Sie haben vier rechte Winkel."

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

#### 8. Visuelle Form-Aufgabe (Index 3) - Smartphone-Display
- **Typ**: `visualChoice`
- **Frage**: "Welche Form hat ein typisches Smartphone-Display?"
- **Optionen** (visuell, ohne Label):
  - Quadrat (id: `square`)
  - Rechteck (id: `rect`)
  - Raute (id: `rhombus`)
- **Richtige Antwort**: `rect`
- **Erklärung**: "Smartphone-Displays sind Rechtecke mit vier rechten Winkeln."

#### 9. Drag-and-Drop Klassifikation
- **Typ**: `dragDrop`
- **Frage**: "Ordne die Figuren in das 'Haus der Vierecke' ein. Ziehe jede Figur in die richtige Kategorie!"
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

### Bounty-Aufgaben

#### Bounty 1 (aus taskFactory.ts)
- **Typ**: `choice`
- **Frage**: "BOUNTY FRAGE: Welche Aussage ist mathematisch präzise?"
- **Optionen**:
  - "Jedes Rechteck ist ein Quadrat."
  - "Ein Drachenviereck hat immer 4 rechte Winkel."
  - "Jedes Quadrat ist eine Raute und ein Rechteck zugleich."
  - "Ein Trapez hat niemals rechte Winkel."
- **Richtige Antwort**: 2
- **Erklärung**: "Das Quadrat ist die 'perfekte' Form: Es erfüllt die Definition der Raute (4 gleiche Seiten) UND des Rechtecks (4 rechte Winkel)."

#### Bounty 2 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Viereck hat parallele Gegenseiten und gleich lange Seiten. a) Welcher Figurenklasse gehört es an? b) Begründe deine Antwort. c) Nenne eine Eigenschaft, die nicht zwingend gilt."
- **Richtige Antwort**: JSON-Objekt:
  - a: `quadrat`
  - b: `parallele gegenseiten und gleich lange seiten`
  - c: `rechte winkel`
- **Erklärung**: "Es könnte ein Quadrat oder eine Raute sein. Rechte Winkel sind nicht zwingend."
- **Schwierigkeit**: Mittel

#### Bounty 3 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Die Aussage 'Jedes Rechteck ist ein Quadrat' ist: a) richtig oder falsch? b) Begründe. c) Formuliere die korrekte Aussage."
- **Richtige Antwort**: JSON-Objekt:
  - a: `falsch`
  - b: `nicht jedes rechteck hat gleich lange seiten`
  - c: `jedes quadrat ist ein rechteck`
- **Erklärung**: "Falsch! Nicht jedes Rechteck ist ein Quadrat, aber jedes Quadrat ist ein Rechteck."
- **Schwierigkeit**: Schwer

#### Bounty 4 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ordne die Begriffe logisch: Viereck – Parallelogramm – Rechteck – Quadrat. a) Nenne die richtige Reihenfolge. b) Begründe die Ordnung."
- **Richtige Antwort**: JSON-Objekt:
  - a: `viereck parallelogramm rechteck quadrat`
  - b: `jede form ist spezialisierung der vorherigen`
- **Erklärung**: "Viereck → Parallelogramm (parallele Gegenseiten) → Rechteck (rechte Winkel) → Quadrat (gleich lange Seiten)."
- **Schwierigkeit**: Schwer

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

### Bounty-Aufgaben

#### Bounty 1 (aus taskFactory.ts)
- **Typ**: `input`
- **Frage**: "BOUNTY FRAGE: In einem rechtwinkligen Dreieck ist Winkel Alpha = 35°. Wie groß ist Winkel Beta, wenn Gamma der rechte Winkel (90°) ist?"
- **Richtige Antwort**: `55`
- **Erklärung**: "Winkelsumme im Dreieck ist 180°. 180° - 90° - 35° = 55°."

#### Bounty 2 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Zwei parallele Geraden werden von einer Querlinie geschnitten. Ein Winkel beträgt 38°. a) Bestimme alle weiteren Winkel. b) Begründe deine Antwort mit den Winkelbeziehungen."
- **Richtige Antwort**: JSON-Objekt:
  - a: `142 38 142`
  - b: `nebenwinkel scheitelwinkel stufenwinkel`
- **Erklärung**: "Nebenwinkel: 180° - 38° = 142°, Scheitelwinkel: 38°, Stufenwinkel: 38° und 142°"
- **Schwierigkeit**: Mittel

#### Bounty 3 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Dreieck hat die Winkel 47° und 63°. a) Berechne den dritten Winkel. b) Begründe deine Antwort."
- **Richtige Antwort**: JSON-Objekt:
  - a: `70`
  - b: `winkelsumme dreieck 180`
- **Erklärung**: "Winkelsumme im Dreieck: 180° - 47° - 63° = 70°"
- **Schwierigkeit**: Mittel

#### Bounty 4 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Dreieck hat die Winkel 61°, 59° und 59°. a) Prüfe, ob diese Winkelwerte möglich sind. b) Begründe deine Antwort."
- **Richtige Antwort**: JSON-Objekt:
  - a: `nein`
  - b: `summe 179 nicht 180`
- **Erklärung**: "Summe: 61° + 59° + 59° = 179° ≠ 180°. Die Winkelsumme im Dreieck muss genau 180° betragen."
- **Schwierigkeit**: Schwer

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

### Bounty-Aufgaben

#### Bounty 1 (aus taskFactory.ts)
- **Typ**: `input`
- **Frage**: "BOUNTY FRAGE: Ein Rechteck hat den Flächeninhalt A = [a*8] cm². Die Seite a ist [a] cm lang. Wie lang ist Seite b?"
- **a**: Zufällig 5-9
- **Richtige Antwort**: `8`
- **Erklärung**: "Formel A = a * b. Umgestellt nach b: b = A / a."

#### Bounty 2 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Rechteck hat die Seitenlängen (x+2) und (x−1). a) Stelle den Term für die Fläche auf. b) Vereinfache den Term. c) Berechne die Fläche für x=6."
- **Richtige Antwort**: JSON-Objekt:
  - a: `(x+2)*(x-1)`
  - b: `x²+x-2`
  - c: `40`
- **Erklärung**: "Term: (x+2)(x-1) = x² + x - 2. Für x=6: 36 + 6 - 2 = 40 cm²"
- **Schwierigkeit**: Mittel

#### Bounty 3 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Ein Dreieck hat die Grundseite 12 cm und die Höhe h. a) Stelle den Term für die Fläche auf. b) Berechne die Fläche für h=7 cm."
- **Richtige Antwort**: JSON-Objekt:
  - a: `0.5*12*h`
  - b: `42`
- **Erklärung**: "Term: A = 0.5 * 12 * h = 6h. Für h=7: 6 * 7 = 42 cm²"
- **Schwierigkeit**: Mittel

#### Bounty 4 (aus segments.ts)
- **Typ**: `input`
- **Frage**: "Eine Figur besteht aus einem Quadrat mit Seitenlänge a und einem Rechteck mit Seiten a und 3a. a) Stelle den Term für die Gesamtfläche auf. b) Vereinfache den Term."
- **Richtige Antwort**: JSON-Objekt:
  - a: `a² + a*3a`
  - b: `4a²`
- **Erklärung**: "Quadrat: a², Rechteck: a * 3a = 3a². Gesamt: a² + 3a² = 4a²"
- **Schwierigkeit**: Schwer

---

## Unit 4: Körper & Oberflächen (u4)

### Quest-Aufgaben (Standard)

#### 1-5. Volumen-Aufgaben
- **Typ**: `input`
- **Frage**: "Eine Box: [a]dm x [a]dm x [a]dm. Volumen in Liter?"
- **a**: Zufällig 3-6
- **Richtige Antwort**: `a * a * a` (z.B. wenn a=4, dann: `64`)
- **Erklärung**: "Volumen = a * a * a."

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

### Bounty-Aufgaben

#### Bounty 1 (aus taskFactory.ts)
- **Typ**: `input`
- **Frage**: "BOUNTY FRAGE: Ein rechtwinkliges Dreieck hat die Katheten a=6cm und b=8cm. Berechne die Hypotenuse c."
- **Richtige Antwort**: `10`
- **Erklärung**: "Satz des Pythagoras: a² + b² = c². 36 + 64 = 100. Wurzel aus 100 ist 10."

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

