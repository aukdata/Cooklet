/**
 * 在庫管理関連の型定義
 */

import type { Quantity } from './common';

// 在庫アイテム情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface StockItem {
  id: string; // 在庫ID（UUID）
  user_id: string; // 所有ユーザーID（DB形式）
  name: string; // 食材名
  quantity: Quantity; // 数量（Quantity型）
  best_before?: string; // 賞味期限（任意、DB形式）
  storage_location?: string; // 保存場所（任意、DB形式）
  is_homemade: boolean; // 作り置きフラグ（DB形式）
  memo?: string; // メモ（任意）
  created_at: string; // 作成日時（DB形式）
  updated_at: string; // 更新日時（DB形式）
}