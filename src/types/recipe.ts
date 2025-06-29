/**
 * レシピ関連の型定義
 */

import type { IngredientItem } from './ingredient';
import type { Ingredient } from './ingredient';
import type { Quantity } from './common';

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

// レシピ情報を表すインターフェース
export interface Recipe {
  id: number; // レシピID
  userId: string; // 作成ユーザーID
  name: string; // レシピ名
  externalUrl?: string; // 外部レシピURL（任意）
  cookingTime?: number; // 調理時間（分、任意）
  servings: number; // 人前
  estimatedCost?: number; // 推定コスト（任意）
  notes?: string; // メモ（任意）
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
  recipeIngredients?: RecipeIngredient[]; // レシピ食材リスト（JOIN結果）
}

// レシピ食材情報を表すインターフェース
export interface RecipeIngredient {
  id: number; // レシピ食材ID
  recipeId: number; // レシピID
  ingredientId: number; // 食材ID
  ingredient?: Ingredient; // 食材情報（JOIN結果）
  quantity: Quantity; // 必要数量（Quantity型）
  isOptional: boolean; // 任意フラグ
}