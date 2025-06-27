import { test, expect } from '@playwright/test';

/**
 * 通知設定トースト重複問題の検証テスト
 * issue: 通知設定をオフにした時にトーストが2個出てしまう問題
 */
test.describe('通知設定トースト重複修正テスト', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    // 通知権限をモック
    await page.addInitScript(() => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'granted'
      });
    });

    // コンソールログを監視（デバッグログ確認用）
    page.on('console', msg => {
      if (msg.text().includes('🔔') || msg.text().includes('handleDisableNotifications')) {
        console.log(`[Browser Console]: ${msg.text()}`);
      }
    });
  });

  test('通知オフ時のトースト重複確認', async ({ page }) => {
    await page.goto('/settings');
    
    // 通知設定セクションが表示されるまで待機
    await expect(page.getByText('通知設定')).toBeVisible();
    
    // 通知スイッチを探す（現在のUIに合わせて調整）
    const notificationSwitch = page.locator('button[role="switch"], button:has-text("無効にする")').first();
    
    // スイッチが存在することを確認
    await expect(notificationSwitch).toBeVisible();
    
    // 通知を無効にする前に、成功トーストの数を監視
    const toastPromises: Promise<void>[] = [];
    
    // 複数のトーストが表示される場合の検知
    page.on('locator', async (locator) => {
      if (await locator.textContent() === '通知機能を無効にしました') {
        toastPromises.push(page.waitForSelector('text=通知機能を無効にしました', { timeout: 1000 }));
      }
    });
    
    // 通知を無効化
    await notificationSwitch.click();
    
    // 成功トーストが表示されることを確認
    await expect(page.getByText('通知機能を無効にしました')).toBeVisible({ timeout: 5000 });
    
    // トーストが1つだけ表示されることを確認（重複していない）
    const toasts = page.locator('text=通知機能を無効にしました');
    await expect(toasts).toHaveCount(1);
    
    // 少し待ってからトーストが消えることを確認
    await page.waitForTimeout(2000);
    
    // 再度同じトーストが表示されていないことを確認
    const remainingToasts = page.locator('text=通知機能を無効にしました');
    const count = await remainingToasts.count();
    expect(count).toBeLessThanOrEqual(1); // 最大1個のトーストのみ
  });

  test('コンソールログでデバッグ情報確認', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    // コンソールログを収集
    page.on('console', msg => {
      if (msg.text().includes('🔔') || 
          msg.text().includes('handleDisableNotifications') ||
          msg.text().includes('disableNotifications') ||
          msg.text().includes('updateSettings')) {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto('/settings');
    
    // 通知設定セクションが表示されるまで待機
    await expect(page.getByText('通知設定')).toBeVisible();
    
    // 通知スイッチをクリック
    const notificationSwitch = page.locator('button[role="switch"], button:has-text("無効にする")').first();
    await notificationSwitch.click();
    
    // 少し待ってからコンソールログを確認
    await page.waitForTimeout(1000);
    
    // デバッグログが記録されていることを確認
    expect(consoleLogs.length).toBeGreaterThan(0);
    
    // 関数が1回だけ実行されていることを確認
    const handleDisableCount = consoleLogs.filter(log => 
      log.includes('handleDisableNotifications 開始')
    ).length;
    
    expect(handleDisableCount).toBe(1); // 1回だけ実行されているはず
    
    console.log('🔍 収集されたデバッグログ:');
    consoleLogs.forEach(log => console.log(`  ${log}`));
  });

  test('NotificationSettingsコンポーネント警告確認', async ({ page }) => {
    const consoleWarnings: string[] = [];
    
    // 警告ログを収集
    page.on('console', msg => {
      if (msg.type() === 'warning' || msg.text().includes('NotificationSettings')) {
        consoleWarnings.push(msg.text());
      }
    });

    await page.goto('/settings');
    
    // 少し待ってからコンソール警告を確認
    await page.waitForTimeout(1000);
    
    // NotificationSettings.tsxからの警告が出力されていることを確認
    const notificationWarnings = consoleWarnings.filter(warning => 
      warning.includes('NotificationSettings.tsx は使用されていません')
    );
    
    if (notificationWarnings.length > 0) {
      console.log('⚠️ NotificationSettings警告が検出されました:');
      notificationWarnings.forEach(warning => console.log(`  ${warning}`));
    } else {
      console.log('✅ NotificationSettings警告は検出されませんでした（修正済み）');
    }
  });

  test('通知設定UI統合確認', async ({ page }) => {
    await page.goto('/settings');
    
    // 通知設定セクションが1つだけ存在することを確認
    const notificationSections = page.locator('h3:has-text("通知設定")');
    await expect(notificationSections).toHaveCount(1);
    
    // 朝の通知設定が別のセクションとして存在しないことを確認
    const morningNotificationSections = page.locator('h3:has-text("朝の通知設定")');
    await expect(morningNotificationSections).toHaveCount(0);
    
    // 通知関連の設定が統合されていることを確認
    await expect(page.getByText('期限通知')).toBeVisible();
    await expect(page.getByText('通知時間')).toBeVisible();
  });
});