# Hooks ディレクトリ

## 概要
Reactカスタムフックを集約したディレクトリ。データベースとの連携とビジネスロジックを提供。

## ファイル構成

### useStockItems.ts
在庫管理機能を提供するカスタムフック（CLAUDE.md仕様書準拠）。

#### 提供する機能
- `stockItems`: 在庫アイテム配列（StockItem型）
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addStockItem`: 在庫追加関数
- `updateStockItem`: 在庫更新関数
- `deleteStockItem`: 在庫削除関数
- `refetch`: 在庫再取得関数

#### 特徴
- stock_itemsテーブルへの直接アクセス
- ユーザー認証状態に連動した自動データ取得
- 賞味期限順での並び替え
- 作り置きフラグ（is_homemade）による管理
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
- 自動抽出結果をそのまま保存可能
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

### useMealPlans.ts
献立計画管理機能を提供するカスタムフック（CLAUDE.md仕様書準拠）。

#### 提供する機能
- `mealPlans`: 献立計画配列（MealPlan型）
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addMealPlan`: 献立追加関数
- `updateMealPlan`: 献立更新関数
- `deleteMealPlan`: 献立削除関数
- `refetch`: 献立再取得関数

#### 特徴
- meal_plansテーブルへの直接アクセス
- 消費状態（consumed_status）管理
- 日本語食事タイプ（朝・昼・夜・間食）
- 食材情報のJSONB形式管理
- 日付順での並び替え

### useShoppingList.ts
買い物リスト管理機能を提供するカスタムフック。

#### 提供する機能
- `shoppingList`: 買い物リスト配列（ShoppingListItem型）
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addShoppingItem`: アイテム追加関数
- `updateShoppingItem`: アイテム更新関数
- `deleteShoppingItem`: アイテム削除関数
- `toggleShoppingItem`: チェック状態切り替え関数

#### 特徴
- shopping_listテーブルへの直接アクセス
- 手動・自動（added_from）の区別管理
- チェック状態の管理
- 作成日順での並び替え

### useCostRecords.ts
コスト記録管理機能を提供するカスタムフック。

#### 提供する機能
- `costRecords`: コスト記録配列（CostRecord型）
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addCostRecord`: コスト記録追加関数
- `updateCostRecord`: コスト記録更新関数
- `deleteCostRecord`: コスト記録削除関数
- `refetch`: コスト記録再取得関数

#### 特徴
- cost_recordsテーブルへの直接アクセス
- 自炊・外食（is_eating_out）の区別管理
- 日付逆順での並び替え
- 金額総計・月別集計機能

### useIngredients.ts
食材マスタ管理機能を提供するカスタムフック（ユーザー認証対応）。

#### 提供する機能
- `ingredients`: 食材マスタ配列
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `addIngredient`: 食材追加関数
- `updateIngredient`: 食材更新関数
- `deleteIngredient`: 食材削除関数
- `findIngredientByOriginalName`: original_nameで食材検索関数
- `refetch`: 食材再取得関数

#### 特徴
- カテゴリ・名前順での並び替え
- ユーザー固有の食材マスタデータ取得
- 認証ユーザー必須（useAuthとの連携）
- user_id付きでの食材追加・更新・削除
- RLSポリシーによるセキュリティ確保
- **完全CRUD対応**: 作成・読み取り・更新・削除機能を提供
- **商品名検索機能**: original_nameによる食材検索（完全一致・部分一致対応）

### useRecipeExtraction.ts
レシピURLからの食材自動抽出機能を提供するカスタムフック。

#### 提供する機能
- `extractIngredients`: URLから食材抽出関数
- `loading`: 抽出処理状態
- `error`: エラーメッセージ

#### 特徴
- 自動抽出プロバイダーとの連携
- HTTPS URLのみサポート
- エラーハンドリングとリトライ機能

### useAutoShoppingList.ts
献立からの買い物リスト自動生成機能を提供するカスタムフック。

#### 提供する機能
- `generateShoppingList`: 買い物リスト自動生成関数
- `loading`: 生成処理状態
- `error`: エラーメッセージ

#### 特徴
- 献立と在庫の照合で不足食材を算出
- 自動生成アイテムのadded_fromフラグ管理
- 重複アイテムの統合処理

### useNotificationSettings.ts
通知設定管理機能を提供するカスタムフック。

#### 提供する機能
- `settings`: 通知設定情報
- `loading`: 読み込み状態
- `error`: エラーメッセージ
- `updateSettings`: 設定更新関数
- `enableNotifications`: 通知有効化関数
- `disableNotifications`: 通知無効化関数
- `updateExpiryDays`: 期限通知日数変更関数
- `requestNotificationPermission`: 通知権限要求関数

#### 特徴
- usersテーブルの通知設定項目を管理
- ブラウザの通知権限要求を処理
- デフォルト設定: 無効、3日前通知

### useExpiryNotifications.ts
賞味期限チェックと通知管理機能を提供するカスタムフック。

#### 提供する機能
- `checkExpiryItems`: 期限近い食品をチェック
- `sendNotification`: Web Push通知送信
- `checkAndNotify`: チェックと通知の実行
- `loading`: 処理状態

