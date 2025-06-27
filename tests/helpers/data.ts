import { Page } from '@playwright/test';

/**
 * テストデータ関連のヘルパー関数
 */

/**
 * 献立のモックデータ
 */
export const mockMealPlans = [
  {
    id: 'meal-1',
    user_id: 'test-user-id',
    date: '2024-01-15',
    meal_type: 'breakfast',
    recipe_url: 'https://example.com/recipe/pancake',
    ingredients: [
      { name: '小麦粉', quantity: '100g' },
      { name: '卵', quantity: '1個' },
      { name: '牛乳', quantity: '100ml' }
    ],
    memo: 'ふわふわパンケーキ',
    consumed_status: 'pending',
    created_at: '2024-01-15T06:00:00Z',
    updated_at: '2024-01-15T06:00:00Z'
  },
  {
    id: 'meal-2',
    user_id: 'test-user-id',
    date: '2024-01-15',
    meal_type: 'lunch',
    recipe_url: 'https://example.com/recipe/pasta',
    ingredients: [
      { name: 'パスタ', quantity: '100g' },
      { name: 'トマトソース', quantity: '1缶' },
      { name: 'チーズ', quantity: '適量' }
    ],
    memo: '簡単トマトパスタ',
    consumed_status: 'completed',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  }
];

/**
 * 在庫のモックデータ
 */
export const mockStockItems = [
  {
    id: 'stock-1',
    user_id: 'test-user-id',
    name: 'トマト',
    quantity: '5個',
    best_before: '2024-01-20',
    storage_location: 'refrigerator',
    is_homemade: false,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'stock-2',
    user_id: 'test-user-id',
    name: '手作りカレー',
    quantity: '2人分',
    best_before: '2024-01-18',
    storage_location: 'freezer',
    is_homemade: true,
    created_at: '2024-01-12T18:00:00Z',
    updated_at: '2024-01-12T18:00:00Z'
  },
  {
    id: 'stock-3',
    user_id: 'test-user-id',
    name: '牛乳',
    quantity: '1本',
    best_before: '2024-01-16', // 期限切れ近い
    storage_location: 'refrigerator',
    is_homemade: false,
    created_at: '2024-01-08T08:00:00Z',
    updated_at: '2024-01-08T08:00:00Z'
  }
];

/**
 * 買い物リストのモックデータ
 */
export const mockShoppingList = [
  {
    id: 'shopping-1',
    user_id: 'test-user-id',
    name: '玉ねぎ',
    quantity: '2個',
    checked: false,
    added_from: 'auto',
    created_at: '2024-01-15T09:00:00Z'
  },
  {
    id: 'shopping-2',
    user_id: 'test-user-id',
    name: '醤油',
    quantity: '1本',
    checked: true,
    added_from: 'manual',
    created_at: '2024-01-14T15:00:00Z'
  },
  {
    id: 'shopping-3',
    user_id: 'test-user-id',
    name: 'パン',
    quantity: '1斤',
    checked: false,
    added_from: 'manual',
    created_at: '2024-01-15T07:00:00Z'
  }
];

/**
 * 保存済みレシピのモックデータ
 */
export const mockSavedRecipes = [
  {
    id: 'recipe-1',
    user_id: 'test-user-id',
    title: 'ふわふわパンケーキ',
    url: 'https://example.com/recipe/pancake',
    servings: 2,
    tags: ['朝食', '簡単', 'デザート'],
    created_at: '2024-01-10T08:00:00Z'
  },
  {
    id: 'recipe-2',
    user_id: 'test-user-id',
    title: '本格カレー',
    url: 'https://example.com/recipe/curry',
    servings: 4,
    tags: ['夕食', '煮込み', 'スパイス'],
    created_at: '2024-01-12T14:00:00Z'
  }
];

/**
 * 通知設定のモックデータ
 */
export const mockNotificationSettings = {
  notification_enabled: true,
  expiry_notification_days: 3,
  notification_time: '08:00'
};

/**
 * Supabase APIレスポンスをモック
 * @param page Playwrightページオブジェクト
 * @param tableName テーブル名
 * @param data モックデータ
 */
export async function mockSupabaseResponse(
  page: Page,
  tableName: string,
  data: any[]
): Promise<void> {
  await page.route(`**/rest/v1/${tableName}*`, route => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (method === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data)
      });
    } else if (method === 'POST') {
      const newItem = { ...JSON.parse(route.request().postData() || '{}'), id: `new-${Date.now()}` };
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([newItem])
      });
    } else if (method === 'PATCH') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([data[0]]) // 最初のアイテムを更新済みとして返す
      });
    } else if (method === 'DELETE') {
      route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: ''
      });
    }
  });
}

/**
 * 全てのテストデータを一括でモック
 * @param page Playwrightページオブジェクト
 */
export async function mockAllData(page: Page): Promise<void> {
  await mockSupabaseResponse(page, 'meal_plans', mockMealPlans);
  await mockSupabaseResponse(page, 'stock_items', mockStockItems);
  await mockSupabaseResponse(page, 'shopping_list', mockShoppingList);
  await mockSupabaseResponse(page, 'saved_recipes', mockSavedRecipes);
}

/**
 * 空のデータ状態をモック
 * @param page Playwrightページオブジェクト
 */
export async function mockEmptyData(page: Page): Promise<void> {
  await mockSupabaseResponse(page, 'meal_plans', []);
  await mockSupabaseResponse(page, 'stock_items', []);
  await mockSupabaseResponse(page, 'shopping_list', []);
  await mockSupabaseResponse(page, 'saved_recipes', []);
}

/**
 * エラーレスポンスをモック
 * @param page Playwrightページオブジェクト
 * @param tableName テーブル名
 * @param errorCode エラーコード
 * @param errorMessage エラーメッセージ
 */
export async function mockSupabaseError(
  page: Page,
  tableName: string,
  errorCode: number = 500,
  errorMessage: string = 'Internal Server Error'
): Promise<void> {
  await page.route(`**/rest/v1/${tableName}*`, route => {
    route.fulfill({
      status: errorCode,
      contentType: 'application/json',
      body: JSON.stringify({
        error: errorMessage,
        code: errorCode
      })
    });
  });
}

/**
 * 日付に基づいたテストデータを生成
 * @param baseDate 基準日
 * @param days 生成する日数
 * @returns 生成されたデータ
 */
export function generateTestDataForDateRange(baseDate: string, days: number = 7): any[] {
  const data = [];
  const base = new Date(baseDate);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(base);
    date.setDate(base.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    data.push({
      id: `generated-${i}`,
      user_id: 'test-user-id',
      date: dateString,
      meal_type: ['breakfast', 'lunch', 'dinner'][i % 3],
      recipe_url: `https://example.com/recipe/${i}`,
      ingredients: [
        { name: `食材${i}`, quantity: `${i + 1}個` }
      ],
      memo: `生成されたテストデータ ${i + 1}`,
      consumed_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return data;
}