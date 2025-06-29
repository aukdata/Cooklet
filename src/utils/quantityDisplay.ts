// Quantity型の表示用ユーティリティ関数

import type { Quantity } from '../types';

/**
 * Quantity型を文字列に変換する関数
 */
export const quantityToString = (quantity: Quantity): string => {
  if (!quantity.amount) return '';
  return `${quantity.amount}${quantity.unit || ''}`;
};

/**
 * Quantity型をReactで表示可能な形式に変換する関数
 */
export const quantityToDisplay = (quantity: Quantity): string => {
  return quantityToString(quantity);
};