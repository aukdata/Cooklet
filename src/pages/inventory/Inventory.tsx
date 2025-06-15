import React, { useState } from 'react';
import { useStockItems, type StockItem } from '../../hooks';
import { AddInventoryModal } from './AddInventoryModal';
import { StockDialog } from '../../components/dialogs';

export const Inventory: React.FC = () => {
  const { stockItems, loading, error, addStockItem, updateStockItem, deleteStockItem } = useStockItems();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  const isExpiringSoon = (bestBefore: string | undefined) => {
    if (!bestBefore) return false;
    const today = new Date();
    const expiry = new Date(bestBefore);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = (bestBefore: string | undefined) => {
    if (!bestBefore) return false;
    const today = new Date();
    const expiry = new Date(bestBefore);
    return expiry < today;
  };

  // 在庫編集ボタンクリック処理
  const handleEditStock = (item: StockItem) => {
    setEditingStock(item);
    setShowEditDialog(true);
  };

  // 在庫保存処理
  const handleSaveStock = async (stockData: StockItem) => {
    try {
      if (editingStock?.id) {
        // 更新
        await updateStockItem(editingStock.id, stockData);
      } else {
        // 新規追加
        await addStockItem(stockData);
      }
      setShowEditDialog(false);
      setEditingStock(null);
    } catch (err) {
      console.error('在庫の保存に失敗しました:', err);
      alert('保存に失敗しました');
    }
  };

  // 在庫削除処理
  const handleDeleteStock = async () => {
    if (editingStock?.id) {
      try {
        await deleteStockItem(editingStock.id);
        setShowEditDialog(false);
        setEditingStock(null);
      } catch (err) {
        console.error('在庫の削除に失敗しました:', err);
        alert('削除に失敗しました');
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">在庫管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          在庫追加
        </button>
      </div>

      {stockItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          まだ在庫が登録されていません
        </div>
      ) : (
        <div className="space-y-3">
          {stockItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-4 shadow-sm border ${
                isExpired(item.best_before) 
                  ? 'border-red-300 bg-red-50' 
                  : isExpiringSoon(item.best_before) 
                  ? 'border-yellow-300 bg-yellow-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.is_homemade && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        作り置き
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>数量: {item.quantity}</div>
                    {item.storage_location && (
                      <div>保存場所: {item.storage_location}</div>
                    )}
                    {item.best_before && (
                      <div className={
                        isExpired(item.best_before) 
                          ? 'text-red-600 font-medium' 
                          : isExpiringSoon(item.best_before) 
                          ? 'text-yellow-600 font-medium' 
                          : ''
                      }>
                        賞味期限: {new Date(item.best_before).toLocaleDateString('ja-JP')}
                        {isExpired(item.best_before) && ' (期限切れ)'}
                        {isExpiringSoon(item.best_before) && !isExpired(item.best_before) && ' (期限間近)'}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleEditStock(item)}
                  className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 hover:bg-gray-100 rounded"
                >
                  編集
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddInventoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
          }}
          addStockItem={addStockItem}
        />
      )}

      {showEditDialog && (
        <StockDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingStock(null);
          }}
          onSave={handleSaveStock}
          onDelete={handleDeleteStock}
          initialData={editingStock || undefined}
          isEditing={!!editingStock?.id}
        />
      )}
    </div>
  );
};