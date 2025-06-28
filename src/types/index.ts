// 食事タイプを表す型定義
export type MealType = '朝' | '昼' | '夜' | '間食';

// ユーザー情報を表すインターフェース
export interface User {
  id: string; // ユーザーID（UUID）
  email: string; // メールアドレス
  name?: string; // 表示名（任意）
  googleId?: string; // Google認証ID（任意）
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
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

// 在庫アイテム情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface StockItem {
  id: string; // 在庫ID（UUID）
  user_id: string; // 所有ユーザーID（DB形式）
  name: string; // 食材名
  quantity: string; // 数量（文字列形式）
  best_before?: string; // 賞味期限（任意、DB形式）
  storage_location?: string; // 保存場所（任意、DB形式）
  is_homemade: boolean; // 作り置きフラグ（DB形式）
  memo?: string; // メモ（任意）
  created_at: string; // 作成日時（DB形式）
  updated_at: string; // 更新日時（DB形式）
}

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
  recipeIngredients?: DatabaseRecipeIngredient[]; // レシピ食材リスト（JOIN結果）
}

// データベース用のレシピ食材情報を表すインターフェース
export interface DatabaseRecipeIngredient {
  id: number; // レシピ食材ID
  recipeId: number; // レシピID
  ingredientId: number; // 食材ID
  ingredient?: Ingredient; // 食材情報（JOIN結果）
  quantity: number; // 必要数量
  unit: string; // 単位
  isOptional: boolean; // 任意フラグ
}

// 献立計画情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface MealPlan {
  id: string; // 献立ID（UUID） 
  user_id: string; // ユーザーID（DB形式）
  date: string; // 予定日
  meal_type: MealType; // 食事タイプ（日本語、DB形式）
  recipe_url?: string; // レシピURL（任意、DB形式）
  ingredients: { name: string; quantity: string }[]; // 食材リスト
  memo?: string; // メモ（任意）
  consumed_status: 'pending' | 'completed' | 'stored'; // 消費状態（未完了・完食・作り置き、DB形式）
  created_at: string; // 作成日時（DB形式）
  updated_at: string; // 更新日時（DB形式）
}

// 買い物リストアイテム情報を表すインターフェース（CLAUDE.md仕様書に準拠）
export interface ShoppingListItem {
  id: string; // 買い物リストID（UUID）
  user_id: string; // ユーザーID（DB形式）
  name: string; // 食材名
  quantity?: string; // 数量（任意）
  checked: boolean; // 完了フラグ
  added_from: 'manual' | 'auto'; // 追加方法（手動・自動、DB形式）
  created_at: string; // 作成日時（DB形式）
}

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

// レシピ保存情報を表すインターフェース（CLAUDE.md仕様書で追加）
// 注意: この型は後方互換性のため残していますが、新しいコードでは src/types/recipe.ts の SavedRecipe を使用してください
export interface SavedRecipe {
  id: string; // レシピID（UUID）
  userId: string; // ユーザーID
  title: string; // レシピタイトル
  url: string; // レシピURL
  servings: number; // 何人前
  tags: string[]; // タグ
  ingredients: { name: string; quantity: string }[]; // 食材リスト
  createdAt: string; // 作成日時
}

