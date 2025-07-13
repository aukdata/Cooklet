// 買い物リスト自動生成サービス - CLAUDE.md仕様書に準拠
// 献立から買い物リストを自動生成し、在庫との突合を行う機能

import { type MealPlan, type StockItem, type Ingredient, type Quantity, type IngredientItem } from '../types/index';
import { type ShoppingListItem } from '../hooks/useShoppingList';
import { quantityToDisplay } from '../utils/quantityDisplay';
import { normalizeForMatching } from '../utils/ingredientNormalizer';
import { isNameMatch, checkStockAvailability, normalizeQuantity, type StockCheckItem } from './nameMatchingService';

export interface ShoppingListGenerationResult {
  success: boolean;
  generatedItems: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>[];
  summary: {
    totalIngredients: number;
    inStock: number;
    needToBuy: number;
  };
  error?: string;
}

// 食材の数量を正規化する関数は nameMatchingService.normalizeQuantity を直接使用

// 食材名の正規化処理は ingredientNormalizer.ts の統一実装を使用

// 在庫の食材と献立の食材をマッチングする関数（統一正規化サービス使用）
const findMatchingStock = (ingredientName: string, stockItems: StockItem[]): StockItem | null => {
  return stockItems.find(stock => isNameMatch(ingredientName, stock.name)) || null;
};

// 食材が無限食材（在庫消費なし）かどうかをチェックする関数（統一正規化サービス使用）
const isInfinityIngredient = (ingredientName: string, ingredients: Ingredient[]): boolean => {
  return ingredients.some(ingredient => 
    ingredient.infinity && isNameMatch(ingredientName, ingredient.name)
  );
};

// 在庫が足りているかチェックする関数（統一サービス使用）
const isStockSufficient = (
  requiredQuantity: Quantity, 
  stockQuantity: Quantity
): boolean => {
  // 統一された在庫チェック関数を使用
  const stockItems: StockCheckItem[] = [{
    name: 'dummy', // 名前は使用しない（数量比較のみ）
    quantity: stockQuantity
  }];
  
  return checkStockAvailability('dummy', requiredQuantity, stockItems);
};

// 献立から必要な食材を集計する関数
const aggregateIngredientsFromMealPlans = (mealPlans: MealPlan[]): Map<string, Quantity> => {
  const aggregatedIngredients = new Map<string, Quantity>();
  
  console.log('🔍 [Debug] aggregateIngredientsFromMealPlans 開始');
  
  mealPlans.forEach((plan, planIndex) => {
    console.log(`🔍 [Debug] 献立 ${planIndex + 1}:`, plan);
    console.log(`🔍 [Debug] 献立 ${planIndex + 1} ingredients:`, plan.ingredients);
    console.log(`🔍 [Debug] 献立 ${planIndex + 1} ingredients type:`, typeof plan.ingredients);
    console.log(`🔍 [Debug] 献立 ${planIndex + 1} ingredients isArray:`, Array.isArray(plan.ingredients));
    
    // ingredientsが配列でない場合や空の場合の対処
    if (!plan.ingredients) {
      console.warn(`⚠️ [Debug] 献立 ${planIndex + 1} の ingredients が null/undefined:`, plan.ingredients);
      return;
    }

    // ingredientsが文字列の場合（JSONB形式）、パースを試行
    let ingredients = plan.ingredients;
    if (typeof plan.ingredients === 'string') {
      try {
        ingredients = JSON.parse(plan.ingredients);
        console.log(`🔍 [Debug] 献立 ${planIndex + 1} JSONB文字列をパース:`, ingredients);
      } catch (parseError) {
        console.error(`❌ [Debug] 献立 ${planIndex + 1} JSONB パースエラー:`, parseError, plan.ingredients);
        return;
      }
    }

    if (!Array.isArray(ingredients)) {
      console.warn(`⚠️ [Debug] 献立 ${planIndex + 1} の ingredients が配列でない:`, ingredients);
      return;
    }

    if (ingredients.length === 0) {
      console.warn(`⚠️ [Debug] 献立 ${planIndex + 1} の ingredients が空配列:`, ingredients);
      return;
    }
    
    ingredients.forEach((ingredient: IngredientItem | unknown, ingredientIndex) => {
      console.log(`🔍 [Debug] 献立 ${planIndex + 1} 食材 ${ingredientIndex + 1}:`, ingredient);
      
      // 型ガードで安全にアクセス
      if (!ingredient || typeof ingredient !== 'object' || !('name' in ingredient) || !('quantity' in ingredient)) {
        console.warn(`⚠️ [Debug] 献立 ${planIndex + 1} 食材 ${ingredientIndex + 1} が無効:`, ingredient);
        return;
      }

      const typedIngredient = ingredient as IngredientItem;
      
      const normalizedName = normalizeForMatching(typedIngredient.name);
      console.log(`🔍 [Debug] 正規化された食材名: "${typedIngredient.name}" → "${normalizedName}"`);
      
      if (aggregatedIngredients.has(normalizedName)) {
        // 既存の食材がある場合は数量を合計（簡易実装）
        const existingQuantity = aggregatedIngredients.get(normalizedName)!;
        const existing = normalizeQuantity(existingQuantity);
        const current = normalizeQuantity(typedIngredient.quantity);
        
        if (existing.unit === current.unit) {
          const totalValue = existing.value + current.value;
          aggregatedIngredients.set(normalizedName, { amount: totalValue.toString(), unit: existing.unit });
        } else {
          // 単位が異なる場合は新しい量を採用
          aggregatedIngredients.set(normalizedName, typedIngredient.quantity);
        }
      } else {
        aggregatedIngredients.set(normalizedName, typedIngredient.quantity);
      }
    });
  });
  
  console.log('🔍 [Debug] aggregateIngredientsFromMealPlans 終了 - 集計結果:', aggregatedIngredients);
  return aggregatedIngredients;
};

