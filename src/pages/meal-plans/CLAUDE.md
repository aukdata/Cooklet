# Pages/Meal-Plans ディレクトリ

## 概要
献立計画機能のページコンポーネントを管理するディレクトリ。CLAUDE.md仕様書に準拠したカレンダー画面として実装。

## ファイル構成

### MealPlans.tsx
献立計画・カレンダー表示を行うページコンポーネント - コミット755004e基準の元デザイン復元済み、統合実装版。

#### 実装済み機能

**7日間カレンダー表示**
- 今日から7日間の表示（一番左が常に今日）
- 日付ごとの食事インジケーター表示（グレーの丸）
- 曜日表示付き
- 今日のハイライト表示（青いリング）
- 選択日のハイライト表示（インディゴ背景）

**週間ナビゲーション**
- 前週・次週移動ボタン
- 今日からに戻るボタン（他の期間表示時のみ表示）
- 今日を基準とした表示状態判定

**献立追加・編集機能**
- 朝食・昼食・夕食の「+ 追加」ボタン
- 既存献立の「編集」ボタン
- MealPlanEditDialogとの連携
- レシピ選択・手動入力対応

**選択日の詳細表示**
- 朝食・昼食・夕食の個別表示
- 未設定時は「［未設定］」表示
- 食材リスト表示
- レシピリンクボタン（レシピがある場合）
- 機能する編集・追加ボタン

**週間サマリー**
- 自炊回数・外食回数表示
- 週間予算表示
- アイコンによる視覚的表示

#### 状態管理

**ローカル状態**
- `selectedDate`: 選択された日付（今日がデフォルト）
- `currentWeekStart`: 現在表示している週の開始日（日曜日基準）
- `mealPlans`: 献立データ配列（MealPlan型）
- `isDialogOpen`: 献立編集ダイアログの表示状態
- `editingMeal`: 編集中の献立情報

**データ型定義**
```typescript
interface MealPlan {
  id?: string;
  date: string;
  meal_type: MealType;
  recipe_url?: string;
  ingredients: { name: string; quantity: string }[];
  memo?: string;
}
```

**ヘルパー関数**
- `getWeekDates()`: 指定開始日から7日分の日付配列生成
- `goToPreviousWeek()`: 前週に移動（7日前へ）
- `goToNextWeek()`: 次週に移動（7日後へ）
- `goToThisWeek()`: 今日からの表示に戻る
- `isCurrentWeek()`: 今日を基準とした表示かどうかを判定
- `getMealPlansForDate()`: 指定日の献立データ取得
- `getMealPlan()`: 指定日・食事タイプの献立取得
- `handleDateSelect()`: 日付選択処理
- `handleAddMeal()`: 献立追加処理
- `handleEditMeal()`: 献立編集処理
- `handleSaveMeal()`: 献立保存処理
- `isToday()`: 今日判定処理

#### UI設計

**レスポンシブカレンダー**
- Grid 7列レイアウト
- タッチ対応のボタン
- ホバー効果とアニメーション

**カード型レイアウト**
- 白背景のセクション分け
- シャドウとボーダーによる立体感
- 適切な余白とパディング

**視覚的識別**
- 絵文字によるアイコン表示
- 色分けによる状態表示
- 直感的なインターフェース

#### 現在の制限事項

**サンプルデータ使用**
- 実際のMealPlanデータとの連携は未実装
- ハードコードされた献立情報

**編集機能未実装**
- 献立編集ダイアログは今後実装予定
- レシピ選択機能は今後実装予定

#### 今後の実装予定

**データ統合**
- useMealPlansフック作成
- Supabase meal_plansテーブル連携
- リアルタイムデータ更新

**編集機能**
- 献立編集ダイアログ実装
- 手動献立入力機能
- レシピ選択インターフェース

**機能拡張**
- 月間表示モード
- 献立コピー機能
- 食材不足警告

## 注意点
- CLAUDE.md仕様書の日本語食事タイプ（朝・昼・夜）に準拠
- 今日から7日間ビューのみ実装（月間ビューは将来拡張）
- 献立インジケーターはグレーの丸を使用
- モバイルファーストのレスポンシブデザイン
- 日曜日基準の週表示から今日基準の7日間表示に変更