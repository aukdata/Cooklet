import { describe, it, expect, beforeEach } from 'vitest';
import type { StockItem, Ingredient } from '../types';
import type { SavedRecipe } from '../types/recipe';
import {
  generateMealPlanAlgorithm,
  generateMealPlan,
  getMealTypeFromIndex,
  getGenerationDates,
  type MealGenerationSettings,
  type InventoryItem,
  type RecipeData,
  type PurchaseUnit
} from '../services/mealPlanGeneration';

/**
 * 献立自動生成機能のユニットテスト
 * mealPlanGeneration.tsの各関数をテスト
 */

describe('mealPlanGeneration', () => {
  // テスト用モックデータ
  let mockStockItems: StockItem[];
  let mockRecipes: SavedRecipe[];
  let mockIngredients: Ingredient[];
  let mockInventory: { [key: string]: InventoryItem };
  let mockRecipeData: { [key: string]: RecipeData };
  let mockPurchaseUnits: { [key: string]: PurchaseUnit };

  beforeEach(() => {
    // モック在庫データ
    mockStockItems = [
      {
        id: '1',
        name: 'トマト',
        quantity: '3個',
        best_before: '2024-01-15',
        storage_location: '冷蔵庫',
        is_homemade: false
      },
      {
        id: '2',
        name: '玉ねぎ',
        quantity: '2個',
        best_before: '2024-01-20',
        storage_location: '常温',
        is_homemade: false
      },
      {
        id: '3',
        name: '牛肉',
        quantity: '500g',
        best_before: '2024-01-10', // 期限が近い
        storage_location: '冷蔵庫',
        is_homemade: false
      }
    ];

    // モックレシピデータ
    mockRecipes = [
      {
        id: '1',
        title: '牛肉炒め',
        url: 'https://example.com/recipe1',
        servings: 2,
        ingredients: [
          { name: '牛肉', quantity: '200g' },
          { name: '玉ねぎ', quantity: '1個' },
          { name: 'しょうゆ', quantity: '大さじ1' }
        ],
        memo: '簡単な炒め物'
      },
      {
        id: '2',
        title: 'トマトサラダ',
        url: 'https://example.com/recipe2',
        servings: 1,
        ingredients: [
          { name: 'トマト', quantity: '2個' },
          { name: 'オリーブオイル', quantity: '小さじ1' }
        ],
        memo: 'さっぱりサラダ'
      },
      {
        id: '3',
        title: '野菜スープ',
        url: 'https://example.com/recipe3',
        servings: 4,
        ingredients: [
          { name: 'トマト', quantity: '1個' },
          { name: '玉ねぎ', quantity: '1個' },
          { name: 'にんじん', quantity: '1個' } // 在庫にない
        ],
        memo: '栄養満点スープ'
      }
    ];

    // モック食材マスタ
    mockIngredients = [
      {
        id: '1',
        name: 'トマト',
        default_unit: '個',
        conversion_quantity: '1',
        conversion_unit: '個',
        infinity: false
      },
      {
        id: '2',
        name: '玉ねぎ',
        default_unit: '個',
        conversion_quantity: '1',
        conversion_unit: '個',
        infinity: false
      },
      {
        id: '3',
        name: '牛肉',
        default_unit: 'g',
        conversion_quantity: '100',
        conversion_unit: 'g',
        infinity: false
      },
      {
        id: '4',
        name: 'しょうゆ',
        default_unit: 'ml',
        conversion_quantity: '1',
        conversion_unit: 'ml',
        infinity: true // 調味料は無限フラグ
      },
      {
        id: '5',
        name: 'オリーブオイル',
        default_unit: 'ml',
        conversion_quantity: '1',
        conversion_unit: 'ml',
        infinity: true
      },
      {
        id: '6',
        name: 'にんじん',
        default_unit: '個',
        conversion_quantity: '1',
        conversion_unit: '個',
        infinity: false
      }
    ];

    // アルゴリズム用データ構造
    mockInventory = {
      'トマト': { name: 'トマト', quantity: 3, unit: '個', expiryDate: '2024-01-15' },
      '玉ねぎ': { name: '玉ねぎ', quantity: 2, unit: '個', expiryDate: '2024-01-20' },
      '牛肉': { name: '牛肉', quantity: 500, unit: 'g', expiryDate: '2024-01-10' },
      'しょうゆ': { name: 'しょうゆ', quantity: Number.MAX_SAFE_INTEGER, unit: 'ml', infinity: true },
      'オリーブオイル': { name: 'オリーブオイル', quantity: Number.MAX_SAFE_INTEGER, unit: 'ml', infinity: true }
    };

    mockRecipeData = {
      '牛肉炒め': {
        name: '牛肉炒め',
        servings: 2,
        ingredients: [
          { name: '牛肉', quantity: 200, unit: 'g' },
          { name: '玉ねぎ', quantity: 1, unit: '個' },
          { name: 'しょうゆ', quantity: 1, unit: '大さじ' }
        ]
      },
      'トマトサラダ': {
        name: 'トマトサラダ',
        servings: 1,
        ingredients: [
          { name: 'トマト', quantity: 2, unit: '個' },
          { name: 'オリーブオイル', quantity: 1, unit: '小さじ' }
        ]
      },
      '野菜スープ': {
        name: '野菜スープ',
        servings: 4,
        ingredients: [
          { name: 'トマト', quantity: 1, unit: '個' },
          { name: '玉ねぎ', quantity: 1, unit: '個' },
          { name: 'にんじん', quantity: 1, unit: '個' }
        ]
      }
    };

    mockPurchaseUnits = {
      'トマト': { ingredientName: 'トマト', quantity: 1, unit: '個' },
      '玉ねぎ': { ingredientName: '玉ねぎ', quantity: 1, unit: '個' },
      '牛肉': { ingredientName: '牛肉', quantity: 100, unit: 'g' },
      'にんじん': { ingredientName: 'にんじん', quantity: 1, unit: '個' }
    };
  });

  describe('generateMealPlanAlgorithm', () => {
    it('基本的な献立生成ができる', () => {
      const [mealPlan, shoppingList] = generateMealPlanAlgorithm(
        mockInventory,
        mockRecipeData,
        mockPurchaseUnits,
        2, // 2食分
        1.0, // alpha
        1.0, // beta
        0.0  // temperature
      );

      expect(mealPlan).toHaveLength(2);
      expect(Array.isArray(shoppingList)).toBe(true);
      
      // 献立の構造をチェック
      mealPlan.forEach(meal => {
        expect(meal).toHaveProperty('mealNumber');
        expect(meal).toHaveProperty('recipe');
        expect(meal).toHaveProperty('ingredients');
        expect(meal).toHaveProperty('estimatedCost');
        expect(typeof meal.mealNumber).toBe('number');
        expect(typeof meal.recipe).toBe('string');
        expect(Array.isArray(meal.ingredients)).toBe(true);
      });
    });

    it('期限の近い食材を優先して使用する', () => {
      // beta（期限重み）を大きくして期限優先にする
      const [mealPlan] = generateMealPlanAlgorithm(
        mockInventory,
        mockRecipeData,
        mockPurchaseUnits,
        1,
        0.1, // 購入コストを小さく
        10.0, // 期限重みを大きく
        0.0
      );

      // 牛肉が最も期限が近いので、牛肉を使うレシピが選ばれやすい
      expect(mealPlan.length).toBeGreaterThan(0);
      if (mealPlan.length > 0) {
        expect(mealPlan[0].ingredients).toEqual(
          expect.arrayContaining(['牛肉'])
        );
      }
    });

    it('購入コストを最小化する', () => {
      // alpha（購入コスト重み）を大きくして購入回避を優先
      const [mealPlan] = generateMealPlanAlgorithm(
        mockInventory,
        mockRecipeData,
        mockPurchaseUnits,
        1,
        10.0, // 購入コストを大きく
        0.1,  // 期限重みを小さく
        0.0
      );

      // 在庫の食材だけで作れるレシピが優先される
      expect(mealPlan.length).toBeGreaterThan(0);
    });

    it('購入が必要な食材がある場合に買い物リストを生成する', () => {
      // にんじんが必要な野菜スープを含む状況を作る
      const limitedInventory = {
        'にんじん': { name: 'にんじん', quantity: 0, unit: '個' }
      };
      
      const [, shoppingList] = generateMealPlanAlgorithm(
        limitedInventory,
        { '野菜スープ': mockRecipeData['野菜スープ'] },
        mockPurchaseUnits,
        1,
        1.0,
        1.0,
        0.0
      );

      // 不足する食材が買い物リストに追加される
      expect(shoppingList.length).toBeGreaterThan(0);
      const carrotItem = shoppingList.find(item => item.ingredient === 'にんじん');
      expect(carrotItem).toBeDefined();
      if (carrotItem) {
        expect(carrotItem.quantity).toBeGreaterThan(0);
        expect(carrotItem.unit).toBe('個');
      }
    });

    it('infinityフラグのある食材は在庫を消費しない', () => {
      const inventoryWithInfinity = {
        ...mockInventory
      };
      
      const [, shoppingList] = generateMealPlanAlgorithm(
        inventoryWithInfinity,
        { '牛肉炒め': mockRecipeData['牛肉炒め'] },
        mockPurchaseUnits,
        1,
        1.0,
        1.0,
        0.0
      );

      // しょうゆはinfinityフラグがtrueなので買い物リストに含まれない
      const soySauceItem = shoppingList.find(item => item.ingredient === 'しょうゆ');
      expect(soySauceItem).toBeUndefined();
    });

    it('temperatureパラメータでランダム性を追加する', () => {
      // ランダム性があるため、複数回実行して異なる結果が出る可能性がある
      const [mealPlan1] = generateMealPlanAlgorithm(
        mockInventory,
        mockRecipeData,
        mockPurchaseUnits,
        1,
        1.0,
        1.0,
        1.0 // 高いtemperature
      );

      const [mealPlan2] = generateMealPlanAlgorithm(
        mockInventory,
        mockRecipeData,
        mockPurchaseUnits,
        1,
        1.0,
        1.0,
        1.0 // 高いtemperature
      );

      // 両方とも結果が生成される
      expect(mealPlan1.length).toBeGreaterThan(0);
      expect(mealPlan2.length).toBeGreaterThan(0);
    });

    it('作れるレシピがない場合は空の結果を返す', () => {
      const emptyInventory = {};
      const impossibleRecipe = {
        '不可能なレシピ': {
          name: '不可能なレシピ',
          servings: 1,
          ingredients: [
            { name: '存在しない食材', quantity: 1, unit: '個' }
          ]
        }
      };

      const [mealPlan, shoppingList] = generateMealPlanAlgorithm(
        emptyInventory,
        impossibleRecipe,
        {}, // 購入単位情報もない
        1,
        1.0,
        1.0,
        0.0
      );

      expect(mealPlan).toHaveLength(0);
      expect(shoppingList).toHaveLength(0);
    });
  });

  describe('generateMealPlan', () => {
    it('統合的な献立生成ができる', async () => {
      const settings: MealGenerationSettings = {
        stockItems: mockStockItems,
        recipes: mockRecipes,
        ingredients: mockIngredients,
        days: 1,
        mealTypes: [true, true, true], // 朝昼夜すべて
        alpha: 1.0,
        beta: 1.0,
        temperature: 0.0
      };

      const result = await generateMealPlan(settings);

      expect(result).toHaveProperty('mealPlan');
      expect(result).toHaveProperty('shoppingList');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('usedIngredients');

      expect(Array.isArray(result.mealPlan)).toBe(true);
      expect(Array.isArray(result.shoppingList)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.usedIngredients)).toBe(true);
    });

    it('レシピがない場合に適切な警告を返す', async () => {
      const settings: MealGenerationSettings = {
        stockItems: mockStockItems,
        recipes: [], // レシピなし
        ingredients: mockIngredients,
        days: 1,
        mealTypes: [true, false, false]
      };

      const result = await generateMealPlan(settings);

      expect(result.mealPlan).toHaveLength(0);
      expect(result.warnings).toContain('利用可能なレシピがありません。レシピを追加してから献立生成を実行してください。');
    });

    it('食事タイプが選択されていない場合に警告を返す', async () => {
      const settings: MealGenerationSettings = {
        stockItems: mockStockItems,
        recipes: mockRecipes,
        ingredients: mockIngredients,
        days: 1,
        mealTypes: [false, false, false] // 全て無効
      };

      const result = await generateMealPlan(settings);

      expect(result.mealPlan).toHaveLength(0);
      expect(result.warnings).toContain('生成する食事タイプが選択されていません');
    });

    it('infinityフラグの食材を無限在庫として扱う', async () => {
      const stockWithoutCondiments = mockStockItems.filter(
        stock => stock.name !== 'しょうゆ' && stock.name !== 'オリーブオイル'
      );

      const settings: MealGenerationSettings = {
        stockItems: stockWithoutCondiments,
        recipes: mockRecipes,
        ingredients: mockIngredients,
        days: 1,
        mealTypes: [true, false, false]
      };

      const result = await generateMealPlan(settings);

      // infinityフラグの食材（しょうゆ、オリーブオイル）は買い物リストに含まれない
      const condimentItems = result.shoppingList.filter(
        item => item.ingredient === 'しょうゆ' || item.ingredient === 'オリーブオイル'
      );
      expect(condimentItems).toHaveLength(0);
    });

    it('食材マスタなしの場合にデフォルト購入単位で対応する', async () => {
      // 作れないレシピのみのデータでテスト
      const impossibleRecipes = [
        {
          id: '1',
          title: '作れないレシピ',
          url: 'https://example.com',
          servings: 2,
          ingredients: [
            { name: '存在しない食材A', quantity: '1個' },
            { name: '存在しない食材B', quantity: '1個' }
          ],
          memo: 'テスト'
        }
      ];

      const invalidSettings: MealGenerationSettings = {
        stockItems: [], // 在庫なし
        recipes: impossibleRecipes,
        ingredients: [], // 食材マスタもなし
        days: 1,
        mealTypes: [true, false, false]
      };

      const result = await generateMealPlan(invalidSettings);

      // アルゴリズムがデフォルト購入単位で献立を作ることができる
      expect(Array.isArray(result.mealPlan)).toBe(true);
      expect(Array.isArray(result.shoppingList)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('getMealTypeFromIndex', () => {
    it('インデックスから正しい食事タイプを返す', () => {
      expect(getMealTypeFromIndex(0)).toBe('朝');
      expect(getMealTypeFromIndex(1)).toBe('昼');
      expect(getMealTypeFromIndex(2)).toBe('夜');
    });

    it('範囲外のインデックスではデフォルト値を返す', () => {
      expect(getMealTypeFromIndex(3)).toBe('夜');
      expect(getMealTypeFromIndex(-1)).toBe('夜');
      expect(getMealTypeFromIndex(999)).toBe('夜');
    });
  });

  describe('getGenerationDates', () => {
    it('指定した日数分の日付配列を生成する', () => {
      const dates = getGenerationDates(3);
      
      expect(dates).toHaveLength(3);
      dates.forEach(date => {
        expect(typeof date).toBe('string');
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD形式
      });
    });

    it('今日から連続した日付を生成する', () => {
      const today = new Date();
      const dates = getGenerationDates(2);
      
      const expectedFirst = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const expectedSecond = tomorrow.toISOString().split('T')[0];
      
      expect(dates[0]).toBe(expectedFirst);
      expect(dates[1]).toBe(expectedSecond);
    });

    it('0日の場合は空配列を返す', () => {
      const dates = getGenerationDates(0);
      expect(dates).toHaveLength(0);
    });

    it('負の値の場合は空配列を返す', () => {
      const dates = getGenerationDates(-1);
      expect(dates).toHaveLength(0);
    });
  });
});