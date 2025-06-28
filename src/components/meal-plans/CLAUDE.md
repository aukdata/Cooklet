# Components/Meal-Plans ディレクトリ

## 概要
献立計画機能に関連するコンポーネントを管理するディレクトリ。適切な粒度でコンポーネント化された統合実装版。

## ファイル構成

### 新しいコンポーネント（適切な粒度での分離）

#### MealPlanHeader.tsx
献立計画ページのヘッダーコンポーネント - タイトル、週範囲、ローディング・エラー状態表示。

**Props:**
- `weekRange: string` - 週の範囲表示用文字列
- `loading?: boolean` - ローディング状態
- `error?: string | null` - エラーメッセージ

**機能:**
- 📅アイコン付きタイトル表示
- 週範囲の動的表示
- ローディング・エラー状態の適切なフィードバック

#### WeeklyNavigation.tsx（更新版）
週間ナビゲーションコンポーネント - 前週・次週・今日ボタンによる週間移動機能。

**Props:**
- `onPreviousWeek: () => void` - 前週移動ハンドラー
- `onNextWeek: () => void` - 次週移動ハンドラー
- `onThisWeek: () => void` - 今日週復帰ハンドラー
- `isCurrentWeek: boolean` - 今日週判定フラグ

**機能:**
- シンプルで直感的な週間移動
- 今日週以外での「今日」ボタン表示
- 統一されたボタンデザイン

#### WeeklyCalendar.tsx（新規）
週間カレンダーコンポーネント - 7日間の日付表示と献立インジケーター。

**Props:**
- `weekDates: Date[]` - 7日分の日付配列
- `selectedDate: Date` - 選択中の日付
- `onDateSelect: (date: Date) => void` - 日付選択ハンドラー
- `getMealPlansForDate: (date: Date) => MealPlan[]` - 献立取得関数

**機能:**
- 7列グリッドによる日付表示
- 今日のハイライト（青リング）
- 選択日のハイライト（インディゴ背景）
- 献立有無のドットインジケーター

#### DayDetail.tsx（新規）
選択日の詳細コンポーネント - 朝昼夜の献立表示と操作機能の統合実装。

**Props:**
- `selectedDate: Date` - 選択された日付
- `getMealPlan: (date: Date, mealType: MealType) => MealPlan | undefined` - 献立取得関数
- `onAddMeal: (date: Date, mealType: MealType) => void` - 献立追加ハンドラー
- `onEditMeal: (mealPlan: MealPlan) => void` - 献立編集ハンドラー
- `onCookedClick: (mealPlan: MealPlan) => void` - 食べたボタンハンドラー
- `onStatusClick: (mealPlan: MealPlan) => void` - ステータス変更ハンドラー

**機能:**
- `renderMealPlan`関数による朝昼夜の統一表示ロジック
- 完食・作り置きステータスの視覚的表現
- レシピリンク・食べたボタン・編集ボタンの適切な配置
- 材料リストの表示

#### WeeklySummary.tsx（新規）
週間サマリーコンポーネント - 自炊・外食回数と予算表示。

**Props:**
- `weekRange: string` - 週の範囲表示用文字列
- `summaryData: WeeklySummaryData` - サマリーデータ

**機能:**
- 📊アイコン付きサマリー表示
- 自炊・外食回数の統計表示
- 予算情報の表示

#### MealSuggestions.tsx（新規）
献立提案コンポーネント - AI献立生成ボタン群。

**Props:**
- `onTodayMealSuggestion: () => void` - 今日の献立提案ハンドラー
- `onWeeklyMealSuggestion: () => void` - 週間献立提案ハンドラー

**機能:**
- 💡アイコン付き提案機能説明
- 今日・週間の2つの提案ボタン
- 統一されたボタンデザイン

### 旧コンポーネント（削除対象）

#### MealPlanDetail.tsx（旧版）
献立詳細表示コンポーネント - 朝食・昼食・夕食の表示ロジックを統一したコンポーネント。

#### 実装済み機能

**統一された献立表示**
- 食事タイプ別のアイコン表示（朝：🌅、昼：🌞、夜：🌙、間食：🍪）
- 献立名表示（未設定時は［未設定］）
- 消費ステータス表示（完食・作り置き状態の視覚的表示）
- 食材リスト表示

**インタラクティブ操作**
- レシピリンクボタン（レシピURLがある場合のみ表示）
- 食べたボタン（未完了の献立のみ表示）
- 編集・追加ボタン（状態に応じて表示切り替え）
- ステータス変更ボタン（完了済み献立のみ表示）

#### Props

```typescript
interface MealPlanDetailProps {
  /** 食事タイプ */
  mealType: MealType;
  /** 献立データ（未設定の場合はnull） */
  mealPlan: MealPlan | null;
  /** 献立追加のハンドラー */
  onAddMeal: () => void;
  /** 献立編集のハンドラー */
  onEditMeal: () => void;
  /** 食べた状態変更のハンドラー */
  onCookedClick: () => void;
  /** ステータス変更のハンドラー */
  onStatusClick: () => void;
}
```

