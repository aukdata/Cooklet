# Components/Dialogs ディレクトリ

## 概要
共通UI要素・ダイアログコンポーネントを管理するディレクトリ。CLAUDE.md仕様書 5.6.1〜5.6.7に準拠した実装。

## ファイル構成

### MealPlanEditDialog.tsx
献立編集ダイアログコンポーネント - CLAUDE.md仕様書 5.6.2に準拠

#### 機能
- 日付・食事タイプ・レシピ・人数・メモの編集
- レシピ選択（コンボボックス形式）
- 新規作成・編集両対応
- 手動入力モードとレシピ選択モード
- 動的な食材リスト編集
- フォームバリデーション

#### 使用例
```typescript
<MealPlanEditDialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  onSave={(mealPlan) => handleSaveMealPlan(mealPlan)}
  selectedDate="2025-06-15"
  selectedMealType="夜"
  initialData={editingMealPlan}
/>
```

#### 最新の実装特徴
- コンボボックスでレシピ選択（ラジオボタンから変更）
- 新規追加選択時もコンボボックスは表示維持
- レシピ絞り込み機能（検索テキストボックス付き）
- 部分一致によるリアルタイムフィルタリング
- レシピ選択時の食材自動設定
- 手動入力時の食材リスト編集機能
- 検索結果件数の表示

### ManualMealDialog.tsx
手動献立入力ダイアログコンポーネント - CLAUDE.md仕様書 5.6.3に準拠

#### 機能
- 料理名・レシピURL・人数・メモの入力
- 動的な食材リスト編集（追加・削除・編集）
- レシピURLの任意入力対応
- 食材の名前・数量管理

#### 使用例
```typescript
<ManualMealDialog
  isOpen={isManualDialogOpen}
  onClose={() => setIsManualDialogOpen(false)}
  onSave={(mealData) => handleSaveManualMeal(mealData)}
/>
```

### RecipeDetailDialog.tsx
レシピ詳細表示ダイアログコンポーネント - GitHub issue #5対応

#### 機能
- レシピ基本情報の表示（タイトル・人数・URL・作成日・タグ）
- 外部レシピURLへのリンク
- 編集・削除アクションボタン
- 詳細ダイアログから編集・削除ダイアログへの遷移
- 将来実装予定の食材情報・メモ表示

#### Props
- `isOpen`: ダイアログの表示状態
- `recipe`: 表示するレシピデータ（SavedRecipe型）
- `onClose`: ダイアログを閉じるコールバック関数
- `onEdit`: 編集ボタンクリック時のコールバック関数
- `onDelete`: 削除ボタンクリック時のコールバック関数

#### 使用例
```typescript
<RecipeDetailDialog
  isOpen={isDetailDialogOpen}
  recipe={selectedRecipe}
  onClose={handleCloseDetailDialog}
  onEdit={handleEditRecipe}
  onDelete={handleDeleteRecipe}
/>
```

#### UI設計
- 中サイズモーダル（max-w-lg）
- 3段階ボタン配置（削除・閉じる・編集・外部リンク）
- アイコン付き情報表示
- タグバッジ表示
- レスポンシブ対応

### RecipeDialog.tsx
レシピ編集ダイアログコンポーネント - CLAUDE.md仕様書 5.6.4に準拠

#### 機能
- レシピ名・URL・人数・食材・タグの編集
- 食材自動抽出機能（API連携対応）
- 動的タグ管理（追加・削除）
- 動的食材リスト編集
- 削除機能（編集時のみ表示）
- 在庫ダイアログと統一デザイン

#### 使用例
```typescript
<RecipeDialog
  isOpen={isRecipeDialogOpen}
  onClose={() => setIsRecipeDialogOpen(false)}
  onSave={(recipeData) => handleSaveRecipe(recipeData)}
  onDelete={() => handleDeleteRecipe()}
  onExtractIngredients={extractIngredientsFromURL}
  initialData={editingRecipe}
  isEditing={!!editingRecipe}
/>
```

#### 最新の実装特徴
- **ボタン配置**: 在庫ダイアログと同じ3段階配置（削除・キャンセル・保存）
- **削除ボタン**: 編集時のみ表示、赤色背景（bg-red-600）
- **統一デザイン**: 在庫管理ダイアログと同じデザインルール準拠

### StockDialog.tsx
在庫編集ダイアログコンポーネント - CLAUDE.md仕様書 5.6.5に準拠

