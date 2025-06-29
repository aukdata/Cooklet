import React from 'react';

// 献立提案コンポーネントのProps型定義
interface MealPlanSuggestionProps {
  // 今日の献立提案ハンドラー
  onTodayMealSuggestion: () => void;
  // 週間献立提案ハンドラー
  onWeeklyMealSuggestion: () => void;
  // 週間サマリーデータ
  weeklySummary: {
    // 自炊回数
    cooking: number;
    // 外食回数
    eating_out: number;
    // 予算
    budget: number;
  };
  // 週の範囲表示用文字列
  weekRange: string;
}

/**
 * 献立提案コンポーネント
 * 献立自動生成機能と週間サマリー情報を提供
 */
export const MealPlanSuggestion: React.FC<MealPlanSuggestionProps> = ({
  onTodayMealSuggestion,
  onWeeklyMealSuggestion,
  weeklySummary,
  weekRange
}) => {
  return (
    <div className="space-y-4">
      {/* 週間サマリー */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          今週の予定 ({weekRange})
        </h3>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="mr-1">🏠</span>
              自炊: {weeklySummary.cooking}回
            </span>
            <span className="flex items-center">
              <span className="mr-1">🍽️</span>
              外食: {weeklySummary.eating_out}回
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">💰</span>
            予算: ¥{weeklySummary.budget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 献立の提案ボタン */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          献立の提案
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            在庫の食材や栄養バランスを考慮した献立を提案します
          </p>
          <div className="flex gap-2">
            <button 
              onClick={onTodayMealSuggestion}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              💡 今日の献立を提案
            </button>
            <button 
              onClick={onWeeklyMealSuggestion}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              📅 週間献立を提案
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};