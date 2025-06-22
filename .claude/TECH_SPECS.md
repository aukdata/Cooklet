# 技術仕様書

## 1. 技術アーキテクチャ

### 1.1 フロントエンド
- **React + TypeScript**
- **PWA対応**でネイティブアプリ風の体験
- **レスポンシブデザイン**（モバイルファースト）

### 1.2 バックエンド・データベース
- **Supabase（無料枠）**
  - PostgreSQLデータベース
  - 認証機能（Google連携）
  - リアルタイム機能
  - ファイルストレージ
  - 月500MBまで無料

### 1.3 ホスティング
- **Netlify（無料枠）**
  - 静的サイトホスティング
  - GitHub連携で自動デプロイ
  - カスタムドメイン対応
  - 月100GB帯域まで無料
  - PWA対応・CDN最適化

### 1.4 API設計
- **Supabase Client直接利用**
  - フロントエンドから直接SupabaseのREST APIを呼び出し
  - 認証・認可はSupabaseが自動処理
  - リアルタイム更新も簡単

```typescript
// API利用例
import { createClient } from '@supabase/supabase-js'

// 在庫取得
const { data } = await supabase.from('stock_items').select('*')

// 献立作成
const { data } = await supabase.from('meal_plans').insert({...})

// 在庫減算（ストアドプロシージャ）
await supabase.rpc('update_inventory_after_cooking', { recipe_id: 1 })
```

### 1.5 通知機能
- **Web Push API**（ブラウザ標準）
- PWAで利用可能
- 完全無料
- **期限通知機能**: 賞味期限が近い食品をプッシュ通知
- **朝の通知機能**: 毎朝指定した時間に期限の近い食材を通知
- **ユーザー設定**: 通知の有効/無効切り替え
- **通知タイミング**: 1-7日前から選択可能（デフォルト3日前）
- **朝の通知時間**: ユーザーが自由に設定可能（デフォルト08:00）
- **権限管理**: ブラウザの通知権限を要求
- **自動チェック**: 1時間ごとの期限チェック
- **スケジュール管理**: 朝の通知は毎日自動実行

### 1.6 レシートOCR機能

#### 概要
Netlify FunctionsとGoogle Vision APIを使用したレシート画像解析システム。
フロントエンドからの画像データを受け取り、OCR処理と構造化データ抽出を行う。

#### システム構成
```
[フロントエンド] → [Netlify Functions] → [Google Vision API]
     ↑                     ↓
[買い物リスト]  ←  [構造化データ] ←  [OCR結果]
```

#### 技術仕様
- **Runtime**: Node.js (Netlify Functions)
- **OCR**: Google Cloud Vision API (@google-cloud/vision)
- **言語**: TypeScript
- **デプロイ**: Netlify Functions (サーバーレス)
- **セキュリティ**: APIキーはサーバーサイドで管理
- **TypeScript型安全性**: 完全な型定義により実行時エラーを防止

#### API仕様
**エンドポイント**: `/.netlify/functions/receiptOCR`
**Method**: POST
**Content-Type**: application/json

**リクエスト**:
```typescript
{
  image: string;  // Base64エンコード画像 (data:image/jpeg;base64,...)
  options?: {
    format?: 'jpeg' | 'png' | 'webp';
    maxSize?: number;
    language?: string;
  };
}
```

**レスポンス（成功時）**:
```typescript
{
  success: true;
  data: {
    fullText: string;        // 抽出されたテキスト
    confidence: number;      // 信頼度 (0.0-1.0)
    processedAt: string;     // 処理完了時刻
    metadata: {
      imageSize: number;     // 画像サイズ (bytes)
      processingTime: number; // 処理時間 (ms)
    };
  };
}
```

**レスポンス（エラー時）**:
```typescript
{
  success: false;
  error: {
    code: string;           // エラーコード
    message: string;        // 日本語エラーメッセージ
    details?: {
      statusCode: number;
      timestamp: string;
      apiError?: unknown;
    };
  };
}
```

#### 機能仕様
- **段階的実装**: 
  - 第一段階: OCR結果のテキスト抽出 ✅
  - 第二段階: 商品名・価格・数量の構造化データ抽出
- **対応形式**: JPEG, PNG, WebP (最大10MB)
- **レスポンス時間**: 2-5秒（画像サイズに依存）
- **エラーハンドリング**: 詳細なエラー分類と日本語メッセージ
- **CORS対応**: 本番・開発環境の適切な制限

