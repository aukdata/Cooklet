/**
 * TypeScript型定義の統一エクスポートファイル
 * 後方互換性を維持しながら、ドメイン別に分割された型定義を統合
 */

// 共通型定義
export type { MealType, MealSourceType, Quantity } from './common';

// ユーザー認証関連
export type { User } from './user';

// 食材マスタ・食材項目関連
export type { Ingredient, IngredientItem } from './ingredient';

// 在庫管理関連
export type { StockItem } from './stock';

// 献立管理関連
export type { MealPlan } from './meal';

// レシピ関連
export type { 
  Recipe, 
  RecipeIngredient, 
  SavedRecipe, 
  RecipeFormData, 
  CreateRecipeData, 
  UpdateRecipeData 
} from './recipe';

// 買い物管理関連
export type { ShoppingListItem } from './shopping';

// コスト管理関連
export type { CostRecord } from './cost';