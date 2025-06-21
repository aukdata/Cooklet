# Cooklet - 献立管理アプリ 仕様書

## 1. プロジェクト基本情報

### Claude Code AIへの制約
すべての応答は、日本語で行われなければなりません。
**遵守** ソースコードには、読者の理解を助けるような日本語のコメントを書いてください。
**遵守** トークン節約のために、ソースコードがあるディレクトリにはCLAUDE.mdを生成し、配下のファイルに含まれるメゾットなどを要約してください。内容はClaudeが理解できれば一任します。
**遵守** ソースコードを参照するときは、まず各ディレクトリのCLAUDE.mdを参照してください。
**遵守** ソースコードを変更するときは、忘れずにCLAUDE.mdにも変更を反映してください。変更した仕様はすべてこのファイルに追記・修正してください。
ユーザの応答が必要なときには、以下のコマンドでユーザの操作を促す: `echo -e '\a'`
不要なパッケージは`pnpm uninstall`してください。
**遵守** 変数を定義するときは必ず型を記述してください。`any`は決して使用してはいけません。
**oxlint抑制コメント（`// oxlint-disable`）は決して使用してはいけません。**根本的な型安全性とコード品質の改善で解決してください。
適宜`pnpm run lint && pnpm run build`を実行して、コードの品質を維持してください。
- **pre-commit hook**: コミット前に自動でlintチェック実行（エラー時はコミット阻止）
- **pre-push hook**: プッシュ前に自動でlint & buildチェック実行（エラー時はプッシュ阻止）
- Git hookにより品質管理が自動化されているため、手動チェックは不要
`import`は、`import {...}`の形式を使用してください。`import ...`は使用しないでください。
**遵守** Github issueに着手する前に、該当のissueに修正方針のコメントを追加してください。
**遵守** Github issueの解決を確認したら、修正の概要をコメントし、Closeしてください。
変更を保存するため、キリがよく、かつ動作が確認できたタイミングで`git add . && git commit -m "wip" && git push`を実行してください。
**重要** キリのいいタイミングで、CLAUDE.mdの内容がコードベースと一致しているか確認し、不一致があれば修正してください。
**重要** 画面をまたいでUIの一貫性を維持してください。
**遵守** データベースの変更が必要な場合は、その旨をIssueのコメントやユーザへの返答で知らせ、database/patch-***.sqlのような形式でパッチを出力してください。
**遵守** このプロジェクトのUIは、.claude/UI.mdの内容に従ってください。必要があれば追記してください。
**遵守** ほかのセッションでの意図しないrevertを防ぐため、機能変更の経緯と、バグ修正、引き継ぐべき事項を、.claude/DEVELOPMENT_LOG.mdに出力してください。変更を計画する前に必ず参照してください。
**遵守** 要素を追加するときは.claude/ELEMENTS.mdにある、既存の型、コンポーネント、関数を使用して作成してください。それで不可能な場合に、新しい要素を作成し、必ず.claude/ELEMENTS.mdに追加してください。

### プロジェクト概要・目的
- **アプリ名**: Cooklet
- **概要**: 一人暮らしユーザーのための献立・在庫・買い物・コストを一元管理できるスマートな献立管理Webアプリ
- **目的**: レシピはURL管理とし、軽量かつシンプルなPWAとして設計
- **対象ユーザー**: 一人暮らしで自炊する個人ユーザー、献立・在庫・支出をシンプルに記録・管理したい人
- **本番URL**: https://cooklet.netlify.app

### セキュリティ設計
- **Netlify Functions CORS制限**: 本番環境では cooklet.netlify.app のみアクセス許可
- **HTTPS限定**: レシピプロキシはHTTPSのURLのみサポート
- **Origin検証**: 不正なOriginからのアクセスを拒否・ログ記録
- **開発環境**: localhost系は自動許可、本番では完全制限

### 開発スタイル
- **個人開発**: 自分のペースで好きに開発
- **Claude Code**: AI支援による効率的な開発

### バージョン管理
- **Git**: GitHub
- **ブランチ戦略**: main（本番）/ develop（開発）
- **自動デプロイ**: GitHub連携でNetlifyに自動デプロイ

## 2. 技術アーキテクチャ

### 2.1 フロントエンド
- **React + TypeScript**
- **PWA対応**でネイティブアプリ風の体験
- **レスポンシブデザイン**（モバイルファースト）

### 2.2 バックエンド・データベース
- **Supabase（無料枠）**
  - PostgreSQLデータベース
  - 認証機能（Google連携）
  - リアルタイム機能
  - ファイルストレージ
  - 月500MBまで無料

### 2.3 ホスティング
- **Netlify（無料枠）**
  - 静的サイトホスティング
  - GitHub連携で自動デプロイ
  - カスタムドメイン対応
  - 月100GB帯域まで無料
  - PWA対応・CDN最適化

### 2.4 API設計
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

### 2.5 通知機能
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

## 3. アプリ特徴

### 3.1 主な特徴
- **レシピはURL管理**、調理手順は非保存
- **食材はLLMでURLから自動抽出**（必要に応じて手動編集）
- **中途半端な食材・作り置きにも対応**した在庫管理
- 献立と在庫から**買い物リストを自動生成**
- **一食ごとの支出記録**（自炊・外食対応）
- **Web Push通知で賞味期限リマインド**（実装済み）
- **UIは軽量・高速を重視**、リッチな装飾は控える

## 4. グローバルタブ構成

アプリ下部のタブバーで画面遷移：

