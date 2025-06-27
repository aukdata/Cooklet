import { Page } from '@playwright/test';

/**
 * 認証関連のテストヘルパー関数
 */

/**
 * 認証状態をモックしてログイン状態にする
 * @param page Playwrightページオブジェクト
 * @param userOptions ユーザー情報のオプション
 */
export async function mockLogin(
  page: Page,
  userOptions: {
    id?: string;
    email?: string;
    name?: string;
  } = {}
): Promise<void> {
  const defaultUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'テストユーザー',
    ...userOptions,
  };

  await page.addInitScript((user) => {
    // Supabase認証トークンをモック
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000, // 1時間後
      token_type: 'bearer',
      user: user,
    }));

    // 認証状態をセッションストレージにも保存
    sessionStorage.setItem('auth-user', JSON.stringify(user));
  }, defaultUser);
}

/**
 * ログアウト状態にする
 * @param page Playwrightページオブジェクト
 */
export async function mockLogout(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('auth-user');
  });
}

/**
 * 認証が必要なページにアクセスして認証チェック
 * @param page Playwrightページオブジェクト
 * @param url アクセスするURL
 * @param shouldRedirect 認証されていない場合にリダイレクトされるべきか
 */
export async function checkAuthRequired(
  page: Page,
  url: string,
  shouldRedirect: boolean = true
): Promise<void> {
  await page.goto(url);
  
  if (shouldRedirect) {
    // ログインページにリダイレクトされることを期待
    await page.waitForURL('/', { timeout: 5000 });
  }
}

/**
 * Google認証フローをモック
 * @param page Playwrightページオブジェクト
 */
export async function mockGoogleAuth(page: Page): Promise<void> {
  // Google認証のリダイレクトをモック
  await page.route('**/auth/v1/authorize*', route => {
    route.fulfill({
      status: 302,
      headers: {
        'Location': `${page.url()}?code=mock-auth-code&state=mock-state`
      }
    });
  });
}

/**
 * 認証トークンの有効期限切れ状態をモック
 * @param page Playwrightページオブジェクト
 */
export async function mockExpiredToken(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'expired-token',
      refresh_token: 'expired-refresh-token',
      expires_at: Date.now() - 3600000, // 1時間前（期限切れ）
      token_type: 'bearer',
      user: null,
    }));
  });
}

/**
 * 権限レベルの異なるユーザーをモック
 * @param page Playwrightページオブジェクト
 * @param role ユーザーの役割
 */
export async function mockUserWithRole(
  page: Page,
  role: 'admin' | 'user' | 'guest' = 'user'
): Promise<void> {
  const user = {
    id: `test-${role}-id`,
    email: `test-${role}@example.com`,
    role: role,
    permissions: getPermissionsByRole(role),
  };

  await mockLogin(page, user);
}

/**
 * 役割に応じた権限を取得
 * @param role ユーザーの役割
 * @returns 権限の配列
 */
function getPermissionsByRole(role: string): string[] {
  switch (role) {
    case 'admin':
      return ['read', 'write', 'delete', 'admin'];
    case 'user':
      return ['read', 'write'];
    case 'guest':
      return ['read'];
    default:
      return [];
  }
}