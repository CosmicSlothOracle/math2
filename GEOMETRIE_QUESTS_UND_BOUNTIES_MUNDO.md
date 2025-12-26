# Geometrie Quest- und Bounty-Aufgaben basierend auf MUNDO-Inhalten

**Quelle:** MUNDO Geometrie-Inhalte für Klasse 9/10
**Erstellt:** 26.12.2025
**Ziel:** Erweiterung der bestehenden Quest- und Bounty-Struktur um Inhalte aus MUNDO

---

## Übersicht

Diese Datei enthält neue Quest- und Bounty-Aufgaben, die auf den gefundenen MUNDO-Inhalten basieren. Die Aufgaben sind nach Themenbereichen organisiert und können in die bestehenden Units integriert oder als neue Units hinzugefügt werden.

---

## Neue Themenbereiche für Erweiterungen

### Trigonometrie (Erweiterung von u2/u6)
### Satz des Pythagoras (Erweiterung von u6)
### Körpergeometrie (Erweiterung von u4)
### Strahlensätze (Erweiterung von u5)
### Kongruente Dreiecke (Erweiterung von u2/u5)
### Vielecke (Erweiterung von u1/u3)

---

## TRIGONOMETRIE - Neue Quest-Aufgaben

### Quest 1: Sinus am rechtwinkligen Dreieck
- **Typ**: `input`
- **Frage**: "Rechtwinkliges Dreieck: Gegenkathete = [a] cm, Hypotenuse = [c] cm. Berechne sin(α) (auf 2 Dezimalstellen gerundet)."
- **Variablen**: a = 6-12, c = 10-20
- **Richtige Antwort**: `(a/c).toFixed(2)`
- **Erklärung**: "Sinus = Gegenkathete / Hypotenuse"
- **Schwierigkeit**: Mittel
- **Unit**: u2 oder neue Unit u7

### Quest 2: Cosinus am rechtwinkligen Dreieck
- **Typ**: `input`
- **Frage**: "Rechtwinkliges Dreieck: Ankathete = [b] cm, Hypotenuse = [c] cm. Berechne cos(β) (auf 2 Dezimalstellen gerundet)."
- **Variablen**: b = 8-15, c = 10-20
- **Richtige Antwort**: `(b/c).toFixed(2)`
- **Erklärung**: "Cosinus = Ankathete / Hypotenuse"
- **Schwierigkeit**: Mittel
- **Unit**: u2 oder neue Unit u7

### Quest 3: Tangens am rechtwinkligen Dreieck
- **Typ**: `input`
- **Frage**: "Rechtwinkliges Dreieck: Gegenkathete = [a] cm, Ankathete = [b] cm. Berechne tan(α) (auf 2 Dezimalstellen gerundet)."
- **Variablen**: a = 5-10, b = 8-15
- **Richtige Antwort**: `(a/b).toFixed(2)`
- **Erklärung**: "Tangens = Gegenkathete / Ankathete"
- **Schwierigkeit**: Mittel
- **Unit**: u2 oder neue Unit u7

### Quest 4: Winkel aus Sinus bestimmen
- **Typ**: `choice`
- **Frage**: "In einem rechtwinkligen Dreieck ist sin(α) = 0,5. Wie groß ist der Winkel α?"
- **Optionen**: ["30°", "45°", "60°", "90°"]
- **Richtige Antwort**: 0
- **Erklärung**: "sin(30°) = 0,5. Das ist ein wichtiger Wert aus der Trigonometrie."
- **Schwierigkeit**: Mittel
- **Unit**: u2 oder neue Unit u7

### Quest 5: Höhe mit Trigonometrie berechnen
- **Typ**: `input`
- **Frage**: "Ein Turm wirft einen Schatten von [s] m. Die Sonne steht in einem Winkel von [α]° über dem Horizont. Wie hoch ist der Turm? (tan([α]°) ≈ [tanValue])"
- **Variablen**: s = 10-30, α = 30/45/60, tanValue entsprechend
- **Richtige Antwort**: `(s * tanValue).toFixed(1)`
- **Erklärung**: "Höhe = Schattenlänge × tan(Winkel)"
- **Schwierigkeit**: Schwer
- **Unit**: u6 oder neue Unit u7

