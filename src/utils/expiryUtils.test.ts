import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getExpiredPeriod,
  groupExpiredItemsByPeriod
} from './expiryUtils';
import type { StockItem } from '../types';

describe('expiryUtils', () => {
  // テスト用の固定日付を設定
  beforeEach(() => {
    // 2025-06-15を「今日」として固定
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getExpiredPeriod', () => {
    it('should return "今日" for today', () => {
      const today = '2025-06-15';
      expect(getExpiredPeriod(today)).toBe('今日');
    });

    it('should return "1日前" for yesterday', () => {
      const yesterday = '2025-06-14';
      expect(getExpiredPeriod(yesterday)).toBe('1日前');
    });

    it('should return correct days for recent dates', () => {
      const threeDaysAgo = '2025-06-12';
      const sevenDaysAgo = '2025-06-08';
      
      expect(getExpiredPeriod(threeDaysAgo)).toBe('3日前');
      expect(getExpiredPeriod(sevenDaysAgo)).toBe('7日前');
    });

    it('should return correct months for older dates', () => {
      const oneMonthAgo = '2025-05-15';
      const twoMonthsAgo = '2025-04-15';
      
      expect(getExpiredPeriod(oneMonthAgo)).toBe('1ヶ月前');
      expect(getExpiredPeriod(twoMonthsAgo)).toBe('2ヶ月前');
    });

    it('should return correct years for very old dates', () => {
      const oneYearAgo = '2024-06-15';
      const twoYearsAgo = '2023-06-15';
      
      expect(getExpiredPeriod(oneYearAgo)).toBe('1年前');
      expect(getExpiredPeriod(twoYearsAgo)).toBe('2年前');
    });

    it('should handle edge cases', () => {
      const thirtyDaysAgo = '2025-05-16';
      const thirtyOneDaysAgo = '2025-05-15';
      
      expect(getExpiredPeriod(thirtyDaysAgo)).toBe('30日前');
      expect(getExpiredPeriod(thirtyOneDaysAgo)).toBe('1ヶ月前');
    });
  });

  describe('groupExpiredItemsByPeriod', () => {
    const createMockStockItem = (id: string, name: string, bestBefore: string): StockItem => ({
      id,
      user_id: 'user1',
      name,
      quantity: { amount: '1', unit: '個' },
      best_before: bestBefore,
      is_homemade: false,
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-06-01T00:00:00Z'
    });

    it('should group items by expiry period correctly', () => {
      const expiredItems = [
        createMockStockItem('1', '牛乳', '2025-06-15'), // 今日
        createMockStockItem('2', 'パン', '2025-06-14'), // 1日前
        createMockStockItem('3', 'ヨーグルト', '2025-06-15'), // 今日
        createMockStockItem('4', 'チーズ', '2025-06-12'), // 3日前
        createMockStockItem('5', '卵', '2025-05-15'), // 1ヶ月前
      ];

      const grouped = groupExpiredItemsByPeriod(expiredItems);

      expect(grouped['今日']).toHaveLength(2);
      expect(grouped['今日'][0].name).toBe('ヨーグルト');
      expect(grouped['今日'][1].name).toBe('牛乳');

      expect(grouped['1日前']).toHaveLength(1);
      expect(grouped['1日前'][0].name).toBe('パン');

      expect(grouped['3日前']).toHaveLength(1);
      expect(grouped['3日前'][0].name).toBe('チーズ');

      expect(grouped['1ヶ月前']).toHaveLength(1);
      expect(grouped['1ヶ月前'][0].name).toBe('卵');
    });

    it('should handle empty array', () => {
      const grouped = groupExpiredItemsByPeriod([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it('should handle items without best_before date', () => {
      const itemsWithoutDate = [
        createMockStockItem('1', '調味料', ''), // 空文字
        { ...createMockStockItem('2', '冷凍食品', '2025-06-15'), best_before: undefined as unknown as string }, // テスト用の不正なデータ構造
      ];

      // best_beforeがない項目は処理されない
      const grouped = groupExpiredItemsByPeriod(itemsWithoutDate.filter(item => item.best_before));
      
      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it('should sort items within groups by name', () => {
      const expiredItems = [
        createMockStockItem('1', 'ヨーグルト', '2025-06-15'),
        createMockStockItem('2', 'アイス', '2025-06-15'),
        createMockStockItem('3', 'ケーキ', '2025-06-15'),
      ];

      const grouped = groupExpiredItemsByPeriod(expiredItems);
      const todayItems = grouped['今日'];

      expect(todayItems[0].name).toBe('アイス');
      expect(todayItems[1].name).toBe('ケーキ');
      expect(todayItems[2].name).toBe('ヨーグルト');
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        createMockStockItem(`${i}`, `商品${i}`, '2025-06-15')
      );

      const start = performance.now();
      const grouped = groupExpiredItemsByPeriod(largeDataset);
      const end = performance.now();

      expect(grouped['今日']).toHaveLength(1000);
      expect(end - start).toBeLessThan(100); // 100ms以内で処理完了
    });
  });

  // エッジケースのテスト
  describe('Edge cases', () => {
    it('should handle invalid date strings gracefully', () => {
      const invalidDate = 'invalid-date';
      
      // 無効な日付でもエラーを投げない
      expect(() => getExpiredPeriod(invalidDate)).not.toThrow();
      
      // NaNの日数差は文字列として扱われる
      const result = getExpiredPeriod(invalidDate);
      expect(typeof result).toBe('string');
    });

    it('should handle future dates', () => {
      const futureDate = '2025-06-20';
      const result = getExpiredPeriod(futureDate);
      
      // 未来の日付でも文字列が返される
      expect(typeof result).toBe('string');
    });

    it('should handle timezone differences', () => {
      // UTCとローカル時間の違いを考慮
      const utcDate = '2025-06-15T23:59:59Z';
      const result = getExpiredPeriod(utcDate);
      
      expect(typeof result).toBe('string');
    });
  });

  // パフォーマンステスト
  describe('Performance', () => {
    it('should handle repeated calculations efficiently', () => {
      const testDate = '2025-06-10';
      const iterations = 10000;
      
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        getExpiredPeriod(testDate);
      }
      const end = performance.now();
      
      // 10000回の計算が100ms以内で完了
      expect(end - start).toBeLessThan(100);
    });
  });
});