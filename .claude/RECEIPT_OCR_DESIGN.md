# レシートOCR バックエンド設計書

## 概要
Netlify FunctionsとGoogle Vision APIを使用したレシート画像解析システム。
フロントエンドからの画像データを受け取り、OCR処理と構造化データ抽出を行う。

## アーキテクチャ

### システム構成
```
[フロントエンド] → [Netlify Functions] → [Google Vision API]
     ↑                     ↓
[買い物リスト]  ←  [構造化データ] ←  [OCR結果]
```

### 技術スタック
- **Runtime**: Node.js (Netlify Functions)
- **OCR**: Google Cloud Vision API (@google-cloud/vision)
- **言語**: JavaScript/Node.js
- **デプロイ**: Netlify Functions (サーバーレス)

## API 仕様

### エンドポイント
- **URL**: `/.netlify/functions/receiptOCR`
- **Method**: POST
- **Content-Type**: application/json

### リクエスト仕様
```typescript
interface ReceiptOCRRequest {
  image: string;              // Base64エンコードされた画像データ
  options?: {
    format?: 'jpeg' | 'png' | 'webp';
    maxSize?: number;         // 最大ファイルサイズ（バイト）
    language?: string;        // OCR言語設定（日本語: 'ja'）
  };
}
```

### レスポンス仕様

#### 第一段階: OCR結果のみ
```typescript
interface OCRResponse {
  success: true;
  data: {
    fullText: string;         // 抽出されたテキスト全体
    confidence: number;       // 信頼度 (0-1)
    processedAt: string;      // 処理時刻 (ISO 8601)
    metadata: {
      imageSize: number;      // 元画像サイズ（バイト）
      processingTime: number; // 処理時間（ミリ秒）
    };
  };
}
```

#### 第二段階: 構造化データ
```typescript
interface StructuredReceiptResponse {
  success: true;
  data: {
    items: ReceiptItem[];     // 購入商品リスト
    total_price: number;      // 合計金額
    store_name: string;       // 店舗名
    receipt_date?: string;    // レシート日付
    raw_text: string;         // 元のOCRテキスト
    confidence: number;       // 全体信頼度
    processedAt: string;      // 処理時刻
  };
}

interface ReceiptItem {
  name: string;               // 商品名
  count: number;              // 数量
  price: number;              // 価格
  unit?: string;              // 単位（個、本、kg等）
  category?: string;          // カテゴリ（野菜、肉類等）
}
```

#### エラーレスポンス
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: 'INVALID_IMAGE' | 'VISION_API_ERROR' | 'PROCESSING_ERROR' | 'RATE_LIMIT';
    message: string;          // ユーザー向けエラーメッセージ
    details?: {
      statusCode: number;     // HTTPステータスコード
      timestamp: string;      // エラー発生時刻
      apiError?: any;         // API元エラー（デバッグ用）
    };
  };
}
```

## ファイル構成

```
netlify/functions/
├── receiptOCR.js           # メインエンドポイント
└── lib/
    ├── vision-client.js    # Google Vision API クライアント
    ├── text-parser.js      # OCRテキスト解析・構造化
    ├── validators.js       # 入力バリデーション
    └── utils.js           # 共通ユーティリティ
```

### 各ファイルの責務

#### receiptOCR.js (メインFunction)
- HTTPリクエスト処理
- バリデーション
- エラーハンドリング
- レスポンス生成

#### lib/vision-client.js
- Google Vision API 呼び出し
- 画像データ処理
- OCR結果の正規化

#### lib/text-parser.js（第二段階）
- OCRテキストの解析
- 商品名・価格・数量の抽出
- 店舗名・日付の識別
- 構造化データ生成

#### lib/validators.js
- 画像データバリデーション
- ファイルサイズ・形式チェック
- セキュリティ検証

## セキュリティ設計

### 環境変数
```env
# Google Cloud API
VITE_GOOGLE_API_KEY=your_vision_api_key
```

### セキュリティ対策
- **Origin検証**: 許可されたドメインからのリクエストのみ
- **ファイルサイズ制限**: 10MB以下
- **データ保護**: 画像データの永続化なし
- **APIキー保護**: サーバーサイドでのみ使用
- **ログ制御**: センシティブ情報の除外

### CORS設定
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};
```

