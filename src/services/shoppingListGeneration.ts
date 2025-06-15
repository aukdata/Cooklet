// 買い物リスト自動生成サービス - CLAUDE.md仕様書に準拠
// 献立から買い物リストを自動生成し、在庫との突合を行う機能

import { type MealPlan } from '../hooks/useMealPlans';
import { type StockItem } from '../hooks/useStockItems';
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
  
  mealPlans.forEach(plan => {
    plan.ingredients.forEach(ingredient => {
      const normalizedName = normalizeIngredientName(ingredient.name);
      
      if (aggregatedIngredients.has(normalizedName)) {
        // 既存の食材がある場合は数量を合計（簡易実装）
        const existingQuantity = aggregatedIngredients.get(normalizedName)!;
        const existing = normalizeQuantity(existingQuantity);
        const current = normalizeQuantity(ingredient.quantity);
        
        if (existing.unit === current.unit) {
          const totalValue = existing.value + current.value;
          aggregatedIngredients.set(normalizedName, `${totalValue}${existing.unit}`);
        } else {
          // 単位が異なる場合は新しい量を採用
          aggregatedIngredients.set(normalizedName, ingredient.quantity);
        }
      } else {
        aggregatedIngredients.set(normalizedName, ingredient.quantity);
      }
    });
  });
  
  return aggregatedIngredients;
};

// メイン関数：献立から買い物リストを自動生成
export const generateShoppingListFromMealPlans = async (
  mealPlans: MealPlan[],
  stockItems: StockItem[]
): Promise<ShoppingListGenerationResult> => {
  try {
    if (mealPlans.length === 0) {
      return {
        success: false,
        generatedItems: [],
        summary: { totalIngredients: 0, inStock: 0, needToBuy: 0 },
        error: '献立が設定されていません'
      };
    }
    
    // 献立から必要な食材を集計
    const aggregatedIngredients = aggregateIngredientsFromMealPlans(mealPlans);
    
    const generatedItems: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>[] = [];
    let totalIngredients = 0;
    let inStock = 0;
    let needToBuy = 0;
    
    // 各食材について在庫チェック
    for (const [normalizedName, quantity] of aggregatedIngredients) {
      totalIngredients++;
      
      // 元の食材名を復元（最初に見つかった名前を使用）
      let originalName = normalizedName;
      for (const plan of mealPlans) {
        const found = plan.ingredients.find(ing => 
          normalizeIngredientName(ing.name) === normalizedName
        );
        if (found) {
          originalName = found.name;
          break;
        }
      }
      
      // 在庫チェック
      const matchingStock = findMatchingStock(originalName, stockItems);
      
      if (matchingStock && isStockSufficient(quantity, matchingStock.quantity)) {
        // 在庫が十分な場合
        inStock++;
      } else {
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
  stockItems: StockItem[]
): Promise<ShoppingListGenerationResult> => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // 指定期間の献立をフィルタリング
  const periodMealPlans = allMealPlans.filter(plan => 
    plan.date >= startDateStr && plan.date <= endDateStr
  );
  
  return generateShoppingListFromMealPlans(periodMealPlans, stockItems);
};

// 今週の買い物リストを生成
export const generateWeeklyShoppingList = async (
  allMealPlans: MealPlan[],
  stockItems: StockItem[]
): Promise<ShoppingListGenerationResult> => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // 日曜日
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // 土曜日
  
  return generateShoppingListForPeriod(startOfWeek, endOfWeek, allMealPlans, stockItems);
};

// 次の数日分の買い物リストを生成
export const generateShoppingListForNextDays = async (
  days: number,
  allMealPlans: MealPlan[],
  stockItems: StockItem[]
): Promise<ShoppingListGenerationResult> => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days - 1);
  
  return generateShoppingListForPeriod(today, endDate, allMealPlans, stockItems);
};