import React from 'react';

// 週間ナビゲーションコンポーネントのProps型定義
interface WeeklyNavigationProps {
  // 前週に移動するハンドラー
  onPreviousWeek: () => void;
  // 次週に移動するハンドラー
  onNextWeek: () => void;
  // 今日を基準とした週に戻るハンドラー
  onThisWeek: () => void;
  // 現在表示している週が今日を含む週かどうか
  isCurrentWeek: boolean;
}

/**
 * 週間ナビゲーションコンポーネント
 * 前週・次週・今日ボタンによる週間移動機能を提供
 */
export const WeeklyNavigation: React.FC<WeeklyNavigationProps> = ({
  onPreviousWeek,
  onNextWeek,
  onThisWeek,
  isCurrentWeek
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={onPreviousWeek}
        className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <span className="mr-1">‹</span>
        前週
      </button>
      
      <div className="flex items-center space-x-2">
        {!isCurrentWeek && (
          <button
            onClick={onThisWeek}
            className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            今日
          </button>
        )}
        <span className="text-sm text-gray-500">
          {isCurrentWeek ? '今日' : ''}
        </span>
      </div>
      
      <button
        onClick={onNextWeek}
        className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        次週
        <span className="ml-1">›</span>
      </button>
    </div>
  );
};