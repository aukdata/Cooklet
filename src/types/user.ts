/**
 * ユーザー認証関連の型定義
 */

// ユーザー情報を表すインターフェース
export interface User {
  id: string; // ユーザーID（UUID）
  email: string; // メールアドレス
  name?: string; // 表示名（任意）
  googleId?: string; // Google認証ID（任意）
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
}