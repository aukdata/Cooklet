import { test, expect } from '@playwright/test';

/**
 * 基本機能のE2Eテスト
 * 最小限の動作確認とログイン機能
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

  test('テストアカウントでログインできる', async ({ page }) => {
    await page.goto('/');
    
    // テストアカウントでログイン
    await page.getByPlaceholder('メールアドレス').fill('cooklet@example.com');
    await page.getByPlaceholder('パスワード').fill('cooklet');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ログイン後、メインアプリが表示されることを確認
    // 1. 読み込み中画面が消えるまで待機
    await expect(page.getByText('読み込み中...')).not.toBeVisible({ timeout: 15000 });
    
    // 2. メインアプリのヘッダーが表示されることを確認
    await expect(page.getByRole('heading', { name: '🍳Cooklet' })).toBeVisible({ timeout: 5000 });
    
    // 3. ログイン後はRootページ（/）に留まることを確認
    await expect(page).toHaveURL('/');
  });
});