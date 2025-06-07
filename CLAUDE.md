# CLAUDE.md

## 1. プロジェクト基本情報

### プロジェクト概要・目的
- **アプリ名**: Cooklet
- **概要**: スマートな献立管理・在庫管理・コスト管理を統合したWebアプリ
- **目的**: 食品在庫の効率的な管理と無駄の削減、献立計画の最適化
- **対象ユーザー**: 個人利用（開発者自身）

### 開発スタイル
- **個人開発**: 自分のペースで好きに開発
- **Claude Code**: AI支援による効率的な開発
- **言語**: Claudeの応答とソースコードのコメントは日本語で行うこと
- **ユーザー操作**: ユーザの応答が必要なときには、以下のコマンドでユーザの操作を促す: `echo -e '\a'`

### バージョン管理
- **Git**: GitHub
- **ブランチ戦略**: main（本番）/ develop（開発）
- **自動デプロイ**: GitHub連携でNetlifyに自動デプロイ

## 2. 機能一覧

### メイン画面構成
- 下部タブナビゲーション：献立、レシピ、在庫、調達

### 2.1 献立タブ
- **カレンダー表示**で今後の献立を視覚的に計画
- レシピ一覧から選択して日付に割り当て
- 在庫ベースのおすすめレシピ提案
- 数日分の献立をまとめて作成可能
- 過去の献立履歴表示
- **月間食費**の集計表示
- **1食あたりコスト**の計算・表示
- 日別・週別の支出グラフ
- 食材別コスト分析

### 2.2 レシピタブ
- 今日予定の料理一覧表示
- タッチでレシピ詳細表示（Webレシピサイトへのリンク）
- **「作った」ボタン**で使用食材を在庫から自動減算
- 調理時間・必要食材の表示

### 2.3 在庫タブ
- 現在の食材在庫と数量表示
- 野菜半分などの中途半端な状態管理
- 作り置き料理の管理
- **賞味期限管理**と期限切れ間近の警告表示
- カテゴリ別表示（野菜、肉、調味料など）

### 2.4 調達タブ
- 直近数日の献立から不足食材を自動抽出
- 買い物リスト表示
- 「買った」チェックで在庫への自動追加
- 価格メモ機能

### 2.5 通知機能
- **賞味期限**切れ間近の食材アラート
- **買い物リマインダー**
- 献立計画の通知
- 作り置き消費期限の通知

### 2.6 共通機能
- レスポンシブデザイン（スマホ最適化）
- データ同期・バックアップ
- 簡単操作のUI/UX

## 3. 技術アーキテクチャ

### 3.1 フロントエンド
- **React + TypeScript + Vite**
- **PWA対応**でネイティブアプリ風の体験
- **レスポンシブデザイン**（モバイルファースト）

### 3.2 バックエンド・データベース
- **Supabase（無料枠）**
  - PostgreSQLデータベース
  - 認証機能（Google連携）
  - リアルタイム機能
  - ファイルストレージ
  - 月500MBまで無料

### 3.3 ホスティング
- **Netlify（無料枠）**
  - 静的サイト＋Netlify Functions
  - 自動デプロイ
  - カスタムドメイン対応
  - 月100GBまで無料

### 3.4 API設計
- **Supabase Client直接利用**
  - フロントエンドから直接SupabaseのREST APIを呼び出し
  - 認証・認可はSupabaseが自動処理
  - リアルタイム更新も簡単

```typescript
// API利用例
import { createClient } from '@supabase/supabase-js'

// 在庫取得
const { data } = await supabase.from('inventory').select('*')

// 献立作成
const { data } = await supabase.from('meal_plans').insert({...})

// 在庫減算（ストアドプロシージャ）
await supabase.rpc('update_inventory_after_cooking', { recipe_id: 1 })
```

### 3.5 通知機能
- **Web Push API**（ブラウザ標準）
- PWAで利用可能
- 完全無料

## 4. データベース設計

