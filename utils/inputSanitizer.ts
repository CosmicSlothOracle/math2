/**
 * Sanitizes math input by removing formatting, currency symbols, and normalizing decimals
 *
 * @param raw - Raw input string from user
 * @returns Sanitized numeric string (may contain decimal point and minus sign)
 */
export function sanitizeMathInput(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    .trim()
    .replace(/,/g, '.') // Replace comma with dot for decimal
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/[^\d.-]/g, ''); // Remove all non-numeric except dot and minus
}

/**
 * Converts sanitized input to number, handling edge cases
 *
 * @param sanitized - Sanitized string from sanitizeMathInput
 * @returns Parsed number or NaN if invalid
 */
export function parseMathInput(sanitized: string): number {
  if (!sanitized) return NaN;
  const num = parseFloat(sanitized);
  return isNaN(num) ? NaN : num;
}

