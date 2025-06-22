// ユーザー情報を表すインターフェース
export interface User {
  id: string; // ユーザーID（UUID）
  email: string; // メールアドレス
  name?: string; // 表示名（任意）
  google_id?: string; // Google認証ID（任意）
  created_at: string; // 作成日時
  updated_at: string; // 更新日時
}

// 食材マスタ情報を表すインターフェース（ユーザー認証対応）
export interface Ingredient {
  id: number; // 食材ID
  user_id: string; // 所有ユーザーID
  name: string; // 食材名
  category: 'vegetables' | 'meat' | 'seasoning' | 'others'; // カテゴリ（野菜・肉・調味料・その他）
  default_unit: string; // デフォルト単位（g, 個, etc.）
  typical_price?: number; // 一般的な価格（任意）
  originalName?: string; // 正規化前の商品名（商品名を一般名に変換するときに使用）
  created_at: string; // 作成日時
}

// 在庫アイテム情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface StockItem {
  id: string; // 在庫ID（UUID）
  user_id: string; // 所有ユーザーID
  name: string; // 食材名
  quantity: string; // 数量（文字列形式）
  best_before?: string; // 賞味期限（任意）
  storage_location?: string; // 保存場所（任意）
  is_homemade: boolean; // 作り置きフラグ
  created_at: string; // 作成日時
  updated_at: string; // 更新日時
}

// レシピ情報を表すインターフェース
export interface Recipe {
  id: number; // レシピID
  user_id: string; // 作成ユーザーID
  name: string; // レシピ名
  external_url?: string; // 外部レシピURL（任意）
  cooking_time?: number; // 調理時間（分、任意）
  servings: number; // 人前
  estimated_cost?: number; // 推定コスト（任意）
  notes?: string; // メモ（任意）
  created_at: string; // 作成日時
  updated_at: string; // 更新日時
  recipe_ingredients?: DatabaseRecipeIngredient[]; // レシピ食材リスト（JOIN結果）
}

// データベース用のレシピ食材情報を表すインターフェース
export interface DatabaseRecipeIngredient {
  id: number; // レシピ食材ID
  recipe_id: number; // レシピID
  ingredient_id: number; // 食材ID
  ingredient?: Ingredient; // 食材情報（JOIN結果）
  quantity: number; // 必要数量
  unit: string; // 単位
  is_optional: boolean; // 任意フラグ
}

// 献立計画情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface MealPlan {
  id: string; // 献立ID（UUID）
  user_id: string; // ユーザーID
  date: string; // 予定日
  meal_type: '朝' | '昼' | '夜' | '間食'; // 食事タイプ（日本語）
  recipe_url?: string; // レシピURL（任意）
  ingredients: { name: string; quantity: string }[]; // 食材リスト
  memo?: string; // メモ（任意）
  consumed_status?: 'pending' | 'completed' | 'stored'; // 消費状態（未完了・完食・作り置き）
  created_at: string; // 作成日時
  updated_at: string; // 更新日時
}

// 買い物リストアイテム情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface ShoppingListItem {
  id: string; // 買い物リストID（UUID）
  user_id: string; // ユーザーID
  name: string; // 食材名
  quantity?: string; // 数量（任意）
  checked: boolean; // 完了フラグ
  added_from: 'manual' | 'auto'; // 追加方法（手動・自動）
  created_at: string; // 作成日時
}

// コスト記録情報を表すインターフェース（CLAUDE.md仕様書で追加）
export interface CostRecord {
  id: string; // コスト記録ID（UUID）
  user_id: string; // ユーザーID
  date: string; // 日付
  description: string; // 内容説明
  amount: number; // 金額
  is_eating_out: boolean; // 外食フラグ
  created_at: string; // 作成日時
}

// レシピ保存情報を表すインターフェース（CLAUDE.md仕様書で追加）
export interface SavedRecipe {
  id: string; // レシピID（UUID）
  user_id: string; // ユーザーID
  title: string; // レシピタイトル
  url: string; // レシピURL
  servings: number; // 何人前
  tags: string[]; // タグ
  created_at: string; // 作成日時
}

