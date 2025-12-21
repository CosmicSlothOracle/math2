import { InputValidatorConfig } from '../types';
import { sanitizeMathInput } from './inputSanitizer';

const NEGATION_WORDS = ['nicht', 'kein', 'keine', 'keiner', 'keines', 'ohne'];

export function sanitizeNumberInput(raw: string): number | null {
  const sanitized = sanitizeMathInput(raw);
  if (!sanitized) return null;
  const num = parseFloat(sanitized);
  return Number.isFinite(num) ? num : null;
}

export function matchKeywords(text: string, keywords: string[], mode: 'any' | 'all' = 'all'): boolean {
  if (!keywords || keywords.length === 0) return true;
  const normalized = normalizeText(text);
  const checks = keywords.map(keyword => normalized.includes(keyword.toLowerCase()));
  return mode === 'all' ? checks.every(Boolean) : checks.some(Boolean);
}

export function hasNegation(text: string): boolean {
  const normalized = normalizeText(text);
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

function normalizeText(value: string): string {
  return (value || '').toString().trim().toLowerCase();
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
      const normalized = normalizeText(value);
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
      const sanitized = normalizeText(value).replace(/\s+/g, '');
      return config.equationPatterns.some(pattern => sanitized.includes(pattern.toLowerCase()));
    }
    default:
      return false;
  }
}

