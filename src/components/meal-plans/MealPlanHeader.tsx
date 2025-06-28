import React from 'react';

// ヘッダーコンポーネントのProps型定義
interface MealPlanHeaderProps {
  // 週の範囲表示用文字列（例: "6/28 - 7/4"）
  weekRange: string;
  // ローディング状態
  loading?: boolean;
  // エラーメッセージ
  error?: string | null;
}

/**
 * 献立計画ページのヘッダーコンポーネント
 * タイトル、週範囲、ローディング・エラー状態を表示
 */
export const MealPlanHeader: React.FC<MealPlanHeaderProps> = ({
  weekRange,
  loading = false,
  error = null
}) => {
  return (
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
  );
};