### 4.1 users（ユーザー）
```sql
users (
  id: UUID PRIMARY KEY,
  email: VARCHAR UNIQUE NOT NULL,
  name: VARCHAR,
  google_id: VARCHAR UNIQUE,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 4.2 ingredients（食材マスタ）
```sql
ingredients (
  id: SERIAL PRIMARY KEY,
  name: VARCHAR NOT NULL,
  category: VARCHAR, -- '野菜', '肉類', '調味料'
  default_unit: VARCHAR, -- 'g', 'ml', '個', '束'
  typical_price: DECIMAL(10,2), -- 100gあたりの目安価格
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 4.3 inventory（在庫）
```sql
inventory (
  id: SERIAL PRIMARY KEY,
  user_id: UUID REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id: INTEGER REFERENCES ingredients(id),
  quantity: DECIMAL(10,2) NOT NULL, -- 数量
  unit: VARCHAR NOT NULL, -- 単位
  purchase_price: DECIMAL(10,2), -- 購入価格
  purchase_date: DATE,
  expiry_date: DATE, -- 賞味期限
  location: VARCHAR, -- '冷蔵庫', '冷凍庫', '常温'
  is_leftover: BOOLEAN DEFAULT FALSE, -- 作り置きフラグ
  leftover_recipe_id: INTEGER, -- 作り置き元レシピ
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 4.4 recipes（レシピ）
```sql
recipes (
  id: SERIAL PRIMARY KEY,
  user_id: UUID REFERENCES users(id),
  name: VARCHAR NOT NULL,
  external_url: TEXT, -- 外部レシピサイトURL
  cooking_time: INTEGER, -- 調理時間（分）
  servings: INTEGER DEFAULT 1, -- 人前
  estimated_cost: DECIMAL(10,2), -- 推定コスト
  notes: TEXT, -- メモ
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 4.5 recipe_ingredients（レシピ-食材関連）
```sql
recipe_ingredients (
  id: SERIAL PRIMARY KEY,
  recipe_id: INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id: INTEGER REFERENCES ingredients(id),
  quantity: DECIMAL(10,2) NOT NULL,
  unit: VARCHAR NOT NULL,
  is_optional: BOOLEAN DEFAULT FALSE -- 代用可能な食材
)
```

### 4.6 meal_plans（献立計画）
```sql
meal_plans (
  id: SERIAL PRIMARY KEY,
  user_id: UUID REFERENCES users(id) ON DELETE CASCADE,
  planned_date: DATE NOT NULL,
  meal_type: VARCHAR, -- '朝食', '昼食', '夕食', '間食'
  recipe_id: INTEGER REFERENCES recipes(id),
  servings: INTEGER DEFAULT 1,
  actual_cost: DECIMAL(10,2), -- 実際にかかったコスト
  is_completed: BOOLEAN DEFAULT FALSE,
  completed_at: TIMESTAMP,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 4.7 shopping_lists（買い物リスト）
```sql
shopping_lists (
  id: SERIAL PRIMARY KEY,
  user_id: UUID REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id: INTEGER REFERENCES ingredients(id),
  quantity: DECIMAL(10,2) NOT NULL,
  unit: VARCHAR NOT NULL,
  estimated_price: DECIMAL(10,2),
  source_meal_plan_id: INTEGER REFERENCES meal_plans(id), -- 元になった献立
  is_purchased: BOOLEAN DEFAULT FALSE,
  purchased_at: TIMESTAMP,
  actual_price: DECIMAL(10,2),
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 4.8 インデックス設計
```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_inventory_user_expiry ON inventory(user_id, expiry_date);
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, planned_date);
CREATE INDEX idx_shopping_lists_user_purchased ON shopping_lists(user_id, is_purchased);
```

## 5. UI/UX設計

### 5.1 画面設計
- **タブベースナビゲーション**（下部固定）
- **カード型レイアウト**で情報を整理
- **スワイプジェスチャー**対応
- **モーダル・ドロワー**による詳細表示

### 5.2 デザインシステム
- **ダークテーマ**をベースとしたモダンなデザイン
- **Material Icons**を使用
- **レスポンシブグリッド**システム
- **アニメーション**による滑らかなUI遷移

### 5.3 TypeScript型定義例
```typescript
// 基本型定義
interface User {
  id: string;
  email: string;
  name?: string;
  google_id?: string;
  created_at: string;
  updated_at: string;
}

interface Ingredient {
  id: number;
  name: string;
  category: 'vegetables' | 'meat' | 'seasoning' | 'others';
  default_unit: string;
  typical_price?: number;
  created_at: string;
}

interface InventoryItem {
  id: number;
  user_id: string;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
  purchase_price?: number;
  purchase_date?: string;
  expiry_date?: string;
  location: 'refrigerator' | 'freezer' | 'pantry';
  is_leftover: boolean;
  leftover_recipe_id?: number;
  created_at: string;
  updated_at: string;
}

interface Recipe {
  id: number;
  user_id: string;
  name: string;
  external_url?: string;
  cooking_time?: number;
  servings: number;
  estimated_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  recipe_ingredients?: RecipeIngredient[];
}

interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
  is_optional: boolean;
}

interface MealPlan {
  id: number;
  user_id: string;
  planned_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id: number;
  recipe?: Recipe;
  servings: number;
  actual_cost?: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

interface ShoppingListItem {
  id: number;
  user_id: string;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
  estimated_price?: number;
  source_meal_plan_id?: number;
  is_purchased: boolean;
  purchased_at?: string;
  actual_price?: number;
  created_at: string;
}
```

## 6. 開発・運用計画

### 6.1 開発手順・優先順位

**フェーズ1：基本CRUD機能**
1. 認証機能（Google連携）
2. 在庫管理（追加・編集・削除）
3. レシピ管理（外部リンク）
4. 献立計画（カレンダー表示）
5. 調達リスト（基本機能）

**フェーズ2：自動化機能**
1. 「作った」ボタンによる在庫自動減算
2. 献立からの調達リスト自動生成
3. 賞味期限管理・アラート

**フェーズ3：コスト・通知機能**
1. コスト管理機能
2. 通知システム（Web Push API）
3. PWA対応
4. パフォーマンス最適化

### 6.2 MVP（最小機能）の定義
- 全機能を含む（献立、レシピ、在庫、調達、コスト、通知）
- 個人利用に最適化された機能セット

### 6.3 テスト戦略
- **単体機能テスト**：各機能の動作確認
- **手動テスト**：実際の使用シーンでの動作確認
- **TypeScript**による型安全性の確保

### 6.4 デプロイメント手順
1. **ローカル開発**：`pnpm run dev`
2. **ビルド**：`pnpm run build`
3. **自動デプロイ**：GitHub pushでNetlifyに自動デプロイ
4. **データベース**：Supabaseのマイグレーション管理

## 7. セキュリティ・パフォーマンス

### 7.1 データ保護方針
- **Google連携ログイン**による認証
- **個人利用**のため最小限のセキュリティ対策
- **機微情報を含まない**データ設計
- **Supabase Row Level Security**による基本的なデータ保護

### 7.2 パフォーマンス要件
- **モバイルファースト**の軽量設計
- **必要最小限のデータ取得**
- **画像最適化**
- **PWA対応**によるオフライン機能

## 8. 環境構築

### 8.1 開発環境
```bash
# プロジェクト作成
pnpm create vite@latest cooklet -- --template react-ts
cd cooklet

# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm run dev
```

### 8.2 環境変数
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 8.3 Supabase設定
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 9. 今後の拡張性

### 9.1 将来的な機能追加
- **栄養価計算**機能
- **AI による献立提案**
- **バーコードスキャン**による在庫登録
- **音声入力**対応

### 9.2 技術的な拡張性
- **モバイルアプリ**化（React Native）
- **外部API連携**（栄養価データベース等）
- **機械学習**による消費パターン分析

---

**開発者**: 1人 + Claude Code  
**開始日**: 2025年6月