---

## TRIGONOMETRIE - Neue Bounty-Aufgaben

### Bounty 1: Trigonometrie am Einheitskreis (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Einheitskreis: Punkt P liegt bei Winkel α = [α]°.\n a) sin(α) (auf 3 Dezimalstellen)?\n b) cos(α) (auf 3 Dezimalstellen)?"
- **Variablen**: α = 30/45/60/90/120/135/150
- **Richtige Antwort**:
  - a: sin-Wert (z.B. 0,500 für 30°)
  - b: cos-Wert (z.B. 0,866 für 30°)
- **Erklärung**: "Am Einheitskreis entspricht die y-Koordinate dem Sinus, die x-Koordinate dem Cosinus."
- **Schwierigkeit**: Schwer
- **Unit**: Neue Unit u7 (Trigonometrie)

### Bounty 2: Anwendungsaufgabe Trigonometrie (Schwer)
- **Typ**: `input` mit drei Feldern
- **Frage**: "Leiter lehnt an Wand: Länge [l] m, Winkel zur Wand [α]°.\n a) Wie hoch reicht die Leiter? (sin([α]°) ≈ [sinValue])\n b) Wie weit steht der Fuß von der Wand? (cos([α]°) ≈ [cosValue])\n c) Prüfe mit Pythagoras!"
- **Variablen**: l = 5-10, α = 30/45/60
- **Richtige Antwort**:
  - a: `(l * sinValue).toFixed(2)`
  - b: `(l * cosValue).toFixed(2)`
  - c: `(Math.sqrt(Math.pow(l * sinValue, 2) + Math.pow(l * cosValue, 2)).toFixed(2))`
- **Erklärung**: "Höhe = l × sin(α), Abstand = l × cos(α). Pythagoras: h² + a² = l²"
- **Schwierigkeit**: Schwer
- **Unit**: Neue Unit u7 (Trigonometrie)

### Bounty 3: Winkelfunktionen kombinieren (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Rechtwinkliges Dreieck: sin(α) = [sinVal], cos(α) = [cosVal].\n a) Berechne tan(α) = sin(α)/cos(α) (auf 2 Dezimalstellen).\n b) Bestimme den Winkel α (auf ganze Grad gerundet)."
- **Variablen**: sinVal = 0,5/0,707/0,866, cosVal entsprechend
- **Richtige Antwort**:
  - a: `(sinVal/cosVal).toFixed(2)`
  - b: Winkel (30/45/60)
- **Erklärung**: "tan(α) = sin(α)/cos(α). Mit bekannten Werten kann man den Winkel bestimmen."
- **Schwierigkeit**: Schwer
- **Unit**: Neue Unit u7 (Trigonometrie)

---

## SATZ DES PYTHAGORAS - Erweiterte Quest-Aufgaben

### Quest 6: Kathete berechnen
- **Typ**: `input`
- **Frage**: "Rechtwinkliges Dreieck: Hypotenuse c = [c] cm, Kathete a = [a] cm. Berechne die andere Kathete b (auf ganze cm gerundet)."
- **Variablen**: c = 10-20, a = 6-12
- **Richtige Antwort**: `Math.round(Math.sqrt(c*c - a*a))`
- **Erklärung**: "b = √(c² - a²) nach Pythagoras umgestellt."
- **Schwierigkeit**: Mittel
- **Unit**: u6

