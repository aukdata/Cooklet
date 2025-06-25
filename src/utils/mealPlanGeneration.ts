import type { StockItem, MealPlan, Ingredient } from '../types';
import type { SavedRecipe } from '../types/recipe';
import type { MealType } from '../types';

// 献立生成の設定を表すインターフェース
export interface MealGenerationSettings {
  stockItems: StockItem[]; // 在庫一覧
  recipes: SavedRecipe[]; // レシピ一覧
  ingredients: Ingredient[]; // 食材マスタ一覧
  days: number; // 何日分生成するか
  mealTypes: [boolean, boolean, boolean]; // [朝, 昼, 夜]のどれを生成するか
}

// 献立生成結果を表すインターフェース
export interface MealGenerationResult {
  generatedMealPlans: MealPlan[]; // 生成された献立配列
  usedIngredients: string[]; // 使用された食材名
  warnings: string[]; // 警告メッセージ（在庫不足など）
}

/**
 * 献立を自動生成する関数
 * 現在は仮実装でログ出力のみ
 * 
 * @param settings 献立生成の設定
 * @returns 生成された献立情報
 */
export const generateMealPlan = async (settings: MealGenerationSettings): Promise<MealGenerationResult> => {
  console.log('献立生成機能が呼び出されました:', {
    在庫数: settings.stockItems.length,
    レシピ数: settings.recipes.length,
    食材マスタ数: settings.ingredients.length,
    生成日数: settings.days,
    食事タイプ: {
      朝食: settings.mealTypes[0],
      昼食: settings.mealTypes[1],
      夕食: settings.mealTypes[2]
    }
  });

  // 現在は空の配列を返す（将来の実装予定）
  return {
    generatedMealPlans: [],
    usedIngredients: [],
    warnings: ['献立生成機能は今後実装予定です']
  };
};

/**
 * 食事タイプのインデックスから日本語表記に変換
 */
export const getMealTypeFromIndex = (index: number): MealType => {
  const mealTypes: MealType[] = ['朝', '昼', '夜'];
  return mealTypes[index] || '夜';
};

/**
 * 生成する期間の日付配列を取得
 */
export const getGenerationDates = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};