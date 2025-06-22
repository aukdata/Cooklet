# Cooklet プロジェクト要素一覧

## 目的
この文書は、新しい機能を追加する際に既存の型・コンポーネント・関数を再利用するためのリファレンスです。
**新要素を作成する前に、必ずこの一覧を確認し、既存要素での実現可能性を検討してください。**

## 使用方法
1. 機能実装前にこの文書で既存要素を確認
2. 既存要素で要件を満たせる場合は再利用
3. 新要素が必要な場合のみ作成し、必ずこの文書に追加

---

## 1. TypeScript型定義

### 基本データ型 (src/types/index.ts)

#### ユーザー・認証
- `User` - ユーザー情報（id, email, name, google_id, 作成日時）

#### 食材・在庫管理
- `Ingredient` - 食材マスタ（id, user_id, name, category, default_unit, typical_price, original_name, conversion_quantity, conversion_unit）
- `StockItem` - 在庫アイテム（id, user_id, name, quantity, best_before, storage_location, is_homemade）

#### 献立・レシピ管理
- `MealPlan` - 献立計画（id, user_id, date, meal_type, recipe_url, ingredients, memo, consumed_status）
- `Recipe` - レシピ情報（id, user_id, name, external_url, cooking_time, servings, estimated_cost）
- `SavedRecipe` - レシピ保存（id, user_id, title, url, servings, tags）
- `DatabaseRecipeIngredient` - レシピ食材（recipe_id, ingredient_id, quantity, unit, is_optional）

#### 買い物・コスト管理
- `ShoppingListItem` - 買い物リスト（id, user_id, name, quantity, checked, added_from）
- `CostRecord` - コスト記録（id, user_id, date, description, amount, is_eating_out）

### レシピ専用型 (src/types/recipe.ts)
- `RecipeIngredient` - レシピ材料（name, quantity）
- `RecipeFormData` - レシピフォーム用データ
- `CreateRecipeData` - レシピ作成用（IDと作成日時を除く）
- `UpdateRecipeData` - レシピ更新用（部分更新可能）

---

## 2. UIコンポーネント

### 2.1 基本UIコンポーネント (src/components/ui)

#### ダイアログ関連
- `BaseDialog` - 全ダイアログの基盤（isOpen, onClose, title, icon, size, 3段階ボタン配置）

#### ボタン関連
- `Button` - 基本ボタン（variant: primary, secondary, edit, delete, add）
- `EditButton` - 編集ボタン（統一デザイン）
- `AddButton` - 追加ボタン（統一デザイン）
- `DeleteButton` - 削除ボタン（統一デザイン）

#### フォーム関連
- `FormField` - ラベル付きフィールド（エラーメッセージ表示付き）
- `TextInput` - テキスト入力
- `TextArea` - テキストエリア
- `NumberInput` - 数値入力
- `DateInput` - 日付入力（クイック設定ボタン付き）
- `IngredientsEditor` - 食材リスト編集（追加・編集・削除・バリデーション）

#### フィードバック関連
- `Toast` / `ToastContainer` - 通知メッセージ表示

### 2.2 専用ダイアログ (src/components/dialogs)

#### 機能別ダイアログ
- `MealPlanEditDialog` - 献立編集（レシピ選択、食材リスト編集）
- `RecipeDialog` - レシピ編集（AI食材抽出、タグ管理）
- `StockDialog` - 在庫編集（賞味期限、保存場所、単位選択）
- `CostDialog` - コスト記録（自炊/外食区別、数値バリデーション）
- `ConfirmDialog` - 削除確認（カスタマイズ可能メッセージ）

### 2.3 レイアウトコンポーネント (src/components/layout)

#### レイアウト管理
- `MainLayout` - メインレイアウト（タブ管理、認証状態管理、設定画面表示）
- `TabNavigation` - 下部タブナビゲーション（6タブ構成）

### 2.4 共通コンポーネント (src/components/common)

#### 特殊入力
- `QuantityInput` - 数量入力（単位選択統合）
- `ErrorBoundary` - Reactエラーバウンダリー

---

## 3. カスタムフック

### 3.1 データ管理フック (src/hooks)

#### CRUD操作フック
- `useMealPlans` - 献立計画CRUD（消費状態管理、タブ切り替え時更新）
- `useRecipes` - レシピCRUD（材料情報JSONB管理、AI抽出結果保存）
- `useStockItems` - 在庫CRUD（賞味期限管理、作り置きフラグ管理）
- `useShoppingList` - 買い物リストCRUD（チェック状態、手動/自動区別）
- `useCostRecords` - コスト記録CRUD（自炊/外食区別、月別集計）
- `useIngredients` - 食材マスタCRUD（ユーザー認証対応）

### 3.2 機能特化フック

#### 自動化機能
- `useAutoShoppingList` - 買い物リスト自動生成（献立→在庫突合→買い物リスト）
- `useRecipeExtraction` - レシピURL食材自動抽出（AI連携）

#### システム機能
- `useTabRefresh` - タブ切り替え時データ更新チェック（5分間隔）
- `useToast` - トースト通知管理
- `useConfirmDialog` - 確認ダイアログ表示制御
- `useCache` - データキャッシュ管理
- `useBuildInfo` - ビルド情報取得

