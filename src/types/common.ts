/**
 * 共通型定義 - 全ドメインで使用される基盤型
 */

// 食事タイプを表す型定義
export type MealType = '朝' | '昼' | '夜' | '間食';

// 献立ソースタイプを表す型定義
export type MealSourceType = 'recipe' | 'stock';

// 数量と単位を表すインターフェース
export interface Quantity {
  amount: string; // 数量（文字列形式）
  unit: string; // 単位
}