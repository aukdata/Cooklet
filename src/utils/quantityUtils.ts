/**
 * Quantity型の演算ユーティリティ
 * PLAN.mdの要求仕様に基づくQuantity型の加算・減算機能
 */

import { parseQuantityString } from './numberConverter';
import type { FoodUnit } from '../constants/units';

export interface Quantity {
  amount: string;
  unit: string;
}

/**
 * 単位変換テーブル
 * 全ての単位を基本単位に変換する係数を定義
 */
export interface UnitConversion {
  /** 基本単位（変換先） */
  baseUnit: FoodUnit;
  /** 基本単位への変換係数 */
  factor: number;
}

/**
 * 単位変換定義
 * PLAN.mdの仕様に従い、重量系(g)と体積系(ml)の変換を実装
 */
export const UNIT_CONVERSIONS: Record<string, UnitConversion> = {
  // 重量系（基本単位: g）
  'g': { baseUnit: 'g', factor: 1 },
  'kg': { baseUnit: 'g', factor: 1000 },
  
  // 体積系（基本単位: mL）
  'mL': { baseUnit: 'mL', factor: 1 },
  'ml': { baseUnit: 'mL', factor: 1 }, // 小文字対応
  'L': { baseUnit: 'mL', factor: 1000 },
  'l': { baseUnit: 'mL', factor: 1000 }, // 小文字対応
  'cc': { baseUnit: 'mL', factor: 1 },
  
  // 料理単位（基本単位: mL）
  '大さじ': { baseUnit: 'mL', factor: 15 },
  '小さじ': { baseUnit: 'mL', factor: 5 },
  'カップ': { baseUnit: 'mL', factor: 200 },
  '合': { baseUnit: 'mL', factor: 180 }, // 1合 = 約180ml
  
  // 個数系（変換不可 - 基本単位を自分自身に設定）
  '個': { baseUnit: '個', factor: 1 },
  '本': { baseUnit: '本', factor: 1 },
  '枚': { baseUnit: '枚', factor: 1 },
  '袋': { baseUnit: '袋', factor: 1 },
  '缶': { baseUnit: '缶', factor: 1 },
  'パック': { baseUnit: 'パック', factor: 1 },
  '箱': { baseUnit: '箱', factor: 1 },
  '束': { baseUnit: '束', factor: 1 },
  '片': { baseUnit: '片', factor: 1 },
  '房': { baseUnit: '房', factor: 1 },
  '人前': { baseUnit: '人前', factor: 1 },
  '杯': { baseUnit: '杯', factor: 1 },
  
  // 単位なし
  '-': { baseUnit: '-', factor: 1 },
};

/**
 * 数量を正規化（文字列から数値に変換）
 * PLAN.md 4.1 数量の正規化に対応
 * 
 * @param amount - 数量文字列
 * @returns 正規化された数値、変換不可能な場合は0（「適量」等の非数値表現）
 */
export function normalizeAmount(amount: string): number {
  // まず既存のparseQuantityStringを試す
  const parsed = parseQuantityString(amount);
  
  if (parsed !== null) {
    return parsed;
  }
  
  // 負の値の処理を追加（parseQuantityStringでサポートされていない場合）
  const trimmed = amount.trim();
  
  // 負の整数・小数点の処理
  const negativeMatch = trimmed.match(/^-(\d+(?:\.\d+)?)$/);
  if (negativeMatch) {
    return -parseFloat(negativeMatch[1]);
  }
  
  // PLAN.mdの仕様: 非数値表現は0として扱う
  return 0;
}

/**
 * 単位を基本単位に変換
 * PLAN.md 4.2 単位の変換に対応
 * 
 * @param unit - 変換対象の単位
 * @returns 基本単位、変換不可能な場合はnull
 */
export function getBaseUnit(unit: string): FoodUnit | null {
  const conversion = UNIT_CONVERSIONS[unit];
  return conversion ? conversion.baseUnit : null;
}

/**
 * 数量を基本単位に変換
 * 
 * @param amount - 数量（数値）
 * @param unit - 元の単位
 * @returns 基本単位での数量、変換不可能な場合はnull
 */
export function convertToBaseUnit(amount: number, unit: string): { amount: number; unit: FoodUnit } | null {
  const conversion = UNIT_CONVERSIONS[unit];
  if (!conversion) {
    return null;
  }
  
  return {
    amount: amount * conversion.factor,
    unit: conversion.baseUnit
  };
}

/**
 * 2つの単位が変換可能かチェック
 * 
 * @param unit1 - 単位1
 * @param unit2 - 単位2
 * @returns 同じ基本単位に変換可能な場合true
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const baseUnit1 = getBaseUnit(unit1);
  const baseUnit2 = getBaseUnit(unit2);
  
  return baseUnit1 !== null && baseUnit2 !== null && baseUnit1 === baseUnit2;
}

/**
 * Quantity型同士の加算
 * PLAN.md 4.3 加算・減算ロジックに対応
 * 
 * @param q1 - 加算する数量1
 * @param q2 - 加算する数量2
 * @returns 加算結果、変換不可能な場合はnull
 */
export function addQuantities(q1: Quantity, q2: Quantity): Quantity | null {
  // 1. 各Quantityのamountを正規化
  const amount1 = normalizeAmount(q1.amount);
  const amount2 = normalizeAmount(q2.amount);
  
  // 2. 単位の互換性をチェック
  if (!areUnitsCompatible(q1.unit, q2.unit)) {
    return null;
  }
  
  // 3. 基本単位に変換
  const converted1 = convertToBaseUnit(amount1, q1.unit);
  const converted2 = convertToBaseUnit(amount2, q2.unit);
  
  if (!converted1 || !converted2) {
    return null;
  }
  
  // 4. 加算実行
  const resultAmount = converted1.amount + converted2.amount;
  
  // 5. 結果を返す（基本単位で）
  return {
    amount: resultAmount.toString(),
    unit: converted1.unit
  };
}