#### フロントエンド統合
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

## 2. TypeScript型定義

### 2.1 基本データ型
```typescript
interface MealPlan {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  recipe_url?: string;
  ingredients: { name: string; quantity: string }[];
  memo?: string;
  consumed_status?: 'pending' | 'completed' | 'stored';
  created_at: string;
  updated_at: string;
}

interface StockItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  best_before?: string;
  storage_location?: string;
  is_homemade: boolean;
  created_at: string;
  updated_at: string;
}

interface ShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  quantity?: string;
  checked: boolean;
  added_from: 'manual' | 'auto';
  created_at: string;
}

interface CostRecord {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  is_eating_out: boolean;
  created_at: string;
}

interface SavedRecipe {
  id: string;
  user_id: string;
  title: string;
  url: string;
  servings: number;
  tags: string[];
  created_at: string;
}

interface NotificationSettings {
  notification_enabled: boolean;
  expiry_notification_days: number;
  notification_enabled: boolean;
  notification_time: string;
}

interface ExpiryItem {
  id: string;
  name: string;
  best_before: string;
  days_until_expiry: number;
  storage_location?: string;
}
```

### 2.2 Netlify Functions用型定義
```typescript
interface OCRRequestBody {
  image: string;
  options?: {
    format?: 'jpeg' | 'png' | 'webp';
    maxSize?: number;
    language?: string;
  };
}

interface OCRSuccessResponse {
  success: true;
  data: {
    fullText: string;
    confidence: number;
    processedAt: string;
    metadata: {
      imageSize: number;
      processingTime: number;
    };
  };
}

interface VisionApiResponse {
  textAnnotations?: Array<{
    description?: string | null;
    boundingPoly?: {
      vertices: Array<{ x?: number; y?: number }>;
    } | null;
    locale?: string | null;
  }> | null;
  fullTextAnnotation?: {
    text?: string | null;
    pages?: Array<{
      property?: {
        detectedLanguages?: Array<{
          languageCode: string;
          confidence: number;
        }>;
      };
    }> | null;
  } | null;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      statusCode: number;
      timestamp: string;
      apiError?: unknown;
    };
  };
}
```

## 3. データベース設計

