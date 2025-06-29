// レシピ関連の共通型定義
import { type IngredientItem } from './index';

// 保存されたレシピデータ（CLAUDE.md仕様書準拠）
export interface SavedRecipe {
  id: string;
  user_id: string;
  title: string;
  url: string;
  servings: number;
  tags: string[];
  ingredients: IngredientItem[];
  created_at: string;
}

// レシピフォームデータ（新規作成・編集用）
export interface RecipeFormData {
  title: string;
  url: string;
  servings: number;
  ingredients: IngredientItem[];
  tags: string[];
}

// レシピ作成用の型（IDと作成日時を除く）
export type CreateRecipeData = Omit<SavedRecipe, 'id' | 'user_id' | 'created_at'>;

// レシピ更新用の型（部分更新可能）
export type UpdateRecipeData = Partial<CreateRecipeData>;