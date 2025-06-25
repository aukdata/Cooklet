# Cooklet - 要素定義リスト

このファイルは、Cookletアプリで使用可能な型、コンポーネント、関数をまとめたリストです。
新機能を追加する際は、既存要素を最大限活用し、必要な場合のみ新しい要素を追加してください。

## 主要データ型（types/index.ts）

### ユーザー・認証関連
- `User` - ユーザー情報（id, email, name, google_id, 作成日時等）
- `Ingredient` - 食材マスタ情報（id, user_id, name, category, default_unit, typical_price, original_name等）

### 在庫・食材関連
- `StockItem` - 食材在庫情報（id, user_id, name, quantity, best_before, storage_location, is_homemade等）
- `Recipe` - レシピ情報（id, user_id, name, external_url, cooking_time, servings等）
- `DatabaseRecipeIngredient` - レシピで使用する食材情報（recipe_id, ingredient_id, quantity, unit, is_optional）
- `SavedRecipe` - レシピ保存（id, user_id, title, url, servings, tags等）

### 献立・買い物関連
- `MealPlan` - 献立計画（id, user_id, date, meal_type, recipe_url, ingredients, memo等）
- `ShoppingListItem` - 買い物リスト項目（id, user_id, name, quantity, checked, added_from等）
- `CostRecord` - コスト記録（id, user_id, date, description, amount, is_eating_out等）

### 追加データ型
- `MealType` - 食事タイプ（'朝食' | '昼食' | '夕食' | '間食'）

## UI共通コンポーネント

### 共通入力コンポーネント（components/common/）

#### NameQuantityUnitInput.tsx
- `NameQuantityUnitInput` - 名前・数量・単位の統合入力コンポーネント
  - Props: name, quantity, unit, onNameChange, onQuantityChange, onUnitChange, disabled?, placeholders?, className?
  - 3列グリッドレイアウト
  - レシート読み取り結果編集などで使用

#### QuantityInput.tsx
- `QuantityInput` - 数値と単位を分離した入力コンポーネント
  - Props: value, onChange, placeholder?, className?, disabled?
  - parseQuantity/formatQuantity関数との連携
  - 在庫ダイアログ・買い物リストで使用

### UIコンポーネント（components/ui/）

#### BaseDialog.tsx
- `BaseDialog` - 全ダイアログで共通のUI構造を提供する基盤コンポーネント
  - Props: isOpen, onClose, title, icon, children, size?, showDelete?, onSave?, onDelete?
  - サイズバリエーション（sm/md/lg）
  - 3段階ボタン配置（削除・キャンセル・保存）

### FormField.tsx
- `FormField` - 統一されたラベル付きフィールドコンポーネント
  - Props: label, icon?, children, required?, error?
- `TextInput` - テキスト入力フィールド
- `TextArea` - テキストエリアフィールド
- `NumberInput` - 数値入力フィールド

### DateInput.tsx
- `DateInput` - クイック設定ボタン付きの統一日付入力コンポーネント
  - Props: value, onChange, showQuickButtons?, disabled?
- `getTodayString()` - 今日の日付取得
- `getDateAfterDays(days)` - 指定日数後の日付取得
- `getDaysDifference(date1, date2)` - 日付差分計算

### IngredientsEditor.tsx
- `IngredientsEditor` - 食材リストの追加・編集・削除機能を統一したコンポーネント
  - Props: ingredients, onChange, disabled?, maxItems?, addButtonText?
- `validateIngredients(ingredients)` - 食材リストのバリデーション
- `cleanIngredients(ingredients)` - 空の項目を除去
- `normalizeIngredients(ingredients)` - 食材リストの正規化

### Button.tsx
- `Button` - 基本的なボタンコンポーネント
  - Props: onClick, children, variant?, size?, disabled?, className?
  - バリアント: 'primary' | 'secondary' | 'edit' | 'delete' | 'add'
- `EditButton` - 編集用の専用ボタン
- `AddButton` - 追加用の専用ボタン
- `DeleteButton` - 削除用の専用ボタン

### Toast.tsx & ToastContainer.tsx
- `Toast` - 個別トースト表示コンポーネント
  - Props: message, type, onClose, id
  - タイプ: 'success' | 'error' | 'info'
  - 自動消去機能（5秒後）
- `ToastContainer` - 複数トースト管理コンポーネント
  - Props: toasts, onRemoveToast
  - 画面右上に固定表示
  - アニメーション対応
- `ToastProvider` - アプリ全体のトースト管理Context Provider（useToast.tsxで提供）
  - showToast、showSuccess、showError、showInfo関数を提供

## ダイアログコンポーネント（components/dialogs/）

