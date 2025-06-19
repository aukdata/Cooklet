# 開発環境セットアップガイド

## Netlify Functions対応のローカル開発

### 前提条件

1. **Netlify CLIのインストール**
   ```bash
   npm install -g netlify-cli
   ```

2. **プロジェクト依存関係のインストール**
   ```bash
   pnpm install
   ```

### 開発サーバーの起動

#### 通常のVite開発サーバー（Netlify Functions無し）
```bash
pnpm run dev
```
- URL: http://localhost:5173
- レシピ抽出機能は動作しません（プロキシサーバー無し）

#### Netlify Functions対応開発サーバー（推奨）
```bash
pnpm run dev:netlify
```
- URL: http://localhost:8888
- Vite開発サーバー + Netlify Functions が同時起動
- レシピ抽出機能が完全に動作します

### プロキシ機能のテスト

レシピ抽出機能をテストする場合：

```bash
# デフォルトURLでテスト
pnpm run test:proxy

# 特定のURLでテスト
node scripts/test-proxy.js "https://cookpad.com/recipe/1234567"
```

### ファイル構成

```
netlify/
└── functions/
    └── proxy.js          # プロキシサーバー（CORS回避用）

scripts/
└── test-proxy.js         # プロキシテスト用スクリプト

netlify.toml              # Netlify設定（Functions設定含む）
```

### 開発フロー

1. **通常の開発**
   ```bash
   pnpm run dev:netlify
   ```

2. **コード変更時**
   - ReactコンポーネントとTypeScriptファイル: 自動リロード
   - Netlify Functions: 自動リロード（netlify devが監視）

3. **プロキシ機能の確認**
   ```bash
   pnpm run test:proxy
   ```

4. **型チェック**
   ```bash
   pnpm run typecheck
   ```

5. **リント**
   ```bash
   pnpm run lint
   ```

### トラブルシューティング

#### 「ECONNREFUSED」エラー
- Netlify Devサーバーが起動していない
- 解決方法: `pnpm run dev:netlify` を実行

#### レシピ抽出が503エラー
- ターゲットサイトの一時的な問題の可能性
- 別のレシピURLで試してみる

#### Netlify Functions が動作しない
1. `netlify.toml` の `[functions]` 設定を確認
2. `netlify/functions/proxy.js` ファイルの存在を確認
3. Netlify CLIのバージョンを確認: `netlify --version`

### 本番環境との差異

- **ローカル**: `http://localhost:8888/.netlify/functions/proxy`
- **本番**: `https://your-site.netlify.app/.netlify/functions/proxy`
- WebFetcherクラスは相対パス（`/.netlify/functions/proxy`）を使用するため、環境による違いは自動的に処理されます

### デプロイ前チェック

```bash
# 全体のビルドテスト
pnpm run build:netlify

# 型エラー確認
pnpm run typecheck

# リント確認
pnpm run lint
```

### パフォーマンス確認

1. **プロキシレスポンス時間**
   ```bash
   pnpm run test:proxy
   ```

2. **ビルドサイズ**
   ```bash
   pnpm run build
   ls -la dist/
   ```

3. **TypeScript型チェック時間**
   ```bash
   time pnpm run typecheck
   ```