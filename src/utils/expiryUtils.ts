/**
 * 期限切れ関連のユーティリティ関数群
 * 賞味期限の計算・フォーマット・グループ化処理を提供
 */

import type { StockItem } from '../types';

/**
 * 期限切れ期間を計算する関数
 * @param expiredDate - 期限切れした日付（ISO文字列）
 * @returns 期間を表す日本語文字列（例: "今日", "1日前", "2ヶ月前"）
 */
export const getExpiredPeriod = (expiredDate: string): string => {
  const today = new Date();
  const expired = new Date(expiredDate);
  const diffInDays = Math.floor((today.getTime() - expired.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return '今日';
  } else if (diffInDays === 1) {
    return '1日前';
  } else if (diffInDays < 31) {
    return `${diffInDays}日前`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months}ヶ月前`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years}年前`;
  }
};

/**
 * 期間文字列から重み（数値）を取得する関数
 * @param period - 期間文字列（例: "今日", "1日前", "2ヶ月前"）
 * @returns ソート用の重み値
 */
const getPeriodWeight = (period: string): number => {
  if (period === '今日') return 0;
  if (period.includes('日前')) return parseInt(period);
  if (period.includes('ヶ月前')) return parseInt(period) * 30;
  if (period.includes('年前')) return parseInt(period) * 365;
  return 999999;
};

/**
 * 期限切れアイテムを期間別にグループ化する関数
 * @param expiredItems - 期限切れアイテムの配列
 * @returns 期間別にグループ化されたアイテム配列
 */
export const groupExpiredItemsByPeriod = (expiredItems: StockItem[]) => {
  const grouped: Record<string, StockItem[]> = {};
  
  expiredItems.forEach(item => {
    if (item.best_before) {
      const period = getExpiredPeriod(item.best_before);
      if (!grouped[period]) {
        grouped[period] = [];
      }
      grouped[period].push(item);
    }
  });
  
  // 期間順にソート（今日、1日前、2日前...1ヶ月前...1年前...）
  return Object.entries(grouped).sort(([a], [b]) => {
    return getPeriodWeight(a) - getPeriodWeight(b);
  });
};