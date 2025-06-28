import React from 'react';

// 週間サマリーデータの型定義
interface WeeklySummaryData {
  // 自炊回数
  cooking: number;
  // 外食回数
  eating_out: number;
  // 予算
  budget: number;
}

// 週間サマリーコンポーネントのProps型定義
interface WeeklySummaryProps {
  // 週の範囲表示用文字列（例: "6/28 - 7/4"）
  weekRange: string;
  // 週間サマリーデータ
  summaryData: WeeklySummaryData;
}

/**
 * 週間サマリーコンポーネント
 * 自炊・外食回数と予算を表示
 */
export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  weekRange,
  summaryData
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">📊</span>
        今週の予定 ({weekRange})
      </h3>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="mr-1">🏠</span>
            自炊: {summaryData.cooking}回
          </span>
          <span className="flex items-center">
            <span className="mr-1">🍽️</span>
            外食: {summaryData.eating_out}回
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">💰</span>
          予算: ¥{summaryData.budget.toLocaleString()}
        </div>
      </div>
    </div>
  );
};