// 入力データの妥当性チェック
const validateInputData = (mealPlans: MealPlan[]): ShoppingListGenerationResult | null => {
  console.log('🔍 [Debug] generateShoppingListFromMealPlans 開始');
  console.log('🔍 [Debug] 入力 - 献立数:', mealPlans.length);
  
  if (mealPlans.length === 0) {
    console.log('🔍 [Debug] 献立が0件のため終了');
    return {
      success: false,
      generatedItems: [],
      summary: { totalIngredients: 0, inStock: 0, needToBuy: 0 },
      error: '献立が設定されていません'
    };
  }
  
  return null; // 妥当性OK
};

// 食材集計と既存買い物リストの正規化
const aggregateAndNormalizeIngredients = (
  mealPlans: MealPlan[],
  existingShoppingItems: ShoppingListItem[]
): {
  aggregatedIngredients: Map<string, Quantity>;
  existingItemsMap: Map<string, ShoppingListItem>;
} => {
  console.log('🔍 [Debug] 入力 - 在庫数:', existingShoppingItems.length);
  console.log('🔍 [Debug] 献立詳細:', mealPlans);
  
  // 献立から必要な食材を集計
  const aggregatedIngredients = aggregateIngredientsFromMealPlans(mealPlans);
  
  console.log('🔍 [Debug] 集計された食材:', aggregatedIngredients);
  console.log('🔍 [Debug] 集計された食材数:', aggregatedIngredients.size);
  
  // 既存の買い物リストアイテムを正規化してマップ化
  const existingItemsMap = new Map<string, ShoppingListItem>();
  existingShoppingItems.forEach(item => {
    const normalizedName = normalizeForMatching(item.name);
    existingItemsMap.set(normalizedName, item);
  });
  
  return { aggregatedIngredients, existingItemsMap };
};

// 元の食材名を復元
const restoreOriginalIngredientName = (
  normalizedName: string,
  mealPlans: MealPlan[]
): string => {
  for (const plan of mealPlans) {
    // ingredientsが配列でない場合の対処
    let ingredients = plan.ingredients;
    if (typeof plan.ingredients === 'string') {
      try {
        ingredients = JSON.parse(plan.ingredients);
      } catch {
        continue;
      }
    }
    
    if (!Array.isArray(ingredients)) continue;
    
    const found = ingredients.find((ing: unknown) => {
      if (!ing || typeof ing !== 'object' || !('name' in ing)) return false;
      const typedIng = ing as { name: string };
      return normalizeForMatching(typedIng.name) === normalizedName;
    });
    if (found && typeof found === 'object' && 'name' in found) {
      const typedFound = found as { name: string };
      return typedFound.name;
    }
  }
  
  return normalizedName; // 見つからない場合は正規化名をそのまま使用
};

// 在庫チェックと無限食材フラグ確認
const checkStockAndInfinityFlags = (
  originalName: string,
  quantity: Quantity,
  stockItems: StockItem[],
  ingredients: Ingredient[]
): {
  isInfinity: boolean;
  matchingStock: StockItem | null;
  hasEnoughStock: boolean;
} => {
  // infinityフラグ（在庫消費なし）をチェック
  const isInfinity = isInfinityIngredient(originalName, ingredients);
  
  if (isInfinity) {
    return { isInfinity: true, matchingStock: null, hasEnoughStock: true };
  }
  
  // 在庫チェック
  const matchingStock = findMatchingStock(originalName, stockItems);
  const hasEnoughStock = matchingStock ? isStockSufficient(quantity, matchingStock.quantity) : false;
  
  return { isInfinity: false, matchingStock, hasEnoughStock };
};

// 不足数量の計算
const calculateShortageQuantities = (
  quantity: Quantity,
  matchingStock: StockItem | null
): Quantity => {
  if (!matchingStock) {
    return quantity;
  }
  
  const required = normalizeQuantity(quantity);
  const stock = normalizeQuantity(matchingStock.quantity);
  
  if (required.unit === stock.unit) {
    const shortage = Math.max(0, required.value - stock.value);
    return shortage > 0 ? { amount: shortage.toString(), unit: required.unit } : quantity;
  }
  
  return quantity;
};