### 3.1 users（ユーザー）
```sql
users (
  id: UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email: TEXT UNIQUE NOT NULL,
  name: TEXT,
  google_id: TEXT UNIQUE,
  notification_enabled: BOOLEAN DEFAULT FALSE,
  expiry_notification_days: INTEGER DEFAULT 3,
  notification_enabled: BOOLEAN DEFAULT FALSE,
  notification_time: TIME DEFAULT '08:00',
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 3.2 meal_plans（献立）
```sql
meal_plans (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date: DATE NOT NULL,
  meal_type: TEXT NOT NULL,
  recipe_url: TEXT,
  ingredients: JSONB,
  memo: TEXT,
  consumed_status: TEXT DEFAULT 'pending' CHECK (consumed_status IN ('pending', 'completed', 'stored')),
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 3.3 ingredients（食材マスタ）
```sql
ingredients (
  id: SERIAL PRIMARY KEY,
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name: TEXT NOT NULL,
  category: TEXT NOT NULL CHECK (category IN ('vegetables', 'meat', 'seasoning', 'others')),
  default_unit: TEXT NOT NULL,
  typical_price: DECIMAL(10,2),
  original_name: TEXT NOT NULL,
  conversion_quantity: TEXT,
  conversion_unit: TEXT,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 3.4 stock_items（食材在庫）
```sql
stock_items (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name: TEXT NOT NULL,
  quantity: TEXT NOT NULL,
  best_before: DATE,
  storage_location: TEXT,
  is_homemade: BOOLEAN DEFAULT FALSE,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 3.4 shopping_list（買い物リスト）
```sql
shopping_list (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name: TEXT NOT NULL,
  quantity: TEXT,
  checked: BOOLEAN DEFAULT FALSE,
  added_from: TEXT,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 3.5 cost_records（コスト記録）
```sql
cost_records (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date: DATE NOT NULL,
  description: TEXT,
  amount: INTEGER NOT NULL,
  is_eating_out: BOOLEAN DEFAULT FALSE,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 3.6 saved_recipes（レシピ保存）
```sql
saved_recipes (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title: TEXT NOT NULL,
  url: TEXT NOT NULL,
  servings: INTEGER DEFAULT 1,
  tags: TEXT[],
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 3.7 インデックス設計
```sql
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX idx_meal_plans_consumed_status ON meal_plans(user_id, consumed_status);
CREATE INDEX idx_stock_items_user_best_before ON stock_items(user_id, best_before);
CREATE INDEX idx_shopping_list_user_checked ON shopping_list(user_id, checked);
CREATE INDEX idx_cost_records_user_date ON cost_records(user_id, date);
```

## 4. セキュリティ設計

### 4.1 基本方針
- **Netlify Functions CORS制限**: 本番環境では cooklet.netlify.app のみアクセス許可
- **HTTPS限定**: レシピプロキシはHTTPSのURLのみサポート
- **Origin検証**: 不正なOriginからのアクセスを拒否・ログ記録
- **開発環境**: localhost系は自動許可、本番では完全制限

### 4.2 データ保護方針
- **Google連携ログイン**による認証
- **個人利用**のため最小限のセキュリティ対策
- **機微情報を含まない**データ設計
- **Supabase Row Level Security**による基本的なデータ保護

## 5. パフォーマンス要件

### 5.1 設計原則
- **モバイルファースト**の軽量設計
- **必要最小限のデータ取得**
- **画像最適化**
- **PWA対応**によるオフライン機能

## 6. 環境構築

### 6.1 開発環境
```bash
# プロジェクト作成
pnpm create vite@latest cooklet -- --template react-ts
cd cooklet

# 依存関係インストール
pnpm install @supabase/supabase-js
pnpm install @types/react @types/react-dom
pnpm install tailwindcss postcss autoprefixer
pnpm install @headlessui/react
pnpm install date-fns
pnpm install react-calendar
pnpm install lucide-react

# 開発サーバー起動
pnpm run dev

# 型チェック・品質管理
pnpm run lint      # ESLint + TypeScript型チェック
pnpm run build     # ビルド時型チェック
```

### 6.2 TypeScript設定・移行

#### 設定概要
- **厳密な型チェック**: `any`型の使用を禁止
- **型安全性**: Netlify Functions用の完全な型定義
- **Google Vision API**: 実際のAPIレスポンスに合わせた型定義
- **エラーハンドリング**: 型安全なエラーレスポンス

#### Netlify Functions TypeScript移行
**移行したファイル**:
- `receiptOCR.js` → `receiptOCR.ts`: Google Vision API レシートOCR処理
- `proxy.js` → `proxy.ts`: レシピサイト CORS制限回避プロキシ

**共有型定義ファイル**:
- `netlify/functions/types/shared.ts`: 統一型システム
  - Netlify Functions共通型（NetlifyEvent, Context, Handler）
  - OCR・プロキシAPIレスポンス型
  - Google Vision API レスポンス型
  - エラーハンドリング・バリデーション用型

#### TypeScript設定ファイル

**netlify/functions/package.json**:
```json
{
  "dependencies": {
    "@google-cloud/vision": "^5.2.0",
    "@netlify/functions": "^2.8.1"
  },
  "devDependencies": {
    "@types/node": "^22.15.30",
    "typescript": "~5.8.3"
  }
}
```

**netlify/functions/tsconfig.json**:
- **target**: ES2022
- **module**: CommonJS  
- **strict**: true（厳密モード）
- Netlify Functions環境に最適化

#### 型安全性の向上例

**Before (JavaScript)**:
```javascript
// 型チェックなし、実行時エラーの可能性
const validation = validateImageData(image);
if (!validation.isValid) {
  return { statusCode: 400, body: validation.error };
}
```

**After (TypeScript)**:
```typescript
// コンパイル時型チェック
const validation: ValidationResult = validateImageData(image);
if (!validation.isValid) {
  return {
    statusCode: 400,
    headers: getCorsHeaders(event.headers.origin),
    body: JSON.stringify(createErrorResponse(
      'INVALID_IMAGE',
      validation.error || '画像データが無効です',
      400
    ))
  };
}
```

#### 主なメリット
1. **開発時の安全性**: コンパイル時型チェック、IDE自動補完
2. **保守性の向上**: APIレスポンス形式の一貫性、エラーハンドリング標準化
3. **フロントエンドとの統合**: 共通型定義による一貫性

### 6.3 環境変数
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Cloud Vision API (Netlify Functions用)
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key

# CORS設定 (Netlify Functions用)
ALLOWED_ORIGINS=https://cooklet.netlify.app,http://localhost:5173
```

### 6.4 Supabase設定
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```