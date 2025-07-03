import React, { useState, useEffect } from 'react';
import { type ShoppingListItem, type Quantity } from '../../types';
import { QuantityInput } from '../common/QuantityInput';
import { quantityToDisplay } from '../../utils/quantityDisplay';

interface ShoppingItemsListProps {
  pendingItems: ShoppingListItem[];
  completedItems: ShoppingListItem[];
  onToggleItem: (id: string) => Promise<void>;
  onDeleteCompleted: () => Promise<void>;
  onQuantityEdit: (itemId: string, newQuantity: Quantity) => void;
  editingQuantities: Record<string, Quantity>;
}

/**
 * 買い物リストアイテム表示コンポーネント
 * 未完了・完了済みアイテムの表示と操作機能を提供
 */
export const ShoppingItemsList: React.FC<ShoppingItemsListProps> = ({
  pendingItems,
  completedItems,
  onToggleItem,
  onDeleteCompleted,
  onQuantityEdit,
  editingQuantities
}) => {
  // 完了アイテムの表示状態（折りたたみ機能）
  const [showCompleted, setShowCompleted] = useState(false);
  
  // 全選択状態の管理
  const [selectAll, setSelectAll] = useState(false);

  // 全選択状態の自動更新
  useEffect(() => {
    const allItemsSelected = pendingItems.length > 0 && pendingItems.every(item => item.checked);
    setSelectAll(allItemsSelected);
  }, [pendingItems]);

  // 全選択・全解除処理
  const handleSelectAll = async () => {
    try {
      if (selectAll) {
        // 現在全選択状態の場合は全解除
        const checkedItems = pendingItems.filter(item => item.checked);
        for (const item of checkedItems) {
          if (item.id) await onToggleItem(item.id);
        }
      } else {
        // 現在未選択状態の場合は全選択
        const uncheckedItems = pendingItems.filter(item => !item.checked);
        for (const item of uncheckedItems) {
          if (item.id) await onToggleItem(item.id);
        }
      }
    } catch (err) {
      console.error('全選択に失敗しました:', err);
    }
  };

  return (
    <>
      {/* 未完了アイテム */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900">未完了アイテム</h3>
          <button
            onClick={handleSelectAll}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {selectAll ? '全解除' : '全選択'}
          </button>
        </div>

        <div className="space-y-3">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => item.id && onToggleItem(item.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="text-gray-900">
                    {item.name}
                    {item.quantity && (
                      <span className="text-gray-600 ml-1">({quantityToDisplay(item.quantity)})</span>
                    )}
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                item.added_from === 'auto' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {item.added_from === 'auto' ? '自動' : '手動'}
              </span>
            </div>
          ))}
          
          {pendingItems.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              未完了のアイテムはありません
            </div>
          )}
        </div>
      </div>

      {/* 完了アイテム（折りたたみ） */}
      {completedItems.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center text-gray-900 font-medium"
            >
              <span className="mr-2">
                {showCompleted ? '▼' : '▶'}
              </span>
              完了済み ({completedItems.length}件)
            </button>
            <button
              onClick={onDeleteCompleted}
              className="text-sm text-red-600 hover:text-red-500"
            >
              削除
            </button>
          </div>

          {showCompleted && (
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => item.id && onToggleItem(item.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-gray-700 line-through">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* 量調整エディット */}
                  <div className="flex items-center ml-3">
                    <QuantityInput
                      value={editingQuantities[item.id!] || item.quantity || { amount: '', unit: '' }}
                      onChange={(value) => onQuantityEdit(item.id!, value)}
                      placeholder="数量"
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};