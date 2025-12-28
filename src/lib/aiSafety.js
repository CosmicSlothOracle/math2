// Simple heuristic-based safety detector for AI responses.
// Returns true if text likely contains direct solutions or step-by-step final answers.
function containsSolution(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase();
  const numericAnswerPattern = /(?:\b(?:ergebnis|lösung|resultat|antwort)\b[:\s]*|(?:^|\s)(?:x|y|z)\s*=|=>|=\s*)([-+]?\d+(?:[.,]\d+)?|±\s*[-+]?\d+)/i;
  const equalsNumber = /(?:=|≈|==|⇒|=>)\s*[-+]?\d/;
  const stepPattern = /schritt\s*\d|step\s*\d|1\)|2\)|3\)|schritte/;
  const explicitSolve = /löse|berechne|calculate|solve|result/;

  if (numericAnswerPattern.test(t) || equalsNumber.test(t)) return true;
  if (stepPattern.test(t) && /\d/.test(t)) return true;
  if (explicitSolve.test(t) && /\d/.test(t)) return true;
  const eqCount = (t.match(/[=⇒=>]/g) || []).length;
  const numTokens = (t.match(/\d+/g) || []).length;
  if (eqCount >= 2 || numTokens >= 6) return true;
  return false;
}

// Export for CommonJS if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { containsSolution };
}
// Also expose on globalThis for ESM environments if needed
try {
  if (typeof globalThis !== 'undefined') {
    globalThis.containsSolution = containsSolution;
  }
} catch (e) {}


