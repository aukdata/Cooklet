import React from 'react';
import { type MealPlan } from '../../types';

// カレンダーコンポーネントのProps型定義
interface MealPlanCalendarProps {
  // 表示する週の日付配列（7日分）
  weekDates: Date[];
  // 選択中の日付
  selectedDate: Date;
  // 日付選択時のハンドラー
  onDateSelect: (date: Date) => void;
  // 指定日の献立一覧を取得する関数
  getMealPlansForDate: (date: Date) => MealPlan[];
}

/**
 * 献立カレンダーコンポーネント
 * 週間の日付を表示し、各日の献立数を視覚的に表示
 */
export const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  weekDates,
  selectedDate,
  onDateSelect,
  getMealPlansForDate
}) => {
  const today = new Date();

  // 日付が今日かどうかチェック
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      {/* カレンダービュー */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const dayMeals = getMealPlansForDate(date);
          const mealCount = dayMeals.length;
          const isSelected = date.toDateString() === selectedDate.toDateString();
          
          // 曜日を取得
          const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
          
          return (
            <button
              key={date.toDateString()}
              onClick={() => onDateSelect(date)}
              className={`p-2 text-center rounded border transition-colors ${
                isSelected 
                  ? 'bg-indigo-100 border-indigo-300' 
                  : 'border-gray-200 hover:bg-gray-50'
              } ${isToday(date) ? 'ring-2 ring-blue-300' : ''}`}
            >
              <div className="text-xs text-gray-500 mb-1">{dayOfWeek}</div>
              <div className={`font-medium ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
              <div className="flex justify-center mt-1">
                {mealCount > 0 ? (
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};