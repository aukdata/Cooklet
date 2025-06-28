import { test, expect } from '@playwright/test';

/**
 * 在庫機能のE2Eテスト
 * 基本的なページ表示確認
 */
test.describe('在庫機能', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/stock');
  });

  test('在庫ページの基本表示', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.getByText('在庫管理')).toBeVisible();
  });
});