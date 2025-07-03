# Components/Shopping ディレクトリ

## 概要
買い物リスト機能に関連するコンポーネントを管理するディレクトリ。Shoppingページのリファクタリングにより分離されたコンポーネント群。

## ファイル構成

### ShoppingHeader.tsx
買い物リストページヘッダーコンポーネント - タイトルと統計情報を表示する軽量コンポーネント。

#### 機能
- 買い物リストタイトル表示（🛒アイコン付き）
- 未完了・完了件数のリアルタイム表示

### ShoppingAutoGeneration.tsx
買い物リスト自動生成セクションコンポーネント - 献立データから必要な食材を自動的に買い物リストに追加する機能を提供。

#### 機能
- 3日分・1週間分の自動生成ボタン
- 生成結果のサマリー表示
- 生成状態管理とエラーハンドリング

### ShoppingManualAdd.tsx
手動アイテム追加セクションコンポーネント - 新規買い物アイテムの手動追加機能を提供。

#### 機能
- 手動アイテム追加ボタン
- ダイアログ開始の責任分離

### ShoppingItemsList.tsx
買い物リストアイテム表示コンポーネント - 未完了・完了済みアイテムの表示と操作機能を提供。

#### 機能
- 未完了アイテムの一覧表示
- 完了済みアイテムの折りたたみ表示
- 全選択・全解除機能
- 量調整エディット機能
- チェック状態変更

### ReceiptReader.tsx
レシート読み取り機能コンポーネント - OCR処理・結果編集・買い物リスト追加を統合したコンポーネント。

#### 実装済み機能

**レシートOCR処理**
- 画像ファイルアップロード機能（JPEG/PNG/WebP対応、10MB以下）
- Google Vision API経由でのテキスト抽出
- 商品名正規化処理（食材マスタデータとの照合）
- エラーハンドリングとファイル妥当性チェック

**読み取り結果編集**
- 商品名・数量・単位の編集可能なフォーム
- NameQuantityUnitInputコンポーネントとの統合
- 価格情報の表示
- 元の商品名の保持

**自動食材登録**
- 未登録食材の自動マスタ登録
- カテゴリ推測ロジック（野菜・肉・調味料・その他）
- 食材マスタとの重複チェック

**買い物リスト連携**
- 読み取り結果を完了済みアイテムとして追加
- 数量・単位の適切な結合処理
- 一括追加機能

**在庫直接追加機能（新機能）**
- レシート読み取り結果を直接在庫にマージ
- 既存在庫との自動統合（同名アイテムの数量加算）
- 商品名正規化機能統合
- 詳細なマージ結果レポート表示

#### Props

```typescript
interface ReceiptReaderProps {
  /** 食材マスタデータ（商品名正規化用） */
  ingredients: Ingredient[];
  /** 食材マスタ追加関数 */
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  /** 買い物リストアイテム追加関数 */
  addShoppingItem: (item: { name: string; quantity?: { amount: string; unit: string }; checked: boolean; added_from: 'manual' | 'auto' }) => Promise<void>;
  /** 在庫データ（マージ機能用、任意） */
  stockItems?: StockItem[];
  /** 在庫追加関数（任意） */
  addStockItem?: (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<StockItem>;
  /** 在庫更新関数（任意） */
  updateStockItem?: (id: string, updates: Partial<Omit<StockItem, 'id' | 'user_id' | 'created_at'>>) => Promise<StockItem>;
}
```

#### 内部状態管理

```typescript
interface EditableReceiptItem {
  originalName?: string;  // 元の商品名（正規化前）
  name: string;          // 正規化後の商品名
  quantity: string;      // 数量
  unit: FoodUnit;        // 単位
  price?: number;        // 価格
}
```

**ローカル状態**
- `isReadingReceipt`: OCR処理中状態
- `receiptResult`: レシート読み取り結果
- `editingReceiptItems`: 編集可能なアイテムリスト
- `fileInputRef`: ファイル入力参照

#### 主要機能

**handleReceiptUpload**
- ファイル選択からOCR処理まで
- 結果の状態保存と編集可能リスト生成
- エラーハンドリングとユーザー通知

**handleEditReceiptItem**
- 読み取り結果の項目別編集
- 商品名・数量・単位の更新

**handleAddReceiptItemsToList**
- 未登録食材の自動マスタ登録
- 買い物リストへの完了済み追加
- 登録件数・追加件数の通知

**カテゴリ推測ロジック**
- 商品名キーワードによる自動分類
- vegetables: 野菜関連キーワード
- meat: 肉・魚関連キーワード
- seasoning: 調味料関連キーワード
- others: その他（デフォルト）

#### UI設計

**レスポンシブレイアウト**
- カード型セクション設計
- アップロードボタンとプログレス表示
- 読み取り結果の編集フォーム

**視覚的フィードバック**
- オレンジ色のテーマカラー（📄レシートアイコン）
- 読み取り中の無効化処理
- 編集可能エリアの明確な区別

**インタラクション**
- ファイル選択の隠しinput活用
- 編集フォームの即座反映
- 一括操作ボタン群

#### リファクタリング効果

**コード分離**
- Shopping.tsxから約200行の複雑なロジックを分離
- 単一責任原則に基づく設計

**再利用性向上**
- 他の画面でもレシート読み取り機能を利用可能
- プロップス経由の疎結合設計

**テスタビリティ向上**
- 独立したコンポーネントとしてのテスト容易性
- 状態管理の明確な分離

#### 使用例

```typescript
// Shopping.tsxでの使用例
<ReceiptReader
  ingredients={ingredients}
  addIngredient={addIngredient}
  addShoppingItem={addShoppingItem}
/>
```

#### 今後の拡張予定

**機能強化**
- 商品価格の合計計算機能
- レシート店舗情報の抽出
- 購入日付の自動設定

**UI改善**
- ドラッグ&ドロップ対応
- プレビュー機能
- 読み取り精度の表示

## リファクタリング成果

### Shopping.tsx の分離
- **元のファイルサイズ**: 473行 → **リファクタリング後**: 211行（55%削減）
- **責任の分離**: ページレベルの状態管理とUI表示の分離
- **再利用性向上**: 各セクションが独立したコンポーネントとして再利用可能
- **保守性向上**: 単一責任原則に基づく設計

### 新規ユーティリティ
- `src/utils/shoppingStockMerge.ts`: 在庫マージロジックの分離
- 複雑なビジネスロジックをクラスベースのサービスとして実装

### コンポーネント分離の利点
1. **テスタビリティ**: 各コンポーネントの独立テストが可能
2. **開発効率**: 機能別の並行開発が可能
3. **コード理解**: 単一責任により理解しやすい
4. **バグ修正**: 影響範囲が限定され修正が容易

## 注意点
- Google Vision API連携のため、ネットワーク接続必須
- 10MB以下の画像ファイル制限
- 食材マスタとの正規化処理により、商品名の精度向上
- 完了済みアイテムとして追加される仕様
- 日本語商品名に最適化されたカテゴリ推測ロジック