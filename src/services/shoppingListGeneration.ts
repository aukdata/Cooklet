// 買い物リスト自動生成サービス - CLAUDE.md仕様書に準拠
// 献立から買い物リストを自動生成し、在庫との突合を行う機能

import { type MealPlan, type StockItem } from '../types/index';
import { type ShoppingListItem } from '../hooks/useShoppingList';

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

// 食材の数量を正規化する関数
const normalizeQuantity = (quantity: string): { value: number; unit: string } => {
  // "2個", "200g", "1本"等から数値と単位を分離
  const match = quantity.match(/^(\d+(?:\.\d+)?)(.*)$/);
  
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2].trim() || '個'
    };
  }
  
  // 数値が見つからない場合は適量として扱う
  return {
    value: 1,
    unit: quantity || '適量'
  };
};

// 食材名の正規化（類似食材のマッチング用）
const normalizeIngredientName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[（）()]/g, '')
    .trim();
};

// 在庫の食材と献立の食材をマッチングする関数
const findMatchingStock = (ingredientName: string, stockItems: StockItem[]): StockItem | null => {
  const normalizedName = normalizeIngredientName(ingredientName);
  
  return stockItems.find(stock => {
    const normalizedStockName = normalizeIngredientName(stock.name);
    return normalizedStockName === normalizedName || 
           normalizedStockName.includes(normalizedName) ||
           normalizedName.includes(normalizedStockName);
  }) || null;
};

// 在庫が足りているかチェックする関数
const isStockSufficient = (
  requiredQuantity: string, 
  stockQuantity: string
): boolean => {
  const required = normalizeQuantity(requiredQuantity);
  const stock = normalizeQuantity(stockQuantity);
  
  // 単位が異なる場合は不十分とする（簡易実装）
  if (required.unit !== stock.unit && 
      !(required.unit === '個' && stock.unit === '本') &&
      !(required.unit === '本' && stock.unit === '個')) {
    return false;
  }
  
  return stock.value >= required.value;
};

