# Cooklet E2Eテスト

CookletアプリケーションのPlaywrightを使ったE2E（End-to-End）テストです。

## テスト構成

```
tests/
├── e2e/                    # E2Eテストファイル
│   ├── auth.spec.ts        # 認証フロー
│   ├── meal-plans.spec.ts  # 献立機能
│   ├── stock.spec.ts       # 在庫管理
│   ├── shopping-list.spec.ts # 買い物リスト
│   ├── notifications.spec.ts # 通知機能
│   └── pwa.spec.ts         # PWA機能
├── helpers/                # テストヘルパー関数
│   ├── auth.ts            # 認証関連
│   ├── data.ts            # テストデータ
│   ├── ui.ts              # UI操作
│   └── index.ts           # 統合エクスポート
├── setup.ts               # テスト共通設定
└── README.md              # このファイル
```

## 実行方法

### 基本的なテスト実行

```bash
# 全テスト実行
pnpm run test

# ブラウザを表示してテスト実行
pnpm run test:headed

# デバッグモードでテスト実行
pnpm run test:debug

# テストレポートを表示
pnpm run test:report
```

### 特定のテストファイルを実行

```bash
# 認証テストのみ実行
pnpm exec playwright test auth.spec.ts

# 献立機能テストのみ実行
pnpm exec playwright test meal-plans.spec.ts
```

### 特定のブラウザでテスト実行

```bash
# Chromeでのみ実行
pnpm exec playwright test --project=chromium

# Firefox, Safari, モバイルでも実行
pnpm exec playwright test --project=firefox
pnpm exec playwright test --project=webkit
pnpm exec playwright test --project="Mobile Chrome"
```

## テスト環境の準備

### 1. 開発サーバーの起動

テスト実行前に開発サーバーが起動している必要があります。
playwright.config.tsの設定により自動で起動されますが、手動で起動する場合：

```bash
pnpm run dev
```

### 2. 環境変数

テスト実行に必要な環境変数を`.env.test`に設定：

```env
VITE_SUPABASE_URL=your_test_supabase_url
VITE_SUPABASE_ANON_KEY=your_test_supabase_anon_key
```

### 3. テストデータベース

テストでは本番データベースの代わりにモックデータを使用します。
`tests/helpers/data.ts`でテストデータを管理しています。

## テストヘルパーの使用方法

### 認証関連

```typescript
import { mockLogin, mockLogout } from '../helpers';

test('認証済みユーザーのテスト', async ({ page }) => {
  await mockLogin(page);
  await page.goto('/meal-plans');
  // テストコード...
});
```

### データモック

```typescript
import { mockAllData, mockEmptyData } from '../helpers';

test('データがある状態のテスト', async ({ page }) => {
  await mockAllData(page);
  await page.goto('/stock');
  // テストコード...
});
```

### UI操作

```typescript
import { waitForDialogToOpen, expectToastMessage } from '../helpers';

test('ダイアログ操作のテスト', async ({ page }) => {
  await page.getByRole('button', { name: '追加' }).click();
  await waitForDialogToOpen(page, '新しいアイテムを追加');
  // フォーム入力...
  await page.getByRole('button', { name: '保存' }).click();
  await expectToastMessage(page, '保存しました');
});
```

## カスタムフィクスチャ

`tests/setup.ts`でカスタムフィクスチャを定義しています：

```typescript
import { test } from '../setup';

// 認証済みページでテスト開始
test('認証が必要な機能のテスト', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/meal-plans');
  // テストコード...
});

// モックデータ付きでテスト開始
test('データ表示のテスト', async ({ mockedPage }) => {
  await mockedPage.goto('/stock');
  // テストコード...
});
```

## 特殊なテストパターン

### レスポンシブテスト

```typescript
import { testResponsiveDesign } from '../helpers';

test('モバイル表示のテスト', async ({ page }) => {
  await testResponsiveDesign(page, { width: 375, height: 667 }, async (mobilePage) => {
    await mobilePage.goto('/');
    // モバイル固有のテスト...
  });
});
```

### PWA機能テスト

```typescript
test.describe('PWA機能', () => {
  test.use({
    contextOptions: {
      permissions: ['notifications'],
      serviceWorkers: 'allow',
    },
  });

  test('PWA固有の機能テスト', async ({ page }) => {
    // PWA機能のテスト...
  });
});
```

### 条件付きテスト

```typescript
import { testOnlyInCI, testForBrowser } from '../setup';

// CI環境でのみ実行
testOnlyInCI(() => {
  test('CI固有のテスト', async ({ page }) => {
    // CIでのみ実行されるテスト...
  });
});

// Chrome固有のテスト
testForBrowser('chromium', () => {
  test('Chrome固有の機能テスト', async ({ page }) => {
    // Chrome固有のテスト...
  });
});
```

## トラブルシューティング

### テストが失敗する場合

1. **スクリーンショットを確認**：`test-results/`フォルダに失敗時のスクリーンショットが保存されます

2. **トレースを確認**：失敗したテストのトレースファイルでデバッグできます

3. **ヘッドモードで実行**：`pnpm run test:headed`でブラウザを表示して実行

4. **デバッグモード**：`pnpm run test:debug`でステップ実行

### よくある問題

- **タイムアウトエラー**：`playwright.config.ts`でタイムアウト時間を調整
- **要素が見つからない**：セレクタやテストIDを確認
- **認証エラー**：モック認証が正しく設定されているか確認

## レポートの確認

テスト実行後、HTMLレポートでテスト結果を確認できます：

```bash
pnpm run test:report
```

ブラウザでテスト結果の詳細、スクリーンショット、動画などを確認できます。

## 継続的インテグレーション

GitHub Actionsでの自動テスト実行設定は別途`.github/workflows/`で管理されています。