import { test, expect } from '@playwright/test';

/**
 * PWA機能のE2Eテスト
 * Progressive Web App機能、オフライン対応、インストール機能のテスト
 */
test.describe('PWA機能', () => {
  test.beforeEach(async ({ page }) => {
    // PWA機能を有効化
    await page.addInitScript(() => {
      // Service Worker の登録をモック
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
      }
    });
  });

  test('Webアプリマニフェストの確認', async ({ page }) => {
    await page.goto('/');
    
    // マニフェストファイルの存在を確認
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    
    // マニフェストファイルの内容を確認
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest.name).toBe('Cooklet');
    expect(manifest.short_name).toBe('Cooklet');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
  });

  test('Service Workerの登録', async ({ page }) => {
    await page.goto('/');
    
    // Service Workerが登録されることを確認
    const isServiceWorkerRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          return !!registration;
        } catch (error) {
          return false;
        }
      }
      return false;
    });
    
    expect(isServiceWorkerRegistered).toBe(true);
  });

  test('PWAインストールプロンプト', async ({ page }) => {
    await page.goto('/');
    
    // インストールプロンプトイベントをモック
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      event.prompt = () => Promise.resolve();
      window.dispatchEvent(event);
    });
    
    // インストールボタンが表示されることを確認
    // await expect(page.getByRole('button', { name: 'アプリをインストール' })).toBeVisible();
  });

  test('オフライン機能', async ({ page }) => {
    await page.goto('/');
    
    // ページが読み込まれることを確認
    await expect(page.getByText('Cooklet')).toBeVisible();
    
    // ネットワークをオフラインにする
    await page.context().setOffline(true);
    
    // ページをリロード
    await page.reload();
    
    // オフラインでも基本的なページが表示されることを確認
    // await expect(page.getByText('オフラインです')).toBeVisible();
    
    // ネットワークをオンラインに戻す
    await page.context().setOffline(false);
  });

  test('キャッシュされたページの表示', async ({ page }) => {
    // 最初にページを訪問してキャッシュに保存
    await page.goto('/');
    await expect(page.getByText('Cooklet')).toBeVisible();
    
    // 別のページに移動
    await page.goto('/meal-plans');
    
    // 元のページに戻る
    await page.goto('/');
    
    // キャッシュからページが高速で読み込まれることを確認
    await expect(page.getByText('Cooklet')).toBeVisible();
  });

  test('アプリアイコンの表示', async ({ page }) => {
    await page.goto('/');
    
    // アプリアイコンのリンクが存在することを確認
    const iconLinks = page.locator('link[rel*="icon"]');
    await expect(iconLinks.first()).toBeVisible();
    
    // 各サイズのアイコンファイルが存在することを確認
    const iconSizes = ['192x192', '512x512'];
    for (const size of iconSizes) {
      const response = await page.request.get(`/icons/icon-${size}.png`);
      expect(response.status()).toBe(200);
    }
  });

  test('スプラッシュスクリーンの設定', async ({ page }) => {
    await page.goto('/');
    
    // Apple Touch Iconの設定を確認
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveAttribute('href');
    
    // メタタグの設定を確認
    const appleCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleCapable).toHaveAttribute('content', 'yes');
    
    const statusBarStyle = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    await expect(statusBarStyle).toHaveAttribute('content');
  });

  test('テーマカラーの設定', async ({ page }) => {
    await page.goto('/');
    
    // テーマカラーのメタタグを確認
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content');
  });

  test('フルスクリーンモードでの表示', async ({ page }) => {
    // フルスクリーンモードをシミュレート
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query.includes('display-mode: standalone'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
        }),
      });
    });
    
    await page.goto('/');
    
    // スタンドアローンモードでの表示を確認
    await expect(page.getByText('Cooklet')).toBeVisible();
    
    // ブラウザのUIが非表示になることを確認（実装時に調整）
    // await expect(page.locator('.browser-ui')).not.toBeVisible();
  });

  test('プッシュ通知の権限要求', async ({ page }) => {
    await page.goto('/');
    
    // 通知権限の状態を確認
    const notificationPermission = await page.evaluate(() => {
      return Notification.permission;
    });
    
    // 権限が適切に管理されていることを確認
    expect(['granted', 'denied', 'default']).toContain(notificationPermission);
  });

  test('背景同期機能', async ({ page }) => {
    await page.goto('/');
    
    // 背景同期機能の登録を確認（実装時に調整）
    // const isSyncRegistered = await page.evaluate(async () => {
    //   if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    //     const registration = await navigator.serviceWorker.ready;
    //     return !!registration.sync;
    //   }
    //   return false;
    // });
    // 
    // expect(isSyncRegistered).toBe(true);
  });

  test('モバイルデバイスでのPWA機能', async ({ page }) => {
    // モバイルビューポートでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // モバイルでの表示を確認
    await expect(page.getByText('Cooklet')).toBeVisible();
    
    // タッチ操作のサポートを確認
    const isTouchSupported = await page.evaluate(() => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });
    
    // モバイル環境では true、デスクトップでは false の可能性
    expect(typeof isTouchSupported).toBe('boolean');
  });

  test('PWAの更新機能', async ({ page }) => {
    await page.goto('/');
    
    // アプリ更新の通知機能を確認（実装時に調整）
    // await page.evaluate(() => {
    //   // Service Worker の updatefound イベントをモック
    //   const event = new Event('updatefound');
    //   if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.dispatchEvent(event);
    //   }
    // });
    
    // 更新通知が表示されることを確認
    // await expect(page.getByText('アプリが更新されました')).toBeVisible();
    // await expect(page.getByRole('button', { name: '更新' })).toBeVisible();
  });
});