// 献立から必要な食材を集計する関数
const aggregateIngredientsFromMealPlans = (mealPlans: MealPlan[]): Map<string, string> => {
  const aggregatedIngredients = new Map<string, string>();
  
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
    
    ingredients.forEach((ingredient: { name: string; quantity: string } | unknown, ingredientIndex) => {
      console.log(`🔍 [Debug] 献立 ${planIndex + 1} 食材 ${ingredientIndex + 1}:`, ingredient);
      
      // 型ガードで安全にアクセス
      if (!ingredient || typeof ingredient !== 'object' || !('name' in ingredient) || !('quantity' in ingredient)) {
        console.warn(`⚠️ [Debug] 献立 ${planIndex + 1} 食材 ${ingredientIndex + 1} が無効:`, ingredient);
        return;
      }

      const typedIngredient = ingredient as { name: string; quantity: string };
      
      const normalizedName = normalizeIngredientName(typedIngredient.name);
      console.log(`🔍 [Debug] 正規化された食材名: "${typedIngredient.name}" → "${normalizedName}"`);
      
      if (aggregatedIngredients.has(normalizedName)) {
        // 既存の食材がある場合は数量を合計（簡易実装）
        const existingQuantity = aggregatedIngredients.get(normalizedName)!;
        const existing = normalizeQuantity(existingQuantity);
        const current = normalizeQuantity(typedIngredient.quantity);
        
        if (existing.unit === current.unit) {
          const totalValue = existing.value + current.value;
          aggregatedIngredients.set(normalizedName, `${totalValue}${existing.unit}`);
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

// メイン関数：献立から買い物リストを自動生成
export const generateShoppingListFromMealPlans = async (
  mealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingItems: ShoppingListItem[] = []
): Promise<ShoppingListGenerationResult> => {
  try {
    console.log('🔍 [Debug] generateShoppingListFromMealPlans 開始');
    console.log('🔍 [Debug] 入力 - 献立数:', mealPlans.length);
    console.log('🔍 [Debug] 入力 - 在庫数:', stockItems.length);
    console.log('🔍 [Debug] 入力 - 既存買い物リスト数:', existingShoppingItems.length);
    console.log('🔍 [Debug] 献立詳細:', mealPlans);
    
    if (mealPlans.length === 0) {
      console.log('🔍 [Debug] 献立が0件のため終了');
      return {
        success: false,
        generatedItems: [],
        summary: { totalIngredients: 0, inStock: 0, needToBuy: 0 },
        error: '献立が設定されていません'
      };
    }
    
    // 献立から必要な食材を集計
    const aggregatedIngredients = aggregateIngredientsFromMealPlans(mealPlans);
    
    console.log('🔍 [Debug] 集計された食材:', aggregatedIngredients);
    console.log('🔍 [Debug] 集計された食材数:', aggregatedIngredients.size);
    
    // 既存の買い物リストアイテムを正規化してマップ化
    const existingItemsMap = new Map<string, ShoppingListItem>();
    existingShoppingItems.forEach(item => {
      const normalizedName = normalizeIngredientName(item.name);
      existingItemsMap.set(normalizedName, item);
    });
    
    const generatedItems: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>[] = [];
    let totalIngredients = 0;
    let inStock = 0;
    let needToBuy = 0;
    
    console.log('🔍 [Debug] 各食材について在庫チェック開始');
    console.log('🔍 [Debug] aggregatedIngredients entries:', Array.from(aggregatedIngredients.entries()));

    // 各食材について在庫チェック
    for (const [normalizedName, quantity] of aggregatedIngredients) {
      totalIngredients++;
      console.log(`🔍 [Debug] 処理中の食材: "${normalizedName}" (${quantity})`);
      
      // 元の食材名を復元（最初に見つかった名前を使用）
      let originalName = normalizedName;
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
          return normalizeIngredientName(typedIng.name) === normalizedName;
        });
        if (found && typeof found === 'object' && 'name' in found) {
          const typedFound = found as { name: string };
          originalName = typedFound.name;
          break;
        }
      }
      
      // 在庫チェック
      const matchingStock = findMatchingStock(originalName, stockItems);
      
      if (matchingStock && isStockSufficient(quantity, matchingStock.quantity)) {
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
        
        let finalQuantity = quantity;
        
        // 在庫がある場合は不足分のみ計算
        if (matchingStock) {
          const required = normalizeQuantity(quantity);
          const stock = normalizeQuantity(matchingStock.quantity);
          
          if (required.unit === stock.unit) {
            const shortage = Math.max(0, required.value - stock.value);
            finalQuantity = shortage > 0 ? `${shortage}${required.unit}` : quantity;
          }
        }
        
        generatedItems.push({
          name: originalName,
          quantity: finalQuantity,
          checked: false,
          added_from: 'auto'
        });
      }
    }
    
    return {
      success: true,
      generatedItems,
      summary: {
        totalIngredients,
        inStock,
        needToBuy
      }
    };
    
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
  existingShoppingItems: ShoppingListItem[] = []
): Promise<ShoppingListGenerationResult> => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // 指定期間の献立をフィルタリング
  const periodMealPlans = allMealPlans.filter(plan => 
    plan.date >= startDateStr && plan.date <= endDateStr
  );
  
  return generateShoppingListFromMealPlans(periodMealPlans, stockItems, existingShoppingItems);
};

// 今週の買い物リストを生成
export const generateWeeklyShoppingList = async (
  allMealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingItems: ShoppingListItem[] = []
): Promise<ShoppingListGenerationResult> => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // 日曜日
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // 土曜日
  
  return generateShoppingListForPeriod(startOfWeek, endOfWeek, allMealPlans, stockItems, existingShoppingItems);
};

// 次の数日分の買い物リストを生成
export const generateShoppingListForNextDays = async (
  days: number,
  allMealPlans: MealPlan[],
  stockItems: StockItem[],
  existingShoppingItems: ShoppingListItem[] = []
): Promise<ShoppingListGenerationResult> => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days - 1);
  
  return generateShoppingListForPeriod(today, endDate, allMealPlans, stockItems, existingShoppingItems);
};