#### 特徴
- 在庫データと通知設定の連携
- 期限日数に基づく自動フィルタリング
- 1日1回の通知制限機能
- PWA通知アイコンとメッセージ設定

### useBuildInfo.ts
ビルド情報表示機能を提供するカスタムフック。

#### 提供する機能
- `versionDisplay`: バージョン表示文字列
- `loading`: ビルド情報読み込み状態

#### 特徴
- build-info.jsonファイルからビルド情報を取得
- JST（日本時間）でのビルド日時表示
- バージョン、ビルド日時、タイムスタンプの管理
- エラー時の適切なフォールバック表示

### useCache.ts
汎用キャッシュ機能を提供するカスタムフック。

#### 提供する機能
- `data`: キャッシュされたデータ
- `isLoading`: データ読み込み状態
- `error`: エラーメッセージ
- `setCache`: データキャッシュ設定
- `clearCache`: キャッシュクリア
- `invalidateCache`: キャッシュ無効化
- `refreshData`: データ再取得

#### 特徴
- TTL（Time To Live）によるキャッシュ期限管理
- LocalStorageへの永続化対応
- タブ切り替え時のパフォーマンス向上
- PWA対応準備（オフライン利用）

### useConfirmDialog.ts
削除確認ダイアログのヘルパー機能を提供するカスタムフック。

#### 提供する機能
- `showConfirm`: 確認ダイアログ表示関数
- `ConfirmDialog`: ダイアログコンポーネント

#### 特徴
- 汎用的な確認ダイアログの簡単実装
- カスタマイズ可能なタイトル・メッセージ・ボタンテキスト
- 破壊的操作の警告表示対応
- React Contextを使わないシンプルな実装

### useTabRefresh.ts
タブ切り替え時のデータ更新チェック機能を提供するカスタムフック。

#### 提供する機能
- `markAsUpdated`: データ更新時刻マーク関数

#### 特徴
- Page Visibility APIによるタブアクティブ検知
- windowのfocusイベントでの更新チェック
- 5分間隔（設定可能）での更新チェック
- 指定時間経過時のみデータ更新実行
- 全データフック共通で使用される更新戦略

### useToast.tsx
トースト通知機能を提供するカスタムフック（Context + Provider）。

#### 提供する機能
- `showToast`: 汎用トースト表示関数
- `showSuccess`: 成功トースト表示関数
- `showError`: エラートースト表示関数
- `showInfo`: 情報トースト表示関数

#### 特徴
- React Context によるアプリ全体でのトースト管理
- 3種類のトーストタイプ（success・error・info）
- 自動消去機能（5秒後）
- 複数トーストの同時表示対応
- ToastProvider で App 全体をラップして使用

### index.ts
カスタムフックのエクスポート管理ファイル - CLAUDE.md仕様書準拠

#### 機能
- 全カスタムフックの一括エクスポート
- 型定義の同時エクスポート
- クリーンなインポート文の提供

#### エクスポート対象
- 献立管理（useMealPlans, MealPlan）
- レシピ管理（useRecipes, SavedRecipe）
- 在庫管理（useStockItems）
- コスト管理（useCostRecords, CostRecord）
- 買い物リスト管理（useShoppingList, ShoppingListItem）
- 自動買い物リスト生成（useAutoShoppingList, AutoGenerationResult）
- タブ切り替え更新（useTabRefresh）
- 通知設定管理（useNotificationSettings, NotificationSettings）
- 期限通知管理（useExpiryNotifications, ExpiryItem, ExpiryNotificationResult）
- 食材マスタ管理（useIngredients）

## 共通パターン
- エラーハンドリングの統一
- 日本語エラーメッセージ
- loading状態の適切な管理
- ユーザー認証との連携（全hooks対応）
- Supabaseクライアントの直接利用
- RLSポリシーによるデータセキュリティ
- **タブ切り替え時の更新チェック機能**（全hooks統一）
- **データ変更時の更新時刻マーク**（markAsUpdated）

## データ更新戦略
### リアルタイム更新から移行
- **旧方式**: Supabaseのリアルタイム機能（複雑、接続管理が必要）
- **新方式**: タブ切り替え時の更新チェック（シンプル、軽量）

### useTabRefresh機能
- **更新間隔**: 5分（全hooks統一）
- **タブアクティブ時**: Page Visibility APIで自動更新チェック
- **フォーカス時**: windowのfocusイベントでも更新チェック
- **markAsUpdated**: データ変更操作後に更新時刻をマーク

## 注意点
- CLAUDE.md仕様書に準拠したテーブル名とデータ型を使用
- エラーハンドリングは日本語で統一、詳細分類も実装済み
- タブ切り替え時の更新チェック機能により、キャッシュ問題を解決
- すべてのhooksでユーザー認証（RLS）によるセキュリティを確保

## セキュリティ強化（最新更新）
- ingredientsテーブルにユーザー認証を追加
- useIngredientsフックを認証対応に更新
- RLSポリシーによりユーザー固有の食材マスタを保護
- 既存システムとの互換性を維持