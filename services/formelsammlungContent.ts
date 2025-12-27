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
          name: 'Multiplikation (gleiche Basis)',
          formula: 'a^n · a^m = a^(n+m)',
          example: '2^5 · 2^3 = 2^8 = 256',
          explanation: 'Bei gleicher Basis werden die Exponenten addiert.',
        },
        {
          name: 'Division (gleiche Basis)',
          formula: 'a^n : a^m = a^(n-m)',
          example: '5^9 : 5^4 = 5^5 = 3125',
          explanation: 'Bei gleicher Basis werden die Exponenten subtrahiert.',
        },
        {
          name: 'Potenzieren von Potenzen',
          formula: '(a^n)^m = a^(n·m)',
          example: '(2^3)^4 = 2^12 = 4096',
          explanation: 'Beim Potenzieren werden die Exponenten multipliziert.',
        },
        {
          name: 'Produkt potenzieren',
          formula: '(a·b)^n = a^n · b^n',
          example: '(3·4)^2 = 3^2 · 4^2 = 9·16 = 144',
          explanation: 'Jeder Faktor wird einzeln potenziert.',
        },
        {
          name: 'Quotient potenzieren',
          formula: '(a/b)^n = a^n / b^n',
          example: '(6/2)^3 = 6^3 / 2^3 = 216/8 = 27',
          explanation: 'Zähler und Nenner werden einzeln potenziert.',
        },
      ],
    },
    {
      title: 'Negative Exponenten',
      formulas: [
        {
          name: 'Definition',
          formula: 'a^(-n) = 1/(a^n)',
          example: '2^(-3) = 1/2^3 = 1/8',
          explanation: 'Negativer Exponent bedeutet Kehrwert.',
        },
        {
          name: 'Bruch mit negativem Exponenten',
          formula: '(a/b)^(-n) = (b/a)^n',
          example: '(2/3)^(-2) = (3/2)^2 = 9/4',
          explanation: 'Negativer Exponent kehrt den Bruch um.',
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
 * Kombinierte Formelsammlung
 */
export const FORMELSAMMLUNG_CONTENT: FormelsammlungContent[] = [
  POTENZEN_FORMELSAMMLUNG,
  QUADRATISCH_FORMELSAMMLUNG,
];

