import React from 'react';

// 週間ナビゲーションコンポーネントのProps型定義
interface WeeklyNavigationProps {
  // 現在表示している週の開始日
  currentWeekStart: Date;
  // 週の範囲表示用文字列（例: "6/1 - 6/7"）
  weekRange: string;
  // 前週に移動するハンドラー
  onPreviousWeek: () => void;
  // 次週に移動するハンドラー
  onNextWeek: () => void;
  // 今日を基準とした週に戻るハンドラー
  onThisWeek: () => void;
  // 現在表示している週が今日を含む週かどうか
  isCurrentWeek: boolean;
  // ローディング状態
  loading?: boolean;
  // エラーメッセージ
  error?: string | null;
}

/**
 * 週間ナビゲーションコンポーネント
 * 献立カレンダーの週間移動機能を提供
 */
export const WeeklyNavigation: React.FC<WeeklyNavigationProps> = ({
  currentWeekStart: _currentWeekStart,
  weekRange,
  onPreviousWeek,
  onNextWeek,
  onThisWeek,
  isCurrentWeek,
  loading = false,
  error = null
}) => {
  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📅</span>
            献立カレンダー
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            {weekRange}
            {loading && <span className="ml-2">読み込み中...</span>}
            {error && <span className="ml-2 text-red-500">エラー: {error}</span>}
          </div>
        </div>
      </div>

      {/* 週間ナビゲーション */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={onPreviousWeek}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
        >
          <span className="mr-1">‹</span>
          前週
        </button>
        
        <div className="flex items-center justify-center flex-1 space-x-2">
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
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
        >
          次週
          <span className="ml-1">›</span>
        </button>
      </div>
    </div>
  );
};