/**
 * Quantity型同士の減算
 * PLAN.md 4.3 加算・減算ロジックに対応
 * 
 * @param q1 - 減算される数量
 * @param q2 - 減算する数量
 * @returns 減算結果（q1 - q2）、変換不可能な場合はnull
 */
export function subtractQuantities(q1: Quantity, q2: Quantity): Quantity | null {
  // 1. 各Quantityのamountを正規化
  const amount1 = normalizeAmount(q1.amount);
  const amount2 = normalizeAmount(q2.amount);
  
  // 2. 単位の互換性をチェック
  if (!areUnitsCompatible(q1.unit, q2.unit)) {
    return null;
  }
  
  // 3. 基本単位に変換
  const converted1 = convertToBaseUnit(amount1, q1.unit);
  const converted2 = convertToBaseUnit(amount2, q2.unit);
  
  if (!converted1 || !converted2) {
    return null;
  }
  
  // 4. 減算実行
  const resultAmount = converted1.amount - converted2.amount;
  
  // 5. 結果を返す（基本単位で）
  return {
    amount: resultAmount.toString(),
    unit: converted1.unit
  };
}

/**
 * Quantity型の比較（等しいかどうか）
 * 
 * @param q1 - 比較する数量1
 * @param q2 - 比較する数量2
 * @returns 等しい場合true、変換不可能な場合はfalse
 */
export function areQuantitiesEqual(q1: Quantity, q2: Quantity): boolean {
  // 1. 各Quantityのamountを正規化
  const amount1 = normalizeAmount(q1.amount);
  const amount2 = normalizeAmount(q2.amount);
  
  // 2. 単位の互換性をチェック
  if (!areUnitsCompatible(q1.unit, q2.unit)) {
    return false;
  }
  
  // 3. 基本単位に変換
  const converted1 = convertToBaseUnit(amount1, q1.unit);
  const converted2 = convertToBaseUnit(amount2, q2.unit);
  
  if (!converted1 || !converted2) {
    return false;
  }
  
  // 4. 比較（小数点の誤差を考慮）
  const epsilon = 1e-10;
  return Math.abs(converted1.amount - converted2.amount) < epsilon;
}

/**
 * Quantity型の比較（大小関係）
 * 
 * @param q1 - 比較する数量1
 * @param q2 - 比較する数量2
 * @returns q1 > q2の場合1、q1 < q2の場合-1、等しい場合0、比較不可能な場合null
 */
export function compareQuantities(q1: Quantity, q2: Quantity): number | null {
  // 1. 各Quantityのamountを正規化
  const amount1 = normalizeAmount(q1.amount);
  const amount2 = normalizeAmount(q2.amount);
  
  // 2. 単位の互換性をチェック
  if (!areUnitsCompatible(q1.unit, q2.unit)) {
    return null;
  }
  
  // 3. 基本単位に変換
  const converted1 = convertToBaseUnit(amount1, q1.unit);
  const converted2 = convertToBaseUnit(amount2, q2.unit);
  
  if (!converted1 || !converted2) {
    return null;
  }
  
  // 4. 比較
  const diff = converted1.amount - converted2.amount;
  const epsilon = 1e-10;
  
  if (Math.abs(diff) < epsilon) {
    return 0; // 等しい
  } else if (diff > 0) {
    return 1; // q1 > q2
  } else {
    return -1; // q1 < q2
  }
}

/**
 * Quantity型をより人間に読みやすい形式にフォーマット
 * 
 * @param quantity - フォーマット対象の数量
 * @param precision - 小数点以下の精度（デフォルト: 2）
 * @returns フォーマットされた文字列
 */
export function formatQuantityForDisplay(quantity: Quantity, precision: number = 2): string {
  const amount = normalizeAmount(quantity.amount);
  
  // 整数の場合は小数点を表示しない
  if (Number.isInteger(amount)) {
    return `${amount}${quantity.unit === '-' ? '' : quantity.unit}`;
  }
  
  // 小数点の場合は指定された精度で表示
  const formattedAmount = amount.toFixed(precision).replace(/\.?0+$/, '');
  return `${formattedAmount}${quantity.unit === '-' ? '' : quantity.unit}`;
}

/**
 * Quantity型が有効（計算可能）かチェック
 * 
 * @param quantity - チェック対象の数量
 * @returns 有効な場合true
 */
export function isValidQuantity(quantity: Quantity): boolean {
  const amount = normalizeAmount(quantity.amount);
  const baseUnit = getBaseUnit(quantity.unit);
  
  // 負の値は無効とする（テストケースに合わせて修正）
  return !isNaN(amount) && amount >= 0 && baseUnit !== null;
}

/**
 * 利用可能な単位のリストを取得（基本単位別）
 * 
 * @returns 基本単位ごとにグループ化された単位リスト
 */
export function getUnitGroups(): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  
  for (const [unit, conversion] of Object.entries(UNIT_CONVERSIONS)) {
    const baseUnit = conversion.baseUnit;
    if (!groups[baseUnit]) {
      groups[baseUnit] = [];
    }
    groups[baseUnit].push(unit);
  }
  
  return groups;
}