import { test, expect } from '@playwright/test';

/**
 * 献立機能のE2Eテスト
 * 基本的なページ表示確認（認証後）
 */
test.describe('献立機能', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    // 献立ページにアクセス
    await page.goto('/meal-plans');
  });

  test('献立ページの基本表示', async ({ page }) => {
    // ページタイトルを確認（ヘッダー内の献立アイコンと文字）
    await expect(page.getByText('📅 献立計画')).toBeVisible();
    
    // 週間ナビゲーションボタンの存在を確認
    await expect(page.getByRole('button', { name: '◀' })).toBeVisible();
    await expect(page.getByRole('button', { name: '▶' })).toBeVisible();
  });
});