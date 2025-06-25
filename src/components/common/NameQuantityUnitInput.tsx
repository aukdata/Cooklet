// 名前・数量・単位の入力コンポーネント - レシート読み取り結果などで使用

import { FOOD_UNITS, type FoodUnit } from '../../constants/units';

export interface NameQuantityUnitInputProps {
  /** 名前の値 */
  name: string;
  /** 数量の値 */
  quantity: string;
  /** 単位の値 */
  unit: FoodUnit;
  /** 名前変更時のコールバック */
  onNameChange: (name: string) => void;
  /** 数量変更時のコールバック */
  onQuantityChange: (quantity: string) => void;
  /** 単位変更時のコールバック */
  onUnitChange: (unit: FoodUnit) => void;
  /** 無効化状態 */
  disabled?: boolean;
  /** 各フィールドのプレースホルダー */
  placeholders?: {
    name?: string;
    quantity?: string;
    unit?: string;
  };
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 名前・数量・単位の入力コンポーネント
 * 
 * レシート読み取り結果の編集などで使用する共通コンポーネント：
 * - 名前入力フィールド
 * - 数量入力フィールド  
 * - 単位選択ドロップダウン（FOOD_UNITSから選択）
 */
export const NameQuantityUnitInput = ({
  name,
  quantity,
  unit,
  onNameChange,
  onQuantityChange,
  onUnitChange,
  disabled = false,
  placeholders = {},
  className = ''
}: NameQuantityUnitInputProps) => {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {/* 名前入力 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={placeholders.name || '食材名'}
          disabled={disabled}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* 数量入力 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">数量</label>
        <input
          type="text"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          placeholder={placeholders.quantity || '数量'}
          disabled={disabled}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* 単位選択 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">単位</label>
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as FoodUnit)}
          disabled={disabled}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {FOOD_UNITS.map(unitOption => (
            <option key={unitOption} value={unitOption}>
              {unitOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};