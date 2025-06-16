import React from 'react';
import { FOOD_UNITS, type FoodUnit, parseQuantity, formatQuantity } from '../../constants/units';

interface QuantityInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// 数値と単位を分離して入力できるコンポーネント
export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  className = "",
  disabled = false
}) => {
  const { amount, unit } = parseQuantity(value);

  const handleAmountChange = (newAmount: string) => {
    const formattedValue = formatQuantity(newAmount, unit);
    onChange(formattedValue);
  };

  const handleUnitChange = (newUnit: FoodUnit) => {
    const formattedValue = formatQuantity(amount, newUnit);
    onChange(formattedValue);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {/* 数値入力 */}
      <input
        type="text"
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder="数量"
        disabled={disabled}
        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 min-w-0"
      />
      
      {/* 単位選択 */}
      <select
        value={unit}
        onChange={(e) => handleUnitChange(e.target.value as FoodUnit)}
        disabled={disabled}
        className="text-sm border border-gray-300 rounded px-1 py-1 bg-white"
      >
        {FOOD_UNITS.map((unitOption) => (
          <option key={unitOption} value={unitOption}>
            {unitOption || '単位なし'}
          </option>
        ))}
      </select>
    </div>
  );
};