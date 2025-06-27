import { test, expect } from '@playwright/test';

/**
 * 通知機能のE2Eテスト
 * Web Push通知、期限通知、設定機能のテスト
 */
test.describe('通知機能', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    // 通知権限をモック（実際のブラウザでは権限要求が必要）
    await page.addInitScript(() => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'granted'
      });
    });
  });

  test('通知設定ページの表示', async ({ page }) => {
    // 設定ページにアクセス
    await page.goto('/settings');
    
    // 通知設定セクションを確認
    await expect(page.getByText('通知設定')).toBeVisible();
    
    // 通知有効/無効の切り替えスイッチを確認
    await expect(page.getByLabel('通知を有効にする')).toBeVisible();
    
    // 期限通知の日数設定を確認
    await expect(page.getByLabel('期限通知（日前）')).toBeVisible();
    
    // 朝の通知時間設定を確認
    await expect(page.getByLabel('朝の通知時間')).toBeVisible();
  });

  test('通知権限の要求', async ({ page }) => {
    await page.goto('/settings');
    
    // 通知を有効にするスイッチをクリック
    const notificationToggle = page.getByLabel('通知を有効にする');
    await notificationToggle.click();
    
    // 権限要求の確認（実際のテストでは権限ダイアログの処理が必要）
    // await page.on('dialog', dialog => dialog.accept());
    
    // 通知が有効になることを確認
    await expect(notificationToggle).toBeChecked();
  });

  test('期限通知日数の設定', async ({ page }) => {
    await page.goto('/settings');
    
    // 期限通知日数を変更
    const daysInput = page.getByLabel('期限通知（日前）');
    await daysInput.clear();
    await daysInput.fill('5');
    
    // 設定を保存
    await page.getByRole('button', { name: '設定を保存' }).click();
    
    // 保存完了メッセージを確認
    await expect(page.getByText('設定を保存しました')).toBeVisible();
    
    // 設定値が保持されることを確認
    await expect(daysInput).toHaveValue('5');
  });

  test('朝の通知時間の設定', async ({ page }) => {
    await page.goto('/settings');
    
    // 朝の通知時間を変更
    const timeInput = page.getByLabel('朝の通知時間');
    await timeInput.fill('07:30');
    
    // 設定を保存
    await page.getByRole('button', { name: '設定を保存' }).click();
    
    // 保存完了メッセージを確認
    await expect(page.getByText('設定を保存しました')).toBeVisible();
    
    // 設定値が保持されることを確認
    await expect(timeInput).toHaveValue('07:30');
  });

  test('期限切れ近い食材の通知表示', async ({ page }) => {
    // 期限切れ近い食材がある状態をモック
    await page.addInitScript(() => {
      window.mockExpiringItems = [
        { name: 'トマト', days_until_expiry: 2 },
        { name: '牛乳', days_until_expiry: 1 }
      ];
    });
    
    await page.goto('/');
    
    // 期限切れアラートが表示されることを確認
    await expect(page.getByText('期限切れ近い食材があります')).toBeVisible();
    await expect(page.getByText('トマト')).toBeVisible();
    await expect(page.getByText('牛乳')).toBeVisible();
  });

  test('通知履歴の表示', async ({ page }) => {
    await page.goto('/settings');
    
    // 通知履歴セクションを確認
    // await expect(page.getByText('通知履歴')).toBeVisible();
    
    // 過去の通知が表示されることを確認
    // await expect(page.getByTestId('notification-history')).toBeVisible();
  });

  test('通知の無効化', async ({ page }) => {
    await page.goto('/settings');
    
    // 通知を無効にする
    const notificationToggle = page.getByLabel('通知を有効にする');
    await notificationToggle.uncheck();
    
    // 設定を保存
    await page.getByRole('button', { name: '設定を保存' }).click();
    
    // 通知が無効になることを確認
    await expect(notificationToggle).not.toBeChecked();
    
    // 関連する設定項目が非活性になることを確認
    await expect(page.getByLabel('期限通知（日前）')).toBeDisabled();
    await expect(page.getByLabel('朝の通知時間')).toBeDisabled();
  });

  test('テスト通知の送信', async ({ page }) => {
    await page.goto('/settings');
    
    // テスト通知ボタンをクリック
    // await page.getByRole('button', { name: 'テスト通知を送信' }).click();
    
    // 通知が送信されることを確認
    // await expect(page.getByText('テスト通知を送信しました')).toBeVisible();
  });

  test('通知権限が拒否された場合の処理', async ({ page }) => {
    // 通知権限を拒否状態にモック
    await page.addInitScript(() => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'denied'
      });
    });
    
    await page.goto('/settings');
    
    // 権限拒否メッセージが表示されることを確認
    await expect(page.getByText('通知権限が拒否されています')).toBeVisible();
    
    // 通知設定が無効になることを確認
    await expect(page.getByLabel('通知を有効にする')).toBeDisabled();
  });

  test('モバイルでの通知設定', async ({ page }) => {
    // モバイルビューポートでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/settings');
    
    // モバイルでの表示を確認
    await expect(page.getByText('通知設定')).toBeVisible();
    await expect(page.getByLabel('通知を有効にする')).toBeVisible();
    
    // モバイルでの操作性を確認
    await page.getByLabel('通知を有効にする').click();
    await expect(page.getByLabel('通知を有効にする')).toBeChecked();
  });
});

/**
 * PWA通知機能のテスト（Chrome PWAプロジェクト用）
 */
test.describe('PWA通知機能', () => {
  test.use({
    contextOptions: {
      permissions: ['notifications'],
      serviceWorkers: 'allow',
    },
  });

  test('Service Workerの通知機能', async ({ page }) => {
    await page.goto('/');
    
    // Service Workerが登録されることを確認
    await page.waitForFunction(() => 'serviceWorker' in navigator);
    
    // PWA通知の動作確認（実装時に調整）
    // const swRegistration = await page.evaluate(() => {
    //   return navigator.serviceWorker.ready;
    // });
    // 
    // expect(swRegistration).toBeTruthy();
  });
});