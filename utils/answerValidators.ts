import { InputValidatorConfig } from '../types';
import { sanitizeMathInput } from './inputSanitizer';

const NEGATION_WORDS = ['nicht', 'kein', 'keine', 'keiner', 'keines', 'ohne'];
const MULTI_VALUE_SEPARATORS = /(?:\r?\n|;|,|\/|\||\s+-\s+|\s+–\s+)/;
const SYNONYM_RULES: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\brhomb(us|us)?\b/g, replacement: 'raute' },
  { pattern: /\brhombus\b/g, replacement: 'raute' },
  { pattern: /\bdiamond\b/g, replacement: 'raute' },
  { pattern: /\bparallelogram\b/g, replacement: 'parallelogramm' },
  { pattern: /\brectangle\b/g, replacement: 'rechteck' },
  { pattern: /\bsquare\b/g, replacement: 'quadrat' },
  { pattern: /\bcircle\b/g, replacement: 'kreis' },
  { pattern: /\bangle\b/g, replacement: 'winkel' },
  { pattern: /\bdegree(s)?\b/g, replacement: 'grad' },
];

export function normalizeTextAnswer(value: string): string {
  if (value === undefined || value === null) return '';

  let normalized = value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase();

  normalized = normalized.replace(/,/g, '.');
  normalized = normalized.replace(/[^a-z0-9°.=%+\-*/()| ]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();

  if (!normalized) return '';

  let withSynonyms = normalized;
  for (const { pattern, replacement } of SYNONYM_RULES) {
    withSynonyms = withSynonyms.replace(pattern, replacement);
  }

  return withSynonyms.replace(/\s+/g, ' ').trim();
}

export function sanitizeNumberInput(raw: string): number | null {
  const sanitized = sanitizeMathInput(raw);
  if (!sanitized) return null;
  const num = parseFloat(sanitized);
  return Number.isFinite(num) ? num : null;
}

export function matchKeywords(text: string, keywords: string[], mode: 'any' | 'all' = 'all'): boolean {
  if (!keywords || keywords.length === 0) return true;
  const normalized = normalizeTextAnswer(text);
  const normalizedKeywords = keywords.map(normalizeTextAnswer).filter(Boolean);
  const checks = normalizedKeywords.map(keyword => normalized.includes(keyword));
  return mode === 'all' ? checks.every(Boolean) : checks.some(Boolean);
}

export function hasNegation(text: string): boolean {
  const normalized = normalizeTextAnswer(text);
  return NEGATION_WORDS.some(word => normalized.includes(word));
}

export function parseCoordinatePair(raw: string): { x: number; y: number } | null {
  if (!raw) return null;
  const matches = raw.match(/-?\d+(?:[.,]\d+)?/g);
  if (!matches || matches.length < 2) {
    return null;
  }

  const [first, second] = matches;
  const x = sanitizeNumberInput(first.replace(',', '.'));
  const y = sanitizeNumberInput(second.replace(',', '.'));
  if (x === null || y === null) {
    return null;
  }
  return { x, y };
}

export function evaluateFreeformAnswer(
  userValue: string,
  correctAnswer: number | string
): { isMatch: boolean; missing: string[] } {
  const normalizedUser = normalizeTextAnswer(userValue);
  const expectedValues = flattenExpectedAnswers(correctAnswer).map(normalizeTextAnswer).filter(Boolean);

  if (!normalizedUser || expectedValues.length === 0) {
    return { isMatch: false, missing: expectedValues };
  }

  const expectedCounts: Record<string, number> = {};
  expectedValues.forEach(value => {
    expectedCounts[value] = (expectedCounts[value] || 0) + 1;
  });

  const missing: string[] = [];

  Object.entries(expectedCounts).forEach(([value, needed]) => {
    const occurrences = countOccurrences(normalizedUser, value);
    if (occurrences >= needed) {
      return;
    }
    if (value.includes(' ')) {
      const tokens = value.split(' ').filter(Boolean);
      const tokensMatch = tokens.every(token => normalizedUser.includes(token));
      if (tokensMatch) {
        return;
      }
    }
    missing.push(value);
  });

  return { isMatch: missing.length === 0, missing };
}

export function validateAnswer(value: string, config: InputValidatorConfig): boolean {
  if (!config) return false;
  switch (config.type) {
    case 'keywords': {
      if (!value) return false;
      if (config.requireNegation && !hasNegation(value)) return false;
      if (config.keywordsAll && !matchKeywords(value, config.keywordsAll, 'all')) return false;
      if (config.keywordsAny && !matchKeywords(value, config.keywordsAny, 'any')) return false;
      return true;
    }
    case 'boolean': {
      const normalized = normalizeTextAnswer(value);
      if (!normalized) return false;
      if (config.booleanExpected === 'false') {
        return ['falsch', 'false', 'nein', 'no', '0'].some(token => normalized.includes(token));
      }
      return ['wahr', 'true', 'richtig', 'ja', 'yes', '1'].some(token => normalized.includes(token));
    }
    case 'numeric': {
      const parsed = sanitizeNumberInput(value);
      if (parsed === null) return false;
      if (config.acceptedNumbers && config.acceptedNumbers.length > 0) {
        return config.acceptedNumbers.some(num => Math.abs(parsed - num) < 1e-9);
      }
      if (config.numericAnswer === undefined) return false;
      return Math.abs(parsed - config.numericAnswer) < 1e-9;
    }
    case 'numericTolerance': {
      const parsed = sanitizeNumberInput(value);
      if (parsed === null || config.numericAnswer === undefined) return false;
      const tolerance = config.tolerance ?? 0;
      return Math.abs(parsed - config.numericAnswer) <= tolerance;
    }
    case 'coordinatePair': {
      if (!config.coordinateAnswer) return false;
      const parsed = parseCoordinatePair(value);
      if (!parsed) return false;
      const tolerance = config.coordinateTolerance ?? 0;
      return (
        Math.abs(parsed.x - config.coordinateAnswer.x) <= tolerance &&
        Math.abs(parsed.y - config.coordinateAnswer.y) <= tolerance
      );
    }
    case 'equation': {
      if (!config.equationPatterns || config.equationPatterns.length === 0) return false;
      const sanitized = normalizeTextAnswer(value).replace(/\s+/g, '');
      return config.equationPatterns.some(pattern =>
        sanitized.includes(normalizeTextAnswer(pattern).replace(/\s+/g, ''))
      );
    }
    default:
      return false;
  }
}

function flattenExpectedAnswers(raw: unknown): string[] {
  if (raw === null || raw === undefined) return [];

  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return [String(raw)];
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return flattenExpectedAnswers(parsed);
      } catch {
        // treat as plain string fallback
      }
    }

    return splitAnswerValue(trimmed);
  }

  if (Array.isArray(raw)) {
    return raw.flatMap(item => flattenExpectedAnswers(item));
  }

  if (typeof raw === 'object') {
    return Object.values(raw as Record<string, unknown>).flatMap(value => flattenExpectedAnswers(value));
  }

  return [];
}

function splitAnswerValue(value: string): string[] {
  if (MULTI_VALUE_SEPARATORS.test(value)) {
    return value
      .split(MULTI_VALUE_SEPARATORS)
      .map(part => part.trim())
      .filter(Boolean);
  }

  if (/^[-\d\s°.]+$/.test(value)) {
    return value
      .split(/\s+/)
      .map(part => part.trim())
      .filter(Boolean);
  }

  return [value];
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const parts = haystack.split(needle);
  return Math.max(0, parts.length - 1);
}

