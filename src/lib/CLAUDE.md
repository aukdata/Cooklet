# Lib ディレクトリ

## 概要
外部ライブラリやAPIクライアントの設定を管理するディレクトリ。

## ファイル構成

### supabase.ts
Supabaseクライアントの初期化と設定を行う。

#### 機能
- `createClient`を使用してSupabaseクライアントを作成
- 環境変数から`VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`を取得
- 環境変数が設定されていない場合はエラーを投げる
- exportされた`supabase`オブジェクトがアプリケーション全体で使用される

#### 使用方法
```typescript
import { supabase } from '../lib/supabase';

// データベースクエリ例
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

#### 設定方法
プロジェクトルートの`.env`ファイルに以下を設定：
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### web-fetch.ts
Webサイトからコンテンツを取得するユーティリティクラス。CORS制限を回避するためNetlify Functionsのプロキシサーバーを使用。

#### 機能
- **WebFetcher**クラス: Netlify Functionsプロキシを使用したWebサイト取得
- **WebFetchError**クラス: Webフェッチ専用エラークラス
- **FetchedWebsite**インターフェース: 取得結果の型定義

#### 主要機能
- **Netlify Functionsプロキシ**: `/.netlify/functions/proxy`を使用
- **CORS制限回避**: サーバーサイドでリクエストを代行処理
- **適切なタイムアウト処理**: 30秒でリクエストタイムアウト
- **詳細エラーハンドリング**: ステータスコード別の適切なエラーメッセージ
- **レスポンス最適化**: HTMLとタイトルを事前抽出して軽量化

#### Netlify Functionsプロキシの利点
- **高い信頼性**: 外部プロキシサービスに依存しない
- **高速応答**: 同一ドメインでのリクエスト処理
- **セキュリティ**: HTTPS限定、適切なヘッダー設定
- **保守性**: 自前で制御可能なプロキシロジック

#### プロキシサーバー仕様
- **エンドポイント**: `/.netlify/functions/proxy?url={target_url}`
- **サポートプロトコル**: HTTPSのみ
- **レスポンス形式**: JSON（html, title, url, fetchedAt含む）
- **タイムアウト**: 20秒

#### 使用例
```typescript
const webFetcher = new WebFetcher();
const website = await webFetcher.fetchWebsite('https://example.com/recipe');
```

## 注意点
- 環境変数はViteの命名規則に従い`VITE_`プレフィックスが必要
- anonキーのみでRow Level Securityにより適切なアクセス制御を実現
- Netlify Functionsは月間実行時間制限あり（無料プランで125,000秒/月）
- 開発環境では `netlify dev` または `pnpm run dev` でローカル実行可能

## Netlify Functions
プロジェクトルートの `netlify/functions/proxy.js` にプロキシサーバーを実装。

### 機能詳細
- **CORS制限回避**: ブラウザのCORS制限をサーバーサイドで回避
- **HTTPSのみサポート**: セキュリティ上HTTPは拒否
- **適切なUser-Agent**: レシピサイトに対して自然なブラウザリクエストを模倣
- **エラーハンドリング**: タイムアウト、ネットワークエラー、HTTPエラーを適切に処理
- **レスポンス最適化**: HTMLからタイトルを抽出してJSONで返却