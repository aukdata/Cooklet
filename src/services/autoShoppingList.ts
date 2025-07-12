// 献立から買い物リスト自動生成のユーティリティ（CLAUDE.md仕様書準拠）

import { type MealPlan, type StockItem, type IngredientItem, type Quantity } from '../types/index';
import { type ShoppingListItem } from '../hooks/useShoppingList';
import { normalizeForMatching } from '../utils/ingredientNormalizer';

// 食材名の正規化処理は ingredientNormalizer.ts の統一実装を使用

// 食材の数量を抽出
export const extractQuantity = (ingredientText: string): { name: string; quantity: string } => {
  // 数量パターンのマッチング
  const quantityPattern = /(\d+(?:\.\d+)?)\s*([gkgml個本枚切れパック袋缶])/i;
  const match = ingredientText.match(quantityPattern);
  
  if (match) {
    const quantity = `${match[1]}${match[2]}`;
    const name = ingredientText.replace(quantityPattern, '').trim();
    return { name: name || ingredientText, quantity };
  }
  
  return { name: ingredientText, quantity: '適量' };
};

// 在庫と必要量を比較して不足をチェック
export const checkIngredientStock = (
  ingredientName: string, 
  _requiredQuantity: Quantity, 
  stockItems: StockItem[]
): boolean => {
  const normalizedIngredient = normalizeForMatching(ingredientName);
  
  // 在庫に同じまたは類似の食材があるかチェック
  const stockItem = stockItems.find(stock => {
    const normalizedStock = normalizeForMatching(stock.name);
    return normalizedStock.includes(normalizedIngredient) || 
           normalizedIngredient.includes(normalizedStock);
  });
  
  if (!stockItem) {
    return false; // 在庫なし
  }
  
  // 簡単な数量チェック（実際の実装ではより精密な比較が必要）
  // ここでは基本的な存在チェックのみ
  return true; // 在庫あり（数量は考慮せず存在のみチェック）
};

// 指定期間の献立から必要な食材を抽出
export const extractIngredientsFromMealPlans = (
  mealPlans: MealPlan[],
  startDate: Date,
  endDate: Date
): Array<{ name: string; quantity: Quantity; source: string }> => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // 指定期間の献立をフィルター
  const relevantMealPlans = mealPlans.filter(plan => {
    return plan.date >= startDateStr && plan.date <= endDateStr;
  });
  
  const ingredientMap = new Map<string, { quantity: Quantity; sources: string[] }>();
  
  // 各献立から食材を抽出
  relevantMealPlans.forEach(plan => {
    plan.ingredients.forEach((ingredient: IngredientItem) => {
      const { name, quantity } = extractQuantity(ingredient.name);
      const normalizedName = normalizeForMatching(name);
      const source = `${plan.date}${plan.meal_type}`;
      
      if (ingredientMap.has(normalizedName)) {
        const existing = ingredientMap.get(normalizedName)!;
        existing.sources.push(source);
      } else {
        ingredientMap.set(normalizedName, {
          quantity: ingredient.quantity || { amount: quantity, unit: '' },
          sources: [source]
        });
      }
    });
  });
  
  // Map を配列に変換
  return Array.from(ingredientMap.entries()).map(([name, data]) => ({
    name,
    quantity: data.quantity,
    source: data.sources.join(', ')
  }));
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