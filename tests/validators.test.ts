import { describe, it, expect } from 'vitest';
import { sanitizeMathInput } from '../utils/inputSanitizer';
import {
  sanitizeNumberInput,
  matchKeywords,
  parseCoordinatePair,
  validateAnswer,
} from '../utils/answerValidators';

describe('Input Sanitization', () => {
  it('should sanitize clean numeric input', () => {
    expect(sanitizeMathInput('64')).toBe('64');
    expect(sanitizeMathInput('123')).toBe('123');
  });

  it('should remove whitespace', () => {
    expect(sanitizeMathInput(' 64 ')).toBe('64');
    expect(sanitizeMathInput('64 0')).toBe('640');
  });

  it('should replace comma with dot', () => {
    expect(sanitizeMathInput('64,0')).toBe('64.0');
    expect(sanitizeMathInput('12,5')).toBe('12.5');
  });

  it('should remove currency symbols', () => {
    expect(sanitizeMathInput('€64')).toBe('64');
    expect(sanitizeMathInput('64€')).toBe('64');
    expect(sanitizeMathInput('$64')).toBe('64');
  });

  it('should preserve minus sign', () => {
    expect(sanitizeMathInput('-64')).toBe('-64');
    expect(sanitizeMathInput('-12.5')).toBe('-12.5');
  });

  it('should handle empty input', () => {
    expect(sanitizeMathInput('')).toBe('');
    expect(sanitizeMathInput('   ')).toBe('');
  });
});

describe('MultiAngleThrow Hit Calculation', () => {
  const tolerance = 5;

  const isHit = (angle: number, target: number, tol: number = tolerance): boolean => {
    return Math.abs(angle - target) <= tol;
  };

  it('should detect hits within tolerance', () => {
    expect(isHit(45, 45)).toBe(true);
    expect(isHit(44, 45)).toBe(true);
    expect(isHit(46, 45)).toBe(true);
    expect(isHit(40, 45)).toBe(true);
    expect(isHit(50, 45)).toBe(true);
  });

  it('should detect misses outside tolerance', () => {
    expect(isHit(39, 45)).toBe(false);
    expect(isHit(51, 45)).toBe(false);
    expect(isHit(30, 45)).toBe(false);
  });

  it('should handle boundary cases', () => {
    expect(isHit(45 + tolerance, 45)).toBe(true);
    expect(isHit(45 - tolerance, 45)).toBe(true);
    expect(isHit(45 + tolerance + 0.1, 45)).toBe(false);
    expect(isHit(45 - tolerance - 0.1, 45)).toBe(false);
  });
});

describe('SliderTransform Tolerance', () => {
  const tolerance = 0.1;

  const isCorrect = (value: number, target: number, tol: number = tolerance): boolean => {
    const currentValue = Math.round(value * 10) / 10;
    const targetValue = Math.round(target * 10) / 10;
    return Math.abs(currentValue - targetValue) <= tol + 1e-6;
  };

  it('should accept values within tolerance', () => {
    expect(isCorrect(2.0, 2.0)).toBe(true);
    expect(isCorrect(1.9, 2.0)).toBe(true);
    expect(isCorrect(2.1, 2.0)).toBe(true);
    expect(isCorrect(2.05, 2.0)).toBe(true);
  });

  it('should reject values outside tolerance', () => {
    expect(isCorrect(2.2, 2.0)).toBe(false);
    expect(isCorrect(1.8, 2.0)).toBe(false);
    expect(isCorrect(2.15, 2.0)).toBe(false);
  });

  it('should handle boundary cases', () => {
    expect(isCorrect(2.0 + tolerance, 2.0)).toBe(true);
    expect(isCorrect(2.0 - tolerance, 2.0)).toBe(true);
    expect(isCorrect(2.0 + tolerance + 0.1, 2.0)).toBe(false);
  });
});