| タブ名 | 機能概要 |
|--------|----------|
| **サマリー** | 当日の献立・在庫アラート・出費概要の一括表示 |
| **献立** | 献立の週間プランを視覚的に確認・編集（今日から7日間表示） |
| **買い物** | 食材不足に基づいた買い物リスト表示・チェック管理 |
| **レシピ** | 外部レシピURLの保存と食材抽出の編集、管理 |
| **在庫** | 現在の在庫一覧表示・編集・賞味期限管理 |
| **コスト** | 自炊・外食を含む一食単位でのコスト記録・月別集計表示 |

## 5. UI要素の画面配置仕様

.Claude/UI.mdを参照


## 6. データベース設計

Supabase（PostgreSQL）を使用。

### 6.1 users（ユーザー）
```sql
-- ユーザー（Supabase auth.usersと連携）
users (
  id: UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email: TEXT UNIQUE NOT NULL,
  name: TEXT,
  google_id: TEXT UNIQUE,
  notification_enabled: BOOLEAN DEFAULT FALSE,     -- 通知機能の有効/無効
  expiry_notification_days: INTEGER DEFAULT 3,     -- 期限通知を行う日数（1-30日）
  notification_enabled: BOOLEAN DEFAULT FALSE,  -- 朝の通知機能の有効/無効
  notification_time: TIME DEFAULT '08:00',      -- 朝の通知時間
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 6.2 meal_plans（献立）
```sql
-- 献立（1日ごとの記録）
meal_plans (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date: DATE NOT NULL,
  meal_type: TEXT NOT NULL,      -- 朝 / 昼 / 夜 / 間食
  recipe_url: TEXT,
  ingredients: JSONB,            -- [{ name, quantity }]
  memo: TEXT,
  consumed_status: TEXT DEFAULT 'pending' CHECK (consumed_status IN ('pending', 'completed', 'stored')),  -- 消費状態（未完了・完食・作り置き）
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)
```

### 6.3 stock_items（食材在庫）
```sql
-- 食材在庫
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

### 6.4 shopping_list（買い物リスト）
```sql
-- 買い物リスト
shopping_list (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name: TEXT NOT NULL,
  quantity: TEXT,
  checked: BOOLEAN DEFAULT FALSE,
  added_from: TEXT,              -- manual / auto
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 6.5 cost_records（コスト記録）
```sql
-- コスト記録
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

### 6.6 saved_recipes（レシピ保存）
```sql
-- レシピ保存
saved_recipes (
  id: UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id: UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title: TEXT NOT NULL,
  url: TEXT NOT NULL,
  servings: INTEGER DEFAULT 1,    -- 何人前
  tags: TEXT[],
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 6.7 インデックス設計
```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX idx_meal_plans_consumed_status ON meal_plans(user_id, consumed_status);  -- 消費状態検索用
CREATE INDEX idx_stock_items_user_best_before ON stock_items(user_id, best_before);
CREATE INDEX idx_shopping_list_user_checked ON shopping_list(user_id, checked);
CREATE INDEX idx_cost_records_user_date ON cost_records(user_id, date);
```

## 7. UI/UX設計

### 7.1 デザインシステム
- **軽量でシンプルなデザイン**
- **Material Icons**を使用
- **レスポンシブグリッド**システム
- **アニメーション**による滑らかなUI遷移
- **高速表示を重視**、リッチな装飾は控える

### 7.2 TypeScript型定義例
```typescript
// 基本型定義
interface MealPlan {
  id: string;
  user_id: string;
  date: string;
  meal_type: '朝' | '昼' | '夜' | '間食';
  recipe_url?: string;
  ingredients: { name: string; quantity: string }[];
  memo?: string;
  consumed_status?: 'pending' | 'completed' | 'stored';  // 消費状態（未完了・完食・作り置き）
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

## 8. 開発・運用計画

### 8.1 開発手順・優先順位

**フェーズ1：基本CRUD機能**
1. 認証機能（Google連携）
2. 在庫管理（追加・編集・削除）
3. レシピ管理（URL保存、食材抽出）
4. 献立計画（カレンダー表示）
5. 買い物リスト（基本機能）

**フェーズ2：自動化機能**
1. LLMによる食材自動抽出
2. 献立からの買い物リスト自動生成
3. 賞味期限管理・アラート

**フェーズ3：コスト・通知機能**（実装済み）
1. コスト管理機能 ✅
2. 通知システム（Web Push API）✅
3. PWA対応 ✅
4. パフォーマンス最適化

### 8.3 MVP（最小機能）の定義
- 基本的な献立・在庫・買い物・コスト管理機能
- レシピURL管理と食材管理
- 個人利用に最適化された機能セット

### 8.4 テスト戦略
- **単体機能テスト**：各機能の動作確認
- **手動テスト**：実際の使用シーンでの動作確認
- **TypeScript**による型安全性の確保

### 8.5 デプロイメント手順
1. **ローカル開発**：`pnpm run dev`
2. **ビルド**：`pnpm run build`
3. **自動デプロイ**：GitHub pushでGitHub Pagesに自動デプロイ
4. **データベース**：Supabaseのマイグレーション管理
5. **CI/CD**：GitHub Actionsによる自動ビルド・デプロイ

## 9. セキュリティ・パフォーマンス

### 9.1 データ保護方針
- **Google連携ログイン**による認証
- **個人利用**のため最小限のセキュリティ対策
- **機微情報を含まない**データ設計
- **Supabase Row Level Security**による基本的なデータ保護

### 9.2 パフォーマンス要件
- **モバイルファースト**の軽量設計
- **必要最小限のデータ取得**
- **画像最適化**
- **PWA対応**によるオフライン機能

## 10. 環境構築

### 10.1 開発環境
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
```

### 10.2 環境変数
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 10.3 Supabase設定
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```