#### 設計思想

**コードの重複排除**
- MealPlans.tsxで朝食・昼食・夕食の同一ロジックが3回繰り返されていた問題を解決
- 約150行のコード重複を単一コンポーネントに統合

**設定駆動のアプローチ**
- `MEAL_CONFIGS`オブジェクトで食事タイプ別の設定を一元管理
- アイコン、名前、デフォルトメニュー名を設定で管理

**状態管理の分離**
- コンポーネント自体は表示ロジックのみを担当
- 状態変更は全てpropsのハンドラー関数経由で親コンポーネントに委譲

#### UI設計

**レスポンシブレイアウト**
- flexboxを使用した左右分割レイアウト
- 左側：献立情報表示、右側：操作ボタン群

**状態に応じた視覚的表現**
- 完了済み献立：取り消し線 + 透明度調整
- ステータスボタン：緑色のバッジ表示
- 未設定時：明確な［未設定］表示

**アクセシビリティ対応**
- title属性によるツールチップ表示
- ホバー効果による操作性向上
- 絵文字アイコンによる視覚的識別

#### 使用例

```typescript
// MealPlans.tsxでの使用例
<MealPlanDetail
  mealType="朝"
  mealPlan={getMealPlan(selectedDate, '朝')}
  onAddMeal={() => handleAddMeal(selectedDate, '朝')}
  onEditMeal={() => handleEditMeal(breakfastPlan!)}
  onCookedClick={() => handleCookedClick(breakfastPlan!)}
  onStatusClick={() => handleStatusClick(breakfastPlan!)}
/>
```

#### リファクタリング効果

**コード削減**
- MealPlans.tsxから約150行の重複コードを削除
- 保守性の大幅な向上

**拡張性向上**
- 新しい食事タイプ（間食など）の追加が容易
- 献立表示ロジックの変更が一箇所で完結

**テスタビリティ向上**
- 単一責任の独立コンポーネントとしてユニットテストが容易
- プロップスベースの純粋関数的設計

### WeeklyNavigation.tsx
週間ナビゲーションコンポーネント - MealPlans.tsxから分離された週間移動機能。

#### 実装済み機能
- 献立カレンダーのヘッダー表示（タイトル + 週範囲）
- 前週・次週ボタンによる週間移動
- 「今日」ボタンによる当日週への即座復帰
- ローディング状態とエラー状態の表示
- レスポンシブレイアウト修正（ボタンの文字切れ防止、flex-shrink-0適用）

#### Props
```typescript
interface WeeklyNavigationProps {
  currentWeekStart: Date;
  weekRange: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  isCurrentWeek: boolean;
  loading?: boolean;
  error?: string | null;
}
```

### MealPlanCalendar.tsx
献立カレンダーコンポーネント - 週間の日付表示とインタラクション機能。

#### 実装済み機能
- 7列グリッドによる週間日付表示
- 曜日表示（日・月・火・水・木・金・土）
- 各日の献立有無をドット表示
- 今日の日付を青リングで強調
- 日付クリックによる選択状態変更
- レスポンシブグリッド調整（gap-1 on mobile, gap-2 on larger screens）
- 曜日文字の切り詰め対応（truncate適用）

### MealPlanDayDetail.tsx
選択日の献立詳細表示コンポーネント - 朝昼夜の献立を統合表示。

#### 実装済み機能
- 選択日の日付表示（今日判定付き）
- 朝昼夜3食のMealPlanDetailコンポーネント統合
- 各食事タイプのハンドラー統一管理

### MealPlanSuggestion.tsx
献立提案機能コンポーネント - AI献立生成と週間サマリー表示。

#### 実装済み機能
- 週間サマリー表示（自炊・外食回数、予算）
- 今日の献立提案ボタン
- 週間献立提案ボタン
- 在庫食材・栄養バランス考慮の説明文

### CookedDialog.tsx
「作った！」ダイアログコンポーネント - 献立完了時の状態選択。

#### 実装済み機能
- 完食・作り置き選択ダイアログ
- 献立名の確認表示
- 作り置き選択時の在庫テーブル自動追加
- モーダルダイアログのアクセシビリティ対応

## リファクタリング効果

### MealPlans.tsx分割結果
- **元のサイズ**: 565行 → **分割後**: 約250行（56%削減）
- **責任分離**: 6つの独立コンポーネントに分割
- **保守性向上**: 各機能が独立してテスト・修正可能
- **再利用性向上**: 他ページでの部分的利用が可能

### 新規カスタムフック
- `useMealPlanCalendar` - 週間カレンダー状態管理フック
- 日付計算・週間ナビゲーション機能を分離
- テストしやすい純粋な状態管理ロジック

## 注意点
- MealType型には間食('間食')も含まれるが、現在の実装では朝・昼・夜のみ使用
- 将来的に間食表示が必要になった場合は追加設定が容易
- 日本語での食事タイプ（朝・昼・夜・間食）に準拠
- 絵文字アイコンの使用（Material Iconsではない）
- 各コンポーネントは独立しており、他機能への影響なし