#### 機能
- 食材名・数量・単位・賞味期限・保存場所・作り置きフラグの編集
- 単位選択（9種類の定義済み単位）
- 保存場所選択（冷蔵庫・冷凍庫・常温）
- 日付クイック設定（今日・1週間後）
- 削除機能付き

#### 使用例
```typescript
<StockDialog
  isOpen={isStockDialogOpen}
  onClose={() => setIsStockDialogOpen(false)}
  onSave={(stockData) => handleSaveStock(stockData)}
  onDelete={() => handleDeleteStock()}
  initialData={editingStock}
  isEditing={true}
/>
```

### CostDialog.tsx
コスト記録ダイアログコンポーネント - CLAUDE.md仕様書 5.6.6に準拠

#### 機能
- 日付・内容・金額・自炊/外食フラグ・メモの入力
- 日付クイック設定（今日ボタン）
- ラジオボタンによる自炊/外食選択
- 数値バリデーション付き金額入力
- 削除機能付き（編集時）

#### 使用例
```typescript
<CostDialog
  isOpen={isCostDialogOpen}
  onClose={() => setIsCostDialogOpen(false)}
  onSave={(costData) => handleSaveCost(costData)}
  onDelete={() => handleDeleteCost()}
  initialData={editingCost}
  isEditing={true}
/>
```

### ConfirmDialog.tsx
削除確認ダイアログコンポーネント - CLAUDE.md仕様書 5.6.7に準拠

#### 機能
- 汎用的な確認ダイアログ
- カスタマイズ可能なメッセージ・ボタンテキスト
- 破壊的操作の警告表示
- useConfirmDialogフック提供

#### 使用例
```typescript
// ダイアログ直接使用
<ConfirmDialog
  isOpen={isConfirmOpen}
  title="確認"
  message="削除します"
  itemName="ハンバーグ定食"
  onConfirm={handleConfirmDelete}
  onCancel={() => setIsConfirmOpen(false)}
/>

// フック使用
const { showConfirm, ConfirmDialog } = useConfirmDialog();
const handleDelete = () => {
  showConfirm({
    message: '削除します',
    itemName: 'ハンバーグ定食',
    onConfirm: () => deleteItem()
  });
};
```

### index.ts
エクスポート管理ファイル

#### 機能
- 全ダイアログコンポーネントの一括エクスポート
- useConfirmDialogフックのエクスポート
- 型定義は個別ファイルで定義（個別インポート推奨）

## 共通設計思想

### UI/UX設計
- **モーダルオーバーレイ**: 黒半透明背景で全画面をカバー
- **カード型ダイアログ**: 白背景・角丸・シャドウ
- **レスポンシブ対応**: モバイルファーストデザイン
- **絵文字アイコン**: Material Iconsではなく絵文字使用

### 操作性
- **キーボード対応**: Enterキーでの送信、Escapeキーでの閉じる操作（今後実装）
- **バリデーション**: 必須項目チェック・数値検証
- **ユーザビリティ**: クイック設定ボタン・直感的な操作

### 状態管理
- **ローカル状態**: useState使用
- **初期データ対応**: 編集時のデータ復元
- **フォームリセット**: 保存・キャンセル時の状態クリア

### アクセシビリティ
- **適切なラベル**: form要素のlabel属性
- **セマンティックHTML**: 意味のあるHTMLタグ使用
- **色のみに依存しない**: アイコンとテキストの併用

## 技術仕様

### 依存関係
- React 18+
- TypeScript
- Tailwind CSS
- 外部ライブラリ非依存

### 型安全性
- 全コンポーネントでTypeScript型定義
- プロパティ・状態の厳密な型チェック
- インターフェース定義によるAPI契約

### パフォーマンス
- 軽量な実装（外部ライブラリ非依存）
- 条件付きレンダリング（isOpen時のみDOM生成）
- メモリリーク対策

## 注意点

### CLAUDE.md仕様書準拠
- 各ダイアログのレイアウトは仕様書通り
- 日本語ラベル・メッセージ使用
- 絵文字アイコンによる視覚的識別

### 今後の拡張性
- API連携機能（食材抽出等）
- キーボードショートカット対応
- アニメーション効果
- フォーカス管理の改善

### 制限事項
- 現在はサンプルデータ使用
- 実際のAPI連携は今後実装
- 一部高度なアクセシビリティ機能は未実装