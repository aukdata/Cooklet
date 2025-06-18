# Cooklet - Netlify デプロイメントガイド

## Netlify設定

### 1. ビルド設定
- **Build command**: `pnpm run build`
- **Publish directory**: `dist`
- **Node.js version**: `18`

### 2. 環境変数設定
Netlifyの管理画面で以下の環境変数を設定してください：

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. ドメイン設定
- カスタムドメインを設定する場合はNetlify管理画面から設定
- HTTPSは自動で有効化されます

### 4. PWA対応
- `manifest.json`と`sw.js`が自動で配信されます
- キャッシュ設定は`netlify.toml`で管理されています

## デプロイ手順

### 1. GitHubリポジトリ連携
1. Netlifyにログイン
2. "New site from Git"を選択
3. GitHubリポジトリを選択
4. ビルド設定を確認（`netlify.toml`で自動設定）

### 2. 環境変数設定
1. Site settings → Environment variables
2. 上記の環境変数を追加

### 3. デプロイ実行
- GitHubにpushすると自動でデプロイ開始
- ビルドログで進捗確認可能

## ファイル構成

```
Cooklet/
├── netlify.toml          # Netlify設定ファイル
├── vite.config.ts        # Vite設定（Netlify対応）
├── public/
│   ├── manifest.json     # PWAマニフェスト
│   ├── sw.js            # Service Worker
│   └── icons/           # PWAアイコン群
└── dist/                # ビルド出力（Netlify公開ディレクトリ）
```

## 特徴

### セキュリティ
- セキュリティヘッダー自動設定
- HTTPS強制
- XSS、クリックジャッキング対策

### パフォーマンス
- 静的アセットのキャッシュ最適化
- PWA対応でオフライン機能
- Gzip圧縮自動有効化

### SEO・PWA
- SPAルーティング対応
- PWAインストール対応
- マニフェスト最適化

## トラブルシューティング

### ビルドエラー
```bash
# ローカルでビルド確認
pnpm run build:netlify

# TypeScriptエラー確認
pnpm run typecheck

# Lintエラー確認
pnpm run lint
```

### 環境変数エラー
- Netlify管理画面で環境変数が正しく設定されているか確認
- Supabaseプロジェクトのアクセス権限を確認

### PWA動作確認
- ブラウザの開発者ツールでService Worker確認
- LighthouseでPWAスコア確認

## 監視・メンテナンス

### パフォーマンス監視
- Netlify Analyticsでトラフィック確認
- Core Web Vitalsの監視

### セキュリティ
- 依存関係の定期的なアップデート
- Supabaseアクセストークンの定期ローテーション

### バックアップ
- GitHubリポジトリが自動バックアップ
- Supabaseデータベースの定期バックアップ推奨