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
  '杯',
  
  // その他
  '適量',
  'お好み',
  '-',  // 単位なし
] as const;

export type FoodUnit = typeof FOOD_UNITS[number];

// 数値と単位を分離する関数（分数や文字列にも対応）
export const parseQuantity = (quantity: string): { amount: string; unit: FoodUnit } => {
  if (!quantity) return { amount: '', unit: '-' };
  
  // 単位のマッチング順序を長い順でソート（例：「大さじ」が「大」より優先）
  const sortedUnits = [...FOOD_UNITS].sort((a, b) => b.length - a.length);
  
  // 各単位について、文字列の末尾にマッチするかチェック
  for (const unit of sortedUnits) {
    if (unit === '-') continue; // 単位なしは後で処理
    
    if (quantity.endsWith(unit)) {
      const amount = quantity.slice(0, -unit.length).trim();
      return {
        amount: amount || '',
        unit: unit
      };
    }
  }
  
  // 単位が見つからない場合
  // 1. 全て数値・分数・「適量」系の場合は amount として扱う
  if (/^[\d/.]+$/.test(quantity) || ['適量', 'お好み', '少々', 'ひとつまみ', 'ひとかけ'].includes(quantity)) {
    return { amount: quantity, unit: '-' };
  }
  
  // 2. その他の場合も amount として扱う（自由入力を許可）
  return { amount: quantity, unit: '-' };
};

// 数値と単位を結合する関数
export const formatQuantity = (amount: string, unit: FoodUnit): string => {
  if (!amount && !unit) return '';
  if (!amount) return unit;
  if (!unit) return amount;
  return `${amount}${unit}`;
};