### 主要ダイアログ
- `MealPlanEditDialog` - 献立編集ダイアログ（日付・食事タイプ・レシピ・人数・メモの編集）
- `MealPlanDialog` - 献立ダイアログ（CLAUDE.md仕様書準拠の献立編集機能）
- `ManualMealDialog` - 手動献立入力ダイアログ（料理名・レシピURL・人数・メモの入力）
- `AddToMealPlanDialog` - レシピから献立追加ダイアログ（GitHub issue #31対応、日付・食事タイプ選択）
- `RecipeDetailDialog` - レシピ詳細表示ダイアログ（基本情報表示・編集・削除アクション）
- `RecipeDialog` - レシピ編集ダイアログ（レシピ名・URL・人数・食材・タグの編集）
- `StockDialog` - 在庫編集ダイアログ（食材名・数量・単位・賞味期限・保存場所・作り置きフラグ）
- `CostDialog` - コスト記録ダイアログ（日付・内容・金額・自炊/外食フラグ・メモ）
- `ShoppingItemDialog` - 買い物リストアイテム編集ダイアログ（名前・数量の編集、削除機能付き）
- `ConfirmDialog` - 削除確認ダイアログ（汎用的な確認ダイアログ）
- `IngredientDialog` - 材料編集ダイアログ（材料名・カテゴリ・デフォルト単位・価格）

### 共通仕様
- `useConfirmDialog` - 確認ダイアログフック

## レイアウトコンポーネント（components/layout/）

- `MainLayout` - アプリケーションのメインレイアウト（ヘッダー、コンテンツエリア、タブナビゲーション）
- `TabNavigation` - 下部固定のタブナビゲーション（6つのタブ: summary, meal-plans, shopping, recipes, stock, cost）

## カスタムフック（hooks/）

### データ管理フック
- `useStockItems` - 在庫管理機能（stockItems, loading, error, addStockItem, updateStockItem, deleteStockItem, refetch）
- `useRecipes` - レシピ管理機能（recipes, loading, error, addRecipe, updateRecipe, deleteRecipe, refetch）
- `useMealPlans` - 献立計画管理機能（mealPlans, loading, error, addMealPlan, updateMealPlan, deleteMealPlan, refetch）
- `useShoppingList` - 買い物リスト管理機能（shoppingList, loading, error, addShoppingItem, updateShoppingItem, deleteShoppingItem, toggleShoppingItem）
- `useCostRecords` - コスト記録管理機能（costRecords, loading, error, addCostRecord, updateCostRecord, deleteCostRecord, refetch）
- `useIngredients` - 食材マスタ管理機能（ingredients, loading, error, addIngredient, updateIngredient, deleteIngredient, findIngredientByOriginalName, refetch）

### 機能特化フック
- `useRecipeExtraction` - レシピURLからの食材自動抽出機能（extractIngredients, loading, error）
- `useAutoShoppingList` - 献立からの買い物リスト自動生成機能（generateShoppingList, loading, error）
- `useNotificationSettings` - 通知設定管理機能（settings, loading, error, updateSettings, enableNotifications, disableNotifications, updateExpiryDays, requestNotificationPermission）
- `useExpiryNotifications` - 賞味期限チェックと通知管理機能（checkExpiryItems, sendNotification, checkAndNotify, loading）

### ユーティリティフック
- `useCache` - キャッシュ機能
- `useConfirmDialog` - 確認ダイアログ管理
- `useBuildInfo` - ビルド情報取得
- `useTabRefresh` - タブ切り替え時の更新チェック機能
- `useToast` - トースト通知管理

## コンテキスト（contexts/）

- `AuthContext` - ユーザー認証状態の管理（user, supabaseUser, session, loading, signIn, signUp, signOut）
- `DialogContext` - ダイアログ表示状態の管理（isDialogOpen, setIsDialogOpen）
- `NavigationContext` - アプリ内ナビゲーションの管理（activeTab, setActiveTab, navigate）

## ページコンポーネント（pages/）

### 主要ページ
- `Summary` - サマリーページ（今日の献立・在庫アラート・今月の出費表示）
- `MealPlans` - 献立計画ページ（7日間カレンダー表示・献立追加編集機能）
- `Shopping` - 買い物リストページ（アイテム管理・レシート読み取り機能）
- `Recipes` - レシピ管理ページ（レシピ一覧・追加・編集・削除機能）
- `Stock` - 在庫管理ページ（在庫一覧・追加・編集・削除・期限管理）
- `Cost` - コスト管理ページ（月間サマリー・支出履歴・月別推移）

### 認証・設定ページ
- `Login` - ログイン・新規登録ページ
- `Settings` - ユーザ設定画面（プロフィール・材料設定・ログアウト）
- `IngredientManagement` - 材料マスタ管理画面

## サービス層（services/）

