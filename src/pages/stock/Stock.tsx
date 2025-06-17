import React, { useState } from 'react';
import { useStockItems, type StockItem } from '../../hooks/useStockItems';
import { StockDialog } from '../../components/dialogs/StockDialog';
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog';
import { EditButton, AddButton } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast.tsx';

// 在庫管理画面コンポーネント - issue #3対応
export const Stock: React.FC = () => {
  // 在庫ダイアログの表示状態
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | undefined>();
  
  // 削除確認ダイアログの状態
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingStock, setDeletingStock] = useState<StockItem | undefined>();

  // 在庫データの取得と操作
  const { 
    stockItems, 
    loading, 
    error, 
    addStockItem,
    updateStockItem,
    deleteStockItem
  } = useStockItems();

  const { showError } = useToast();

  // 賞味期限が間近かどうかを判定（3日以内）
  const isExpiringSoon = (bestBefore?: string) => {
    if (!bestBefore) return false;
    const today = new Date();
    const expiry = new Date(bestBefore);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  // 賞味期限が切れているかどうかを判定
  const isExpired = (bestBefore?: string) => {
    if (!bestBefore) return false;
    const today = new Date();
    const expiry = new Date(bestBefore);
    return expiry < today;
  };

  // 在庫追加ハンドラー
  const handleAddStock = () => {
    setEditingStock(undefined);
    setShowStockDialog(true);
  };

  // 在庫編集ハンドラー
  const handleEditStock = (stock: StockItem) => {
    setEditingStock(stock);
    setShowStockDialog(true);
  };

  // 在庫削除ハンドラー
  const handleDeleteStock = (stock: StockItem) => {
    setDeletingStock(stock);
    setShowDeleteDialog(true);
  };

  // 在庫保存ハンドラー
  const handleSaveStock = async (stockData: StockItem) => {
    try {
      if (editingStock?.id) {
        // 編集の場合
        await updateStockItem(editingStock.id, stockData);
      } else {
        // 新規追加の場合
        await addStockItem(stockData);
      }
      setShowStockDialog(false);
      setEditingStock(undefined);
    } catch (err) {
      console.error('在庫の保存に失敗しました:', err);
      showError('在庫の保存に失敗しました');
    }
  };

  // 在庫削除確認ハンドラー
  const handleConfirmDelete = async () => {
    if (!deletingStock?.id) return;
    
    try {
      await deleteStockItem(deletingStock.id);
      setShowDeleteDialog(false);
      setDeletingStock(undefined);
    } catch (err) {
      console.error('在庫の削除に失敗しました:', err);
      showError('在庫の削除に失敗しました');
    }
  };

  // 削除キャンセルハンドラー
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingStock(undefined);
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // エラー状態の表示
  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📦</span>
            在庫管理
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            在庫: {stockItems.length}件
          </p>
        </div>
        <AddButton onClick={handleAddStock}>
          + 在庫追加
        </AddButton>
      </div>

      {/* 在庫一覧 */}
      <div className="space-y-3">
        {stockItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            在庫がありません。在庫を追加してください。
          </div>
        ) : (
          stockItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-lg border shadow-sm ${
                item.best_before && isExpired(item.best_before)
                  ? 'border-red-300 bg-red-50'
                  : item.best_before && isExpiringSoon(item.best_before)
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* 食材名 */}
                  <div className="flex items-center mb-2">
                    <h3 className="font-medium text-gray-900">
                      {item.name || '不明'}
                    </h3>
                  </div>

                  {/* 数量・保存場所 */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <span className="mr-1">📊</span>
                      数量: {item.quantity}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">🏠</span>
                      保存場所: {item.storage_location || '不明'}
                    </div>

                    {/* 賞味期限 */}
                    {item.best_before && (
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        賞味期限: {new Date(item.best_before).toLocaleDateString('ja-JP')}
                        {isExpired(item.best_before) && (
                          <span className="ml-2 text-red-600 text-xs font-medium">期限切れ</span>
                        )}
                        {isExpiringSoon(item.best_before) && !isExpired(item.best_before) && (
                          <span className="ml-2 text-yellow-600 text-xs font-medium">期限間近</span>
                        )}
                      </div>
                    )}

                    {/* 作り置きフラグ */}
                    {item.is_homemade && (
                      <div className="flex items-center">
                        <span className="mr-1">🍱</span>
                        <span className="text-orange-600 text-xs font-medium">作り置き</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex space-x-2">
                  <EditButton onClick={() => handleEditStock(item)} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 在庫編集ダイアログ */}
      <StockDialog
        isOpen={showStockDialog}
        onClose={() => {
          setShowStockDialog(false);
          setEditingStock(undefined);
        }}
        onSave={handleSaveStock}
        onDelete={editingStock?.id ? () => {
          setShowStockDialog(false);
          if (editingStock) {
            handleDeleteStock(editingStock);
          }
        } : undefined}
        initialData={editingStock}
        isEditing={!!editingStock?.id}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="確認"
        message="を在庫から削除します"
        itemName={deletingStock?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};