### Quest 7: Höhensatz
- **Typ**: `input`
- **Frage**: "Rechtwinkliges Dreieck: Hypotenusenabschnitte p = [p] cm, q = [q] cm. Berechne die Höhe h auf die Hypotenuse (auf 1 Dezimalstelle gerundet)."
- **Variablen**: p = 4-9, q = 6-12
- **Richtige Antwort**: `Math.sqrt(p * q).toFixed(1)`
- **Erklärung**: "Höhensatz: h² = p × q"
- **Schwierigkeit**: Schwer
- **Unit**: u6

### Quest 8: Kathetensatz
- **Typ**: `input`
- **Frage**: "Rechtwinkliges Dreieck: Hypotenuse c = [c] cm, Hypotenusenabschnitt p = [p] cm. Berechne Kathete a (auf 1 Dezimalstelle gerundet)."
- **Variablen**: c = 10-20, p = 3-8
- **Richtige Antwort**: `Math.sqrt(p * c).toFixed(1)`
- **Erklärung**: "Kathetensatz: a² = p × c"
- **Schwierigkeit**: Schwer
- **Unit**: u6

---

## SATZ DES PYTHAGORAS - Erweiterte Bounty-Aufgaben

### Bounty 4: Satzgruppe des Pythagoras (Schwer)
- **Typ**: `input` mit drei Feldern
- **Frage**: "Rechtwinkliges Dreieck: Hypotenuse c = [c] cm, Hypotenusenabschnitte p = [p] cm, q = [q] cm.\n a) Höhe h (Höhensatz)?\n b) Kathete a (Kathetensatz)?\n c) Kathete b (Kathetensatz)?"
- **Variablen**: c = 13-17, p = 4-7, q = c-p
- **Richtige Antwort**:
  - a: `Math.sqrt(p * q).toFixed(2)`
  - b: `Math.sqrt(p * c).toFixed(2)`
  - c: `Math.sqrt(q * c).toFixed(2)`
- **Erklärung**: "Höhensatz: h² = p×q. Kathetensatz: a² = p×c, b² = q×c"
- **Schwierigkeit**: Schwer
- **Unit**: u6

### Bounty 5: Anwendungsaufgabe Pythagoras (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Dachfläche berechnen: Hausbreite [b] m, Firsthöhe [h] m über Traufe, Dachlänge [l] m.\n a) Länge einer Dachseite (auf 0,1 m gerundet)?\n b) Gesamte Dachfläche beider Seiten (auf ganze m² gerundet)?"
- **Variablen**: b = 8-12, h = 2-4, l = 10-15
- **Richtige Antwort**:
  - a: `(Math.sqrt((b/2)*(b/2) + h*h)).toFixed(1)`
  - b: `Math.round(2 * Math.sqrt((b/2)*(b/2) + h*h) * l)`
- **Erklärung**: "Dachseite = √((b/2)² + h²). Gesamtfläche = 2 × Dachseite × Länge"
- **Schwierigkeit**: Schwer
- **Unit**: u6

---

## KÖRPERGEOMETRIE - Erweiterte Quest-Aufgaben

### Quest 9: Pyramide Volumen
- **Typ**: `input`
- **Frage**: "Quadratische Pyramide: Grundkante a = [a] cm, Höhe h = [h] cm. Volumen? (auf ganze cm³ gerundet)"
- **Variablen**: a = 6-12, h = 8-15
- **Richtige Antwort**: `Math.round((a*a*h)/3)`
- **Erklärung**: "V = (Grundfläche × Höhe) / 3 = (a² × h) / 3"
- **Schwierigkeit**: Mittel
- **Unit**: u4

### Quest 10: Kegel Volumen
- **Typ**: `input`
- **Frage**: "Kegel: Radius r = [r] cm, Höhe h = [h] cm. Volumen? (π≈3,14, auf ganze cm³ gerundet)"
- **Variablen**: r = 3-8, h = 6-12
- **Richtige Antwort**: `Math.round(3.14 * r * r * h / 3)`
- **Erklärung**: "V = (π × r² × h) / 3"
- **Schwierigkeit**: Mittel
- **Unit**: u4

