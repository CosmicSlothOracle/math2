/**
 * Formelsammlung Content
 *
 * Strukturierte Formeln für Potenzen, Wurzeln und Quadratische Funktionen
 */

export interface FormelSection {
  title: string;
  formulas: {
    name: string;
    formula: string; // LaTeX-ähnliche Notation
    example?: string;
    explanation?: string;
  }[];
}

export interface FormelsammlungContent {
  id: string;
  title: string;
  sections: FormelSection[];
}

/**
 * Formelsammlung: Potenzen & Reelle Zahlen
 */
export const POTENZEN_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'potenzen',
  title: 'Potenzen & Reelle Zahlen',
  sections: [
    {
      title: 'Potenzgesetze',
      formulas: [
        {
          name: 'Gültigkeitsbereich',
          formula: 'a, b ∈ ℝ; n, m ∈ ℤ',
          example: 'a ≠ 0 bei Division',
          explanation: 'Basis: reelle Zahlen; Exponent: ganze Zahlen. Bei Division muss a ≠ 0 sein.',
        },
        {
          name: 'Multiplikation (gleiche Basis)',
          formula: 'a^n · a^m = a^(n+m)',
          example: '2^5 · 2^3 = 2^8 = 256',
          explanation: 'Bei gleicher Basis werden die Exponenten addiert.',
        },
        {
          name: 'Division (gleiche Basis)',
          formula: 'a^n : a^m = a^(n-m) (a ≠ 0)',
          example: '5^9 : 5^4 = 5^5 = 3125; x^3 : x^2 = x^1 = x',
          explanation: 'Bei gleicher Basis werden die Exponenten subtrahiert. Basis darf nicht null sein.',
        },
        {
          name: 'Potenzieren von Potenzen',
          formula: '(a^n)^m = a^(n·m)',
          example: '(2^3)^4 = 2^12 = 4096; (10^3)^2 = 10^6',
          explanation: 'Beim Potenzieren werden die Exponenten multipliziert.',
        },
        {
          name: 'Multiplikation (gleicher Exponent)',
          formula: 'a^n · b^n = (a·b)^n',
          example: '2^3 · 5^3 = (2·5)^3 = 10^3 = 1000',
          explanation: 'Bei gleichem Exponenten können die Basen multipliziert werden.',
        },
        {
          name: 'Produkt potenzieren',
          formula: '(a·b)^n = a^n · b^n',
          example: '(3·4)^2 = 3^2 · 4^2 = 9·16 = 144',
          explanation: 'Jeder Faktor wird einzeln potenziert.',
        },
        {
          name: 'Quotient potenzieren',
          formula: '(a/b)^n = a^n / b^n (b ≠ 0)',
          example: '(6/2)^3 = 6^3 / 2^3 = 216/8 = 27',
          explanation: 'Zähler und Nenner werden einzeln potenziert. Nenner darf nicht null sein.',
        },
      ],
    },
    {
      title: 'Negative Exponenten',
      formulas: [
        {
          name: 'Definition',
          formula: 'a^(-n) = 1/(a^n) (a ≠ 0)',
          example: '2^(-3) = 1/2^3 = 1/8; a^(-3) · a^(-4) = a^(-7) = 1/a^7',
          explanation: 'Negativer Exponent bedeutet Kehrwert. Basis darf nicht null sein.',
        },
        {
          name: 'Bruch mit negativem Exponenten',
          formula: '(a/b)^(-n) = (b/a)^n',
          example: '(2/3)^(-2) = (3/2)^2 = 9/4',
          explanation: 'Negativer Exponent kehrt den Bruch um.',
        },
        {
          name: 'Division mit negativen Exponenten',
          formula: 'a^n : a^(-m) = a^(n-(-m)) = a^(n+m)',
          example: 'z^4 : z^(-2) = z^(4-(-2)) = z^6',
          explanation: 'Beim Dividieren mit negativem Exponenten werden die Exponenten addiert.',
        },
      ],
    },
    {
      title: 'Wurzeln & Rationale Exponenten',
      formulas: [
        {
          name: 'Wurzel als Potenz',
          formula: 'ⁿ√a = a^(1/n)',
          example: '√9 = 9^(1/2) = 3',
          explanation: 'Jede Wurzel kann als Potenz geschrieben werden.',
        },
        {
          name: 'Rationale Exponenten',
          formula: 'a^(m/n) = ⁿ√(a^m) = (ⁿ√a)^m',
          example: '8^(2/3) = ³√(8^2) = ³√64 = 4',
          explanation: 'Rationale Exponenten kombinieren Potenz und Wurzel.',
        },
        {
          name: 'Wurzelgesetze: Multiplikation',
          formula: 'ⁿ√a · ⁿ√b = ⁿ√(a·b)',
          example: '√4 · √9 = √36 = 6',
          explanation: 'Wurzeln mit gleichem Wurzelexponenten multiplizieren.',
        },
        {
          name: 'Wurzelgesetze: Division',
          formula: 'ⁿ√a : ⁿ√b = ⁿ√(a/b)',
          example: '√16 : √4 = √4 = 2',
          explanation: 'Wurzeln mit gleichem Wurzelexponenten dividieren.',
        },
      ],
    },
    {
      title: 'Zahlbereiche',
      formulas: [
        {
          name: 'Natürliche Zahlen',
          formula: 'ℕ = {0, 1, 2, 3, ...}',
          example: '0, 1, 5, 100 ∈ ℕ',
          explanation: 'Alle positiven ganzen Zahlen inkl. 0.',
        },
        {
          name: 'Ganze Zahlen',
          formula: 'ℤ = {..., -2, -1, 0, 1, 2, ...}',
          example: '-5, 0, 7 ∈ ℤ',
          explanation: 'Alle ganzen Zahlen (positiv, negativ, null).',
        },
        {
          name: 'Rationale Zahlen',
          formula: 'ℚ = {p/q | p, q ∈ ℤ, q ≠ 0}',
          example: '1/2, -3/4, 5 ∈ ℚ',
          explanation: 'Alle Zahlen, die als Bruch darstellbar sind.',
        },
        {
          name: 'Irrationale Zahlen',
          formula: '𝕀 = ℝ \ ℚ',
          example: '√2, √5, π ∈ 𝕀',
          explanation: 'Reelle Zahlen, die nicht als Bruch darstellbar sind.',
        },
        {
          name: 'Reelle Zahlen',
          formula: 'ℝ = ℚ ∪ 𝕀',
          example: 'Alle Zahlen auf der Zahlengeraden.',
          explanation: 'Vereinigung aller rationalen und irrationalen Zahlen.',
        },
      ],
    },
    {
      title: 'Wissenschaftliche Schreibweise',
      formulas: [
        {
          name: 'Standardform',
          formula: 'a · 10^n (1 ≤ |a| < 10)',
          example: '23500 = 2,35 · 10^4',
          explanation: 'Zahl zwischen 1 und 10 mal Zehnerpotenz.',
        },
        {
          name: 'Kleine Zahlen',
          formula: 'a · 10^(-n)',
          example: '0,000123 = 1,23 · 10^(-4)',
          explanation: 'Negative Exponenten für Zahlen < 1.',
        },
        {
          name: 'Rechnen mit Zehnerpotenzen',
          formula: '(a·10^m) · (b·10^n) = (a·b) · 10^(m+n)',
          example: '3·10^5 · 2·10^3 = 6·10^8',
          explanation: 'Zahlen multiplizieren, Exponenten addieren.',
        },
      ],
    },
    {
      title: 'Kombinierte Potenzgesetze',
      formulas: [
        {
          name: 'Potenz von Produkt mit Variablen',
          formula: '(a·b·c)^n = a^n · b^n · c^n',
          example: '(3xy^2)^4 = 3^4 · x^4 · (y^2)^4 = 81x^4y^8',
          explanation: 'Jeder Faktor (inkl. Variablen) wird einzeln potenziert.',
        },
        {
          name: 'Potenz von Potenz mit algebraischem Exponenten',
          formula: '(a^n)^(m+k) = a^(n·(m+k)) = a^(nm + nk)',
          example: '(x^(n+1))^2 = x^(2(n+1)) = x^(2n+2); (a^3)^(n-1) = a^(3(n-1)) = a^(3n-3)',
          explanation: 'Exponenten werden multipliziert, auch bei algebraischen Ausdrücken.',
        },
        {
          name: 'Kombinierte Potenzen in Brüchen',
          formula: '(a^m · b^n)^p / (a^q · b^r)^s = a^(mp-qs) · b^(np-rs)',
          example: '(a^3·b^4)^3 / (a^2·b^3)^2 = a^9·b^12 / a^4·b^6 = a^5·b^6',
          explanation: 'Potenzgesetze auf Zähler und Nenner anwenden, dann dividieren.',
        },
        {
          name: 'Negatives Vorzeichen in Potenzen',
          formula: '(-a)^n = (-1)^n · a^n',
          example: '(-3^2)^3 = -3^6 = -729; ((-2)^4)^3 = (-2)^12 = 4096',
          explanation: 'Minuszeichen wird mit potenziert. (-a)^n ≠ -(a^n) wenn n gerade!',
        },
        {
          name: 'Mehrfache Potenzierung',
          formula: '((a^n)^m)^p = a^(n·m·p)',
          example: '((2^3)^2)^2 = 2^(3·2·2) = 2^12 = 4096',
          explanation: 'Bei mehrfacher Potenzierung werden alle Exponenten multipliziert.',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Quadratische Funktionen
 */
export const QUADRATISCH_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'quadratisch',
  title: 'Quadratische Funktionen',
  sections: [
    {
      title: 'Funktionsformen',
      formulas: [
        {
          name: 'Scheitelpunktform',
          formula: 'f(x) = a(x - d)² + e',
          example: 'f(x) = 2(x-3)² + 5 → S(3|5)',
          explanation: 'Scheitelpunkt direkt ablesbar: S(d|e). a = Streckfaktor.',
        },
        {
          name: 'Allgemeine Form',
          formula: 'f(x) = ax² + bx + c',
          example: 'f(x) = x² + 4x + 3',
          explanation: 'Koeffizienten direkt sichtbar. Scheitelpunkt bei x = -b/(2a).',
        },
        {
          name: 'Normalparabel',
          formula: 'f(x) = x²',
          example: 'Scheitelpunkt S(0|0), nach oben geöffnet.',
          explanation: 'Grundform aller quadratischen Funktionen.',
        },
      ],
    },
    {
      title: 'Parabel-Eigenschaften',
      formulas: [
        {
          name: 'Öffnung',
          formula: 'a > 0: nach oben | a < 0: nach unten',
          example: 'f(x) = -2x² ist nach unten geöffnet',
          explanation: 'Vorzeichen von a bestimmt Öffnungsrichtung.',
        },
        {
          name: 'Streckung & Stauchung',
          formula: '|a| > 1: gestreckt | |a| < 1: gestaucht',
          example: 'f(x) = 3x² ist gestreckt, f(x) = 0,5x² ist gestaucht',
          explanation: 'Betrag von a bestimmt Form der Parabel.',
        },
        {
          name: 'Scheitelpunkt (aus AF)',
          formula: 'x_S = -b/(2a), y_S = f(x_S)',
          example: 'f(x) = x² + 4x + 3 → x_S = -2, y_S = -1',
          explanation: 'Scheitelpunkt liegt bei x = -b/(2a).',
        },
        {
          name: 'Symmetrieachse',
          formula: 'x = d (bei SPF) oder x = -b/(2a) (bei AF)',
          example: 'f(x) = (x-3)² + 5 → Symmetrieachse: x = 3',
          explanation: 'Parabel ist symmetrisch zur senkrechten Geraden durch den Scheitelpunkt.',
        },
      ],
    },
    {
      title: 'Nullstellen',
      formulas: [
        {
          name: 'pq-Formel',
          formula: 'x₁,₂ = -p/2 ± √((p/2)² - q)',
          example: 'x² + 6x + 5 = 0 → x₁ = -1, x₂ = -5',
          explanation: 'Für f(x) = x² + px + q = 0 (normierte Form).',
        },
        {
          name: 'Mitternachtsformel',
          formula: 'x₁,₂ = (-b ± √(b² - 4ac)) / (2a)',
          example: '2x² + 5x - 3 = 0 → x₁ = 0,5, x₂ = -3',
          explanation: 'Für f(x) = ax² + bx + c = 0 (allgemeine Form).',
        },
        {
          name: 'Diskriminante',
          formula: 'D = (p/2)² - q (pq) oder D = b² - 4ac (Mitternacht)',
          example: 'D > 0: 2 Lösungen, D = 0: 1 Lösung, D < 0: keine Lösung',
          explanation: 'Diskriminante bestimmt Anzahl der Nullstellen.',
        },
        {
          name: 'Nullstellen aus SPF',
          formula: 'f(x) = a(x-d)² + e = 0 → (x-d)² = -e/a',
          example: 'f(x) = (x-2)² - 9 = 0 → x₁ = 5, x₂ = -1',
          explanation: 'Wenn e negativ, gibt es zwei Nullstellen.',
        },
      ],
    },
    {
      title: 'Quadratische Ergänzung',
      formulas: [
        {
          name: 'Schritt 1: a ausklammern',
          formula: 'ax² + bx + c = a(x² + (b/a)x) + c',
          example: '2x² - 8x + 6 = 2(x² - 4x) + 6',
          explanation: 'Wenn a ≠ 1, zuerst a ausklammern.',
        },
        {
          name: 'Schritt 2: Ergänzen',
          formula: 'x² + px = (x + p/2)² - (p/2)²',
          example: 'x² + 6x = (x + 3)² - 9',
          explanation: 'Quadratische Ergänzung: (p/2)² addieren und subtrahieren.',
        },
        {
          name: 'Schritt 3: Zusammenfassen',
          formula: 'a[(x + p/2)² - (p/2)²] + c = a(x + p/2)² + (c - a·(p/2)²)',
          example: '2[(x-2)² - 4] + 6 = 2(x-2)² - 2',
          explanation: 'Ausmultiplizieren und vereinfachen.',
        },
      ],
    },
    {
      title: 'Anwendungen',
      formulas: [
        {
          name: 'Maximum/Minimum',
          formula: 'Bei a > 0: Minimum bei x_S | Bei a < 0: Maximum bei x_S',
          example: 'f(x) = -x² + 4x hat Maximum bei x = 2',
          explanation: 'Extremwert liegt immer beim Scheitelpunkt.',
        },
        {
          name: 'Wurfparabel',
          formula: 'h(t) = -5t² + v₀t + h₀',
          example: 'Maximale Höhe bei t = v₀/10',
          explanation: 'h(t) = Höhe, v₀ = Anfangsgeschwindigkeit, h₀ = Starthöhe.',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Grundlagen
 */
export const GRUNDLAGEN_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'grundlagen',
  title: 'Grundlagen',
  sections: [
    {
      title: 'Prozentrechnung',
      formulas: [
        {
          name: 'Grundformel',
          formula: 'W/p = G/100',
          example: '25% von 80: W = (25/100) · 80 = 20',
          explanation: 'W: Prozentwert, p: Prozentsatz, G: Grundwert',
        },
        {
          name: 'Prozentwert berechnen',
          formula: 'W = (p/100) · G',
          example: '15% von 200: W = (15/100) · 200 = 30',
          explanation: 'Prozentwert = Prozentsatz mal Grundwert',
        },
        {
          name: 'Grundwert berechnen',
          formula: 'G = (W · 100) / p',
          example: '25 ist 20% von G: G = (25 · 100) / 20 = 125',
          explanation: 'Grundwert = Prozentwert mal 100 geteilt durch Prozentsatz',
        },
        {
          name: 'Prozentsatz berechnen',
          formula: 'p = (W · 100) / G',
          example: '30 von 150: p = (30 · 100) / 150 = 20%',
          explanation: 'Prozentsatz = Prozentwert mal 100 geteilt durch Grundwert',
        },
      ],
    },
    {
      title: 'Dichte',
      formulas: [
        {
          name: 'Dichte eines Stoffes',
          formula: 'ρ = m/V',
          example: 'm = 500g, V = 100cm³ → ρ = 500/100 = 5 g/cm³',
          explanation: 'ρ: Dichte, m: Masse, V: Volumen',
        },
        {
          name: 'Masse berechnen',
          formula: 'm = ρ · V',
          example: 'ρ = 2,7 g/cm³, V = 50 cm³ → m = 2,7 · 50 = 135 g',
          explanation: 'Masse = Dichte mal Volumen',
        },
        {
          name: 'Volumen berechnen',
          formula: 'V = m/ρ',
          example: 'm = 1000g, ρ = 8 g/cm³ → V = 1000/8 = 125 cm³',
          explanation: 'Volumen = Masse geteilt durch Dichte',
        },
      ],
    },
    {
      title: 'Geschwindigkeit',
      formulas: [
        {
          name: 'Geschwindigkeit (gleichförmige Bewegung)',
          formula: 'v = s/t',
          example: 's = 120 km, t = 2 h → v = 120/2 = 60 km/h',
          explanation: 'v: Geschwindigkeit, s: zurückgelegter Weg, t: benötigte Zeit',
        },
        {
          name: 'Weg berechnen',
          formula: 's = v · t',
          example: 'v = 80 km/h, t = 1,5 h → s = 80 · 1,5 = 120 km',
          explanation: 'Weg = Geschwindigkeit mal Zeit',
        },
        {
          name: 'Zeit berechnen',
          formula: 't = s/v',
          example: 's = 200 km, v = 100 km/h → t = 200/100 = 2 h',
          explanation: 'Zeit = Weg geteilt durch Geschwindigkeit',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Lineare Funktionen
 */
export const LINEAR_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'linear',
  title: 'Lineare Funktionen',
  sections: [
    {
      title: 'Funktionsgleichung',
      formulas: [
        {
          name: 'Allgemeine Form',
          formula: 'f(x) = mx + n',
          example: 'f(x) = 2x + 3 → m = 2, n = 3',
          explanation: 'm: Steigung, n: y-Achsenabschnitt',
        },
        {
          name: 'Steigung zwischen zwei Punkten',
          formula: 'm = (y_2 - y_1)/(x_2 - x_1)',
          example: 'P₁(2|5), P₂(4|9) → m = (9-5)/(4-2) = 4/2 = 2',
          explanation: 'Steigung = Differenz der y-Werte geteilt durch Differenz der x-Werte',
        },
        {
          name: 'Steigungswinkel',
          formula: 'm = tan α',
          example: 'm = 1 → α = 45°',
          explanation: 'Steigung = Tangens des Steigungswinkels (für α ≠ 90°)',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Exponentialfunktionen
 */
export const EXPONENTIAL_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'exponential',
  title: 'Exponentialfunktionen',
  sections: [
    {
      title: 'Allgemeine Form',
      formulas: [
        {
          name: 'Funktionsgleichung',
          formula: 'f(x) = c · a^x',
          example: 'f(x) = 100 · 1,05^x',
          explanation: 'c: Anfangswert (c = f(0)), a: Wachstumsfaktor, x ∈ ℝ, a > 0, a ≠ 1, c ≠ 0',
        },
        {
          name: 'Wachstumsrate',
          formula: 'p% = (a - 1) · 100%',
          example: 'a = 1,05 → p% = (1,05 - 1) · 100% = 5%',
          explanation: 'Wachstumsrate in Prozent',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Geometrie - Rechtwinklige Dreiecke
 */
export const DREIECK_RECHTWINKLIG_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'dreieck_rechtwinklig',
  title: 'Rechtwinkliges Dreieck',
  sections: [
    {
      title: 'Satz des Pythagoras',
      formulas: [
        {
          name: 'Pythagoras',
          formula: 'c² = a² + b²',
          example: 'a = 3, b = 4 → c = √(3² + 4²) = √25 = 5',
          explanation: 'c: Hypotenuse, a, b: Katheten',
        },
        {
          name: 'Kathete berechnen',
          formula: 'a = √(c² - b²)',
          example: 'c = 5, b = 4 → a = √(5² - 4²) = √9 = 3',
          explanation: 'Kathete aus Hypotenuse und anderer Kathete',
        },
      ],
    },
    {
      title: 'Flächeninhalt',
      formulas: [
        {
          name: 'Flächeninhalt',
          formula: 'A = (1/2) · a · b = (1/2) · c · h_c',
          example: 'a = 5, b = 12 → A = (1/2) · 5 · 12 = 30',
          explanation: 'A: Flächeninhalt, h_c: Höhe auf Hypotenuse',
        },
      ],
    },
    {
      title: 'Trigonometrie',
      formulas: [
        {
          name: 'Sinus',
          formula: 'sin α = (Gegenkathete von α)/Hypotenuse = a/c',
          example: 'a = 3, c = 5 → sin α = 3/5 = 0,6',
          explanation: 'Sinus = Gegenkathete geteilt durch Hypotenuse',
        },
        {
          name: 'Kosinus',
          formula: 'cos α = (Ankathete von α)/Hypotenuse = b/c',
          example: 'b = 4, c = 5 → cos α = 4/5 = 0,8',
          explanation: 'Kosinus = Ankathete geteilt durch Hypotenuse',
        },
        {
          name: 'Tangens',
          formula: 'tan α = (Gegenkathete von α)/(Ankathete von α) = a/b',
          example: 'a = 3, b = 4 → tan α = 3/4 = 0,75',
          explanation: 'Tangens = Gegenkathete geteilt durch Ankathete',
        },
      ],
    },
    {
      title: 'Höhen- und Kathetensatz',
      formulas: [
        {
          name: 'Höhensatz',
          formula: 'h_c² = p · q',
          example: 'p = 1,8, q = 3,2 → h_c = √(1,8 · 3,2) = √5,76 = 2,4',
          explanation: 'Quadrat der Höhe = Produkt der Hypotenusenabschnitte',
        },
        {
          name: 'Kathetensatz',
          formula: 'a² = p · c und b² = q · c',
          example: 'p = 1,8, c = 5 → a = √(1,8 · 5) = √9 = 3',
          explanation: 'Quadrat der Kathete = Produkt aus zugehörigem Hypotenusenabschnitt und Hypotenuse',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Geometrie - Beliebiges Dreieck
 */
export const DREIECK_BELIEBIG_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'dreieck_beliebig',
  title: 'Beliebiges Dreieck',
  sections: [
    {
      title: 'Sinussatz',
      formulas: [
        {
          name: 'Sinussatz',
          formula: 'a/sin α = b/sin β = c/sin γ',
          example: 'a = 5, α = 30°, β = 45° → b = (5/sin 30°) · sin 45° ≈ 7,07',
          explanation: 'Verhältnis von Seite zu Sinus des gegenüberliegenden Winkels ist konstant',
        },
      ],
    },
    {
      title: 'Kosinussatz',
      formulas: [
        {
          name: 'Kosinussatz',
          formula: 'c² = a² + b² - 2ab · cos γ',
          example: 'a = 5, b = 7, γ = 60° → c² = 25 + 49 - 70·0,5 = 39 → c ≈ 6,24',
          explanation: 'Verallgemeinerung des Satzes des Pythagoras',
        },
      ],
    },
    {
      title: 'Flächeninhalt',
      formulas: [
        {
          name: 'Flächeninhalt',
          formula: 'A = (1/2) · c · h_c = (1/2) · a · b · sin γ',
          example: 'a = 5, b = 7, γ = 60° → A = (1/2) · 5 · 7 · sin 60° ≈ 15,16',
          explanation: 'Flächeninhalt = halbes Produkt zweier Seiten mal Sinus des eingeschlossenen Winkels',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Geometrie - Vierecke
 */
export const VIERECKE_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'vierecke',
  title: 'Vierecke',
  sections: [
    {
      title: 'Parallelogramm',
      formulas: [
        {
          name: 'Umfang',
          formula: 'u = 2a + 2b = 2(a + b)',
          example: 'a = 6, b = 4 → u = 2(6 + 4) = 20',
          explanation: 'Umfang = Summe aller Seiten',
        },
        {
          name: 'Flächeninhalt',
          formula: 'A = a · h_a',
          example: 'a = 6, h_a = 5 → A = 6 · 5 = 30',
          explanation: 'Flächeninhalt = Grundseite mal Höhe',
        },
      ],
    },
    {
      title: 'Trapez',
      formulas: [
        {
          name: 'Mittellinie',
          formula: 'm = (1/2)(a + c)',
          example: 'a = 8, c = 4 → m = (1/2)(8 + 4) = 6',
          explanation: 'Mittellinie = halbe Summe der parallelen Seiten',
        },
        {
          name: 'Flächeninhalt',
          formula: 'A = m · h = (1/2)(a + c) · h',
          example: 'a = 8, c = 4, h = 5 → A = (1/2)(8 + 4) · 5 = 30',
          explanation: 'Flächeninhalt = Mittellinie mal Höhe',
        },
      ],
    },
    {
      title: 'Drachenviereck',
      formulas: [
        {
          name: 'Umfang',
          formula: 'u = 2a + 2b = 2(a + b)',
          example: 'a = 5, b = 3 → u = 2(5 + 3) = 16',
          explanation: 'Umfang = Summe aller Seiten',
        },
        {
          name: 'Flächeninhalt',
          formula: 'A = (e · f)/2',
          example: 'e = 8, f = 6 → A = (8 · 6)/2 = 24',
          explanation: 'Flächeninhalt = halbes Produkt der Diagonalen',
        },
      ],
    },
    {
      title: 'Kreis',
      formulas: [
        {
          name: 'Durchmesser',
          formula: 'd = 2r',
          example: 'r = 5 → d = 2 · 5 = 10',
          explanation: 'Durchmesser = doppelter Radius',
        },
        {
          name: 'Umfang',
          formula: 'u = π · d = 2π · r',
          example: 'r = 5 → u = 2π · 5 ≈ 31,42',
          explanation: 'Umfang = Pi mal Durchmesser',
        },
        {
          name: 'Flächeninhalt',
          formula: 'A = π · r²',
          example: 'r = 5 → A = π · 25 ≈ 78,54',
          explanation: 'Flächeninhalt = Pi mal Radius zum Quadrat',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Geometrie - Körper
 */
export const KOERPER_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'koerper',
  title: 'Geometrische Körper',
  sections: [
    {
      title: 'Würfel',
      formulas: [
        {
          name: 'Grundfläche',
          formula: 'A_G = a²',
          example: 'a = 5 → A_G = 25',
          explanation: 'Grundfläche = Seitenlänge zum Quadrat',
        },
        {
          name: 'Oberfläche',
          formula: 'A_O = 6 · a²',
          example: 'a = 5 → A_O = 6 · 25 = 150',
          explanation: 'Oberfläche = 6 mal Grundfläche',
        },
        {
          name: 'Volumen',
          formula: 'V = a³',
          example: 'a = 5 → V = 125',
          explanation: 'Volumen = Seitenlänge hoch 3',
        },
        {
          name: 'Raumdiagonale',
          formula: 'd = a · √3',
          example: 'a = 5 → d = 5√3 ≈ 8,66',
          explanation: 'Raumdiagonale = Seitenlänge mal Wurzel aus 3',
        },
      ],
    },
    {
      title: 'Quader',
      formulas: [
        {
          name: 'Grundfläche',
          formula: 'A_G = a · b',
          example: 'a = 6, b = 4 → A_G = 24',
          explanation: 'Grundfläche = Länge mal Breite',
        },
        {
          name: 'Oberfläche',
          formula: 'A_O = 2ab + 2bc + 2ac',
          example: 'a = 6, b = 4, c = 5 → A_O = 48 + 40 + 60 = 148',
          explanation: 'Oberfläche = Summe aller Flächen',
        },
        {
          name: 'Volumen',
          formula: 'V = a · b · c',
          example: 'a = 6, b = 4, c = 5 → V = 120',
          explanation: 'Volumen = Länge mal Breite mal Höhe',
        },
        {
          name: 'Raumdiagonale',
          formula: 'd = √(a² + b² + c²)',
          example: 'a = 6, b = 4, c = 5 → d = √(36 + 16 + 25) = √77 ≈ 8,77',
          explanation: 'Raumdiagonale = Wurzel aus Summe der quadrierten Seitenlängen',
        },
      ],
    },
    {
      title: 'Prisma (gerade)',
      formulas: [
        {
          name: 'Mantelfläche',
          formula: 'A_M = u_G · h',
          example: 'u_G = 20, h = 8 → A_M = 160',
          explanation: 'A_G: Grundfläche, u_G: Umfang der Grundfläche, h: Höhe',
        },
        {
          name: 'Oberfläche',
          formula: 'A_O = 2A_G + A_M',
          example: 'A_G = 30, A_M = 160 → A_O = 60 + 160 = 220',
          explanation: 'Oberfläche = 2 mal Grundfläche plus Mantelfläche',
        },
        {
          name: 'Volumen',
          formula: 'V = A_G · h',
          example: 'A_G = 30, h = 8 → V = 240',
          explanation: 'Volumen = Grundfläche mal Höhe',
        },
      ],
    },
    {
      title: 'Pyramide (gerade)',
      formulas: [
        {
          name: 'Oberfläche',
          formula: 'A_O = A_G + A_M',
          example: 'A_G = 36, A_M = 60 → A_O = 96',
          explanation: 'Oberfläche = Grundfläche plus Mantelfläche',
        },
        {
          name: 'Volumen',
          formula: 'V = (1/3) · A_G · h',
          example: 'A_G = 36, h = 12 → V = (1/3) · 36 · 12 = 144',
          explanation: 'Volumen = ein Drittel mal Grundfläche mal Höhe',
        },
        {
          name: 'Quadratische Pyramide',
          formula: 'A_G = a², A_M = 2a · h_S',
          example: 'a = 6, h_S = 5 → A_G = 36, A_M = 60',
          explanation: 'h_S: Seitenhöhe (Höhe der Seitenfläche)',
        },
        {
          name: 'Rechteckige Pyramide',
          formula: 'A_G = a · b, A_M = a · h_a + b · h_b',
          example: 'a = 8, b = 6, h_a = 5, h_b = 6 → A_G = 48, A_M = 88',
          explanation: 'h_a, h_b: Seitenhöhen',
        },
      ],
    },
    {
      title: 'Zylinder (gerade)',
      formulas: [
        {
          name: 'Grundfläche',
          formula: 'A_G = π · r²',
          example: 'r = 4 → A_G = π · 16 ≈ 50,27',
          explanation: 'Grundfläche = Kreisfläche',
        },
        {
          name: 'Mantelfläche',
          formula: 'A_M = 2π · r · h',
          example: 'r = 4, h = 10 → A_M = 2π · 4 · 10 ≈ 251,33',
          explanation: 'Mantelfläche = Umfang mal Höhe',
        },
        {
          name: 'Oberfläche',
          formula: 'A_O = 2A_G + A_M',
          example: 'A_G = 50,27, A_M = 251,33 → A_O ≈ 351,87',
          explanation: 'Oberfläche = 2 mal Grundfläche plus Mantelfläche',
        },
        {
          name: 'Volumen',
          formula: 'V = A_G · h = π · r² · h',
          example: 'r = 4, h = 10 → V = π · 16 · 10 ≈ 502,65',
          explanation: 'Volumen = Grundfläche mal Höhe',
        },
      ],
    },
    {
      title: 'Kugel',
      formulas: [
        {
          name: 'Oberfläche',
          formula: 'A_O = 4π · r²',
          example: 'r = 5 → A_O = 4π · 25 ≈ 314,16',
          explanation: 'Oberfläche = 4 mal Pi mal Radius zum Quadrat',
        },
        {
          name: 'Volumen',
          formula: 'V = (4/3)π · r³',
          example: 'r = 5 → V = (4/3)π · 125 ≈ 523,60',
          explanation: 'Volumen = vier Drittel mal Pi mal Radius hoch 3',
        },
      ],
    },
    {
      title: 'Kegel (gerade)',
      formulas: [
        {
          name: 'Mantellinie',
          formula: 's² = r² + h²',
          example: 'r = 3, h = 4 → s = √(9 + 16) = 5',
          explanation: 's: Mantellinie (Seitenkante)',
        },
        {
          name: 'Grundfläche',
          formula: 'A_G = π · r²',
          example: 'r = 3 → A_G = π · 9 ≈ 28,27',
          explanation: 'Grundfläche = Kreisfläche',
        },
        {
          name: 'Mantelfläche',
          formula: 'A_M = π · r · s',
          example: 'r = 3, s = 5 → A_M = π · 3 · 5 ≈ 47,12',
          explanation: 'Mantelfläche = Pi mal Radius mal Mantellinie',
        },
        {
          name: 'Oberfläche',
          formula: 'A_O = A_G + A_M = π · r(r + s)',
          example: 'r = 3, s = 5 → A_O = π · 3(3 + 5) ≈ 75,40',
          explanation: 'Oberfläche = Grundfläche plus Mantelfläche',
        },
        {
          name: 'Volumen',
          formula: 'V = (1/3) · A_G · h = (1/3)π · r² · h',
          example: 'r = 3, h = 4 → V = (1/3)π · 9 · 4 ≈ 37,70',
          explanation: 'Volumen = ein Drittel mal Grundfläche mal Höhe',
        },
      ],
    },
  ],
};

/**
 * Formelsammlung: Stochastik
 */
export const STOCHASTIK_FORMELSAMMLUNG: FormelsammlungContent = {
  id: 'stochastik',
  title: 'Stochastik',
  sections: [
    {
      title: 'Laplace-Experiment',
      formulas: [
        {
          name: 'Wahrscheinlichkeit',
          formula: 'P(A) = (Anzahl der für A günstigen Ergebnisse)/(Anzahl der möglichen Ergebnisse)',
          example: 'Würfel: P(gerade Zahl) = 3/6 = 1/2',
          explanation: 'Bei gleich wahrscheinlichen Ergebnissen: Günstige durch Mögliche',
        },
      ],
    },
    {
      title: 'Pfadregeln',
      formulas: [
        {
          name: 'Produktregel',
          formula: 'P(D) = p_L · p_k',
          example: 'Münze zweimal: P(K,K) = (1/2) · (1/2) = 1/4',
          explanation: 'Wahrscheinlichkeit entlang eines Pfades = Produkt der Einzelwahrscheinlichkeiten',
        },
        {
          name: 'Summenregel',
          formula: 'P(H) = p_L · p_k + p_S · p_b',
          example: 'Für H = {D, E}: P(H) = P(D) + P(E)',
          explanation: 'Wahrscheinlichkeit für mehrere Pfade = Summe der Pfadwahrscheinlichkeiten',
        },
      ],
    },
    {
      title: 'Bedingte Wahrscheinlichkeit',
      formulas: [
        {
          name: 'Bedingte Wahrscheinlichkeit',
          formula: 'P_A(B) = P(A ∩ B)/P(A)',
          example: 'P(Regen | Wolken) = P(Regen ∩ Wolken)/P(Wolken)',
          explanation: 'Wahrscheinlichkeit von B unter der Bedingung A (für P(A) > 0)',
        },
      ],
    },
    {
      title: 'Kombinatorik',
      formulas: [
        {
          name: 'Permutation ohne Wiederholung',
          formula: 'P_n = n!',
          example: '3 Buchstaben: P_3 = 3! = 6 Möglichkeiten',
          explanation: 'Anzahl der Anordnungen von n verschiedenen Elementen',
        },
        {
          name: 'Permutation mit Wiederholung',
          formula: 'P_n^W = n!/(k_1! · k_2! · ... · k_m!)',
          example: 'ANNA: P_4^W = 4!/(2! · 2!) = 6',
          explanation: 'n: Gesamtanzahl, k_i: Anzahl gleicher Elemente',
        },
        {
          name: 'Variation mit Wiederholung',
          formula: 'V_n^k = n^k',
          example: '3 Ziffern, 5 Möglichkeiten: V_5^3 = 5³ = 125',
          explanation: 'k aus n mit Reihenfolge, mit Wiederholung',
        },
        {
          name: 'Kombination mit Wiederholung',
          formula: 'C_n^k = (n+k-1 über k)',
          example: '5 aus 3: C_3^5 = (7 über 5) = 21',
          explanation: 'k aus n ohne Reihenfolge, mit Wiederholung',
        },
      ],
    },
  ],
};

/**
 * Kombinierte Formelsammlung
 */
export const FORMELSAMMLUNG_CONTENT: FormelsammlungContent[] = [
  GRUNDLAGEN_FORMELSAMMLUNG,
  POTENZEN_FORMELSAMMLUNG,
  LINEAR_FORMELSAMMLUNG,
  QUADRATISCH_FORMELSAMMLUNG,
  EXPONENTIAL_FORMELSAMMLUNG,
  DREIECK_RECHTWINKLIG_FORMELSAMMLUNG,
  DREIECK_BELIEBIG_FORMELSAMMLUNG,
  VIERECKE_FORMELSAMMLUNG,
  KOERPER_FORMELSAMMLUNG,
  STOCHASTIK_FORMELSAMMLUNG,
];

