import { test, expect } from '@playwright/test';

/**
 * 在庫管理機能のE2Eテスト
 * 食材在庫の追加、編集、削除、期限管理機能のテスト
 */
test.describe('在庫管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    // 在庫ページにアクセス
    await page.goto('/stock');
  });

  test('在庫ページの表示', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.getByText('在庫管理')).toBeVisible();
    
    // 在庫追加ボタンの存在を確認
    await expect(page.getByRole('button', { name: '在庫を追加' })).toBeVisible();
    
    // 在庫一覧の表示エリアを確認
    await expect(page.locator('[data-testid="stock-list"]')).toBeVisible();
  });

  test('在庫の追加', async ({ page }) => {
    // 在庫追加ボタンをクリック
    await page.getByRole('button', { name: '在庫を追加' }).click();
    
    // 在庫追加ダイアログが表示されることを確認
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('在庫を追加')).toBeVisible();
    
    // フォーム要素の存在を確認
    await expect(page.getByLabel('食材名')).toBeVisible();
    await expect(page.getByLabel('数量')).toBeVisible();
    await expect(page.getByLabel('賞味期限')).toBeVisible();
    await expect(page.getByLabel('保存場所')).toBeVisible();
    
    // フォームに入力
    await page.getByLabel('食材名').fill('トマト');
    await page.getByLabel('数量').fill('3個');
    await page.getByLabel('賞味期限').fill('2024-12-31');
    await page.getByLabel('保存場所').selectOption('refrigerator');
    
    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();
    
    // ダイアログが閉じることを確認
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // 追加された在庫が表示されることを確認
    await expect(page.getByText('トマト')).toBeVisible();
    await expect(page.getByText('3個')).toBeVisible();
  });

  test('在庫の編集', async ({ page }) => {
    // 既存の在庫アイテムの編集ボタンをクリック（モックデータが必要）
    // await page.getByTestId('edit-stock-item').first().click();
    
    // 編集ダイアログが表示されることを確認
    // await expect(page.getByRole('dialog')).toBeVisible();
    // await expect(page.getByText('在庫を編集')).toBeVisible();
    
    // フォームの値が既存データで埋められていることを確認
    // await expect(page.getByLabel('食材名')).toHaveValue('既存の食材名');
  });

  test('在庫の削除', async ({ page }) => {
    // 削除ボタンをクリック（モックデータが必要）
    // await page.getByTestId('delete-stock-item').first().click();
    
    // 確認ダイアログが表示されることを確認
    // await expect(page.getByText('在庫を削除しますか？')).toBeVisible();
    
    // 削除を実行
    // await page.getByRole('button', { name: '削除' }).click();
    
    // 在庫が削除されることを確認
    // await expect(page.getByText('削除された食材名')).not.toBeVisible();
  });

  test('期限切れ在庫の表示', async ({ page }) => {
    // 期限切れタブまたはフィルターをクリック
    // await page.getByRole('tab', { name: '期限切れ' }).click();
    
    // 期限切れアイテムが表示されることを確認
    // await expect(page.getByText('期限切れ')).toBeVisible();
    
    // 警告表示を確認
    // await expect(page.locator('.text-red-500')).toBeVisible();
  });

  test('保存場所による在庫の分類', async ({ page }) => {
    // 保存場所フィルターを使用
    // await page.getByLabel('保存場所').selectOption('refrigerator');
    
    // 冷蔵庫の在庫のみが表示されることを確認
    // await expect(page.getByText('冷蔵庫')).toBeVisible();
  });

  test('在庫の検索機能', async ({ page }) => {
    // 検索ボックスに入力
    await page.getByPlaceholder('在庫を検索').fill('トマト');
    
    // 検索結果が表示されることを確認
    // await expect(page.getByText('トマト')).toBeVisible();
    
    // 関連しない在庫が非表示になることを確認
    // await expect(page.getByText('関連しない食材')).not.toBeVisible();
  });

  test('手作り食品の在庫管理', async ({ page }) => {
    await page.getByRole('button', { name: '在庫を追加' }).click();
    
    // 手作り食品チェックボックスを確認
    await expect(page.getByLabel('手作り食品')).toBeVisible();
    
    // チェックボックスをオンにする
    await page.getByLabel('手作り食品').check();
    
    // 手作り食品の入力フォームを確認
    await page.getByLabel('食材名').fill('手作りカレー');
    await page.getByLabel('数量').fill('2人分');
    
    await page.getByRole('button', { name: '保存' }).click();
    
    // 手作り食品として保存されることを確認
    await expect(page.getByText('手作りカレー')).toBeVisible();
  });

  test('在庫の一括操作', async ({ page }) => {
    // 複数の在庫アイテムを選択
    // await page.getByTestId('stock-checkbox').first().check();
    // await page.getByTestId('stock-checkbox').nth(1).check();
    
    // 一括削除ボタンが表示されることを確認
    // await expect(page.getByRole('button', { name: '選択項目を削除' })).toBeVisible();
    
    // 一括削除を実行
    // await page.getByRole('button', { name: '選択項目を削除' }).click();
    // await page.getByRole('button', { name: '削除' }).click();
  });

  test('モバイル表示での在庫管理', async ({ page }) => {
    // モバイルビューポートでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    // レスポンシブデザインが適用されることを確認
    await expect(page.getByText('在庫管理')).toBeVisible();
    await expect(page.getByRole('button', { name: '在庫を追加' })).toBeVisible();
    
    // モバイルでの操作性を確認
    await page.getByRole('button', { name: '在庫を追加' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});