### Quest 11: Kegel Oberfläche
- **Typ**: `input`
- **Frage**: "Kegel: Radius r = [r] cm, Mantellinie s = [s] cm. Oberfläche? (π≈3,14, auf ganze cm² gerundet)"
- **Variablen**: r = 4-8, s = 8-15
- **Richtige Antwort**: `Math.round(3.14 * r * r + 3.14 * r * s)`
- **Erklärung**: "O = Grundfläche + Mantelfläche = πr² + πrs"
- **Schwierigkeit**: Mittel
- **Unit**: u4

### Quest 12: Kugel Volumen
- **Typ**: `input`
- **Frage**: "Kugel: Radius r = [r] cm. Volumen? (π≈3,14, auf ganze cm³ gerundet)"
- **Variablen**: r = 5-10
- **Richtige Antwort**: `Math.round(4/3 * 3.14 * r * r * r)`
- **Erklärung**: "V = (4/3) × π × r³"
- **Schwierigkeit**: Mittel
- **Unit**: u4

### Quest 13: Kugel Oberfläche
- **Typ**: `input`
- **Frage**: "Kugel: Radius r = [r] cm. Oberfläche? (π≈3,14, auf ganze cm² gerundet)"
- **Variablen**: r = 5-10
- **Richtige Antwort**: `Math.round(4 * 3.14 * r * r)`
- **Erklärung**: "O = 4 × π × r²"
- **Schwierigkeit**: Mittel
- **Unit**: u4

---

## KÖRPERGEOMETRIE - Erweiterte Bounty-Aufgaben

### Bounty 6: Zusammengesetzter Körper (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Körper: Quader (10×8×6 cm) + Pyramide oben (Grundfläche 10×8 cm, Höhe 4 cm).\n a) Gesamtvolumen (cm³)?\n b) Gesamtoberfläche ohne Kontaktfläche (cm², auf ganze Zahl)?"
- **Richtige Antwort**:
  - a: `480 + (10*8*4/3) = 586.67 ≈ 587`
  - b: `376 + (Pyramidenmantel) ≈ 500-550` (je nach Berechnung)
- **Erklärung**: "Volumen addieren. Oberfläche: Quader-O + Pyramidenmantel (ohne Grundfläche)"
- **Schwierigkeit**: Schwer
- **Unit**: u4

### Bounty 7: Kegelstumpf (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Kegelstumpf: r₁ = [r1] cm, r₂ = [r2] cm, h = [h] cm.\n a) Volumen (π≈3,14, auf ganze cm³)?\n b) Mantelfläche (auf ganze cm²)?"
- **Variablen**: r1 = 6-10, r2 = 3-5, h = 8-12
- **Richtige Antwort**:
  - a: `Math.round(3.14 * h / 3 * (r1*r1 + r1*r2 + r2*r2))`
  - b: `Math.round(3.14 * (r1 + r2) * Math.sqrt((r1-r2)*(r1-r2) + h*h))`
- **Erklärung**: "V = (πh/3)(r₁² + r₁r₂ + r₂²). Mantel = π(r₁+r₂)s mit s = √((r₁-r₂)²+h²)"
- **Schwierigkeit**: Schwer
- **Unit**: u4

---

## STRAHLENSÄTZE - Erweiterte Quest-Aufgaben

### Quest 14: Erster Strahlensatz
- **Typ**: `input`
- **Frage**: "Zwei Strahlen werden von zwei parallelen Geraden geschnitten. Abschnitt auf Strahl 1: [a1] cm / [a2] cm. Abschnitt auf Strahl 2: [b1] cm. Berechne [b2] (auf ganze cm gerundet)."
- **Variablen**: a1 = 3-6, a2 = 6-12, b1 = 4-8
- **Richtige Antwort**: `Math.round((b1 * a2) / a1)`
- **Erklärung**: "Erster Strahlensatz: a₁/a₂ = b₁/b₂ → b₂ = (b₁ × a₂) / a₁"
- **Schwierigkeit**: Mittel
- **Unit**: u5

