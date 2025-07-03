import React from 'react';

interface ShoppingManualAddProps {
  onAddClick: () => void;
}

/**
 * 手動アイテム追加セクションコンポーネント
 * 新規買い物アイテムの手動追加機能を提供
 */
export const ShoppingManualAdd: React.FC<ShoppingManualAddProps> = ({ onAddClick }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">🛒</span>
        手動で追加
      </h3>
      <button
        onClick={onAddClick}
        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-indigo-700 flex items-center justify-center"
      >
        <span className="mr-2">➕</span>
        新規アイテムを追加
      </button>
    </div>
  );
};