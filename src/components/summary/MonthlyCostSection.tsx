import React from 'react';

interface MonthlySummary {
  /** 合計支出 */
  total: number;
  /** 自炊関連統計 */
  homeCooking: {
    total: number;
    count: number;
    average: number;
  };
  /** 外食関連統計 */
  eatingOut: {
    total: number;
    count: number;
    average: number;
  };
  /** 1日平均支出 */
  dailyAverage: number;
  /** 1食平均支出 */
  mealAverage: number;
}

interface MonthlyCostSectionProps {
  /** 月間サマリーデータ */
  monthlySummary: MonthlySummary;
  /** 現在の月（1-12） */
  currentMonth: number;
  /** コストデータのローディング状態 */
  loading: boolean;
  /** コスト追加ボタンクリック処理 */
  onAddCost: () => void;
}

/**
 * 月間コストセクションコンポーネント
 * 
 * サマリー画面で今月の出費情報を表示する専用コンポーネント：
 * - 自炊・外食の金額と回数表示
 * - 合計支出・1日平均・1食平均の表示
 * - コスト追加ボタン
 * - 金額の3桁区切り表示
 */
export const MonthlyCostSection: React.FC<MonthlyCostSectionProps> = ({
  monthlySummary,
  currentMonth,
  loading,
  onAddCost
}) => {
  // 金額を3桁区切りでフォーマットする関数
  const formatCurrency = (amount: number): string => {
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900 flex items-center">
          <span className="mr-2">💰</span>
          今月の出費 ({currentMonth}月)
          {loading && <span className="ml-2 text-sm text-gray-500">読み込み中...</span>}
        </h3>
        <button
          onClick={onAddCost}
          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md"
        >
          + 支出追加
        </button>
      </div>

      <div className="space-y-3">
        {/* 自炊統計 */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="flex items-center">
            <span className="mr-2">🏠</span>
            <span className="text-gray-700">自炊:</span>
            <span className="ml-2 font-medium">{formatCurrency(monthlySummary.homeCooking.total)}</span>
            <span className="ml-1 text-sm text-gray-500">({monthlySummary.homeCooking.count}回)</span>
          </div>
          {monthlySummary.homeCooking.count > 0 && (
            <div className="text-sm text-gray-600">
              平均: {formatCurrency(monthlySummary.homeCooking.average)}
            </div>
          )}
        </div>

        {/* 外食統計 */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="flex items-center">
            <span className="mr-2">🍽️</span>
            <span className="text-gray-700">外食:</span>
            <span className="ml-2 font-medium">{formatCurrency(monthlySummary.eatingOut.total)}</span>
            <span className="ml-1 text-sm text-gray-500">({monthlySummary.eatingOut.count}回)</span>
          </div>
          {monthlySummary.eatingOut.count > 0 && (
            <div className="text-sm text-gray-600">
              平均: {formatCurrency(monthlySummary.eatingOut.average)}
            </div>
          )}
        </div>

        {/* 合計統計 */}
        <div className="pt-2 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">📊 合計:</span>
            <span className="font-bold text-lg">{formatCurrency(monthlySummary.total)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>📈 1日平均:</span>
            <span>{formatCurrency(monthlySummary.dailyAverage)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>🍽️ 1食平均:</span>
            <span>{formatCurrency(monthlySummary.mealAverage)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};