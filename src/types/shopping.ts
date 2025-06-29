/**
 * 買い物管理関連の型定義
 */

import type { Quantity } from './common';

// 買い物リストアイテム情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface ShoppingListItem {
  id: string; // 買い物リストID（UUID）
  user_id: string; // ユーザーID（DB形式）
  name: string; // 食材名
  quantity?: Quantity; // 数量（任意、Quantity型）
  checked: boolean; // 完了フラグ
  added_from: 'manual' | 'auto'; // 追加方法（手動・自動、DB形式）
  created_at: string; // 作成日時（DB形式）
}