import { describe, it, expect } from 'vitest';
import type { MealPlan, StockItem } from '../types';
import type { ShoppingListItem } from '../hooks/useShoppingList';
import { normalizeForMatching } from '../utils/ingredientNormalizer';
import {
  extractQuantity,
  checkIngredientStock,
  extractIngredientsFromMealPlans,
  findMissingIngredients,
  generateShoppingListItems,
  generateShoppingListFromMealPlans
} from '../services/autoShoppingList';

/**
 * 買い物リスト自動生成機能のユニットテスト
 * autoShoppingList.tsの各関数をテスト
 */

describe('autoShoppingList', () => {
  // テスト用モックデータ
  const mockMealPlans: MealPlan[] = [
    {
      id: '1',
      date: '2024-01-01',
      meal_type: '朝',
      recipe_url: 'https://example.com/recipe1',
      ingredients: [
        { name: 'トマト', quantity: '2個' },
        { name: '玉ねぎ', quantity: '1個' }
      ],
      memo: 'モックレシピ1',
      consumed_status: 'pending'
    },
    {
      id: '2',
      date: '2024-01-02',
      meal_type: '昼',
      recipe_url: 'https://example.com/recipe2',
      ingredients: [
        { name: 'トマト', quantity: '1個' },
        { name: 'にんじん', quantity: '100g' }
      ],
      memo: 'モックレシピ2',
      consumed_status: 'pending'
    }
  ];

  const mockStockItems: StockItem[] = [
    {
      id: '1',
      name: 'トマト',
      quantity: '1個',
      best_before: '2024-01-15',
      storage_location: '冷蔵庫',
      is_homemade: false
    },
    {
      id: '2',
      name: '玉ねぎ',
      quantity: '3個',
      best_before: '2024-01-20',
      storage_location: '常温',
      is_homemade: false
    }
  ];

  const mockShoppingList: ShoppingListItem[] = [
    {
      id: '1',
      name: 'パン',
      quantity: '1斤',
      checked: false,
      added_from: 'manual'
    }
  ];

  describe('normalizeForMatching', () => {
    it('食材名を正規化する', () => {
      expect(normalizeForMatching('トマト（大）')).toBe('トマト');
      expect(normalizeForMatching('玉ねぎ 2個')).toBe('玉ねぎ');
      expect(normalizeForMatching('にんじん、100g')).toBe('にんじん');
      expect(normalizeForMatching('  牛肉  ')).toBe('牛肉');
    });

    it('空文字列を処理する', () => {
      expect(normalizeForMatching('')).toBe('');
      expect(normalizeForMatching('   ')).toBe('');
    });
  });

  describe('extractQuantity', () => {
    it('数量と食材名を正しく抽出する', () => {
      expect(extractQuantity('トマト2個')).toEqual({
        name: 'トマト',
        quantity: '2個'
      });
      
      expect(extractQuantity('にんじん100g')).toEqual({
        name: 'にんじん',
        quantity: '100g'
      });
      
      expect(extractQuantity('牛肉 300g')).toEqual({
        name: '牛肉',
        quantity: '300g'
      });
    });

    it('数量がない場合は適量を返す', () => {
      expect(extractQuantity('しょうゆ')).toEqual({
        name: 'しょうゆ',
        quantity: '適量'
      });
    });

    it('小数点を含む数量を処理する', () => {
      expect(extractQuantity('バター0.5g')).toEqual({
        name: 'バター',
        quantity: '0.5g'
      });
    });
  });

  describe('checkIngredientStock', () => {
    it('在庫がある場合はtrueを返す', () => {
      const result = checkIngredientStock('トマト', '1個', mockStockItems);
      expect(result).toBe(true);
    });

    it('在庫がない場合はfalseを返す', () => {
      const result = checkIngredientStock('キャベツ', '1個', mockStockItems);
      expect(result).toBe(false);
    });

    it('部分一致で在庫をチェックする', () => {
      const stockWithVariant: StockItem[] = [
        {
          id: '1',
          name: '新玉ねぎ',
          quantity: '2個',
          best_before: '2024-01-15',
          storage_location: '冷蔵庫',
          is_homemade: false
        }
      ];
      
      const result = checkIngredientStock('玉ねぎ', '1個', stockWithVariant);
      expect(result).toBe(true);
    });
  });

  describe('extractIngredientsFromMealPlans', () => {
    it('指定期間の献立から食材を抽出する', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');
      
      const result = extractIngredientsFromMealPlans(mockMealPlans, startDate, endDate);
      
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'トマト',
            quantity: '2個'
          }),
          expect.objectContaining({
            name: '玉ねぎ',
            quantity: '1個'
          }),
          expect.objectContaining({
            name: 'にんじん',
            quantity: '100g'
          })
        ])
      );
    });

    it('期間外の献立は除外される', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01'); // 1日だけ
      
      const result = extractIngredientsFromMealPlans(mockMealPlans, startDate, endDate);
      
      // 2024-01-01の献立のみが含まれる
      const sources = result.map(item => item.source);
      expect(sources.every(source => source.includes('2024-01-01'))).toBe(true);
    });

    it('同じ食材が複数回出現する場合に統合される', () => {
      const mealPlansWithDuplicates: MealPlan[] = [
        {
          id: '1',
          date: '2024-01-01',
          meal_type: '朝',
          ingredients: [{ name: 'トマト', quantity: '1個' }],
          memo: 'レシピ1',
          consumed_status: 'pending'
        },
        {
          id: '2',
          date: '2024-01-01',
          meal_type: '昼',
          ingredients: [{ name: 'トマト', quantity: '1個' }],
          memo: 'レシピ2',
          consumed_status: 'pending'
        }
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      const result = extractIngredientsFromMealPlans(mealPlansWithDuplicates, startDate, endDate);
      
      // トマトが1つのエントリにまとめられる
      const tomatoEntries = result.filter(item => item.name === 'トマト');
      expect(tomatoEntries).toHaveLength(1);
      expect(tomatoEntries[0].source).toContain('朝');
      expect(tomatoEntries[0].source).toContain('昼');
    });
  });

  describe('findMissingIngredients', () => {
    it('在庫にない食材を特定する', () => {
      const requiredIngredients = [
        { name: 'トマト', quantity: '3個', source: '2024-01-01朝' },
        { name: 'キャベツ', quantity: '1個', source: '2024-01-01朝' },
        { name: '玉ねぎ', quantity: '1個', source: '2024-01-01朝' }
      ];
      
      const result = findMissingIngredients(requiredIngredients, mockStockItems);
      
      // キャベツは在庫にないので含まれる
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'キャベツ' })
        ])
      );
      
      // トマトと玉ねぎは在庫にあるので含まれない（数量は考慮されない簡易実装）
      expect(result.find(item => item.name === 'トマト')).toBeUndefined();
      expect(result.find(item => item.name === '玉ねぎ')).toBeUndefined();
    });
  });

  describe('generateShoppingListItems', () => {
    it('買い物リストアイテムを生成する', () => {
      const missingIngredients = [
        { name: 'キャベツ', quantity: '1個', source: '2024-01-01朝' },
        { name: 'にんじん', quantity: '100g', source: '2024-01-01昼' }
      ];
      
      const result = generateShoppingListItems(missingIngredients, mockShoppingList);
      
      expect(result).toEqual([
        expect.objectContaining({
          name: 'キャベツ',
          quantity: '1個',
          checked: false,
          added_from: 'auto'
        }),
        expect.objectContaining({
          name: 'にんじん',
          quantity: '100g',
          checked: false,
          added_from: 'auto'
        })
      ]);
    });

    it('既に買い物リストにある食材は除外される', () => {
      const missingIngredients = [
        { name: 'パン', quantity: '1斤', source: '2024-01-01朝' }, // 既存
        { name: 'キャベツ', quantity: '1個', source: '2024-01-01朝' } // 新規
      ];
      
      const result = generateShoppingListItems(missingIngredients, mockShoppingList);
      
      // パンは既存なので除外、キャベツのみ追加
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('キャベツ');
    });
  });

  describe('generateShoppingListFromMealPlans', () => {
    it('献立から買い物リストを自動生成する（統合テスト）', () => {
      const result = generateShoppingListFromMealPlans(
        mockMealPlans,
        mockStockItems,
        mockShoppingList,
        2 // 2日分
      );
      
      // 結果の形式をチェック
      expect(Array.isArray(result)).toBe(true);
      result.forEach(item => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('checked');
        expect(item).toHaveProperty('added_from');
        expect(item.checked).toBe(false);
        expect(item.added_from).toBe('auto');
      });
    });

    it('在庫が十分な場合は買い物リストが空になる', () => {
      const abundantStock: StockItem[] = [
        {
          id: '1',
          name: 'トマト',
          quantity: '10個',
          best_before: '2024-01-15',
          storage_location: '冷蔵庫',
          is_homemade: false
        },
        {
          id: '2',
          name: '玉ねぎ',
          quantity: '10個',
          best_before: '2024-01-20',
          storage_location: '常温',
          is_homemade: false
        },
        {
          id: '3',
          name: 'にんじん',
          quantity: '1kg',
          best_before: '2024-01-25',
          storage_location: '冷蔵庫',
          is_homemade: false
        }
      ];
      
      const result = generateShoppingListFromMealPlans(
        mockMealPlans,
        abundantStock,
        [],
        2
      );
      
      expect(result).toHaveLength(0);
    });

    it('カスタム期間で生成する', () => {
      const result = generateShoppingListFromMealPlans(
        mockMealPlans,
        [],
        [],
        1 // 1日分のみ
      );
      
      // 1日分の献立のみから生成される
      expect(Array.isArray(result)).toBe(true);
    });
  });
});