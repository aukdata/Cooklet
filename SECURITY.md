# セキュリティ設定

## Netlify Functionsプロキシのセキュリティ

### CORS設定

#### 本番環境
- **許可Origin**: `https://cooklet.netlify.app` のみ
- **制限**: 他のドメインからのアクセスを完全に拒否

#### 開発環境
- **許可Origin**: 
  - `http://localhost:8888` (Netlify Dev)
  - `http://localhost:5173` (Vite Dev)
  - `NODE_ENV !== 'production'` の場合、localhost系を自動許可

### セキュリティ機能

1. **Origin検証**
   ```javascript
   const allowedOrigins = [
     'https://cooklet.netlify.app',  // 本番のみ
     'http://localhost:8888',        // 開発
     'http://localhost:5173'         // 開発
   ];
   ```

2. **プロトコル制限**
   - HTTPSのURLのみ許可
   - HTTPは完全拒否

3. **ログ監視**
   - 不正なOriginからのアクセスを警告ログ出力
   - リクエスト元の記録

### 環境別設定

| 環境 | Origin制限 | ログレベル |
|------|------------|------------|
| 本番 | cooklet.netlify.app のみ | WARN以上 |
| 開発 | localhost系許可 | 全ログ |

### セキュリティ監査

1. **不正アクセスチェック**
   ```bash
   # Netlify Functionsログを確認
   netlify functions:logs proxy
   ```

2. **Origin検証テスト**
   ```bash
   # 不正Origin（拒否されるべき）
   curl -H "Origin: https://malicious-site.com" \
        "https://cooklet.netlify.app/.netlify/functions/proxy?url=..."
   
   # 正当Origin（許可されるべき）
   curl -H "Origin: https://cooklet.netlify.app" \
        "https://cooklet.netlify.app/.netlify/functions/proxy?url=..."
   ```

### 追加セキュリティ対策

1. **レート制限**（将来実装予定）
   - IP別リクエスト制限
   - 同一URLの連続リクエスト制限

2. **URL検証強化**
   - 許可ドメインリストの導入検討
   - 危険なURLパターンの拒否

3. **ログ分析**
   - 異常なアクセスパターンの検知
   - セキュリティインシデント対応

### 緊急時対応

不正使用が検知された場合：

1. **即座に無効化**
   ```javascript
   // proxy.js の先頭に追加
   if (process.env.EMERGENCY_DISABLE === 'true') {
     return { statusCode: 503, body: 'Service Temporarily Unavailable' };
   }
   ```

2. **環境変数で制御**
   ```bash
   # Netlify管理画面で設定
   EMERGENCY_DISABLE=true
   ```

3. **ログ確認**
   - Netlify Functionsの実行ログ分析
   - 不正なアクセス元の特定