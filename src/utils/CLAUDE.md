# Utils ディレクトリ

## 概要
アプリケーション全体で使用するユーティリティ関数を管理するディレクトリ。

## ファイル構成

### receiptReader.ts
レシート読み取り機能の実装ファイル。Google Vision APIとGemini AIを組み合わせた高精度レシート解析。
ingredientsテーブルのoriginal_nameと照らし合わせて商品名を一般名に自動変換。

### nameNormalizer.ts
商品名正規化ユーティリティ。レシートの商品名をingredientsテーブルの一般名に変換。

#### 型定義

**ReceiptItem**
```typescript
interface ReceiptItem {
  originalName: string;                    // 元の商品名（OCR結果、任意）
  name: string;                            // 正規化された商品名
  quantity: string;                        // 数量
  price?: number;                          // 価格（任意）
  normalizationResult?: NameNormalizationResult; // 正規化結果（任意）
}
```

**ReceiptResult**
```typescript
interface ReceiptResult {
  items: ReceiptItem[];    // 読み取った商品リスト
  totalPrice?: number;     // 計算された合計金額（任意）
  storeName?: string;      // 店舗名（任意）
  date?: string;          // 購入日（任意）
  confidence?: number;     // AI構造化の信頼度（任意）
}
```

#### 実装済み機能

**readReceiptFromImage(file: File, ingredients?: Ingredient[]): Promise<ReceiptResult>**
- レシート画像を読み取って商品リストを返す関数
- Step 1: Google Vision APIでOCR処理（プレーンテキスト抽出）
- Step 2: Gemini AIでテキスト構造化（商品・店舗・日付抽出）
- Step 3: 商品名正規化処理（ingredientsテーブルのoriginal_nameと照らし合わせ）
- Step 4: 商品価格から合計金額を自動計算
- デバッグ用のコンソール出力機能付き（正規化統計を含む）

**calculateTotalPrice(items: ReceiptItem[]): number**
- 商品リストから合計金額を計算する関数
- 価格が設定されている商品のみを対象
- 数値型の価格のみを集計

**validateImageFile(file: File): boolean**
- 画像ファイルの妥当性チェック
- 対応形式: JPEG, JPG, PNG, WebP
- 最大ファイルサイズ: 10MB
- ファイルタイプとサイズの両方をチェック

#### nameNormalizer.ts の機能

**normalizeProductName(originalName: string, ingredients: Ingredient[]): NameNormalizationResult**
- 商品名をingredientsテーブルと照らし合わせて一般名に変換
- 完全一致 → 部分一致 → 逆向き部分一致の順で検索
- 正規化結果と詳細情報を返す

**normalizeReceiptItems<T>(items: T[], ingredients: Ingredient[]): Array<T & { normalizationResult: NameNormalizationResult }>**
- レシートアイテムリストの商品名を一括正規化
- 元のアイテムデータに正規化情報を追加して返す

**getNormalizationStats(results: NameNormalizationResult[]): Stats**
- 正規化統計情報（総数・成功数・未変更数・成功率）を計算

#### 使用方法

```typescript
import { readReceiptFromImage, validateImageFile } from '../utils/receiptReader';
import { useIngredients } from '../hooks';

// 食材マスタデータを取得
const { ingredients } = useIngredients();

// ファイル妥当性チェック
if (!validateImageFile(file)) {
  console.error('無効なファイル形式またはサイズです');
  return;
}

// レシート読み取り実行（商品名正規化付き）
try {
  const result = await readReceiptFromImage(file, ingredients);
  console.log(`${result.items.length}件のアイテムを読み取りました`);
  console.log('店舗名:', result.storeName);
  console.log('購入日:', result.date);
  console.log('合計金額:', result.totalPrice);
  console.log('AI信頼度:', result.confidence);
  
  // 個別の商品詳細（正規化情報付き）
  result.items.forEach((item, index) => {
    console.log(`${index + 1}: ${item.name} - ${item.quantity} - ¥${item.price || '価格不明'}`);
    if (item.normalizationResult?.isNormalized) {
      console.log(`  正規化: "${item.normalizationResult.originalName}" → "${item.name}"`);
    }
  });
} catch (error) {
  console.error('読み取りに失敗しました:', error);
}
```

#### 実装済み技術

**OCR処理**
- Google Vision API（DOCUMENT_TEXT_DETECTION）
- Netlify Functions経由でセキュアなAPI利用
- 高精度なテキスト抽出

**AI構造化**
- Google Gemini AI（gemini-2.5-flash）
- JSON Schema指定による構造化レスポンス
- 商品名、数量、価格の正確な抽出
- 店舗名、日付の自動識別

**エラーハンドリング**
- OCR処理エラー対応
- AI構造化エラー対応
- ネットワークエラー対応
- 詳細なエラーメッセージ

#### 今後の改良予定

**精度向上**
- プロンプトエンジニアリングの最適化
- レシート形式別の対応強化
- 商品名正規化ロジック

**機能拡張**
- カテゴリ自動分類
- 栄養成分情報の関連付け
- 買い物履歴との連携

## 注意点

### API利用制限
- Google Vision API: 月間制限と課金に注意
- Google Gemini AI: リクエスト頻度制限あり
- 環境変数による適切な設定管理が必要

### セキュリティ
- APIキーの適切な管理（環境変数での設定）
- 画像データの一時的な処理（永続化なし）
- プライバシー保護のための適切なデータ取り扱い

### 精度について
- レシート画質により結果が変動
- 手書き文字や特殊フォントの認識精度に限界
- AI構造化の信頼度を参考に結果を判断