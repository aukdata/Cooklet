import { describe, it, expect } from 'vitest';
import {
  quantityToString,
  quantityToDisplay
} from './quantityDisplay';
import type { Quantity } from '../types';

describe('quantityDisplay', () => {
  
  describe('quantityToString', () => {
    it('should convert basic quantity to string', () => {
      const quantity: Quantity = { amount: '100', unit: 'g' };
      expect(quantityToString(quantity)).toBe('100g');
    });

    it('should handle quantity without unit', () => {
      const quantity: Quantity = { amount: '5', unit: '' };
      expect(quantityToString(quantity)).toBe('5');
    });

    it('should handle quantity with unit "-"', () => {
      const quantity: Quantity = { amount: '3', unit: '-' };
      expect(quantityToString(quantity)).toBe('3-');
    });

    it('should handle empty amount', () => {
      const quantity: Quantity = { amount: '', unit: 'kg' };
      expect(quantityToString(quantity)).toBe('');
    });

    it('should handle null/undefined amount', () => {
      // テスト用の不正なデータ構造（実際の型安全な実装では発生しない）
      const quantity1: Quantity = { amount: null as unknown as string, unit: 'mL' };
      const quantity2: Quantity = { amount: undefined as unknown as string, unit: 'L' };
      
      expect(quantityToString(quantity1)).toBe('');
      expect(quantityToString(quantity2)).toBe('');
    });

    it('should handle fraction amounts', () => {
      const quantity: Quantity = { amount: '1/2', unit: 'カップ' };
      expect(quantityToString(quantity)).toBe('1/2カップ');
    });

    it('should handle decimal amounts', () => {
      const quantity: Quantity = { amount: '2.5', unit: 'kg' };
      expect(quantityToString(quantity)).toBe('2.5kg');
    });

    it('should handle Japanese cooking units', () => {
      const quantities: Quantity[] = [
        { amount: '1', unit: '大さじ' },
        { amount: '2', unit: '小さじ' },
        { amount: '200', unit: 'mL' },
        { amount: '1', unit: 'L' }
      ];

      expect(quantityToString(quantities[0])).toBe('1大さじ');
      expect(quantityToString(quantities[1])).toBe('2小さじ');
      expect(quantityToString(quantities[2])).toBe('200mL');
      expect(quantityToString(quantities[3])).toBe('1L');
    });

    it('should handle non-numeric expressions', () => {
      const quantities: Quantity[] = [
        { amount: '適量', unit: 'g' },
        { amount: '少々', unit: '' },
        { amount: 'お好み', unit: '-' },
        { amount: 'ひとつまみ', unit: '塩' }
      ];

      expect(quantityToString(quantities[0])).toBe('適量g');
      expect(quantityToString(quantities[1])).toBe('少々');
      expect(quantityToString(quantities[2])).toBe('お好み-');
      expect(quantityToString(quantities[3])).toBe('ひとつまみ塩');
    });

    it('should handle individual count units', () => {
      const quantities: Quantity[] = [
        { amount: '2', unit: '個' },
        { amount: '1', unit: '本' },
        { amount: '3', unit: '枚' },
        { amount: '1', unit: '缶' },
        { amount: '2', unit: 'パック' }
      ];

      quantities.forEach(quantity => {
        const expected = `${quantity.amount}${quantity.unit}`;
        expect(quantityToString(quantity)).toBe(expected);
      });
    });
  });

  describe('quantityToDisplay', () => {
    it('should work same as quantityToString', () => {
      const quantity: Quantity = { amount: '150', unit: 'g' };
      
      expect(quantityToDisplay(quantity)).toBe(quantityToString(quantity));
      expect(quantityToDisplay(quantity)).toBe('150g');
    });

    it('should handle all same cases as quantityToString', () => {
      const testCases: Quantity[] = [
        { amount: '100', unit: 'g' },
        { amount: '1/2', unit: 'カップ' },
        { amount: '適量', unit: '' },
        { amount: '', unit: 'kg' },
        { amount: '2.5', unit: 'L' }
      ];

      testCases.forEach(quantity => {
        expect(quantityToDisplay(quantity)).toBe(quantityToString(quantity));
      });
    });
  });

  // エッジケースのテスト
  describe('Edge cases', () => {
    it('should handle very long amounts', () => {
      const quantity: Quantity = { 
        amount: '123456789.123456789', 
        unit: 'g' 
      };
      
      expect(quantityToString(quantity)).toBe('123456789.123456789g');
    });

    it('should handle special characters in amount', () => {
      const quantities: Quantity[] = [
        { amount: '1-2', unit: 'g' },
        { amount: '約100', unit: 'mL' },
        { amount: '100～200', unit: 'g' }
      ];

      expect(quantityToString(quantities[0])).toBe('1-2g');
      expect(quantityToString(quantities[1])).toBe('約100mL');
      expect(quantityToString(quantities[2])).toBe('100～200g');
    });

    it('should handle special characters in unit', () => {
      const quantities: Quantity[] = [
        { amount: '100', unit: 'g/mL' },
        { amount: '1', unit: '個(大)' },
        { amount: '2', unit: '人分' }
      ];

      expect(quantityToString(quantities[0])).toBe('100g/mL');
      expect(quantityToString(quantities[1])).toBe('1個(大)');
      expect(quantityToString(quantities[2])).toBe('2人分');
    });

    it('should handle whitespace in amount and unit', () => {
      const quantities: Quantity[] = [
        { amount: ' 100 ', unit: ' g ' },
        { amount: '1 1/2', unit: 'カップ' },
        { amount: '2', unit: '' }
      ];

      expect(quantityToString(quantities[0])).toBe(' 100  g ');
      expect(quantityToString(quantities[1])).toBe('1 1/2カップ');
      expect(quantityToString(quantities[2])).toBe('2');
    });

    it('should handle zero values', () => {
      const quantities: Quantity[] = [
        { amount: '0', unit: 'g' },
        { amount: '0.0', unit: 'mL' },
        { amount: '0', unit: '' }
      ];

      expect(quantityToString(quantities[0])).toBe('0g');
      expect(quantityToString(quantities[1])).toBe('0.0mL');
      expect(quantityToString(quantities[2])).toBe('0');
    });
  });

  // パフォーマンステスト
  describe('Performance', () => {
    it('should handle large number of conversions efficiently', () => {
      const quantities = Array.from({ length: 10000 }, (_, i) => ({
        amount: `${i}`,
        unit: 'g'
      }));

      const start = performance.now();
      quantities.forEach(quantity => quantityToString(quantity));
      const end = performance.now();

      // 10000回の変換が50ms以内で完了
      expect(end - start).toBeLessThan(50);
    });

    it('should have consistent performance for different input types', () => {
      const testCases = [
        { amount: '100', unit: 'g' },
        { amount: '1/2', unit: 'カップ' },
        { amount: '適量', unit: '' },
        { amount: '2.5', unit: '大さじ' }
      ];

      const iterations = 1000;
      const results: number[] = [];

      testCases.forEach(quantity => {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          quantityToString(quantity);
        }
        const end = performance.now();
        results.push(end - start);
      });

      // すべてのケースで処理時間が似ている（最大と最小の差が5倍以内）
      const max = Math.max(...results);
      const min = Math.min(...results);
      expect(max / min).toBeLessThan(5);
    });
  });

  // 型安全性のテスト
  describe('Type safety', () => {
    it('should handle Quantity interface correctly', () => {
      // TypeScript型チェックのテスト
      const quantity: Quantity = {
        amount: '100',
        unit: 'g'
      };

      const result = quantityToString(quantity);
      expect(typeof result).toBe('string');
    });

    it('should work with partial Quantity objects', () => {
      // 必須プロパティのみのテスト
      const minimalQuantity = {
        amount: '50',
        unit: 'mL'
      } as Quantity;

      expect(quantityToString(minimalQuantity)).toBe('50mL');
    });
  });
});