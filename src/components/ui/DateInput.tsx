// 日付入力コンポーネント - クイック設定ボタン付きの統一日付入力

import { type ChangeEvent } from 'react';

export interface DateInputProps {
  /** 日付の値（YYYY-MM-DD形式） */
  value: string;
  /** 日付変更時のコールバック */
  onChange: (value: string) => void;
  /** クイック設定ボタンの表示 */
  showQuickButtons?: boolean;
  /** 無効化状態 */
  disabled?: boolean;
  /** 最小日付 */
  min?: string;
  /** 最大日付 */
  max?: string;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 日付入力コンポーネント
 * 
 * 統一された日付入力フィールドを提供：
 * - 日付入力フィールド
 * - クイック設定ボタン（今日、1週間後等）
 * - キーボードアクセシビリティ対応
 */
export const DateInput = ({
  value,
  onChange,
  showQuickButtons = true,
  disabled = false,
  min,
  max,
  className = ''
}: DateInputProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // 現在の日付を取得
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 1週間後の日付を取得
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);
  const oneWeekLaterStr = oneWeekLater.toISOString().split('T')[0];

  // 1ヶ月後の日付を取得
  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(today.getMonth() + 1);
  const oneMonthLaterStr = oneMonthLater.toISOString().split('T')[0];

  // クイック設定ボタンのデータ
  const quickButtons = [
    { label: '今日', value: todayStr },
    { label: '1週間', value: oneWeekLaterStr },
    { label: '1ヶ月', value: oneMonthLaterStr }
  ];

  const handleQuickSet = (dateValue: string) => {
    onChange(dateValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 日付入力フィールド */}
      <div className="flex gap-2">
        <input
          type="date"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {/* クイック設定ボタン */}
        {showQuickButtons && !disabled && (
          <div className="flex gap-1">
            {quickButtons.map((button) => (
              <button
                key={button.label}
                type="button"
                onClick={() => handleQuickSet(button.value)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
                title={`${button.label}に設定 (${button.value})`}
              >
                {button.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 選択された日付の説明 */}
      {value && (
        <div className="text-xs text-gray-500">
          選択日: {formatDate(value)}
        </div>
      )}
    </div>
  );
};

/**
 * 日付を日本語形式でフォーマット
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    };
    return date.toLocaleDateString('ja-JP', options);
  } catch {
    return dateStr;
  }
};

// よく使用される日付操作のユーティリティ

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 指定日数後の日付を YYYY-MM-DD 形式で取得
 */
export const getDateAfterDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * 日付の差分（日数）を計算
 */
export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};