import { renderHook, act, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStockItems } from '../hooks/useStockItems';
import { RepositoryProvider } from '../contexts/RepositoryContext';
import { createTestRepositoryContainer } from '../repositories/container';
import { type StockItem } from '../types';

// モックユーザー
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'テストユーザー',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// AuthContextのモック
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// useTabRefreshのモック
vi.mock('../hooks/useTabRefresh', () => ({
  useTabRefresh: () => ({
    markAsUpdated: vi.fn(),
  }),
}));

// テスト用のWrapper
const createWrapper = () => {
  const testContainer = createTestRepositoryContainer();
  
  return ({ children }: { children: ReactNode }) => (
    <RepositoryProvider container={testContainer}>
      {children}
    </RepositoryProvider>
  );
};

describe('useStockItems', () => {
  let testContainer: ReturnType<typeof createTestRepositoryContainer>;
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    wrapper = createWrapper();
    testContainer = createTestRepositoryContainer();
  });

  it('should initialize with empty stock items', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stockItems).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should add a stock item successfully', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    const newStockItem = {
      name: 'テスト食材',
      quantity: '100g',
      is_homemade: false,
    };

    await act(async () => {
      const addedItem = await result.current.addStockItem(newStockItem);
      expect(addedItem.name).toBe('テスト食材');
      expect(addedItem.user_id).toBe(mockUser.id);
    });

    expect(result.current.stockItems).toHaveLength(1);
    expect(result.current.stockItems[0].name).toBe('テスト食材');
  });

  it('should update a stock item successfully', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    // まず在庫を追加
    await act(async () => {
      await result.current.addStockItem({
        name: 'テスト食材',
        quantity: '100g',
        is_homemade: false,
      });
    });

    const itemId = result.current.stockItems[0].id;

    // 在庫を更新
    await act(async () => {
      await result.current.updateStockItem(itemId, {
        quantity: '200g',
        best_before: '2024-12-31',
      });
    });

    expect(result.current.stockItems[0].quantity).toBe('200g');
    expect(result.current.stockItems[0].best_before).toBe('2024-12-31');
  });

  it('should delete a stock item successfully', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    // まず在庫を追加
    await act(async () => {
      await result.current.addStockItem({
        name: 'テスト食材',
        quantity: '100g',
        is_homemade: false,
      });
    });

    expect(result.current.stockItems).toHaveLength(1);
    const itemId = result.current.stockItems[0].id;

    // 在庫を削除
    await act(async () => {
      await result.current.deleteStockItem(itemId);
    });

    expect(result.current.stockItems).toHaveLength(0);
  });

  it('should get expired items correctly', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 期限切れの在庫を追加
    await act(async () => {
      await result.current.addStockItem({
        name: '期限切れ食材',
        quantity: '100g',
        best_before: yesterdayStr,
        is_homemade: false,
      });
    });

    const expiredItems = result.current.getExpiredItems();
    expect(expiredItems).toHaveLength(1);
    expect(expiredItems[0].name).toBe('期限切れ食材');
  });

  it('should get expiring items correctly', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 期限が近い在庫を追加
    await act(async () => {
      await result.current.addStockItem({
        name: '期限間近食材',
        quantity: '100g',
        best_before: tomorrowStr,
        is_homemade: false,
      });
    });

    const expiringItems = result.current.getExpiringItems(1);
    expect(expiringItems).toHaveLength(1);
    expect(expiringItems[0].name).toBe('期限間近食材');
  });

  it('should search items by name', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    // 複数の在庫を追加
    await act(async () => {
      await result.current.addStockItem({
        name: 'りんご',
        quantity: '3個',
        is_homemade: false,
      });
      await result.current.addStockItem({
        name: 'みかん',
        quantity: '5個',
        is_homemade: false,
      });
      await result.current.addStockItem({
        name: 'りんごジュース',
        quantity: '1本',
        is_homemade: false,
      });
    });

    const searchResults = result.current.searchItems('りんご');
    expect(searchResults).toHaveLength(2);
    expect(searchResults.some(item => item.name === 'りんご')).toBe(true);
    expect(searchResults.some(item => item.name === 'りんごジュース')).toBe(true);
  });

  it('should handle errors appropriately', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    // 無効なIDで更新を試行
    await act(async () => {
      try {
        await result.current.updateStockItem('invalid-id', { quantity: '200g' });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('not found');
      }
    });
  });

  it('should save stock item correctly (add new)', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    const stockItem = {
      name: '新しい食材',
      quantity: '100g',
      is_homemade: false,
    };

    await act(async () => {
      const savedItem = await result.current.saveStockItem(stockItem);
      expect(savedItem.name).toBe('新しい食材');
    });

    expect(result.current.stockItems).toHaveLength(1);
  });

  it('should save stock item correctly (update existing)', async () => {
    const { result } = renderHook(() => useStockItems(), { wrapper });

    // まず追加
    await act(async () => {
      await result.current.addStockItem({
        name: '既存食材',
        quantity: '100g',
        is_homemade: false,
      });
    });

    const existingItem = result.current.stockItems[0];

    // 既存アイテムを更新
    await act(async () => {
      await result.current.saveStockItem({
        ...existingItem,
        quantity: '200g',
      });
    });

    expect(result.current.stockItems[0].quantity).toBe('200g');
    expect(result.current.stockItems).toHaveLength(1); // 追加ではなく更新
  });
});