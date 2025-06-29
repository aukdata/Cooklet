import React, { useState, useEffect } from 'react';
import { FOOD_UNITS, type FoodUnit, parseQuantity, formatQuantity } from '../../constants/units';
import { type Quantity } from '../../types';

interface QuantityInputProps {
  value: Quantity;
  onChange: (value: Quantity) => void;
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
  // 入力中の数値を一時的に保持
  const [tempAmount, setTempAmount] = useState(value.amount);
  const [isEditing, setIsEditing] = useState(false);
  
  // valueが外部から変更されたときにtempAmountを更新
  useEffect(() => {
    if (!isEditing) {
      setTempAmount(value.amount);
    }
  }, [value.amount, isEditing]);

  const handleAmountChange = (newAmount: string) => {
    setTempAmount(newAmount);
  };
  
  const handleAmountBlur = () => {
    // 空の値の場合は修正しない
    if (tempAmount.trim() === '') {
      onChange({ amount: '', unit: value.unit });
    } else {
      const formattedQuantityString = formatQuantity(tempAmount.trim(), value.unit as FoodUnit);
      const { amount, unit } = parseQuantity(formattedQuantityString);
      onChange({ amount, unit });
    }
    setIsEditing(false);
  };
  
  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 空の値の場合は修正しない
      if (tempAmount.trim() === '') {
        onChange({ amount: '', unit: value.unit });
      } else {
        const formattedQuantityString = formatQuantity(tempAmount.trim(), value.unit as FoodUnit);
        const { amount, unit } = parseQuantity(formattedQuantityString);
        onChange({ amount, unit });
      }
      setIsEditing(false);
      e.currentTarget.blur();
    }
  };
  
  const handleAmountFocus = () => {
    setIsEditing(true);
  };

  const handleUnitChange = (newUnit: FoodUnit) => {
    const currentAmount = isEditing ? tempAmount.trim() : value.amount;
    // 空の値の場合は単位のみ設定しない
    if (currentAmount === '') {
      onChange({ amount: '', unit: newUnit });
    } else {
      const formattedQuantityString = formatQuantity(currentAmount, newUnit);
      const { amount, unit } = parseQuantity(formattedQuantityString);
      onChange({ amount, unit });
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {/* 数値入力 */}
      <input
        type="text"
        value={isEditing ? tempAmount : value.amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        onBlur={handleAmountBlur}
        onFocus={handleAmountFocus}
        onKeyDown={handleAmountKeyDown}
        placeholder="数量"
        disabled={disabled}
        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 min-w-0"
      />
      
      {/* 単位選択 */}
      <select
        value={value.unit}
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