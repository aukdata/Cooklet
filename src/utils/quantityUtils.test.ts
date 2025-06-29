import { describe, it, expect } from 'vitest';
import {
  Quantity,
  normalizeAmount,
  getBaseUnit,
  convertToBaseUnit,
  areUnitsCompatible,
  addQuantities,
  subtractQuantities,
  areQuantitiesEqual,
  compareQuantities,
  formatQuantityForDisplay,
  isValidQuantity,
  getUnitGroups,
  UNIT_CONVERSIONS
} from './quantityUtils';

describe('quantityUtils', () => {
  
  describe('normalizeAmount', () => {
    it('should normalize basic numeric strings', () => {
      expect(normalizeAmount('100')).toBe(100);
      expect(normalizeAmount('2.5')).toBe(2.5);
      expect(normalizeAmount('0')).toBe(0);
    });

    it('should normalize fractions', () => {
      expect(normalizeAmount('1/2')).toBe(0.5);
      expect(normalizeAmount('3/4')).toBe(0.75);
      expect(normalizeAmount('2 1/2')).toBe(2.5);
    });

    it('should return 0 for non-numeric expressions as per PLAN.md spec', () => {
      expect(normalizeAmount('適量')).toBe(0);
      expect(normalizeAmount('少々')).toBe(0);
      expect(normalizeAmount('ひとつまみ')).toBe(0);
      expect(normalizeAmount('お好み')).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(normalizeAmount('')).toBe(0);
      expect(normalizeAmount('   ')).toBe(0);
      expect(normalizeAmount('abc')).toBe(0);
    });
  });

  describe('getBaseUnit', () => {
    it('should return correct base units for weight system', () => {
      expect(getBaseUnit('g')).toBe('g');
      expect(getBaseUnit('kg')).toBe('g');
    });

    it('should return correct base units for volume system', () => {
      expect(getBaseUnit('mL')).toBe('mL');
      expect(getBaseUnit('L')).toBe('mL');
      expect(getBaseUnit('大さじ')).toBe('mL');
      expect(getBaseUnit('小さじ')).toBe('mL');
      expect(getBaseUnit('カップ')).toBe('mL');
    });

    it('should return base unit for individual units', () => {
      expect(getBaseUnit('個')).toBe('個');
      expect(getBaseUnit('本')).toBe('本');
      expect(getBaseUnit('枚')).toBe('枚');
    });

    it('should return null for unknown units', () => {
      expect(getBaseUnit('unknown')).toBeNull();
      expect(getBaseUnit('xyz')).toBeNull();
    });
  });

  describe('convertToBaseUnit', () => {
    it('should convert weight units correctly', () => {
      expect(convertToBaseUnit(1, 'kg')).toEqual({ amount: 1000, unit: 'g' });
      expect(convertToBaseUnit(500, 'g')).toEqual({ amount: 500, unit: 'g' });
    });

    it('should convert volume units correctly', () => {
      expect(convertToBaseUnit(1, 'L')).toEqual({ amount: 1000, unit: 'mL' });
      expect(convertToBaseUnit(1, '大さじ')).toEqual({ amount: 15, unit: 'mL' });
      expect(convertToBaseUnit(1, '小さじ')).toEqual({ amount: 5, unit: 'mL' });
      expect(convertToBaseUnit(1, 'カップ')).toEqual({ amount: 200, unit: 'mL' });
    });

    it('should return null for unknown units', () => {
      expect(convertToBaseUnit(1, 'unknown')).toBeNull();
    });
  });

  describe('areUnitsCompatible', () => {
    it('should return true for compatible weight units', () => {
      expect(areUnitsCompatible('g', 'kg')).toBe(true);
      expect(areUnitsCompatible('kg', 'g')).toBe(true);
    });

    it('should return true for compatible volume units', () => {
      expect(areUnitsCompatible('mL', 'L')).toBe(true);
      expect(areUnitsCompatible('大さじ', '小さじ')).toBe(true);
      expect(areUnitsCompatible('カップ', 'mL')).toBe(true);
    });

    it('should return false for incompatible units as per PLAN.md spec', () => {
      expect(areUnitsCompatible('g', 'mL')).toBe(false);
      expect(areUnitsCompatible('個', 'g')).toBe(false);
      expect(areUnitsCompatible('本', 'mL')).toBe(false);
    });

    it('should return true for same individual units', () => {
      expect(areUnitsCompatible('個', '個')).toBe(true);
      expect(areUnitsCompatible('本', '本')).toBe(true);
    });

    it('should return false for different individual units', () => {
      expect(areUnitsCompatible('個', '本')).toBe(false);
      expect(areUnitsCompatible('枚', '缶')).toBe(false);
    });

    it('should handle unknown units', () => {
      expect(areUnitsCompatible('unknown', 'g')).toBe(false);
      expect(areUnitsCompatible('g', 'unknown')).toBe(false);
    });
  });

  describe('addQuantities', () => {
    it('should add compatible weight quantities', () => {
      const q1: Quantity = { amount: '500', unit: 'g' };
      const q2: Quantity = { amount: '1', unit: 'kg' };
      const result = addQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '1500', unit: 'g' });
    });

    it('should add compatible volume quantities', () => {
      const q1: Quantity = { amount: '1', unit: '大さじ' };
      const q2: Quantity = { amount: '1', unit: '小さじ' };
      const result = addQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '20', unit: 'mL' });
    });

    it('should add fractions correctly', () => {
      const q1: Quantity = { amount: '1/2', unit: 'カップ' };
      const q2: Quantity = { amount: '1/4', unit: 'カップ' };
      const result = addQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '150', unit: 'mL' }); // 0.5 * 200 + 0.25 * 200 = 150mL
    });

    it('should return null for incompatible units as per PLAN.md spec', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '1', unit: '個' };
      const result = addQuantities(q1, q2);
      
      expect(result).toBeNull();
    });

    it('should handle "適量" expressions as 0', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '適量', unit: 'g' };
      const result = addQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '100', unit: 'g' }); // 100 + 0 = 100
    });

    it('should handle same individual units', () => {
      const q1: Quantity = { amount: '2', unit: '個' };
      const q2: Quantity = { amount: '3', unit: '個' };
      const result = addQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '5', unit: '個' });
    });
  });

  describe('subtractQuantities', () => {
    it('should subtract compatible weight quantities', () => {
      const q1: Quantity = { amount: '1', unit: 'kg' };
      const q2: Quantity = { amount: '300', unit: 'g' };
      const result = subtractQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '700', unit: 'g' }); // 1000 - 300 = 700
    });

    it('should subtract compatible volume quantities', () => {
      const q1: Quantity = { amount: '1', unit: 'カップ' };
      const q2: Quantity = { amount: '2', unit: '大さじ' };
      const result = subtractQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '170', unit: 'mL' }); // 200 - 30 = 170
    });

    it('should allow negative results', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '150', unit: 'g' };
      const result = subtractQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '-50', unit: 'g' });
    });

    it('should return null for incompatible units', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '1', unit: '個' };
      const result = subtractQuantities(q1, q2);
      
      expect(result).toBeNull();
    });

    it('should handle "適量" expressions as 0', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '適量', unit: 'g' };
      const result = subtractQuantities(q1, q2);
      
      expect(result).toEqual({ amount: '100', unit: 'g' }); // 100 - 0 = 100
    });
  });

  describe('areQuantitiesEqual', () => {
    it('should return true for equal quantities in same units', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '100', unit: 'g' };
      
      expect(areQuantitiesEqual(q1, q2)).toBe(true);
    });

    it('should return true for equal quantities in different but compatible units', () => {
      const q1: Quantity = { amount: '1', unit: 'kg' };
      const q2: Quantity = { amount: '1000', unit: 'g' };
      
      expect(areQuantitiesEqual(q1, q2)).toBe(true);
    });

    it('should return true for equal fractions', () => {
      const q1: Quantity = { amount: '1/2', unit: 'カップ' };
      const q2: Quantity = { amount: '100', unit: 'mL' };
      
      expect(areQuantitiesEqual(q1, q2)).toBe(true); // 0.5 * 200 = 100
    });

    it('should return false for different quantities', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '200', unit: 'g' };
      
      expect(areQuantitiesEqual(q1, q2)).toBe(false);
    });

    it('should return false for incompatible units', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '1', unit: '個' };
      
      expect(areQuantitiesEqual(q1, q2)).toBe(false);
    });
  });

  describe('compareQuantities', () => {
    it('should return 1 when q1 > q2', () => {
      const q1: Quantity = { amount: '200', unit: 'g' };
      const q2: Quantity = { amount: '100', unit: 'g' };
      
      expect(compareQuantities(q1, q2)).toBe(1);
    });

    it('should return -1 when q1 < q2', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '1', unit: 'kg' };
      
      expect(compareQuantities(q1, q2)).toBe(-1); // 100g < 1000g
    });

    it('should return 0 when q1 == q2', () => {
      const q1: Quantity = { amount: '1', unit: 'kg' };
      const q2: Quantity = { amount: '1000', unit: 'g' };
      
      expect(compareQuantities(q1, q2)).toBe(0);
    });

    it('should return null for incompatible units', () => {
      const q1: Quantity = { amount: '100', unit: 'g' };
      const q2: Quantity = { amount: '1', unit: '個' };
      
      expect(compareQuantities(q1, q2)).toBeNull();
    });
  });

  describe('formatQuantityForDisplay', () => {
    it('should format integer amounts without decimals', () => {
      const q: Quantity = { amount: '100', unit: 'g' };
      expect(formatQuantityForDisplay(q)).toBe('100g');
    });

    it('should format decimal amounts with appropriate precision', () => {
      const q: Quantity = { amount: '1.5', unit: 'kg' };
      expect(formatQuantityForDisplay(q)).toBe('1.5kg');
    });

    it('should handle unit-less quantities', () => {
      const q: Quantity = { amount: '2', unit: '-' };
      expect(formatQuantityForDisplay(q)).toBe('2');
    });

    it('should remove trailing zeros', () => {
      const q: Quantity = { amount: '1.50', unit: 'L' };
      expect(formatQuantityForDisplay(q)).toBe('1.5L');
    });

    it('should handle fractions', () => {
      const q: Quantity = { amount: '1/2', unit: 'カップ' };
      expect(formatQuantityForDisplay(q)).toBe('0.5カップ');
    });
  });

  describe('isValidQuantity', () => {
    it('should return true for valid numeric quantities', () => {
      const q: Quantity = { amount: '100', unit: 'g' };
      expect(isValidQuantity(q)).toBe(true);
    });

    it('should return true for zero quantities', () => {
      const q: Quantity = { amount: '0', unit: 'g' };
      expect(isValidQuantity(q)).toBe(true);
    });

    it('should return false for negative quantities', () => {
      const q: Quantity = { amount: '-100', unit: 'g' };
      expect(isValidQuantity(q)).toBe(false);
    });

    it('should return false for unknown units', () => {
      const q: Quantity = { amount: '100', unit: 'unknown' };
      expect(isValidQuantity(q)).toBe(false);
    });

    it('should return true for "適量" expressions (normalized to 0)', () => {
      const q: Quantity = { amount: '適量', unit: 'g' };
      expect(isValidQuantity(q)).toBe(true);
    });
  });

  describe('getUnitGroups', () => {
    it('should group units by base unit', () => {
      const groups = getUnitGroups();
      
      expect(groups['g']).toContain('g');
      expect(groups['g']).toContain('kg');
      
      expect(groups['mL']).toContain('mL');
      expect(groups['mL']).toContain('L');
      expect(groups['mL']).toContain('大さじ');
      expect(groups['mL']).toContain('小さじ');
      expect(groups['mL']).toContain('カップ');
      
      expect(groups['個']).toContain('個');
      expect(groups['本']).toContain('本');
    });
  });

  describe('UNIT_CONVERSIONS validation', () => {
    it('should contain all expected weight units', () => {
      expect(UNIT_CONVERSIONS['g']).toEqual({ baseUnit: 'g', factor: 1 });
      expect(UNIT_CONVERSIONS['kg']).toEqual({ baseUnit: 'g', factor: 1000 });
    });

    it('should contain all expected volume units', () => {
      expect(UNIT_CONVERSIONS['mL']).toEqual({ baseUnit: 'mL', factor: 1 });
      expect(UNIT_CONVERSIONS['L']).toEqual({ baseUnit: 'mL', factor: 1000 });
      expect(UNIT_CONVERSIONS['大さじ']).toEqual({ baseUnit: 'mL', factor: 15 });
      expect(UNIT_CONVERSIONS['小さじ']).toEqual({ baseUnit: 'mL', factor: 5 });
      expect(UNIT_CONVERSIONS['カップ']).toEqual({ baseUnit: 'mL', factor: 200 });
    });

    it('should contain individual units with factor 1', () => {
      expect(UNIT_CONVERSIONS['個']).toEqual({ baseUnit: '個', factor: 1 });
      expect(UNIT_CONVERSIONS['本']).toEqual({ baseUnit: '本', factor: 1 });
      expect(UNIT_CONVERSIONS['枚']).toEqual({ baseUnit: '枚', factor: 1 });
    });
  });

  // エッジケースのテスト（PLAN.mdで要求された包括的なテスト）
  describe('Edge cases as per PLAN.md requirements', () => {
    describe('non-numeric expressions', () => {
      it('should handle "適量" in addition', () => {
        const q1: Quantity = { amount: '適量', unit: 'g' };
        const q2: Quantity = { amount: '適量', unit: 'g' };
        const result = addQuantities(q1, q2);
        
        expect(result).toEqual({ amount: '0', unit: 'g' }); // 0 + 0 = 0
      });

      it('should handle mixed numeric and non-numeric in subtraction', () => {
        const q1: Quantity = { amount: '200', unit: 'g' };
        const q2: Quantity = { amount: '少々', unit: 'g' };
        const result = subtractQuantities(q1, q2);
        
        expect(result).toEqual({ amount: '200', unit: 'g' }); // 200 - 0 = 200
      });
    });

    describe('unit incompatibility', () => {
      it('should handle cross-category incompatibility', () => {
        const incompatiblePairs = [
          [{ amount: '100', unit: 'g' }, { amount: '1', unit: '個' }],
          [{ amount: '200', unit: 'mL' }, { amount: '2', unit: '枚' }],
          [{ amount: '1', unit: 'カップ' }, { amount: '5', unit: '本' }]
        ];

        incompatiblePairs.forEach(([q1, q2]) => {
          expect(addQuantities(q1 as Quantity, q2 as Quantity)).toBeNull();
          expect(subtractQuantities(q1 as Quantity, q2 as Quantity)).toBeNull();
          expect(areQuantitiesEqual(q1 as Quantity, q2 as Quantity)).toBe(false);
          expect(compareQuantities(q1 as Quantity, q2 as Quantity)).toBeNull();
        });
      });
    });

    describe('precision and rounding', () => {
      it('should handle floating point precision in equality', () => {
        const q1: Quantity = { amount: '0.1', unit: 'g' };
        const q2: Quantity = { amount: '0.1', unit: 'g' };
        
        expect(areQuantitiesEqual(q1, q2)).toBe(true);
      });

      it('should handle very small differences', () => {
        // これは実際の計算で起こりうる浮動小数点誤差をテスト
        const q1: Quantity = { amount: '0.1', unit: 'g' };
        const q2: Quantity = { amount: '0.1', unit: 'g' };
        const q3: Quantity = { amount: '0.1', unit: 'g' };
        
        // 0.1 + 0.1 + 0.1 の計算
        const intermediate = addQuantities(q1, q2);
        const result = intermediate ? addQuantities(intermediate, q3) : null;
        
        expect(result).not.toBeNull();
        expect(parseFloat(result!.amount)).toBeCloseTo(0.3, 10);
      });
    });

    describe('extreme values', () => {
      it('should handle very large numbers', () => {
        const q1: Quantity = { amount: '999999', unit: 'g' };
        const q2: Quantity = { amount: '1', unit: 'g' };
        const result = addQuantities(q1, q2);
        
        expect(result).toEqual({ amount: '1000000', unit: 'g' });
      });

      it('should handle very small fractions', () => {
        const q1: Quantity = { amount: '1/1000', unit: 'g' };
        const q2: Quantity = { amount: '1/1000', unit: 'g' };
        const result = addQuantities(q1, q2);
        
        expect(result).toEqual({ amount: '0.002', unit: 'g' });
      });
    });

    describe('mixed case and alternative spellings', () => {
      it('should handle lowercase volume units', () => {
        const q1: Quantity = { amount: '500', unit: 'ml' };
        const q2: Quantity = { amount: '1', unit: 'l' };
        const result = addQuantities(q1, q2);
        
        expect(result).toEqual({ amount: '1500', unit: 'mL' });
      });
    });
  });
});