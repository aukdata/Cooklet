// 献立から買い物リスト自動生成のユーティリティ（CLAUDE.md仕様書準拠）

import { type MealPlan, type StockItem, type IngredientItem, type Quantity } from '../types/index';
import { type ShoppingListItem } from '../hooks/useShoppingList';
import { normalizeForMatching } from '../utils/ingredientNormalizer';
import { parseQuantity, formatQuantity } from '../constants/units';
import { checkStockAvailability, type StockCheckItem } from './nameMatchingService';

// 食材名の正規化処理は ingredientNormalizer.ts の統一実装を使用

// 食材名と数量を分離して抽出（parseQuantity統合版）
export const parseIngredientNameWithQuantity = (ingredientText: string): { name: string; quantity: string } => {
  // constants/units.ts の parseQuantity を使用した堅牢な実装
  const parsed = parseQuantity(ingredientText);
  
  // 数量が見つかった場合、元のテキストから数量部分を除去して食材名を抽出
  if (parsed.amount && parsed.unit !== '-') {
    const quantityStr = formatQuantity(parsed.amount, parsed.unit);
    const name = ingredientText.replace(quantityStr, '').trim();
    return { 
      name: name || ingredientText, 
      quantity: quantityStr 
    };
  }
  
  // 数量が見つからない場合は全体を食材名として扱う
  return { name: ingredientText, quantity: '適量' };
};

// 在庫と必要量を比較して不足をチェック
export const checkIngredientStock = (
  ingredientName: string, 
  requiredQuantity: Quantity, 
  stockItems: StockItem[]
): boolean => {
  // StockItem を StockCheckItem 形式に変換
  const stockCheckItems: StockCheckItem[] = stockItems.map(stock => ({
    name: stock.name,
    quantity: stock.quantity
  }));
  
  // 統一された在庫チェック関数を使用
  return checkStockAvailability(ingredientName, requiredQuantity, stockCheckItems);
};

// 指定期間の献立をフィルタリング
const filterMealPlansByDateRange = (
  mealPlans: MealPlan[],
  startDate: Date,
  endDate: Date
): MealPlan[] => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  return mealPlans.filter(plan => {
    return plan.date >= startDateStr && plan.date <= endDateStr;
  });
};

// 単一の献立から食材を抽出
const extractIngredientsFromSinglePlan = (
  plan: MealPlan
): Array<{ normalizedName: string; quantity: Quantity; source: string }> => {
  const source = `${plan.date}${plan.meal_type}`;
  
  return plan.ingredients.map((ingredient: IngredientItem) => {
    const { name, quantity } = parseIngredientNameWithQuantity(ingredient.name);
    const normalizedName = normalizeForMatching(name);
    
    return {
      normalizedName,
      quantity: ingredient.quantity || { amount: quantity, unit: '' },
      source
    };
  });
};

// 食材を名前ごとに集計
const aggregateIngredientsByName = (
  extractedIngredients: Array<{ normalizedName: string; quantity: Quantity; source: string }>
): Map<string, { quantity: Quantity; sources: string[] }> => {
  const ingredientMap = new Map<string, { quantity: Quantity; sources: string[] }>();
  
  extractedIngredients.forEach(({ normalizedName, quantity, source }) => {
    if (ingredientMap.has(normalizedName)) {
      const existing = ingredientMap.get(normalizedName)!;
      existing.sources.push(source);
    } else {
      ingredientMap.set(normalizedName, {
        quantity,
        sources: [source]
      });
    }
  });
  
  return ingredientMap;
};

// Mapを配列形式に変換
const convertMapToArray = (
  ingredientMap: Map<string, { quantity: Quantity; sources: string[] }>
): Array<{ name: string; quantity: Quantity; source: string }> => {
  return Array.from(ingredientMap.entries()).map(([name, data]) => ({
    name,
    quantity: data.quantity,
    source: data.sources.join(', ')
  }));
};

// 指定期間の献立から必要な食材を抽出（Martin Fowler Extract Function適用）
export const extractIngredientsFromMealPlans = (
  mealPlans: MealPlan[],
  startDate: Date,
  endDate: Date
): Array<{ name: string; quantity: Quantity; source: string }> => {
  // 1. 指定期間の献立をフィルター
  const relevantMealPlans = filterMealPlansByDateRange(mealPlans, startDate, endDate);
  
  // 2. 各献立から食材を抽出
  const extractedIngredients = relevantMealPlans.flatMap(plan => 
    extractIngredientsFromSinglePlan(plan)
  );
  
  // 3. 食材を名前ごとに集計
  const ingredientMap = aggregateIngredientsByName(extractedIngredients);
  
  // 4. Map を配列に変換
  return convertMapToArray(ingredientMap);
};

// 不足している食材を特定
export const findMissingIngredients = (
  requiredIngredients: Array<{ name: string; quantity: Quantity; source: string }>,
  stockItems: StockItem[]
): Array<{ name: string; quantity: Quantity; source: string }> => {
  return requiredIngredients.filter(ingredient => {
    return !checkIngredientStock(ingredient.name, ingredient.quantity, stockItems);
  });
};

// 買い物リストアイテムを生成
export const generateShoppingListItems = (
  missingIngredients: Array<{ name: string; quantity: Quantity; source: string }>,
  existingShoppingList: ShoppingListItem[]
): Array<Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>> => {
  const existingItemNames = existingShoppingList.map(item => 
    normalizeForMatching(item.name)
  );
  
  return missingIngredients
    .filter(ingredient => {
      // 既に買い物リストにある場合は除外
      const normalizedName = normalizeForMatching(ingredient.name);
      return !existingItemNames.includes(normalizedName);
    })
    .map(ingredient => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      checked: false,
      added_from: 'auto' as const
    }));
};

// メイン関数：献立から買い物リストを自動生成
export const generateShoppingListFromMealPlans = (
  mealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingList: ShoppingListItem[],
  daysAhead: number = 7
): Array<Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>> => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);
  
  // 1. 必要な食材を抽出
  const requiredIngredients = extractIngredientsFromMealPlans(
    mealPlans, 
    startDate, 
    endDate
  );
  
  // 2. 不足している食材を特定
  const missingIngredients = findMissingIngredients(
    requiredIngredients, 
    stockItems
  );
  
  // 3. 買い物リストアイテムを生成
  return generateShoppingListItems(missingIngredients, existingShoppingList);
};