### notificationService.ts
- `MorningNotificationSettings` - 朝の通知設定型定義（enabled, time）
- `NotificationService` - 通知機能の一元管理クラス
  - `scheduleMorningNotification(settings, userId)` - 朝の定期通知スケジュール設定
  - `sendMorningNotification()` - 朝の通知送信（プライベートメソッド）
  - `clearMorningNotifications()` - スケジュール済み通知のクリア
  - `requestNotificationPermission()` - ブラウザ通知権限要求

### shoppingListGeneration.ts
- `ShoppingListGenerationResult` - 買い物リスト生成結果型定義
- `generateShoppingListFromMealPlans(mealPlans, stockItems, existingShoppingItems)` - 献立から買い物リスト自動生成
- `generateShoppingListForPeriod(startDate, endDate, ...)` - 指定期間の買い物リスト生成
- `generateWeeklyShoppingList(...)` - 今週（日〜土）の買い物リスト生成
- `generateShoppingListForNextDays(days, ...)` - 次のN日分の買い物リスト生成
- `normalizeQuantity(quantity)` - 数量文字列正規化
- `normalizeIngredientName(name)` - 食材名正規化
- `findMatchingStock(ingredientName, stockItems)` - 食材名から在庫検索
- `isStockSufficient(requiredQuantity, stockQuantity)` - 在庫充足性チェック
- `aggregateIngredientsFromMealPlans(mealPlans)` - 複数献立からの食材集計

### mealPlanGeneration.ts
- `MealGenerationSettings` - 献立生成設定の型定義（在庫・レシピ・食材マスタ・日数・食事タイプ）
- `MealGenerationResult` - 献立生成結果の型定義（生成献立・使用食材・警告メッセージ）
- `generateMealPlan(settings)` - 献立自動生成関数（現在は仮実装でログ出力のみ）
- `getMealTypeFromIndex(index)` - 食事タイプインデックスから日本語表記に変換
- `getGenerationDates(days)` - 生成期間の日付配列を取得

## ライブラリ・ユーティリティ（lib/, utils/）

### AI・OCR関連
- `AIProvider` - AI Provider抽象化インターフェース（extractRecipeFromHtml, extractReceiptFromText）
- `VisionClient` - Google Vision APIを使用するOCRクライアント（extractTextFromImage）
- `WebFetcher` - Webサイトからコンテンツを取得するクライアント（fetchWebsite）

### ユーティリティ関数
- `readReceiptFromImage(file, ingredients)` - レシート画像読み取り（OCR + AI構造化 + 商品名正規化）
- `normalizeProductName(originalName, ingredients)` - 商品名正規化
- `validateImageFile(file)` - 画像ファイル妥当性チェック
- `calculateTotalPrice(items)` - レシートアイテムから合計金額計算

### データベース
- `supabase` - Supabaseクライアント

## 定数・設定（constants/）

### units.ts
- `FOOD_UNITS` - 食材単位一覧（23種類の定義済み単位）
  - 重量系: g, kg
  - 容量系: mL, L, cc, 合
  - 個数系: 個, 本, 枚, 袋, 缶, パック, 箱, 束, 片, 房
  - 料理系: 人前, カップ, 大さじ, 小さじ, 杯
  - その他: - (単位なし)
- `FoodUnit` - FOOD_UNITSの型定義（リテラル型による型安全性確保）
- `parseQuantity(quantity: string)` - 文字列から数値と単位を分離する関数
  - 戻り値: { amount: string; unit: FoodUnit }
  - 分数・定型表現（適量、お好み等）対応
- `formatQuantity(amount: string, unit: FoodUnit)` - 数値と単位を結合して文字列生成

## 使用指針

### 新機能追加時
1. 既存の型・コンポーネント・フックを最優先で使用
2. 必要な場合のみ新しい要素を作成
3. 新しい要素はこのファイルに必ず追加
4. 統一されたデザインシステムを維持

### 編集・削除ボタン
- 必ず共通のButtonコンポーネントを使用
- 削除ボタンはダイアログ内でのみ使用
- 独自のボタンスタイルは作成禁止

### データ管理
- 全てのデータ操作は対応するカスタムフックを使用
- useTabRefresh機能によりタブ切り替え時の更新チェック機能が統一
- RLSポリシーによるユーザー認証とセキュリティを確保

### UI設計
- BaseDialogベースの統一ダイアログデザイン
- FormFieldによる統一フォーム要素
- 絵文字アイコンの使用（Material Iconsではない）
- レスポンシブデザイン対応

### エラーハンドリング
- 日本語エラーメッセージの統一
- 専用エラークラスの使用（RecipeExtractionError, ReceiptExtractionError, OCRError, WebFetchError）
- loading状態の適切な管理

この要素定義リストを参考に、統一性を保ちながら機能を開発してください。