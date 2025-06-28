import { describe, it, expect } from 'vitest';
import { parseQuantityString, fractionToDecimal, decimalToFraction } from './numberConverter';

describe('numberConverter', () => {
  describe('parseQuantityString', () => {
    it('should parse basic integers', () => {
      expect(parseQuantityString('1')).toBe(1);
      expect(parseQuantityString('2')).toBe(2);
      expect(parseQuantityString('10')).toBe(10);
    });

    it('should parse fractions', () => {
      expect(parseQuantityString('1/2')).toBe(0.5);
      expect(parseQuantityString('1/4')).toBe(0.25);
      expect(parseQuantityString('3/4')).toBe(0.75);
    });

    it('should parse addition expressions', () => {
      expect(parseQuantityString('1 + 1/2')).toBe(1.5);
      expect(parseQuantityString('2 + 1/4')).toBe(2.25);
    });

    it('should parse mixed fractions', () => {
      expect(parseQuantityString('2 1/2')).toBe(2.5);
      expect(parseQuantityString('1 3/4')).toBe(1.75);
    });

    it('should parse decimal numbers', () => {
      expect(parseQuantityString('1.5')).toBe(1.5);
      expect(parseQuantityString('2.25')).toBe(2.25);
    });

    it('should return null for ambiguous expressions', () => {
      expect(parseQuantityString('少々')).toBeNull();
      expect(parseQuantityString('')).toBeNull();
      expect(parseQuantityString('   ')).toBeNull();
      expect(parseQuantityString('ひとつまみ')).toBeNull();
      expect(parseQuantityString('適量')).toBeNull();
    });

    it('should return null for invalid inputs', () => {
      expect(parseQuantityString('abc')).toBeNull();
      expect(parseQuantityString('1/0')).toBeNull();
    });
  });

  describe('fractionToDecimal', () => {
    it('should convert fractions to decimals', () => {
      expect(fractionToDecimal(1, 2)).toBe(0.5);
      expect(fractionToDecimal(3, 4)).toBe(0.75);
    });

    it('should return null for division by zero', () => {
      expect(fractionToDecimal(1, 0)).toBeNull();
    });
  });

  describe('decimalToFraction', () => {
    it('should convert decimals to fraction strings', () => {
      expect(decimalToFraction(0.5)).toBe('1/2');
      expect(decimalToFraction(1.5)).toBe('1 1/2');
      expect(decimalToFraction(2)).toBe('2');
      expect(decimalToFraction(2.75)).toBe('2 3/4');
    });
  });
});