describe('AngleMeasure Tolerance', () => {
  const tolerance = 5;

  const isCorrect = (userAngle: number, correctAngle: number, tol: number = tolerance): boolean => {
    return Math.abs(userAngle - correctAngle) <= tol;
  };

  it('should accept angles within ±5°', () => {
    expect(isCorrect(90, 90)).toBe(true);
    expect(isCorrect(85, 90)).toBe(true);
    expect(isCorrect(95, 90)).toBe(true);
    expect(isCorrect(88, 90)).toBe(true);
  });

  it('should reject angles outside tolerance', () => {
    expect(isCorrect(84, 90)).toBe(false);
    expect(isCorrect(96, 90)).toBe(false);
    expect(isCorrect(100, 90)).toBe(false);
  });
});

describe('DragDrop Classification', () => {
  const validateClassification = (
    classification: Record<string, string>,
    correctAnswer: Record<string, string>
  ): boolean => {
    return Object.keys(correctAnswer).every(
      key => classification[key] === correctAnswer[key]
    );
  };

  it('should validate correct classification', () => {
    const classification = {
      square: 'quadrat',
      rect: 'rechteck',
      rhombus: 'raute',
      para: 'parallelogramm',
      trapez: 'viereck'
    };
    const correctAnswer = {
      square: 'quadrat',
      rect: 'rechteck',
      rhombus: 'raute',
      para: 'parallelogramm',
      trapez: 'viereck'
    };
    expect(validateClassification(classification, correctAnswer)).toBe(true);
  });

  it('should reject incorrect classification', () => {
    const classification = {
      square: 'rechteck', // Wrong
      rect: 'rechteck',
      rhombus: 'raute',
      para: 'parallelogramm',
      trapez: 'viereck'
    };
    const correctAnswer = {
      square: 'quadrat',
      rect: 'rechteck',
      rhombus: 'raute',
      para: 'parallelogramm',
      trapez: 'viereck'
    };
    expect(validateClassification(classification, correctAnswer)).toBe(false);
  });
});

describe('Answer Validators', () => {
  it('sanitizes numeric input with commas and spaces', () => {
    expect(sanitizeNumberInput(' 12,5 ')).toBe(12.5);
    expect(sanitizeNumberInput(' -7.4 ')).toBe(-7.4);
  });

  it('matches keywords with negation', () => {
    expect(matchKeywords('Keine rechten Winkel vorhanden', ['rechten winkel'])).toBe(true);
    expect(matchKeywords('hat rechte Winkel', ['rechte winkel'], 'any')).toBe(true);
  });

  it('parses coordinate pairs from different formats', () => {
    expect(parseCoordinatePair(' (3|4) ')).toEqual({ x: 3, y: 4 });
    expect(parseCoordinatePair('3,4 5,6')).toEqual({ x: 3.4, y: 5.6 });
  });

  it('validates keyword answers with negation requirement', () => {
    const config = {
      type: 'keywords' as const,
      keywordsAny: ['rechten winkel'],
      requireNegation: true,
    };
    expect(validateAnswer('Keine rechten Winkel!', config)).toBe(true);
    expect(validateAnswer('Hat rechte Winkel', config)).toBe(false);
  });

  it('validates numeric tolerance answers', () => {
    const config = { type: 'numericTolerance' as const, numericAnswer: 6280, tolerance: 10 };
    expect(validateAnswer('6285', config)).toBe(true);
    expect(validateAnswer('6250', config)).toBe(false);
  });

  it('validates coordinate pairs', () => {
    const config = {
      type: 'coordinatePair' as const,
      coordinateAnswer: { x: 3, y: 4 },
      coordinateTolerance: 0.1,
    };
    expect(validateAnswer('3|4', config)).toBe(true);
    expect(validateAnswer('2|4', config)).toBe(false);
  });

  it('validates equations via pattern match', () => {
    const config = {
      type: 'equation' as const,
      equationPatterns: ['x(x+5)=300', 'x^2+5x-300=0'],
    };
    expect(validateAnswer('x(x+5)=300', config)).toBe(true);
    expect(validateAnswer('x(x+3)=0', config)).toBe(false);
  });
});