### Quest 15: Zweiter Strahlensatz
- **Typ**: `input`
- **Frage**: "Zwei Strahlen werden von zwei parallelen Geraden geschnitten. Strahlabschnitt [s1] cm, Gesamtstrahl [s2] cm. Parallele Abschnitte: [p1] cm / [p2] cm. Berechne [p2] (auf ganze cm gerundet)."
- **Variablen**: s1 = 4-8, s2 = 8-16, p1 = 3-6
- **Richtige Antwort**: `Math.round((p1 * s2) / s1)`
- **Erklärung**: "Zweiter Strahlensatz: s₁/s₂ = p₁/p₂ → p₂ = (p₁ × s₂) / s₁"
- **Schwierigkeit**: Mittel
- **Unit**: u5

---

## STRAHLENSÄTZE - Erweiterte Bounty-Aufgaben

### Bounty 8: Strahlensatz-Anwendung (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Baumhöhe bestimmen: Person [h] m hoch, Schatten [s1] m. Baum-Schatten [s2] m.\n a) Baumhöhe (auf 0,1 m gerundet)?\n b) Prüfe: Welcher Strahlensatz wurde verwendet?"
- **Variablen**: h = 1,6-1,8, s1 = 2-3, s2 = 8-12
- **Richtige Antwort**:
  - a: `((h * s2) / s1).toFixed(1)`
  - b: "Erster Strahlensatz" oder "Strahlensatz"
- **Erklärung**: "h_Baum / h_Person = s2 / s1 → h_Baum = (h_Person × s2) / s1"
- **Schwierigkeit**: Schwer
- **Unit**: u5

### Bounty 9: Umkehrung des Strahlensatzes (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Zwei Strahlen, zwei Geraden. Abschnitte: Strahl 1: [a1] cm / [a2] cm, Strahl 2: [b1] cm / [b2] cm.\n a) Verhältnis Strahl 1?\n b) Sind die Geraden parallel? (ja/nein)"
- **Variablen**: a1 = 4-6, a2 = 8-12, b1 = 6-9, b2 berechnet für Parallelität
- **Richtige Antwort**:
  - a: `(a1/a2).toFixed(2)` oder `(a2/a1).toFixed(2)`
  - b: "ja" wenn Verhältnisse gleich, sonst "nein"
- **Erklärung**: "Wenn a₁/a₂ = b₁/b₂, dann sind die Geraden parallel (Umkehrung des Strahlensatzes)"
- **Schwierigkeit**: Schwer
- **Unit**: u5

---

## KONGRUENTE DREIECKE - Neue Quest-Aufgaben

### Quest 16: Kongruenzsatz SSW
- **Typ**: `choice`
- **Frage**: "Zwei Dreiecke haben: Seite a gleich, Seite b gleich, Winkel α gleich (nicht zwischen den Seiten). Welcher Kongruenzsatz gilt?"
- **Optionen**: ["SSS", "SWS", "WSW", "SSW"]
- **Richtige Antwort**: 3
- **Erklärung**: "SSW-Satz: Zwei Seiten und der der größeren Seite gegenüberliegende Winkel sind gleich."
- **Schwierigkeit**: Mittel
- **Unit**: u2 oder u5

### Quest 17: Kongruenzsatz WSW
- **Typ**: `choice`
- **Frage**: "Zwei Dreiecke haben: Winkel α gleich, Seite a gleich, Winkel β gleich (an Seite a). Welcher Kongruenzsatz gilt?"
- **Optionen**: ["SSS", "SWS", "WSW", "SSW"]
- **Richtige Antwort**: 2
- **Erklärung**: "WSW-Satz: Zwei Winkel und die eingeschlossene Seite sind gleich."
- **Schwierigkeit**: Mittel
- **Unit**: u2 oder u5

