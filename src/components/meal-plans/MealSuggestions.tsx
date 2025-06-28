import React from 'react';

// 献立提案コンポーネントのProps型定義
interface MealSuggestionsProps {
  // 今日の献立提案ハンドラー
  onTodayMealSuggestion: () => void;
  // 週間献立提案ハンドラー
  onWeeklyMealSuggestion: () => void;
}

/**
 * 献立提案コンポーネント
 * AI献立生成ボタン群を表示
 */
export const MealSuggestions: React.FC<MealSuggestionsProps> = ({
  onTodayMealSuggestion,
  onWeeklyMealSuggestion
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
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
  );
};