# src/services - サービス層

ビジネスロジックを担当するサービス層のディレクトリです。UI層から分離された処理ロジックを提供します。

## ファイル構成

### notificationService.ts
**用途**: 通知機能の管理とスケジューリング

### shoppingListGeneration.ts
**用途**: 献立から買い物リストの自動生成

## notificationService.ts

### MorningNotificationSettings
**型定義**: 朝の通知設定
- `enabled: boolean` - 通知の有効/無効
- `time: string` - 通知時刻（"HH:MM"形式）

### NotificationService クラス
**用途**: 通知機能の一元管理

**主要メソッド**:

#### scheduleMorningNotification(settings, userId)
- 朝の定期通知をスケジュール設定
- 今日・明日の時刻計算で適切なタイミングで通知
- 既存スケジュールの自動クリア

#### sendMorningNotification()
- 朝の通知を実際に送信（プライベートメソッド）
- 通知権限チェック
- 通知タイトル："🍳 Cooklet"、内容："期限の近い食材があります"
- クリック時にアプリにフォーカス

#### clearMorningNotifications()
- スケジュール済みの通知をすべてクリア
- タイムアウト管理の安全な処理

#### requestNotificationPermission()
- ブラウザの通知権限を要求
- 権限状態の適切なハンドリング
- 戻り値：権限取得成功時true

**内部状態管理**:
- `scheduledTimeouts: Set<NodeJS.Timeout>` - アクティブなタイムアウト管理

## shoppingListGeneration.ts

### ShoppingListGenerationResult
**型定義**: 買い物リスト生成結果
- `success: boolean` - 生成成功/失敗
- `generatedItems: ShoppingListItem[]` - 生成されたアイテム
- `summary` - 集計情報（総食材数、在庫数、購入必要数）
- `error?: string` - エラーメッセージ

### 主要関数

#### generateShoppingListFromMealPlans()
**用途**: 献立から買い物リストを自動生成（メイン関数）

**引数**:
- `mealPlans: MealPlan[]` - 対象献立
- `stockItems: StockItem[]` - 現在の在庫
- `existingShoppingItems: ShoppingListItem[]` - 既存買い物リスト

**処理フロー**:
1. 献立から食材を集計・正規化
2. 在庫との突合チェック
3. 不足分の特定と買い物リスト生成
4. 既存アイテムとの重複チェック

#### generateShoppingListForPeriod()
**用途**: 指定期間の献立から買い物リスト生成

#### generateWeeklyShoppingList()
**用途**: 今週（日〜土）の買い物リスト生成

#### generateShoppingListForNextDays()
**用途**: 次のN日分の買い物リスト生成

### 内部ユーティリティ関数

#### normalizeQuantity(quantity)
- 数量文字列から数値と単位を分離
- "2個"→{value: 2, unit: "個"}
- 数値が見つからない場合は適量として処理

#### normalizeIngredientName(name)
- 食材名の正規化（マッチング用）
- 小文字変換、空白・括弧の除去

#### findMatchingStock(ingredientName, stockItems)
- 食材名から在庫アイテムを検索
- 部分一致による類似食材のマッチング

#### isStockSufficient(requiredQuantity, stockQuantity)
- 在庫が必要量を満たしているかチェック
- 単位の一致確認
- 個/本の互換性考慮

#### aggregateIngredientsFromMealPlans(mealPlans)
- 複数献立から食材を集計
- 同一食材の数量合計（同一単位の場合）

## 使用場面

### notificationService
- 設定画面での通知設定
- アプリ起動時の通知スケジュール設定
- 賞味期限アラート機能
- PWA環境での定期通知

### shoppingListGeneration
- 買い物画面での自動生成ボタン
- 献立計画後の買い物リスト更新
- 週間/期間指定での一括生成
- 在庫管理との連携機能

## 設計方針

### notificationService
- **シングルトンパターン**: アプリ全体で単一インスタンス
- **権限管理**: ブラウザ通知権限の適切なハンドリング
- **リソース管理**: タイムアウトの適切なクリア処理
- **エラーハンドリング**: 通知失敗時の安全な処理

### shoppingListGeneration
- **関数型アプローチ**: 状态を持たない純粋関数
- **エラー安全性**: 例外発生時の適切なエラー返却
- **正規化**: 食材名・数量の一貫した正規化処理
- **柔軟性**: 様々な期間設定に対応
- **実用性**: 完璧でなくても実用的な近似マッチング

## 依存関係

- **型定義**: MealPlan, StockItem, ShoppingListItem
- **フック**: useMealPlans, useShoppingList
- **外部API**: Browser Notification API

## 今後の拡張可能性

- レシート読み取り連携
- より高精度な食材マッチング
- 単位変換機能
- 通知内容のカスタマイズ
- プッシュ通知への拡張