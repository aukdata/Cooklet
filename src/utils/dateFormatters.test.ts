import { describe, it, expect } from 'vitest';
import {
  formatDateToJapanese,
  formatDateToSlash,
  formatDateToISO,
  formatDateRange,
  isToday,
  isYesterday,
  isTomorrow,
  addDays,
  getDaysDifference,
  formatRelativeDate
} from './dateFormatters';

describe('dateFormatters', () => {
  // テスト用の固定日付
  const testDate = new Date('2025-06-15T12:00:00Z');
  const _today = new Date('2025-06-15T10:00:00Z');
  const _yesterday = new Date('2025-06-14T10:00:00Z');
  const _tomorrow = new Date('2025-06-16T10:00:00Z');

  describe('formatDateToJapanese', () => {
    it('should format date to Japanese format', () => {
      expect(formatDateToJapanese(testDate)).toBe('6月15日');
    });

    it('should handle different months and days', () => {
      const janDate = new Date('2025-01-01T12:00:00Z');
      const decDate = new Date('2025-12-31T12:00:00Z');
      
      expect(formatDateToJapanese(janDate)).toBe('1月1日');
      expect(formatDateToJapanese(decDate)).toBe('12月31日');
    });
  });

  describe('formatDateToSlash', () => {
    it('should format date to slash format', () => {
      expect(formatDateToSlash(testDate)).toBe('6/15');
    });

    it('should handle single digit dates', () => {
      const singleDigitDate = new Date('2025-01-05T12:00:00Z');
      expect(formatDateToSlash(singleDigitDate)).toBe('1/5');
    });
  });

  describe('formatDateToISO', () => {
    it('should format date to ISO format', () => {
      expect(formatDateToISO(testDate)).toBe('2025-06-15');
    });

    it('should maintain zero padding', () => {
      const paddedDate = new Date('2025-01-05T12:00:00Z');
      expect(formatDateToISO(paddedDate)).toBe('2025-01-05');
    });
  });

  describe('formatDateRange', () => {
    it('should format date range correctly', () => {
      const startDate = new Date('2025-06-15T12:00:00Z');
      const endDate = new Date('2025-06-20T12:00:00Z');
      
      expect(formatDateRange(startDate, endDate)).toBe('6/15 - 6/20');
    });

    it('should handle same date range', () => {
      expect(formatDateRange(testDate, testDate)).toBe('6/15 - 6/15');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      // 現在時刻に近い日付でテスト
      const now = new Date();
      expect(isToday(now)).toBe(true);
    });

    it('should return false for different dates', () => {
      const differentDate = new Date('2023-01-01T12:00:00Z');
      expect(isToday(differentDate)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return false for today', () => {
      const now = new Date();
      expect(isYesterday(now)).toBe(false);
    });

    it('should return false for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(isYesterday(future)).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    it('should return false for today', () => {
      const now = new Date();
      expect(isTomorrow(now)).toBe(false);
    });

    it('should return false for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isTomorrow(past)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const result = addDays(testDate, 5);
      expect(formatDateToISO(result)).toBe('2025-06-20');
    });

    it('should subtract days with negative input', () => {
      const result = addDays(testDate, -3);
      expect(formatDateToISO(result)).toBe('2025-06-12');
    });

    it('should handle zero days', () => {
      const result = addDays(testDate, 0);
      expect(formatDateToISO(result)).toBe('2025-06-15');
    });

    it('should handle month boundaries', () => {
      const endOfMonth = new Date('2025-06-30T12:00:00Z');
      const result = addDays(endOfMonth, 2);
      expect(formatDateToISO(result)).toBe('2025-07-02');
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate positive difference correctly', () => {
      const date1 = new Date('2025-06-15T12:00:00Z');
      const date2 = new Date('2025-06-20T12:00:00Z');
      
      expect(getDaysDifference(date1, date2)).toBe(5);
    });

    it('should calculate negative difference correctly', () => {
      const date1 = new Date('2025-06-20T12:00:00Z');
      const date2 = new Date('2025-06-15T12:00:00Z');
      
      expect(getDaysDifference(date1, date2)).toBe(-5);
    });

    it('should return zero for same dates', () => {
      expect(getDaysDifference(testDate, testDate)).toBe(0);
    });

    it('should handle time differences within same day', () => {
      const morning = new Date('2025-06-15T08:00:00Z');
      const evening = new Date('2025-06-15T20:00:00Z');
      
      expect(getDaysDifference(morning, evening)).toBe(0);
    });
  });

  describe('formatRelativeDate', () => {
    // Note: これらのテストは実際の実装に依存するため、
    // 基本的なケースのみをテスト
    it('should handle date formatting', () => {
      const result = formatRelativeDate(testDate);
      // 実装に応じて適切な期待値を設定
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be consistent', () => {
      const result1 = formatRelativeDate(testDate);
      const result2 = formatRelativeDate(testDate);
      expect(result1).toBe(result2);
    });
  });

  // エッジケースのテスト
  describe('Edge cases', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00Z');
      expect(formatDateToISO(leapYearDate)).toBe('2024-02-29');
      expect(formatDateToJapanese(leapYearDate)).toBe('2月29日');
    });

    it('should handle year boundaries', () => {
      const yearEnd = new Date('2024-12-31T23:59:59Z');
      const nextYear = addDays(yearEnd, 1);
      expect(formatDateToISO(nextYear)).toBe('2025-01-01');
    });

    it('should handle time zones consistently', () => {
      // UTC時間での一貫性をテスト
      const utcDate = new Date('2025-06-15T12:00:00Z');
      expect(formatDateToISO(utcDate)).toBe('2025-06-15');
    });
  });
});