// 生成結果の構築
const buildGenerationResult = (
  generatedItems: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>[],
  totalIngredients: number,
  inStock: number,
  needToBuy: number
): ShoppingListGenerationResult => {
  return {
    success: true,
    generatedItems,
    summary: {
      totalIngredients,
      inStock,
      needToBuy
    }
  };
};

// メイン関数：献立から買い物リストを自動生成（Martin Fowler Extract Function適用）
export const generateShoppingListFromMealPlans = async (
  mealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingItems: ShoppingListItem[] = [],
  ingredients: Ingredient[] = []
): Promise<ShoppingListGenerationResult> => {
  try {
    // 1. 入力データの妥当性チェック
    const validationResult = validateInputData(mealPlans);
    if (validationResult) {
      return validationResult;
    }
    
    // 2. 食材集計と既存買い物リストの正規化
    const { aggregatedIngredients, existingItemsMap } = aggregateAndNormalizeIngredients(
      mealPlans,
      existingShoppingItems
    );
    
    const generatedItems: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>[] = [];
    let totalIngredients = 0;
    let inStock = 0;
    let needToBuy = 0;
    
    console.log('🔍 [Debug] 各食材について在庫チェック開始');
    console.log('🔍 [Debug] aggregatedIngredients entries:', Array.from(aggregatedIngredients.entries()));

    // 3. 各食材について在庫チェックと買い物リスト生成
    for (const [normalizedName, quantity] of aggregatedIngredients) {
      totalIngredients++;
      console.log(`🔍 [Debug] 処理中の食材: "${normalizedName}" (${quantityToDisplay(quantity)})`);
      
      // 元の食材名を復元
      const originalName = restoreOriginalIngredientName(normalizedName, mealPlans);
      
      // 在庫チェックと無限食材フラグ確認
      const { isInfinity, matchingStock, hasEnoughStock } = checkStockAndInfinityFlags(
        originalName,
        quantity,
        stockItems,
        ingredients
      );
      
      if (isInfinity) {
        // 無限食材（醤油・塩等）は買い物リストに追加不要
        inStock++;
        console.log(`🔍 [Debug] 無限食材のためスキップ: "${originalName}"`);
        continue;
      }
      
      if (hasEnoughStock) {
        // 在庫が十分な場合
        inStock++;
      } else {
        // 既存の買い物リストに同じアイテムがあるかチェック
        if (existingItemsMap.has(normalizedName)) {
          // 既に買い物リストにあるのでスキップ
          needToBuy++;
          continue;
        }
        
        // 在庫が不足している場合は買い物リストに追加
        needToBuy++;
        
        // 不足数量の計算
        const finalQuantity = calculateShortageQuantities(quantity, matchingStock);
        
        generatedItems.push({
          name: originalName,
          quantity: finalQuantity,
          checked: false,
          added_from: 'auto'
        });
      }
    }
    
    // 4. 生成結果の構築
    return buildGenerationResult(generatedItems, totalIngredients, inStock, needToBuy);
    
  } catch (error) {
    console.error('買い物リスト生成中にエラーが発生しました:', error);
    return {
      success: false,
      generatedItems: [],
      summary: { totalIngredients: 0, inStock: 0, needToBuy: 0 },
      error: error instanceof Error ? error.message : '買い物リスト生成に失敗しました'
    };
  }
};

// 指定期間の献立から買い物リストを生成
export const generateShoppingListForPeriod = async (
  startDate: Date,
  endDate: Date,
  allMealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingItems: ShoppingListItem[] = [],
  ingredients: Ingredient[] = []
): Promise<ShoppingListGenerationResult> => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // 指定期間の献立をフィルタリング
  const periodMealPlans = allMealPlans.filter(plan => 
    plan.date >= startDateStr && plan.date <= endDateStr
  );
  
  return generateShoppingListFromMealPlans(periodMealPlans, stockItems, existingShoppingItems, ingredients);
};

// 今週の買い物リストを生成
export const generateWeeklyShoppingList = async (
  allMealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingItems: ShoppingListItem[] = [],
  ingredients: Ingredient[] = []
): Promise<ShoppingListGenerationResult> => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // 日曜日
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // 土曜日
  
  return generateShoppingListForPeriod(startOfWeek, endOfWeek, allMealPlans, stockItems, existingShoppingItems, ingredients);
};

// 次の数日分の買い物リストを生成
export const generateShoppingListForNextDays = async (
  days: number,
  allMealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingItems: ShoppingListItem[] = [],
  ingredients: Ingredient[] = []
): Promise<ShoppingListGenerationResult> => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days - 1);
  
  return generateShoppingListForPeriod(today, endDate, allMealPlans, stockItems, existingShoppingItems, ingredients);
};