import { test, expect } from '@playwright/test';

/**
 * 基本機能のE2Eテスト
 * 最小限の動作確認
 */
test.describe('基本機能', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/');
    
    // ログインフォームの基本要素を確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('PWAマニフェストが存在する', async ({ page }) => {
    await page.goto('/');
    
    // マニフェストファイルのリンクが存在することを確認
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
  });
});