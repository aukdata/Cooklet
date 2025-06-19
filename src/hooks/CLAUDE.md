# Hooks ディレクトリ

## 概要
Reactカスタムフックを集約したディレクトリ。データベースとの連携とビジネスロジックを提供。

## ファイル構成

### useInventory.ts
在庫管理機能を提供するカスタムフック。

#### 提供する機能
- `inventory`: 在庫アイテム配列
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addInventoryItem`: 在庫追加関数
- `updateInventoryItem`: 在庫更新関数
- `deleteInventoryItem`: 在庫削除関数
- `refetch`: 在庫再取得関数

#### 特徴
- ingredientsテーブルとのJOIN取得
- ユーザー認証状態に連動した自動データ取得
- 作成日降順での並び替え
- 日本語エラーメッセージ

### useRecipes.ts
レシピ管理機能を提供するカスタムフック。

#### 提供する機能
- `recipes`: レシピ配列（材料情報を含む）
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addRecipe`: レシピ追加関数（材料情報を含む）
- `updateRecipe`: レシピ更新関数（材料情報を含む）
- `deleteRecipe`: レシピ削除関数
- `refetch`: レシピ再取得関数

#### 特徴
- レシピ材料情報をJSONB形式で保存・取得
- AI抽出結果をそのまま保存可能
- リアルタイム更新対応
- 材料情報の型安全な管理

#### データ構造
```typescript
interface SavedRecipe {
  id: string;
  user_id: string;
  title: string;
  url: string;
  servings: number;
  tags: string[];
  ingredients: { name: string; quantity: string }[]; // 材料情報
  created_at: string;
}
```

### useIngredients.ts
食材マスタ管理機能を提供するカスタムフック（ユーザー認証対応）。

#### 提供する機能
- `ingredients`: 食材マスタ配列
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addIngredient`: 食材追加関数
- `refetch`: 食材再取得関数

#### 特徴
- カテゴリ・名前順での並び替え
- ユーザー固有の食材マスタデータ取得
- 認証ユーザー必須（useAuthとの連携）
- user_id付きでの食材追加
- RLSポリシーによるセキュリティ確保

## 共通パターン
- エラーハンドリングの統一
- 日本語エラーメッセージ
- loading状態の適切な管理
- ユーザー認証との連携（useInventory, useRecipes, useIngredients）
- Supabaseクライアントの直接利用
- RLSポリシーによるデータセキュリティ

## 注意点
- 現在のテーブル名が仕様書と一部異なる（inventory vs stock_items等）
- エラーハンドリングは基本的だが、より詳細な分類が可能
- キャッシュ機能は未実装（毎回サーバーから取得）

## セキュリティ強化（最新更新）
- ingredientsテーブルにユーザー認証を追加
- useIngredientsフックを認証対応に更新
- RLSポリシーによりユーザー固有の食材マスタを保護
- 既存システムとの互換性を維持