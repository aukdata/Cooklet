import { test, expect } from '@playwright/test';

/**
 * 通知設定テスト
 * 基本的な通知設定操作確認
 */
test.describe('通知設定テスト', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/settings');
  });

  test('設定ページの基本表示', async ({ page }) => {
    // 設定ページタイトルを確認
    await expect(page.getByText('設定')).toBeVisible();
  });
});