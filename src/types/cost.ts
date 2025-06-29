/**
 * コスト管理関連の型定義
 */

// コスト記録情報を表すインターフェース（CLAUDE.md仕様書で追加）
export interface CostRecord {
  id?: string; // コスト記録ID（UUID）
  user_id?: string; // ユーザーID
  date: string; // 日付
  description?: string; // 内容説明
  amount: number; // 金額
  is_eating_out: boolean; // 外食フラグ
  created_at?: string; // 作成日時
}