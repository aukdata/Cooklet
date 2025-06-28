import { test, expect } from '@playwright/test';

/**
 * PWA機能のE2Eテスト
 * 基本的なPWA要素確認
 */
test.describe('PWA機能', () => {
  test('マニフェストファイルの存在確認', async ({ page }) => {
    await page.goto('/');
    
    // マニフェストファイルのリンクが存在することを確認
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
  });
});