---

## KONGRUENTE DREIECKE - Neue Bounty-Aufgaben

### Bounty 10: Kongruenz beweisen (Schwer)
- **Typ**: `input` mit drei Feldern
- **Frage**: "Dreieck ABC: a=[a] cm, b=[b] cm, α=[α]°. Dreieck DEF: d=[d] cm, e=[e] cm, δ=[δ]°.\n a) Welcher Kongruenzsatz? (SSS/SWS/WSW/SSW)\n b) Sind die Dreiecke kongruent? (ja/nein)\n c) Begründung kurz?"
- **Variablen**: Für SWS: a=d, b=e, γ=ε (eingeschlossener Winkel)
- **Richtige Antwort**:
  - a: "SWS"
  - b: "ja"
  - c: "SWS-Satz: zwei Seiten und eingeschlossener Winkel gleich"
- **Erklärung**: "SWS-Satz: Zwei Seiten und der eingeschlossene Winkel sind gleich → Dreiecke kongruent"
- **Schwierigkeit**: Schwer
- **Unit**: u2 oder u5

---

## VIELEcke - Neue Quest-Aufgaben

### Quest 18: Regelmäßiges Fünfeck
- **Typ**: `input`
- **Frage**: "Regelmäßiges Fünfeck: Seitenlänge a = [a] cm, Umkreisradius r ≈ [r] cm. Flächeninhalt? (Formel: A ≈ 1,72 × a², auf ganze cm² gerundet)"
- **Variablen**: a = 5-10
- **Richtige Antwort**: `Math.round(1.72 * a * a)`
- **Erklärung**: "Näherungsformel für regelmäßiges Fünfeck: A ≈ 1,72 × a²"
- **Schwierigkeit**: Mittel
- **Unit**: u3

### Quest 19: Regelmäßiges Sechseck
- **Typ**: `input`
- **Frage**: "Regelmäßiges Sechseck: Seitenlänge a = [a] cm. Flächeninhalt? (Formel: A = (3√3/2) × a², √3≈1,73, auf ganze cm² gerundet)"
- **Variablen**: a = 4-8
- **Richtige Antwort**: `Math.round((3 * 1.73 / 2) * a * a)`
- **Erklärung**: "A = (3√3/2) × a² für regelmäßiges Sechseck"
- **Schwierigkeit**: Mittel
- **Unit**: u3

---

## VIELEcke - Neue Bounty-Aufgaben

### Bounty 11: Vieleck-Umfang und Fläche (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Regelmäßiges Achteck: Seitenlänge a = [a] cm.\n a) Umfang (cm)?\n b) Flächeninhalt? (Formel: A ≈ 4,83 × a², auf ganze cm² gerundet)"
- **Variablen**: a = 5-8
- **Richtige Antwort**:
  - a: `8 * a`
  - b: `Math.round(4.83 * a * a)`
- **Erklärung**: "Umfang = 8 × a. Fläche ≈ 4,83 × a² für regelmäßiges Achteck"
- **Schwierigkeit**: Schwer
- **Unit**: u3

---

## 3D-GEOMETRIE - Neue Quest-Aufgaben

### Quest 20: 3D-Koordinaten Abstand
- **Typ**: `input`
- **Frage**: "Punkt A(2|3|4), Punkt B(5|7|9). Abstand im Raum? (auf 1 Dezimalstelle gerundet)"
- **Richtige Antwort**: `Math.sqrt((5-2)*(5-2) + (7-3)*(7-3) + (9-4)*(9-4)).toFixed(1)`
- **Erklärung**: "Abstand = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)"
- **Schwierigkeit**: Mittel
- **Unit**: Neue Unit u8 (3D-Geometrie)

