# Components/Summary ディレクトリ

## 概要
サマリー画面の表示コンポーネントを管理するディレクトリ。
Summary.tsxの責任分離によって抽出された、各セクションの専用コンポーネント群。

## ファイル構成

### TodayMealSection.tsx
今日の献立セクション表示コンポーネント

#### 機能
- 当日の朝食・昼食・夕食の表示
- 未設定の場合は「［未設定］」表示
- 食材リスト表示（配列から名前を結合）
- レシピリンク表示（外部サイトを新しいタブで開く）
- 編集・追加ボタン（状態に応じてテキスト変更）

#### Props
- `mealPlans`: 今日の献立データ配列
- `loading`: 献立データのローディング状態
- `error`: 献立データのエラー状態
- `onAddMeal`: 献立追加ボタンクリック処理
- `onEditMeal`: 献立編集ボタンクリック処理

#### 内部コンポーネント
- `MealItem`: 個別の食事アイテム表示（朝・昼・夜で再利用）

### StockAlertSection.tsx
在庫アラートセクション表示コンポーネント

#### 機能
- 期限切れアイテムの赤色表示（期間別グループ化）
- 期限間近アイテムの黄色表示
- 視覚的なアイコンによる区別（🔴🟡）
- アラートがない場合のメッセージ表示
- 期限切れアイテムの期間別グループ化表示

#### Props
- `expiredItems`: 期限切れアイテム配列
- `expiringItems`: 期限間近アイテム配列
- `loading`: 在庫データのローディング状態

#### 依存関係
- `groupExpiredItemsByPeriod`: expiryUtilsからの期間別グループ化関数
- `formatDate`: dateFormattersからの日付フォーマット関数

### MonthlyCostSection.tsx
月間コストセクション表示コンポーネント

#### 機能
- 自炊・外食の金額と回数表示
- 合計支出・1日平均・1食平均の表示
- コスト追加ボタン
- 金額の3桁区切り表示（toLocaleString使用）

#### Props
- `monthlySummary`: 月間サマリーデータ
- `currentMonth`: 現在の月（1-12）
- `loading`: コストデータのローディング状態
- `onAddCost`: コスト追加ボタンクリック処理

#### 内部関数
- `formatCurrency`: 金額を3桁区切りでフォーマット

## 設計思想

### 責任の分離
- 各セクションが独立したコンポーネントとして分離
- 表示ロジックと状態管理の分離
- 再利用可能なコンポーネント設計

### Props設計
- 必要最小限のPropsで外部依存を最小化
- コールバック関数による疎結合
- 型安全性の確保

### UI統一性
- 全セクションで統一されたカード型レイアウト
- アイコンによる視覚的識別
- 一貫したスタイリング（bg-white, rounded-lg, shadow-sm等）

## 使用例

```typescript
// Summary.tsx での使用例
import { TodayMealSection } from '../../components/summary/TodayMealSection';
import { StockAlertSection } from '../../components/summary/StockAlertSection';
import { MonthlyCostSection } from '../../components/summary/MonthlyCostSection';

export const Summary: React.FC = () => {
  // データとハンドラーの準備...
  
  return (
    <div className="p-4">
      <TodayMealSection
        mealPlans={mealPlans}
        loading={mealLoading}
        error={mealError}
        onAddMeal={handleAddMeal}
        onEditMeal={handleEditMeal}
      />
      
      <StockAlertSection
        expiredItems={expiredItems}
        expiringItems={expiringItems}
        loading={stockLoading}
      />
      
      <MonthlyCostSection
        monthlySummary={monthlySummary}
        currentMonth={currentMonth}
        loading={costLoading}
        onAddCost={handleAddCost}
      />
    </div>
  );
};
```

## 今後の拡張

### 機能拡張
- アラートアイテムクリック時の詳細表示
- コストセクションでのグラフ表示
- 献立セクションでの栄養情報表示

### パフォーマンス最適化
- React.memo によるメモ化
- useMemo による計算結果キャッシュ

### アクセシビリティ改善
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 注意点
- コンポーネント間の状態は親コンポーネント（Summary.tsx）で管理
- 外部ライブラリに依存しない軽量な実装
- TypeScript型安全性の確保