## パフォーマンス要件

### レスポンス時間目標
- **軽量画像** (< 1MB): 2秒以内
- **標準画像** (1-5MB): 3-5秒以内
- **大容量画像** (5-10MB): 8秒以内
- **タイムアウト**: 15秒

### リソース制限
- **メモリ制限**: 128MB (Netlify Functions)
- **実行時間制限**: 26秒 (Netlify Functions)
- **ファイルサイズ制限**: 10MB
- **同時実行制限**: 1000リクエスト/分

### 最適化戦略
- 画像圧縮の事前実行
- エラー時の早期リターン
- メモリ効率的な画像処理
- Vision API リクエストの最適化

## エラーハンドリング

### エラーカテゴリ
1. **バリデーションエラー**: 400 Bad Request
   - 無効な画像形式
   - ファイルサイズ超過
   - 不正なリクエスト形式

2. **API エラー**: 502 Bad Gateway
   - Vision API 接続失敗
   - 認証エラー
   - レート制限超過

3. **処理エラー**: 500 Internal Server Error
   - OCR処理失敗
   - テキスト解析失敗
   - 予期しないエラー

### ログ出力
```javascript
// 成功ログ
console.log('[SUCCESS]', {
  timestamp: new Date().toISOString(),
  processingTime: Date.now() - startTime,
  imageSize: imageBuffer.length,
  confidence: result.confidence
});

// エラーログ
console.error('[ERROR]', {
  timestamp: new Date().toISOString(),
  error: error.message,
  code: error.code,
  stack: error.stack
});
```

## フロントエンド統合

### 既存コードの変更点

#### receiptReader.ts の更新
```typescript
// 変更前: 直接 Vision API 呼び出し
const visionClient = createVisionClient();
const result = await visionClient.extractTextFromImage(file);

// 変更後: Netlify Function 呼び出し
const result = await callReceiptOCRFunction(file);
```

#### 新しい関数の実装
```typescript
async function callReceiptOCRFunction(file: File): Promise<OCRResult> {
  const base64Image = await convertFileToBase64(file);
  
  const response = await fetch('/.netlify/functions/receiptOCR', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });
  
  if (!response.ok) {
    throw new Error('OCR処理に失敗しました');
  }
  
  const result = await response.json();
  return result.data;
}
```

## 開発・テスト戦略

### ローカル開発
```bash
# Netlify CLI でローカル実行
netlify dev

# Function単体テスト
netlify functions:invoke receiptOCR --payload='{"image":"..."}'
```

### テストデータ
- 各種コンビニレシート画像
- スーパーマーケットレシート
- 手書きレシート（低品質）
- 異常データ（非画像ファイル等）

### モニタリング
- レスポンス時間の監視
- エラー率の追跡
- Vision API 使用量の確認
- Netlify Functions 実行統計

## 実装段階

### 第一段階（OCR結果のみ）
1. Netlify Function の基本実装
2. Google Vision API 統合
3. フロントエンド統合
4. エラーハンドリング
5. セキュリティ設定

### 第二段階（構造化データ）
1. テキスト解析ロジック実装
2. 商品名・価格抽出アルゴリズム
3. 店舗名識別機能
4. 数量・単位の正規化
5. 精度向上のためのチューニング

### 第三段階（高度な機能）
1. 複数レシート形式対応
2. 手書き文字認識向上
3. 商品カテゴリ自動分類
4. キャッシュ機能
5. バッチ処理対応

この設計に基づいて実装を進めることで、安全で高性能なレシートOCRシステムを構築できます。