### Quest 21: Prisma Volumen
- **Typ**: `input`
- **Frage**: "Dreiecksprisma: Grundfläche rechtwinkliges Dreieck (Katheten [a] cm und [b] cm), Höhe h = [h] cm. Volumen? (auf ganze cm³ gerundet)"
- **Variablen**: a = 4-8, b = 6-10, h = 8-12
- **Richtige Antwort**: `Math.round((a * b / 2) * h)`
- **Erklärung**: "V = Grundfläche × Höhe = (a×b/2) × h"
- **Schwierigkeit**: Mittel
- **Unit**: u4

---

## 3D-GEOMETRIE - Neue Bounty-Aufgaben

### Bounty 12: Schnitt von Ebene und Würfel (Schwer)
- **Typ**: `input` mit zwei Feldern
- **Frage**: "Würfel (Kante [a] cm) wird von einer Ebene geschnitten, die durch drei Eckpunkte geht.\n a) Welche Form hat der Schnitt? (Dreieck/Quadrat/Rechteck/Fünfeck)\n b) Umfang des Schnitts? (auf 0,1 cm gerundet)"
- **Variablen**: a = 6-10
- **Richtige Antwort**:
  - a: "Dreieck" (wenn durch drei Ecken)
  - b: `(3 * a * Math.sqrt(2)).toFixed(1)` (für gleichseitiges Dreieck)
- **Erklärung**: "Schnitt durch drei Eckpunkte eines Würfels ergibt ein Dreieck. Seitenlänge = Raumdiagonale einer Seitenfläche"
- **Schwierigkeit**: Schwer
- **Unit**: Neue Unit u8 (3D-Geometrie)

---

## Implementierungsvorschläge

### Option 1: Erweiterung bestehender Units
- **u2**: Trigonometrie-Aufgaben hinzufügen
- **u4**: Erweiterte Körpergeometrie (Pyramide, Kegel, Kugel)
- **u5**: Erweiterte Strahlensatz-Aufgaben
- **u6**: Erweiterte Pythagoras-Aufgaben (Höhensatz, Kathetensatz)

### Option 2: Neue Units erstellen
- **u7**: Trigonometrie (Sinus, Cosinus, Tangens, Einheitskreis)
- **u8**: 3D-Geometrie (Koordinaten, Schnitte, erweiterte Körper)

### Option 3: Hybrid-Ansatz
- Einfache Aufgaben in bestehende Units integrieren
- Komplexe Themen als neue Units

---

## Technische Hinweise

### Validator-Typen
- `numeric`: Genaue Zahlenwerte
- `numericTolerance`: Zahlen mit Toleranz (±0.1, ±1, etc.)
- `keywords`: Textantworten mit Schlüsselwörtern
- `coordinatePair`: Koordinatenpaare (x|y oder x,y)
- `equation`: Gleichungen (für algebraische Aufgaben)

### Schwierigkeitsgrade
- **Leicht**: Einfache Anwendung von Formeln
- **Mittel**: Mehrschrittige Aufgaben, Formelumstellung
- **Schwer**: Kombinierte Aufgaben, Beweise, komplexe Anwendungen

### Coin-Rewards (Vorschlag)
- **Quest-Aufgaben**: 10-20 Coins pro Aufgabe
- **Bounty-Aufgaben**:
  - Mittel: 50-80 Coins
  - Schwer: 100-150 Coins
- **Entry Fees**: 15% des Bounty-Rewards (min 10, max 60)

---

## Nächste Schritte

1. **Code-Integration**: Aufgaben in `bountyCatalog.ts` und `taskFactory.ts` integrieren
2. **Testing**: Validatoren für neue Aufgabentypen testen
3. **UI-Anpassungen**: Falls neue Aufgabentypen benötigt werden
4. **Dokumentation**: Aktualisierung der Quest-Dokumentation

---

**Hinweis**: Diese Aufgaben basieren auf den MUNDO-Inhalten und können direkt in die bestehende Struktur integriert werden. Die Variablen sollten bei der Implementierung mit `getRandomInt()` generiert werden, um Abwechslung zu gewährleisten.

