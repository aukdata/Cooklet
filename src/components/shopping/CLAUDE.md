# Components/Shopping ディレクトリ

## 概要
買い物リスト機能に関連するコンポーネントを管理するディレクトリ。Shoppingページのリファクタリングにより分離されたコンポーネント群。

## ファイル構成

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

#### Props

```typescript
interface ReceiptReaderProps {
  /** 食材マスタデータ（商品名正規化用） */
  ingredients: Ingredient[];
  /** 食材マスタ追加関数 */
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  /** 買い物リストアイテム追加関数 */
  addShoppingItem: (item: { name: string; quantity?: string; checked: boolean; added_from: string }) => Promise<void>;
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

## 注意点
- Google Vision API連携のため、ネットワーク接続必須
- 10MB以下の画像ファイル制限
- 食材マスタとの正規化処理により、商品名の精度向上
- 完了済みアイテムとして追加される仕様
- 日本語商品名に最適化されたカテゴリ推測ロジック