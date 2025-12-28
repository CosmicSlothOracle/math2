import { describe, it, expect } from 'vitest';
const { containsSolution } = require('../src/lib/aiSafety');

describe('aiSafety.containsSolution', () => {
  it('detects explicit numeric answers', () => {
    expect(containsSolution('Die Lösung ist x = 5')).toBe(true);
    expect(containsSolution('Ergebnis: 42')).toBe(true);
  });

  it('detects step patterns', () => {
    expect(containsSolution('Schritt 1: addiere, Schritt 2: teile')).toBe(true);
  });

  it('does not flag explanatory text', () => {
    expect(containsSolution('Überlege, welche Formel angewendet werden kann.')).toBe(false);
    expect(containsSolution('Frage: Was ist bekannt?')).toBe(false);
  });
});


