import React, { useState } from 'react';
import { useStockItems } from '../../hooks/useStockItems';
import { type StockItem } from "../../types/index";
import { StockDialog } from '../../components/dialogs/StockDialog';
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog';
import { EditButton, AddButton } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast.tsx';
import { quantityToDisplay } from '../../utils/quantityDisplay';

// 在庫管理画面コンポーネント - issue #3対応
export const Stock: React.FC = () => {
  // 在庫ダイアログの表示状態
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | undefined>();
  
  // 削除確認ダイアログの状態
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingStock, setDeletingStock] = useState<StockItem | undefined>();
  
  // 検索・フィルターの状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('全て');

  // 在庫データの取得と操作
  const { 
    stockItems, 
    loading, 
    error, 
    addStockItem,
    updateStockItem,
    deleteStockItem
  } = useStockItems();

  const { showError, showSuccess } = useToast();

  // 賞味期限が間近かどうかを判定（3日以内）
  const isExpiringSoon = (best_before?: string) => {
    if (!best_before) return false;
    const today = new Date();
    const expiry = new Date(best_before);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  // 賞味期限が切れているかどうかを判定
  const isExpired = (best_before?: string) => {
    if (!best_before) return false;
    const today = new Date();
    const expiry = new Date(best_before);
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
    console.log('🗑️ [Stock] handleConfirmDelete called for:', deletingStock?.name);
    
    if (!deletingStock?.id) {
      console.warn('⚠️ [Stock] No deletingStock.id, returning early');
      return;
    }
    
    // 期限切れ一括削除の場合
    if (deletingStock.id === 'bulk-delete') {
      await handleConfirmExpiredDelete();
      return;
    }
    
    try {
      console.log('🚀 [Stock] Calling deleteStockItem...');
      await deleteStockItem(deletingStock.id);
      console.log('✅ [Stock] deleteStockItem completed, clearing dialog state...');
      setShowDeleteDialog(false);
      setDeletingStock(undefined);
      console.log('✅ [Stock] handleConfirmDelete completed successfully');
    } catch (err) {
      console.error('❌ [Stock] handleConfirmDelete failed:', err);
      console.error('在庫の削除に失敗しました:', err);
      showError('在庫の削除に失敗しました');
    }
  };

  // 削除キャンセルハンドラー
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingStock(undefined);
  };

  // 期限切れ食材の一括削除ハンドラー
  const handleDeleteExpiredItems = () => {
    const expiredItems = stockItems.filter(item => isExpired(item.best_before));
    if (expiredItems.length === 0) {
      showError('期限切れの食材がありません');
      return;
    }
    
    // 複数削除用のダイアログ表示
    setDeletingStock({
      id: 'bulk-delete',
      name: `期限切れ食材 (${expiredItems.length}件)`,
      quantity: { amount: '', unit: '' },
      user_id: '',
      storage_location: '',
      is_homemade: false,
      created_at: '',
      updated_at: ''
    });
    setShowDeleteDialog(true);
  };

  // 期限切れ食材の一括削除確認ハンドラー
  const handleConfirmExpiredDelete = async () => {
    try {
      const expiredItems = stockItems.filter(item => isExpired(item.best_before));
      
      // 期限切れ食材を順次削除
      for (const item of expiredItems) {
        await deleteStockItem(item.id);
      }
      
      setShowDeleteDialog(false);
      setDeletingStock(undefined);
      
      // 成功メッセージ
      showSuccess(`期限切れ食材 ${expiredItems.length}件を削除しました`);
    } catch (err) {
      console.error('期限切れ食材の削除に失敗しました:', err);
      showError('期限切れ食材の削除に失敗しました');
    }
  };

  // 検索フィルタリング
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === '全て' || item.storage_location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  // 全保存場所を取得
  const allLocations = ['全て', ...Array.from(new Set(stockItems.map(item => item.storage_location).filter(Boolean)))];

  // 期限切れ食材の件数を計算
  const expiredItemsCount = stockItems.filter(item => isExpired(item.best_before)).length;

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
          <div className="text-sm text-gray-600 mt-1">
            在庫: {stockItems.length}件
            {expiredItemsCount > 0 && (
              <span className="ml-2 text-red-600">期限切れ: {expiredItemsCount}件</span>
            )}
            {loading && <span className="ml-2">読み込み中...</span>}
            {error && <span className="ml-2 text-red-500">エラー: {error}</span>}
          </div>
        </div>
        <div className="flex space-x-2">
          {expiredItemsCount > 0 && (
            <button
              onClick={handleDeleteExpiredItems}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              🗑️ 期限切れ削除 ({expiredItemsCount})
            </button>
          )}
          <AddButton onClick={handleAddStock}>
            + 在庫追加
          </AddButton>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">絞込</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">🏠 保存場所:</span>
            {allLocations.map(location => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location || '全て')}
                className={`text-xs px-2 py-1 rounded ${
                  selectedLocation === location 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 在庫一覧 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        {filteredStockItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {stockItems.length === 0 ? '在庫がありません。在庫を追加してください。' : '検索結果がありません'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
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
                      数量: {quantityToDisplay(item.quantity)}
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
            ))}
          </div>
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
          console.log('🗑️ [Stock] StockDialog onDelete triggered for:', editingStock?.name);
          
          setShowStockDialog(false);
          if (editingStock) {
            console.log('🚀 [Stock] Setting deletingStock and showing confirm dialog...');
            setDeletingStock(editingStock);
            setShowDeleteDialog(true);
          } else {
            console.warn('⚠️ [Stock] No editingStock in onDelete');
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