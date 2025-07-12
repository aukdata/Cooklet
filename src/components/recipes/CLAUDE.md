# src/components/recipes - レシピコンポーネント

レシピ画面で使用するUIコンポーネントを管理するディレクトリです。

## ファイル構成

### RecipesHeader.tsx
レシピページのヘッダー部分コンポーネント

#### Props
- `recipeCount: number` - 保存済みレシピ件数
- `loading: boolean` - 読み込み中状態
- `error: string | null` - エラー状態
- `onAddNewRecipe: () => void` - レシピ追加ボタンのクリックハンドラー

#### 機能
- レシピ管理タイトル表示（🍳アイコン付き）
- 保存済みレシピ件数表示
- ローディング・エラー状態表示
- レシピ追加ボタン

### RecipesFilter.tsx
レシピページの検索・フィルター部分コンポーネント

#### Props
- `searchQuery: string` - 検索クエリ
- `selectedTag: string` - 選択中のタグ
- `allTags: string[]` - 全タグリスト
- `onSearchQueryChange: (query: string) => void` - 検索クエリ変更ハンドラー
- `onSelectedTagChange: (tag: string) => void` - タグ選択変更ハンドラー

#### 機能
- 検索入力フィールド（🔍アイコン付き）
- タグフィルターボタン群（🏷️アイコン付き）
- 選択中タグのハイライト表示
- 絞込ボタン（機能未実装）

### RecipesList.tsx
レシピ一覧表示部分コンポーネント

#### Props
- `recipes: SavedRecipe[]` - 表示するレシピリスト
- `onShowRecipeDetail: (recipe: SavedRecipe) => void` - レシピ詳細表示ハンドラー
- `onEditRecipe: (recipe: SavedRecipe) => void` - レシピ編集ハンドラー
- `onAddToMealPlan: (recipe: SavedRecipe) => void` - 献立追加ハンドラー
- `getLastCookedDate: (url: string) => string | null` - 最後に作った日取得関数

#### 機能
- レシピカード一覧のコンテナ
- 空状態メッセージ表示
- RecipeCardコンポーネントの描画

### RecipeCard.tsx
個別レシピカード全体コンポーネント

#### Props
- `recipe: SavedRecipe` - レシピデータ
- `onShowRecipeDetail: (recipe: SavedRecipe) => void` - レシピ詳細表示ハンドラー
- `onEditRecipe: (recipe: SavedRecipe) => void` - レシピ編集ハンドラー
- `onAddToMealPlan: (recipe: SavedRecipe) => void` - 献立追加ハンドラー
- `getLastCookedDate: (url: string) => string | null` - 最後に作った日取得関数

#### 機能
- 再利用可能なボタンコンポーネントを統合
- レシピカードのレイアウト管理
- レシピ情報表示（人前・最後に作った日・材料）

#### ヘルパー関数
- `formatDate(dateStr: string)` - 日付をMM/DD形式でフォーマット

## 再利用可能なボタンコンポーネント

### AddToMealPlanButton.tsx
献立追加ボタンコンポーネント（再利用可能）

#### Props
- `recipe: SavedRecipe` - レシピデータ
- `onClick: (recipe: SavedRecipe) => void` - クリックハンドラー

#### 機能
- 献立追加ボタン（📅アイコン付き）
- 緑色のボタンスタイル

### RecipeUrlButton.tsx
レシピURL開くボタンコンポーネント（再利用可能）

#### Props
- `url: string` - レシピURL

#### 機能
- 外部レシピURL開くボタン（🌐アイコン付き）
- 新しいタブで開く

### RecipeTitle.tsx
クリック可能なレシピタイトルコンポーネント（再利用可能）

#### Props
- `recipe: SavedRecipe` - レシピデータ
- `onClick: (recipe: SavedRecipe) => void` - クリックハンドラー

#### 機能
- レシピタイトル表示（📄アイコン付き）
- クリックで詳細表示
- ホバー時のスタイル変更

## 設計思想

### コンポーネント分割の利点
- **責任の分離**: 各コンポーネントが単一の責任を持つ
- **再利用性**: 他の画面でも部分的に再利用可能
- **保守性**: 各部分の変更が他に影響しない
- **テスタビリティ**: 個別にテスト可能

### 状態管理パターン
- 親コンポーネント（Recipes.tsx）で状態管理
- 子コンポーネントはpropsでデータ受け取り
- イベントハンドラーはpropsで親から受け取り

### UIの一貫性
- 絵文字アイコンの統一使用
- 共通ボタンコンポーネント（EditButton）の使用
- Tailwind CSSクラスの一貫したパターン

## 依存関係
- `EditButton` - 共通編集ボタンコンポーネント
- `SavedRecipe` - レシピ型定義

各コンポーネントは独立しており、他のレシピ関連機能でも再利用可能な設計となっています。