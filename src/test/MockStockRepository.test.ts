import { describe, it, expect, beforeEach } from 'vitest';
import { MockStockRepository } from '../repositories/implementations/MockStockRepository';
import { NotFoundError } from '../repositories/errors';
import { type StockItem } from '../types';

describe('MockStockRepository', () => {
  let repository: MockStockRepository;
  const testUserId = 'test-user-id';

  beforeEach(() => {
    repository = new MockStockRepository();
  });

  describe('findAll', () => {
    it('should return empty array when no items exist', async () => {
      const result = await repository.findAll(testUserId);
      expect(result).toEqual([]);
    });

    it('should return items for specific user only', async () => {
      const user1Items: StockItem[] = [
        {
          id: '1',
          user_id: 'user1',
          name: 'ユーザー1の食材',
          quantity: '100g',
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const user2Items: StockItem[] = [
        {
          id: '2',
          user_id: 'user2',
          name: 'ユーザー2の食材',
          quantity: '200g',
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      repository.setMockData([...user1Items, ...user2Items]);

      const user1Result = await repository.findAll('user1');
      const user2Result = await repository.findAll('user2');

      expect(user1Result).toHaveLength(1);
      expect(user1Result[0].name).toBe('ユーザー1の食材');
      expect(user2Result).toHaveLength(1);
      expect(user2Result[0].name).toBe('ユーザー2の食材');
    });
  });

  describe('findById', () => {
    it('should return null when item does not exist', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return item when it exists', async () => {
      const testItem: StockItem = {
        id: '1',
        user_id: testUserId,
        name: 'テスト食材',
        quantity: '100g',
        is_homemade: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      repository.setMockData([testItem]);

      const result = await repository.findById('1');
      expect(result).toEqual(testItem);
    });
  });

  describe('create', () => {
    it('should create new item with generated ID and timestamps', async () => {
      const newItem = {
        user_id: testUserId,
        name: '新しい食材',
        quantity: '100g',
        is_homemade: false,
      };

      const result = await repository.create(newItem);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('新しい食材');
      expect(result.user_id).toBe(testUserId);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();

      // データがリポジトリに保存されているか確認
      const allItems = await repository.findAll(testUserId);
      expect(allItems).toHaveLength(1);
      expect(allItems[0]).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update existing item', async () => {
      const originalItem: StockItem = {
        id: '1',
        user_id: testUserId,
        name: '元の食材',
        quantity: '100g',
        is_homemade: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      repository.setMockData([originalItem]);

      const updates = {
        name: '更新された食材',
        quantity: '200g',
        best_before: '2024-12-31',
      };

      const result = await repository.update('1', updates);

      expect(result.id).toBe('1');
      expect(result.name).toBe('更新された食材');
      expect(result.quantity).toBe('200g');
      expect(result.best_before).toBe('2024-12-31');
      expect(result.created_at).toBe(originalItem.created_at); // 作成日時は変更されない
      expect(result.updated_at).not.toBe(originalItem.updated_at); // 更新日時は変更される
    });

    it('should throw NotFoundError when item does not exist', async () => {
      await expect(repository.update('non-existent-id', { quantity: '200g' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing item', async () => {
      const testItem: StockItem = {
        id: '1',
        user_id: testUserId,
        name: 'テスト食材',
        quantity: '100g',
        is_homemade: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      repository.setMockData([testItem]);

      await repository.delete('1');

      const result = await repository.findById('1');
      expect(result).toBeNull();

      const allItems = await repository.findAll(testUserId);
      expect(allItems).toHaveLength(0);
    });

    it('should throw NotFoundError when item does not exist', async () => {
      await expect(repository.delete('non-existent-id'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('findExpiringSoon', () => {
    it('should return items expiring within specified days', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const items: StockItem[] = [
        {
          id: '1',
          user_id: testUserId,
          name: '明日期限',
          quantity: '100g',
          best_before: tomorrow.toISOString().split('T')[0],
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: testUserId,
          name: '明後日期限',
          quantity: '100g',
          best_before: dayAfterTomorrow.toISOString().split('T')[0],
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          user_id: testUserId,
          name: '来週期限',
          quantity: '100g',
          best_before: nextWeek.toISOString().split('T')[0],
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      repository.setMockData(items);

      const result = await repository.findExpiringSoon(testUserId, 2);

      expect(result).toHaveLength(2);
      expect(result.some(item => item.name === '明日期限')).toBe(true);
      expect(result.some(item => item.name === '明後日期限')).toBe(true);
      expect(result.some(item => item.name === '来週期限')).toBe(false);
    });
  });

  describe('findExpired', () => {
    it('should return expired items', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const items: StockItem[] = [
        {
          id: '1',
          user_id: testUserId,
          name: '期限切れ食材',
          quantity: '100g',
          best_before: yesterday.toISOString().split('T')[0],
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: testUserId,
          name: '期限内食材',
          quantity: '100g',
          best_before: tomorrow.toISOString().split('T')[0],
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      repository.setMockData(items);

      const result = await repository.findExpired(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('期限切れ食材');
    });
  });

  describe('findByName', () => {
    it('should return items matching the search query', async () => {
      const items: StockItem[] = [
        {
          id: '1',
          user_id: testUserId,
          name: 'りんご',
          quantity: '3個',
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: testUserId,
          name: 'りんごジュース',
          quantity: '1本',
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          user_id: testUserId,
          name: 'みかん',
          quantity: '5個',
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      repository.setMockData(items);

      const result = await repository.findByName(testUserId, 'りんご');

      expect(result).toHaveLength(2);
      expect(result.some(item => item.name === 'りんご')).toBe(true);
      expect(result.some(item => item.name === 'りんごジュース')).toBe(true);
      expect(result.some(item => item.name === 'みかん')).toBe(false);
    });
  });

  describe('findHomemade', () => {
    it('should return only homemade items', async () => {
      const items: StockItem[] = [
        {
          id: '1',
          user_id: testUserId,
          name: '作り置きカレー',
          quantity: '1食分',
          is_homemade: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: testUserId,
          name: '購入したパン',
          quantity: '1個',
          is_homemade: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      repository.setMockData(items);

      const result = await repository.findHomemade(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('作り置きカレー');
      expect(result[0].is_homemade).toBe(true);
    });
  });

  describe('setMockData and clearMockData', () => {
    it('should set and clear mock data correctly', async () => {
      const testItem: StockItem = {
        id: '1',
        user_id: testUserId,
        name: 'テスト食材',
        quantity: '100g',
        is_homemade: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // データを設定
      repository.setMockData([testItem]);
      let result = await repository.findAll(testUserId);
      expect(result).toHaveLength(1);

      // データをクリア
      repository.clearMockData();
      result = await repository.findAll(testUserId);
      expect(result).toHaveLength(0);
    });
  });
});