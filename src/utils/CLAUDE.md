# Utils ディレクトリ

## 概要
アプリケーション全体で使用するユーティリティ関数を管理するディレクトリ。

## ファイル構成

### receiptReader.ts
レシート読み取り機能のモック実装ファイル。将来的にはOCR APIやAI APIと連携予定。

#### 型定義

**ReceiptItem**
```typescript
interface ReceiptItem {
  name: string;        // 商品名
  quantity: string;    // 数量
  price?: number;      // 価格（任意）
}
```

**ReceiptResult**
```typescript
interface ReceiptResult {
  items: ReceiptItem[];    // 読み取った商品リスト
  totalAmount?: number;    // 合計金額（任意）
  storeName?: string;      // 店舗名（任意）
  date?: string;          // 購入日（任意）
}
```

#### 実装済み機能

**readReceiptFromImage(file: File): Promise<ReceiptResult>**
- レシート画像を読み取って商品リストを返すモック関数
- 2秒間の処理時間をシミュレート
- ファイルサイズに基づいて3種類のモックデータから選択
- 現在は以下のモックデータを返却：
  - スーパーマーケット: キャベツ、玉ねぎ、豚バラ肉、卵、牛乳（合計1210円）
  - 食品館: 鶏むね肉、ブロッコリー、にんじん、米、醤油（合計2702円）
  - コンビニ: じゃがいも、トマト、レタス、パン、バター（合計960円）

**validateImageFile(file: File): boolean**
- 画像ファイルの妥当性チェック
- 対応形式: JPEG, JPG, PNG, WebP
- 最大ファイルサイズ: 10MB
- ファイルタイプとサイズの両方をチェック

#### 使用方法

```typescript
import { readReceiptFromImage, validateImageFile } from '../utils/receiptReader';

// ファイル妥当性チェック
if (!validateImageFile(file)) {
  console.error('無効なファイル形式またはサイズです');
  return;
}

// レシート読み取り実行
try {
  const result = await readReceiptFromImage(file);
  console.log(`${result.items.length}件のアイテムを読み取りました`);
  console.log('店舗名:', result.storeName);
  console.log('合計金額:', result.totalAmount);
} catch (error) {
  console.error('読み取りに失敗しました:', error);
}
```

#### 今後の実装予定

**実際のOCR API連携**
- Google Vision API
- AWS Textract
- Azure Computer Vision
などとの連携を検討

**AI解析機能**
- ChatGPT API等を使用したレシート内容の構造化
- 商品名の正規化
- 価格と数量の正確な抽出

**エラーハンドリング強化**
- ネットワークエラー対応
- API制限対応
- 画像品質チェック

## 注意点
- 現在はモック実装のため、実際の画像読み取りは行わない
- ファイルサイズによって返却するモックデータが変わる
- 実際のAPI連携時は環境変数による設定管理が必要
- プライバシー保護のため、画像データの適切な取り扱いが重要