---

## 4. ユーティリティ関数

### 4.1 日付関連ユーティリティ (src/components/ui/DateInput.tsx)
- `getTodayString()` - 今日の日付文字列取得
- `getDateAfterDays(days)` - 指定日数後の日付取得
- `getDaysDifference(date1, date2)` - 日付間の日数差計算

### 4.2 食材・在庫関連ユーティリティ (src/components/ui/IngredientsEditor.tsx)
- `validateIngredients(ingredients)` - 食材リストバリデーション
- `cleanIngredients(ingredients)` - 食材リストクリーンアップ
- `normalizeIngredients(ingredients)` - 食材リスト正規化

### 4.3 買い物リスト生成ユーティリティ (src/utils/autoShoppingList.ts)
- `normalizeIngredientName(name)` - 食材名正規化
- `extractQuantity(text)` - テキストから数量抽出
- `checkIngredientStock(name, quantity, stock)` - 在庫充足チェック
- `extractIngredientsFromMealPlans(plans, start, end)` - 献立から食材抽出
- `findMissingIngredients(required, stock)` - 不足食材特定
- `generateShoppingListFromMealPlans(plans, stock, existing, days)` - メイン生成関数

### 4.4 数量・単位関連ユーティリティ (src/constants/units.ts)
- `parseQuantity(text)` - テキストから数量パース
- `formatQuantity(value, unit)` - 数量フォーマット

---

## 5. 定数・設定

### 5.1 食材単位定義 (src/constants/units.ts)
- `FOOD_UNITS` - 食材単位一覧（g, kg, ml, L, 個, 本, 包等）
- `FoodUnit` - 食材単位型定義

### 5.2 Supabaseクライアント (src/lib/supabase.ts)
- `supabase` - Supabaseクライアントインスタンス

### 5.3 Web取得クライアント (src/lib/web-fetch.ts)
- `WebFetcher` - Webサイト取得クラス（Netlify Functionsプロキシ使用）
- `WebFetchError` - Web取得専用エラークラス
- `FetchedWebsite` - 取得結果型定義

---

## 6. AI連携要素 (src/lib/ai)

### 6.1 AI型定義 (src/lib/ai/types.ts)
- `RecipeExtraction` - レシピ抽出結果型
- `AIProviderConfig` - AIプロバイダー設定型
- `AIProvider` - AIプロバイダーインターフェース
- `RecipeExtractionError` - レシピ抽出エラークラス

### 6.2 AIプロバイダー管理
- `ProviderFactory` - AIプロバイダー選択・生成（src/lib/ai/provider-factory.ts）
- `GeminiProvider` - Google Gemini AI連携（src/lib/ai/providers/gemini-provider.ts）

---

## 7. コンテキスト (src/contexts)

### 7.1 認証管理
- `useAuth` / `AuthProvider` - 認証状態管理（ユーザープロフィール、セッション管理）

### 7.2 UI状態管理
- `useDialog` / `DialogProvider` - グローバルダイアログ管理

---

## 8. サービス層 (src/services)

### 8.1 買い物リスト生成サービス (src/services/shoppingListGeneration.ts)
- `generateShoppingListFromMealPlans` - 献立から買い物リスト生成
- `generateWeeklyShoppingList` - 週間買い物リスト生成
- `generateShoppingListForNextDays` - 指定日数分買い物リスト生成

---

## 新要素追加ガイドライン

### 追加前チェックリスト
1. ✅ 既存の型で要件を満たせないか確認
2. ✅ 既存のコンポーネントで実現できないか確認
3. ✅ 既存のフックで機能を提供できないか確認
4. ✅ 既存のユーティリティ関数で処理できないか確認

### 新要素作成時の必須事項
1. **型安全性**: `any`型は絶対使用禁止、厳密な型定義を作成
2. **命名規則**: 既存パターンに従った命名
3. **日本語コメント**: すべての要素に説明コメントを追加
4. **ドキュメント更新**: この文書に新要素を必ず追加
5. **テスト**: 基本的な動作確認を実施

### 新要素追加後の作業
1. **ELEMENTS.md更新**: 新要素の詳細情報を追加
2. **関連CLAUDE.md更新**: 該当ディレクトリのドキュメント更新
3. **DEVELOPMENT_LOG.md記録**: 追加の経緯と使用方法を記録

---

## 重要な注意事項

### 再利用優先の原則
- **新規作成は最後の手段**: 既存要素での実現可能性を必ず検討
- **統一性の維持**: UIデザイン、エラーハンドリング、命名規則の一貫性
- **型安全性の徹底**: TypeScript型システムを最大限活用

### CLAUDE.md仕様書準拠
- **全要素**: CLAUDE.md仕様書の設計原則に従って作成
- **データベース**: 型定義とデータベーススキーマの整合性維持
- **UI/UX**: .claude/UI.mdの設計ルールに従った実装

この文書を活用することで、効率的で一貫性のある開発を推進し、コードベースの品質を維持できます。