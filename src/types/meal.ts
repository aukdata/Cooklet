/**
 * 献立管理関連の型定義
 */

import type { MealType, MealSourceType } from './common';
import type { IngredientItem } from './ingredient';

// 献立計画情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface MealPlan {
  id: string; // 献立ID（UUID） 
  user_id: string; // ユーザーID（DB形式）
  date: string; // 予定日
  meal_type: MealType; // 食事タイプ（日本語、DB形式）
  source_type: MealSourceType; // 献立ソースタイプ（recipe: レシピ、stock: 在庫、DB形式）
  recipe_url?: string; // レシピURL（任意、DB形式）
  stock_id?: string; // 在庫ID（source_typeがstockの場合、DB形式）
  ingredients: IngredientItem[]; // 食材リスト（Quantity型使用）
  memo?: string; // メモ（任意）
  consumed_status: 'pending' | 'completed' | 'stored'; // 消費状態（未完了・完食・作り置き、DB形式）
  created_at: string; // 作成日時（DB形式）
  updated_at: string; // 更新日時（DB形式）
}