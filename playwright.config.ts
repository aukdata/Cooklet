import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定ファイル
 * E2Eテスト・UI自動テスト・PWA機能テストの設定
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './tests',
  
  // 全てのテストタイムアウト
  timeout: 30 * 1000,
  
  // 期待値のタイムアウト
  expect: {
    timeout: 5000,
  },
  
  // テスト並列実行の設定
  fullyParallel: true,
  
  // CI環境でのテスト失敗時の動作
  forbidOnly: !!process.env.CI,
  
  // テスト失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,
  
  // 並列実行ワーカー数
  workers: process.env.CI ? 1 : undefined,
  
  // テストレポート設定
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['line']
  ],
  
  // 全テスト共通設定
  use: {
    // ベースURL（開発サーバー）
    baseURL: 'http://localhost:5173',
    
    // トレース設定（失敗時のみ）
    trace: 'on-first-retry',
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    
    // ビデオ録画設定
    video: 'retain-on-failure',
    
    // 日本語ロケール
    locale: 'ja-JP',
    
    // タイムゾーン
    timezoneId: 'Asia/Tokyo',
  },

  // プロジェクト設定（各ブラウザ・デバイス）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // モバイルテスト
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // PWAテスト用（Chrome）
    {
      name: 'PWA Chrome',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          // PWA機能を有効化
          permissions: ['notifications'],
          serviceWorkers: 'allow',
        },
      },
    },
  ],

  // 開発サーバー起動設定
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
