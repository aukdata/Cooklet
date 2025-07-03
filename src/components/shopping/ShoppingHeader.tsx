import React from 'react';

interface ShoppingHeaderProps {
  stats: {
    uncompleted: number;
    completed: number;
  };
}

/**
 * 買い物リストページヘッダーコンポーネント
 * タイトルと統計情報を表示
 */
export const ShoppingHeader: React.FC<ShoppingHeaderProps> = ({ stats }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center">
          <span className="mr-2">🛒</span>
          買い物リスト
        </h2>
        <div className="text-sm text-gray-600 mt-1">
          未完了: {stats.uncompleted}件  完了: {stats.completed}件
        </div>
      </div>
    </div>
  );
};