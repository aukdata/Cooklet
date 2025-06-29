import { describe, it, expect } from 'vitest';
import {
  NameNormalizationResult,
  normalizeProductName,
  normalizeReceiptItems,
  getNormalizationStats
} from './nameNormalizer';
import type { ReceiptItem } from '../lib/ai/types';
import type { Ingredient } from '../types';

describe('nameNormalizer', () => {
  // テスト用のモックデータ
  const mockIngredients: Ingredient[] = [
    {
      id: 1,
      user_id: 'user1',
      name: '牛乳',
      category: 'others',
      default_unit: 'mL',
      typical_price: 200,
      original_name: 'めいらく牛乳1000ml',
      conversion_quantity: '',
      conversion_unit: '',
      infinity: false,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      user_id: 'user1',
      name: '食パン',
      category: 'others',
      default_unit: '枚',
      typical_price: 150,
      original_name: 'ヤマザキ食パン6枚切り',
      conversion_quantity: '',
      conversion_unit: '',
      infinity: false,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 3,
      user_id: 'user1',
      name: 'トマト',
      category: 'vegetables',
      default_unit: '個',
      typical_price: 100,
      original_name: 'フルーツトマト',
      conversion_quantity: '',
      conversion_unit: '',
      infinity: false,
      created_at: '2025-01-01T00:00:00Z'
    }
  ];

  const createMockReceiptItem = (originalName: string, name?: string): ReceiptItem => ({
    originalName,
    name: name || originalName,
    quantity: '1',
    price: 200
  });

  describe('normalizeProductName', () => {
    it('should normalize with exact match', () => {
      const item = createMockReceiptItem('めいらく牛乳1000ml');
      const result = normalizeProductName(item, mockIngredients);

      expect(result.isNormalized).toBe(true);
      expect(result.item.name).toBe('牛乳');
      expect(result.matchedIngredient?.name).toBe('牛乳');
    });

    it('should normalize with partial match', () => {
      const item = createMockReceiptItem('ヤマザキ食パン');
      const result = normalizeProductName(item, mockIngredients);

      expect(result.isNormalized).toBe(true);
      expect(result.item.name).toBe('食パン');
      expect(result.matchedIngredient?.name).toBe('食パン');
    });

    it('should normalize with reverse partial match', () => {
      const item = createMockReceiptItem('トマト大玉');
      const result = normalizeProductName(item, mockIngredients);

      expect(result.isNormalized).toBe(true);
      expect(result.item.name).toBe('トマト');
      expect(result.matchedIngredient?.name).toBe('トマト');
    });

    it('should not normalize when no match found', () => {
      const item = createMockReceiptItem('未知の商品');
      const result = normalizeProductName(item, mockIngredients);

      expect(result.isNormalized).toBe(false);
      expect(result.item.name).toBe('未知の商品');
      expect(result.matchedIngredient).toBeUndefined();
    });

    it('should handle empty ingredients array', () => {
      const item = createMockReceiptItem('テスト商品');
      const result = normalizeProductName(item, []);

      expect(result.isNormalized).toBe(false);
      expect(result.item.name).toBe('テスト商品');
    });

    it('should handle items without originalName', () => {
      const item = { ...createMockReceiptItem('テスト商品'), originalName: '' };
      const result = normalizeProductName(item, mockIngredients);

      expect(result.isNormalized).toBe(false);
    });

    it('should prioritize exact match over partial match', () => {
      const ingredientsWithOverlap: Ingredient[] = [
        ...mockIngredients,
        {
          id: 4,
          user_id: 'user1',
          name: '特別牛乳',
          category: 'others',
          default_unit: 'mL',
          typical_price: 300,
          original_name: 'めいらく',
          conversion_quantity: '',
          conversion_unit: '',
          infinity: false,
          created_at: '2025-01-01T00:00:00Z'
        }
      ];

      const item = createMockReceiptItem('めいらく牛乳1000ml');
      const result = normalizeProductName(item, ingredientsWithOverlap);

      // 完全一致が優先される
      expect(result.item.name).toBe('牛乳');
      expect(result.matchedIngredient?.name).toBe('牛乳');
    });
  });

  describe('normalizeReceiptItems', () => {
    it('should normalize multiple items', () => {
      const items = [
        createMockReceiptItem('めいらく牛乳1000ml'),
        createMockReceiptItem('ヤマザキ食パン6枚切り'),
        createMockReceiptItem('未知の商品')
      ];

      const results = normalizeReceiptItems(items, mockIngredients);

      expect(results).toHaveLength(3);
      expect(results[0].normalizationResult.isNormalized).toBe(true);
      expect(results[0].name).toBe('牛乳');
      
      expect(results[1].normalizationResult.isNormalized).toBe(true);
      expect(results[1].name).toBe('食パン');
      
      expect(results[2].normalizationResult.isNormalized).toBe(false);
      expect(results[2].name).toBe('未知の商品');
    });

    it('should handle empty items array', () => {
      const results = normalizeReceiptItems([], mockIngredients);
      expect(results).toHaveLength(0);
    });

    it('should preserve original item properties', () => {
      const originalItem = {
        originalName: 'めいらく牛乳1000ml',
        name: 'めいらく牛乳1000ml',
        quantity: '2',
        price: 400
      };

      const results = normalizeReceiptItems([originalItem], mockIngredients);
      const result = results[0];

      expect(result.quantity).toBe('2');
      expect(result.price).toBe(400);
      expect(result.originalName).toBe('めいらく牛乳1000ml');
      expect(result.name).toBe('牛乳'); // 正規化された名前
    });
  });

  describe('getNormalizationStats', () => {
    it('should calculate stats correctly', () => {
      const results: NameNormalizationResult[] = [
        {
          item: createMockReceiptItem('test1'),
          isNormalized: true,
          matchedIngredient: mockIngredients[0]
        },
        {
          item: createMockReceiptItem('test2'),
          isNormalized: true,
          matchedIngredient: mockIngredients[1]
        },
        {
          item: createMockReceiptItem('test3'),
          isNormalized: false
        },
        {
          item: createMockReceiptItem('test4'),
          isNormalized: false
        }
      ];

      const stats = getNormalizationStats(results);

      expect(stats.total).toBe(4);
      expect(stats.normalized).toBe(2);
      expect(stats.unchanged).toBe(2);
      expect(stats.successRate).toBe(50);
    });

    it('should handle empty results', () => {
      const stats = getNormalizationStats([]);

      expect(stats.total).toBe(0);
      expect(stats.normalized).toBe(0);
      expect(stats.unchanged).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('should handle 100% success rate', () => {
      const results: NameNormalizationResult[] = [
        {
          item: createMockReceiptItem('test1'),
          isNormalized: true,
          matchedIngredient: mockIngredients[0]
        },
        {
          item: createMockReceiptItem('test2'),
          isNormalized: true,
          matchedIngredient: mockIngredients[1]
        }
      ];

      const stats = getNormalizationStats(results);

      expect(stats.total).toBe(2);
      expect(stats.normalized).toBe(2);
      expect(stats.unchanged).toBe(0);
      expect(stats.successRate).toBe(100);
    });

    it('should round success rate correctly', () => {
      const results: NameNormalizationResult[] = Array.from({ length: 3 }, (_, i) => ({
        item: createMockReceiptItem(`test${i}`),
        isNormalized: i < 1, // 1つだけ正規化成功
        matchedIngredient: i < 1 ? mockIngredients[0] : undefined
      }));

      const stats = getNormalizationStats(results);

      expect(stats.successRate).toBe(33); // 1/3 ≈ 33.33% → 33%
    });
  });

  // エッジケースのテスト
  describe('Edge cases', () => {
    it('should handle special characters in names', () => {
      const specialIngredient: Ingredient = {
        id: 99,
        user_id: 'user1',
        name: '特殊食材',
        category: 'others',
        default_unit: '個',
        typical_price: 100,
        original_name: '特殊!@#$%食材',
        conversion_quantity: '',
        conversion_unit: '',
        infinity: false,
        created_at: '2025-01-01T00:00:00Z'
      };

      const item = createMockReceiptItem('特殊!@#$%食材');
      const result = normalizeProductName(item, [specialIngredient]);

      expect(result.isNormalized).toBe(true);
      expect(result.item.name).toBe('特殊食材');
    });

    it('should handle very long product names', () => {
      const longName = 'とても長い商品名'.repeat(10);
      const item = createMockReceiptItem(longName);
      const result = normalizeProductName(item, mockIngredients);

      expect(result.isNormalized).toBe(false);
      expect(result.item.name).toBe(longName);
    });

    it('should handle case sensitivity', () => {
      const item = createMockReceiptItem('フルーツトマト'); // 大文字小文字完全一致
      const result = normalizeProductName(item, mockIngredients);

      expect(result.isNormalized).toBe(true);
      expect(result.item.name).toBe('トマト');
    });

    it('should handle whitespace in names', () => {
      const ingredientWithSpaces: Ingredient = {
        id: 99,
        user_id: 'user1',
        name: 'テスト食材',
        category: 'others',
        default_unit: '個',
        typical_price: 100,
        original_name: ' テスト 食材 ',
        conversion_quantity: '',
        conversion_unit: '',
        infinity: false,
        created_at: '2025-01-01T00:00:00Z'
      };

      const item = createMockReceiptItem(' テスト 食材 ');
      const result = normalizeProductName(item, [ingredientWithSpaces]);

      expect(result.isNormalized).toBe(true);
    });
  });

  // パフォーマンステスト
  describe('Performance', () => {
    it('should handle large ingredients dataset efficiently', () => {
      const largeIngredients = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        user_id: 'user1',
        name: `食材${i}`,
        category: 'others' as const,
        default_unit: '個',
        typical_price: 100,
        original_name: `商品${i}`,
        conversion_quantity: '',
        conversion_unit: '',
        infinity: false,
        created_at: '2025-01-01T00:00:00Z'
      }));

      const item = createMockReceiptItem('商品500');
      
      const start = performance.now();
      const result = normalizeProductName(item, largeIngredients);
      const end = performance.now();

      expect(result.isNormalized).toBe(true);
      expect(end - start).toBeLessThan(10); // 10ms以内で処理完了
    });
  });
});