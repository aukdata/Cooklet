/**
 * 食材マスタ・食材項目関連の型定義
 */

import type { Quantity } from './common';

// 食材項目（Quantity型使用）
export interface IngredientItem {
  name: string; // 食材名
  quantity: Quantity; // 数量と単位
}

// 食材マスタ情報を表すインターフェース（ユーザー認証対応）
export interface Ingredient {
  id: string; // 食材ID（UUIDに変更）
  user_id: string; // 所有ユーザーID（DB形式）
  name: string; // 食材名
  category: 'vegetables' | 'meat' | 'seasoning' | 'others'; // カテゴリ（野菜・肉・調味料・その他）
  default_unit: string; // デフォルト単位（g, 個, etc.）（DB形式）
  typical_price?: number; // 一般的な価格（任意）（DB形式）
  infinity: boolean; // 無限食材フラグ（醤油、塩など1回の使用量が少なく在庫から消費されない食材）
  original_name: string; // 正規化前の商品名（商品名を一般名に変換するときに使用）（DB形式）
  conversion_quantity?: string; // 1個当たりの数量（任意）（DB形式）
  conversion_unit?: string; // 1個当たりの単位（任意）（DB形式）
  created_at: string; // 作成日時（DB形式）
  updated_at: string; // 更新日時（DB形式）
}