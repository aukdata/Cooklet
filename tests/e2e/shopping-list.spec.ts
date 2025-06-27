import { test, expect } from '@playwright/test';

/**
 * 買い物リスト機能のE2Eテスト
 * 買い物リストの自動生成、手動追加、チェック機能のテスト
 */
test.describe('買い物リスト機能', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    // 買い物リストページにアクセス
    await page.goto('/shopping-list');
  });

  test('買い物リストページの表示', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.getByText('買い物リスト')).toBeVisible();
    
    // 主要なボタンの存在を確認
    await expect(page.getByRole('button', { name: '自動生成' })).toBeVisible();
    await expect(page.getByRole('button', { name: '手動追加' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'レシート読み取り' })).toBeVisible();
    
    // リスト表示エリアを確認
    await expect(page.locator('[data-testid="shopping-list"]')).toBeVisible();
  });

  test('買い物リストの自動生成', async ({ page }) => {
    // 自動生成ボタンをクリック
    await page.getByRole('button', { name: '自動生成' }).click();
    
    // 生成確認ダイアログが表示されることを確認
    await expect(page.getByText('献立から買い物リストを生成しますか？')).toBeVisible();
    
    // 生成を実行
    await page.getByRole('button', { name: '生成' }).click();
    
    // 生成完了メッセージを確認
    await expect(page.getByText('買い物リストを生成しました')).toBeVisible();
    
    // 生成されたアイテムが表示されることを確認（モックデータが必要）
    // await expect(page.getByTestId('shopping-item')).toBeVisible();
  });

  test('手動でのアイテム追加', async ({ page }) => {
    // 手動追加ボタンをクリック
    await page.getByRole('button', { name: '手動追加' }).click();
    
    // 追加ダイアログが表示されることを確認
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('アイテムを追加')).toBeVisible();
    
    // フォーム要素の存在を確認
    await expect(page.getByLabel('商品名')).toBeVisible();
    await expect(page.getByLabel('数量')).toBeVisible();
    await expect(page.getByLabel('メモ')).toBeVisible();
    
    // フォームに入力
    await page.getByLabel('商品名').fill('牛乳');
    await page.getByLabel('数量').fill('1本');
    await page.getByLabel('メモ').fill('低脂肪');
    
    // 保存ボタンをクリック
    await page.getByRole('button', { name: '追加' }).click();
    
    // ダイアログが閉じることを確認
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // 追加されたアイテムが表示されることを確認
    await expect(page.getByText('牛乳')).toBeVisible();
    await expect(page.getByText('1本')).toBeVisible();
  });

  test('アイテムのチェック機能', async ({ page }) => {
    // チェックボックスをクリック（モックデータが必要）
    // const checkbox = page.getByTestId('shopping-item-checkbox').first();
    // await checkbox.check();
    
    // チェックされたアイテムがスタイル変更されることを確認
    // await expect(page.getByTestId('shopping-item').first()).toHaveClass(/line-through/);
    
    // チェック数のカウンターが更新されることを確認
    // await expect(page.getByText('1/5 完了')).toBeVisible();
  });

  test('アイテムの削除', async ({ page }) => {
    // 削除ボタンをクリック（モックデータが必要）
    // await page.getByTestId('delete-shopping-item').first().click();
    
    // 確認ダイアログが表示されることを確認
    // await expect(page.getByText('削除しますか？')).toBeVisible();
    
    // 削除を実行
    // await page.getByRole('button', { name: '削除' }).click();
    
    // アイテムが削除されることを確認
    // await expect(page.getByText('削除されたアイテム')).not.toBeVisible();
  });

  test('レシート読み取り機能', async ({ page }) => {
    // レシート読み取りボタンをクリック
    await page.getByRole('button', { name: 'レシート読み取り' }).click();
    
    // ファイル選択ダイアログまたはカメラ起動を確認
    // await expect(page.getByText('レシート画像を選択')).toBeVisible();
    
    // ファイル入力要素の存在を確認
    // await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('買い物リストのクリア', async ({ page }) => {
    // 全体クリアボタンをクリック
    // await page.getByRole('button', { name: 'リストをクリア' }).click();
    
    // 確認ダイアログが表示されることを確認
    // await expect(page.getByText('すべてのアイテムを削除しますか？')).toBeVisible();
    
    // クリアを実行
    // await page.getByRole('button', { name: 'クリア' }).click();
    
    // リストが空になることを確認
    // await expect(page.getByText('買い物リストは空です')).toBeVisible();
  });

  test('チェック済みアイテムの一括削除', async ({ page }) => {
    // チェック済みアイテムを削除ボタンをクリック
    // await page.getByRole('button', { name: 'チェック済みを削除' }).click();
    
    // 確認ダイアログが表示されることを確認
    // await expect(page.getByText('チェック済みアイテムを削除しますか？')).toBeVisible();
    
    // 削除を実行
    // await page.getByRole('button', { name: '削除' }).click();
    
    // チェック済みアイテムのみが削除されることを確認
    // await expect(page.getByTestId('checked-item')).not.toBeVisible();
    // await expect(page.getByTestId('unchecked-item')).toBeVisible();
  });

  test('カテゴリ別表示', async ({ page }) => {
    // カテゴリフィルターを使用
    // await page.getByLabel('カテゴリ').selectOption('vegetables');
    
    // 野菜カテゴリのアイテムのみが表示されることを確認
    // await expect(page.getByText('野菜')).toBeVisible();
  });

  test('検索機能', async ({ page }) => {
    // 検索ボックスに入力
    await page.getByPlaceholder('アイテムを検索').fill('牛乳');
    
    // 検索結果が表示されることを確認
    // await expect(page.getByText('牛乳')).toBeVisible();
    
    // 関連しないアイテムが非表示になることを確認
    // await expect(page.getByText('関連しない商品')).not.toBeVisible();
  });

  test('モバイル表示での買い物リスト', async ({ page }) => {
    // モバイルビューポートでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    // レスポンシブデザインが適用されることを確認
    await expect(page.getByText('買い物リスト')).toBeVisible();
    await expect(page.getByRole('button', { name: '手動追加' })).toBeVisible();
    
    // モバイルでの操作性を確認
    await page.getByRole('button', { name: '手動追加' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});