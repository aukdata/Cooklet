# Vision ディレクトリ

## 概要
Netlify Functions経由でGoogle Vision API を使用したOCR（光学文字認識）機能を提供するディレクトリ。
レシート画像からテキストを抽出する機能を実装。
セキュリティのためAPIキーはサーバーサイドで管理。

## ファイル構成

### vision-client.ts
Netlify Functions経由でGoogle Vision API を使用するOCRクライアントの実装。
フロントエンドから安全にOCR処理を実行。

#### 主要クラス・関数

**VisionClient クラス**
- Netlify Functions `/.netlify/functions/receiptOCR` への接続
- 画像データのData URL形式変換
- レスポンス解析とエラーハンドリング
- ネットワークエラー対応
- 接続テスト機能

**ReceiptItem インターフェース**
```typescript
interface ReceiptItem {
  name: string;           // 商品名
  quantity: string;       // 数量
  price?: number;         // 価格（任意）
}
```

**OCRResult インターフェース**
```typescript
interface OCRResult {
  fullText: string;        // 抽出されたテキスト全体
  confidence: number;      // 抽出結果の信頼度
  processedAt: string;     // 処理時刻
  metadata?: {
    imageSize: number;     // 画像サイズ
    processingTime: number; // 処理時間
  };
  // 構造化データ（オプション）
  structured?: {
    items: ReceiptItem[];   // 抽出された商品リスト
    totalPrice?: number;    // 合計金額
    storeName?: string;     // 店舗名
    date?: string;          // 購入日
  };
}
```

**OCRError クラス**
- OCR処理専用のエラークラス
- API エラーコードとメッセージを含む詳細エラー情報
- 元エラーの保持による デバッグ情報の維持

#### 実装済み機能

**extractTextFromImage(imageFile: File): Promise<OCRResult>**
- 画像ファイルからテキストを抽出
- DOCUMENT_TEXT_DETECTION を使用した高精度認識
- Base64エンコーディングによる画像データ変換
- Vision API レスポンスの解析とエラーハンドリング
- 構造化データ（商品リスト、店舗名、合計金額等）の自動抽出

**convertToBase64(file: File): Promise<string>**
- ファイルをBase64文字列に変換
- データURLプレフィックスの除去
- FileReader による非同期読み込み

**createVisionClient(): VisionClient**
- 環境変数からAPIキーを取得してクライアントを作成
- VITE_GOOGLE_CLOUD_API_KEY の存在チェック
- デフォルトインスタンスの生成

#### Vision API 仕様

**リクエスト形式**
```json
{
  "requests": [
    {
      "image": {
        "content": "base64_encoded_image"
      },
      "features": [
        {
          "type": "DOCUMENT_TEXT_DETECTION",
          "maxResults": 1
        }
      ]
    }
  ]
}
```

**レスポンス形式**
```json
{
  "responses": [
    {
      "textAnnotations": [
        {
          "description": "extracted_text",
          "boundingPoly": {
            "vertices": [...]
          }
        }
      ]
    }
  ]
}
```

#### 使用方法

```typescript
import { createVisionClient } from './vision-client';

const visionClient = createVisionClient();
const result = await visionClient.extractTextFromImage(imageFile);

console.log('抽出テキスト:', result.fullText);
console.log('信頼度:', result.confidence);

// 構造化データがある場合
if (result.structured) {
  console.log('店舗名:', result.structured.storeName);
  console.log('合計金額:', result.structured.totalPrice);
  console.log('商品一覧:', result.structured.items);
}
```

#### エラーハンドリング

**OCRError の種類**
- APIキー未設定エラー
- Vision API リクエストエラー
- レスポンスエラー（コード・メッセージ付き）
- テキスト検出失敗エラー
- ファイル読み込みエラー

**エラーメッセージ**
- 日本語での詳細エラー情報
- HTTPステータスコードの含有
- 元エラーの保持による詳細デバッグ情報

## 環境変数

### 必須設定
```env
VITE_GOOGLE_CLOUD_API_KEY=your_google_vision_api_key
```

### Google Cloud Console 設定
1. Google Cloud Console でプロジェクト作成
2. Vision API の有効化
3. 認証情報（APIキー）の作成
4. APIキーの制限設定（Vision API のみ許可）

## 注意点

### セキュリティ
- APIキーの適切な管理が必要
- 本番環境では適切なキー制限を設定
- ブラウザからの直接API呼び出しのため、キーの漏洩リスクあり

### 使用制限
- Google Cloud の Vision API 使用制限に注意
- 月間リクエスト数の上限確認
- 適切な課金設定

### パフォーマンス
- 大きな画像ファイルは処理時間が長い
- ネットワーク接続状況による影響
- タイムアウト設定の考慮

### 対応画像形式
- JPEG, PNG, WebP, GIF, PDF, TIFF
- 最大ファイルサイズ: 20MB
- 最大解像度: 制限なし（実用的には4096x4096推奨）

## 今後の拡張予定

### 高度なOCR機能
- 構造化データ抽出
- 表形式データの認識
- レシート項目の自動分類

### パフォーマンス改善
- 画像圧縮による転送量削減
- キャッシュ機能の実装
- バッチ処理対応

### エラー処理強化
- リトライ機能
- フォールバック処理
- ユーザーフレンドリーなエラーメッセージ