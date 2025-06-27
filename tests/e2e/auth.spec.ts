import { test, expect } from '@playwright/test';

/**
 * 認証フローのE2Eテスト
 * Google認証、ログイン・ログアウト機能のテスト
 */
test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // ホームページにアクセス
    await page.goto('/');
  });

  test('ログインページの表示', async ({ page }) => {
    // ログインページの基本要素を確認
    await expect(page.getByText('Cooklet')).toBeVisible();
    await expect(page.getByText('Googleでログイン')).toBeVisible();
    
    // ログインボタンが存在することを確認
    const loginButton = page.getByRole('button', { name: 'Googleでログイン' });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
  });

  test('未認証時のリダイレクト', async ({ page }) => {
    // 認証が必要なページにアクセス
    await page.goto('/meal-plans');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Googleでログイン')).toBeVisible();
  });

  test('Google認証フローの開始', async ({ page }) => {
    // Googleログインボタンをクリック
    const loginButton = page.getByRole('button', { name: 'Googleでログイン' });
    await loginButton.click();
    
    // 注意: 実際のGoogle認証は外部サービスのため、
    // テスト環境では認証をモックまたはスキップする必要がある
    // ここでは認証開始の確認のみ行う
  });

  test('ログアウト機能', async ({ page }) => {
    // 認証状態をモック（実装時に調整）
    // await page.addInitScript(() => {
    //   localStorage.setItem('auth-token', 'mock-token');
    // });
    
    // ログアウトボタンが存在することを確認（実装時に調整）
    // const logoutButton = page.getByRole('button', { name: 'ログアウト' });
    // await expect(logoutButton).toBeVisible();
  });
});