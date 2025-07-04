import { test, expect } from '@playwright/test';

/**
 * 認証フローのE2Eテスト
 * 基本的なログインページの表示確認
 */
test.describe('認証フロー', () => {
  test('ログインページの基本表示', async ({ page }) => {
    await page.goto('/');
    
    // ログインフォームの基本要素を確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });
});