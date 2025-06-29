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
 * 期限切れアイテムを期間別にグループ化する関数
 * @param expiredItems - 期限切れアイテムの配列
 * @returns 期間別にグループ化されたアイテムオブジェクト
 */
export const groupExpiredItemsByPeriod = (expiredItems: StockItem[]): Record<string, StockItem[]> => {
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
  
  // 各グループ内のアイテムを名前順にソート
  Object.keys(grouped).forEach(period => {
    grouped[period].sort((a, b) => a.name.localeCompare(b.name));
  });
  
  return grouped;
};