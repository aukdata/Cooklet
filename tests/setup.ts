/**
 * Playwrightテストのグローバル設定
 * 全てのテストで共通的に使用される設定やユーティリティ
 */

import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockLogin, mockAllData } from './helpers';

/**
 * テスト用のカスタムフィクスチャ
 */
export const test = base.extend<{
  /**
   * 認証済みページ: ログイン状態でテストを開始
   */
  authenticatedPage: Page;
  
  /**
   * データがモックされたページ: 全てのテストデータがモックされた状態
   */
  mockedPage: Page;
}>({
  // 認証済みページフィクスチャ
  authenticatedPage: async ({ page }, use) => {
    // ログイン状態をモック
    await mockLogin(page);
    await use(page);
  },

  // データモック済みページフィクスチャ
  mockedPage: async ({ page }, use) => {
    // 認証状態とテストデータをモック
    await mockLogin(page);
    await mockAllData(page);
    await use(page);
  },
});

/**
 * カスタムexpectマッチャー
 */
export { expect };

/**
 * テスト用の共通定数
 */
export const TEST_CONFIG = {
  // 基本タイムアウト
  DEFAULT_TIMEOUT: 5000,
  LONG_TIMEOUT: 10000,
  
  // テスト用URL
  BASE_URL: 'http://localhost:5173',
  
  // テスト用ユーザー情報
  TEST_USER: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'テストユーザー',
  },
  
  // モバイルビューポート
  MOBILE_VIEWPORT: { width: 375, height: 667 },
  TABLET_VIEWPORT: { width: 768, height: 1024 },
  DESKTOP_VIEWPORT: { width: 1280, height: 720 },
  
  // テストデータの日付
  TEST_DATES: {
    TODAY: new Date().toISOString().split('T')[0],
    TOMORROW: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    YESTERDAY: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
};

/**
 * 共通のテストヘルパー関数
 */

/**
 * 特定の環境でのみテストを実行
 * @param condition 実行条件
 * @param testFn テスト関数
 */
export function testIf(condition: boolean, testFn: () => void): void {
  if (condition) {
    testFn();
  } else {
    test.skip('条件が満たされていないためスキップ', () => {});
  }
}

/**
 * 環境変数に基づいてテストをスキップ
 * @param envVar 環境変数名
 * @param testFn テスト関数
 */
export function testIfEnv(envVar: string, testFn: () => void): void {
  testIf(!!process.env[envVar], testFn);
}

/**
 * CI環境でのみテストを実行
 * @param testFn テスト関数
 */
export function testOnlyInCI(testFn: () => void): void {
  testIf(!!process.env.CI, testFn);
}

/**
 * ローカル環境でのみテストを実行
 * @param testFn テスト関数
 */
export function testOnlyLocal(testFn: () => void): void {
  testIf(!process.env.CI, testFn);
}

/**
 * ブラウザ固有のテスト
 * @param browserName ブラウザ名
 * @param testFn テスト関数
 */
export function testForBrowser(browserName: string, testFn: () => void): void {
  test.describe(`${browserName}固有のテスト`, () => {
    test.skip(({ browserName: currentBrowser }) => currentBrowser !== browserName);
    testFn();
  });
}

/**
 * PWA機能のテスト（Chrome固有）
 * @param testFn テスト関数
 */
export function testPWA(testFn: () => void): void {
  testForBrowser('chromium', testFn);
}