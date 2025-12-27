/**
 * Parses a fraction string (e.g., "1/216", "3/4") to a decimal number
 *
 * @param raw - Raw input string that might contain a fraction
 * @returns Parsed number or NaN if invalid
 */
function parseFraction(raw: string): number | null {
  // Match fraction pattern: optional minus, digits, /, digits
  const fractionPattern = /^(-?\d+)\s*\/\s*(\d+)$/;
  const match = raw.trim().match(fractionPattern);

  if (match) {
    const numerator = parseFloat(match[1]);
    const denominator = parseFloat(match[2]);

    if (denominator === 0) return null; // Division by zero
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;

    return numerator / denominator;
  }

  return null;
}

/**
 * Sanitizes math input by removing formatting, currency symbols, and normalizing decimals
 * Also handles fraction notation (e.g., "1/216")
 *
 * @param raw - Raw input string from user
 * @returns Sanitized numeric string (may contain decimal point, minus sign, or fraction)
 */
export function sanitizeMathInput(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  const trimmed = raw.trim();

  // Check if it's a fraction first (before sanitizing removes the slash)
  if (trimmed.includes('/')) {
    // Try to parse as fraction - if valid, keep it for fraction parsing
    const fractionMatch = trimmed.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (fractionMatch) {
      return trimmed.replace(/\s+/g, ''); // Remove whitespace but keep fraction format
    }
  }

  return trimmed
    .replace(/,/g, '.') // Replace comma with dot for decimal
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/[^\d.-]/g, ''); // Remove all non-numeric except dot and minus
}

/**
 * Converts sanitized input to number, handling edge cases and fractions
 *
 * @param sanitized - Sanitized string from sanitizeMathInput
 * @returns Parsed number or NaN if invalid
 */
export function parseMathInput(sanitized: string): number {
  if (!sanitized) return NaN;

  // Try parsing as fraction first
  const fractionResult = parseFraction(sanitized);
  if (fractionResult !== null) {
    return fractionResult;
  }

  // Otherwise parse as regular decimal
  const num = parseFloat(sanitized);
  return isNaN(num) ? NaN : num;
}

