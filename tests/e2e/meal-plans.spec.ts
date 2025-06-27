import { test, expect } from '@playwright/test';

/**
 * 献立機能のE2Eテスト
 * 献立の追加、編集、削除、表示機能のテスト
 */
test.describe('献立機能', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック（実装時に調整）
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

  test('献立ページの表示', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.getByText('献立')).toBeVisible();
    
    // カレンダーまたは日付選択UIの存在を確認
    await expect(page.locator('[data-testid="date-selector"]')).toBeVisible();
    
    // 献立追加ボタンの存在を確認
    await expect(page.getByRole('button', { name: '献立を追加' })).toBeVisible();
  });

  test('献立の追加', async ({ page }) => {
    // 献立追加ボタンをクリック
    await page.getByRole('button', { name: '献立を追加' }).click();
    
    // 献立追加ダイアログが表示されることを確認
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('献立を追加')).toBeVisible();
    
    // フォーム要素の存在を確認
    await expect(page.getByLabel('食事タイプ')).toBeVisible();
    await expect(page.getByLabel('レシピURL')).toBeVisible();
    await expect(page.getByLabel('メモ')).toBeVisible();
    
    // フォームに入力
    await page.getByLabel('食事タイプ').selectOption('lunch');
    await page.getByLabel('レシピURL').fill('https://example.com/recipe');
    await page.getByLabel('メモ').fill('テスト献立');
    
    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();
    
    // ダイアログが閉じることを確認
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // 追加された献立が表示されることを確認
    await expect(page.getByText('テスト献立')).toBeVisible();
  });

  test('献立の編集', async ({ page }) => {
    // 既存の献立をクリック（モックデータが必要）
    // await page.getByTestId('meal-plan-item').first().click();
    
    // 編集ダイアログが表示されることを確認
    // await expect(page.getByRole('dialog')).toBeVisible();
    // await expect(page.getByText('献立を編集')).toBeVisible();
  });

  test('献立の削除', async ({ page }) => {
    // 削除ボタンをクリック（モックデータが必要）
    // await page.getByTestId('delete-meal-plan').first().click();
    
    // 確認ダイアログが表示されることを確認
    // await expect(page.getByText('削除しますか？')).toBeVisible();
    
    // 削除を実行
    // await page.getByRole('button', { name: '削除' }).click();
  });

  test('レシピURLからの食材自動抽出', async ({ page }) => {
    // 献立追加ボタンをクリック
    await page.getByRole('button', { name: '献立を追加' }).click();
    
    // レシピURLを入力
    await page.getByLabel('レシピURL').fill('https://example.com/recipe');
    
    // 食材自動抽出ボタンをクリック（実装時に調整）
    // await page.getByRole('button', { name: '食材を自動抽出' }).click();
    
    // 抽出結果が表示されることを確認
    // await expect(page.getByText('食材が自動抽出されました')).toBeVisible();
  });

  test('食事タイプの選択', async ({ page }) => {
    await page.getByRole('button', { name: '献立を追加' }).click();
    
    // 食事タイプの選択肢を確認
    const mealTypeSelect = page.getByLabel('食事タイプ');
    await expect(mealTypeSelect).toBeVisible();
    
    // 各選択肢が存在することを確認
    await mealTypeSelect.click();
    await expect(page.getByRole('option', { name: '朝食' })).toBeVisible();
    await expect(page.getByRole('option', { name: '昼食' })).toBeVisible();
    await expect(page.getByRole('option', { name: '夕食' })).toBeVisible();
    await expect(page.getByRole('option', { name: '間食' })).toBeVisible();
  });

  test('モバイル表示での献立管理', async ({ page }) => {
    // モバイルビューポートでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    // レスポンシブデザインが適用されることを確認
    await expect(page.getByText('献立')).toBeVisible();
    await expect(page.getByRole('button', { name: '献立を追加' })).toBeVisible();
    
    // モバイルでの操作性を確認
    await page.getByRole('button', { name: '献立を追加' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});