// 食材の単位一覧 - アプリ全体で使用する共通定数

export const FOOD_UNITS = [
  // 重量系
  'g',
  'kg',
  
  // 容量系
  'mL',
  'L',
  'cc',
  '合',
  
  // 個数系
  '個',
  '本',
  '枚',
  '袋',
  '缶',
  'パック',
  '箱',
  '束',
  '片',
 
  // 料理系
  '人前',
  'カップ',
  '大さじ',
  '小さじ',
  
  // その他
  '適量',
  'お好み',
  '-',  // 単位なし
] as const;

export type FoodUnit = typeof FOOD_UNITS[number];

// 数値と単位を分離する関数
export const parseQuantity = (quantity: string): { amount: string; unit: FoodUnit } => {
  if (!quantity) return { amount: '', unit: '-' };
  
  // 数値部分と単位部分を分離
  const match = quantity.match(/^(\d*\.?\d*)\s*(.*)$/);
  if (match) {
    const [, amount, unit] = match;
    return {
      amount: amount || '',
      unit: (FOOD_UNITS.includes(unit as FoodUnit) ? unit : '') as FoodUnit
    };
  }
  
  return { amount: '', unit: quantity as FoodUnit };
};

// 数値と単位を結合する関数
export const formatQuantity = (amount: string, unit: FoodUnit): string => {
  if (!amount && !unit) return '';
  if (!amount) return unit;
  if (!unit) return amount;
  return `${amount}${unit}`;
};