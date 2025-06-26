import { useDataHook } from './useDataHook';
import type { StockItem } from '../types/index';

// useStockItemsフック - 汎用データフックを使用した在庫管理
export const useStockItems = () => {
  const {
    data: stockItems,
    loading,
    error,
    addData,
    updateData,
    deleteData,
    refetch
  } = useDataHook<StockItem>({
    tableName: 'stock_items',
    orderBy: [
      { column: 'best_before', ascending: true },
      { column: 'created_at', ascending: false }
    ]
  }, {
    fetch: '在庫データの取得に失敗しました',
    add: '在庫の追加に失敗しました',
    update: '在庫の更新に失敗しました',
    delete: '在庫の削除に失敗しました'
  });

  // 在庫を追加
  const addStockItem = async (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    return await addData(stockItem);
  };

  // 在庫を更新
  const updateStockItem = async (id: string, updates: Partial<Omit<StockItem, 'id' | 'user_id' | 'created_at'>>) => {
    return await updateData(id, updates);
  };

  // 在庫を削除
  const deleteStockItem = async (id: string) => {
    console.log('🗑️ [useStockItems] deleteStockItem called with id:', id);
    
    try {
      const result = await deleteData(id);
      console.log('✅ [useStockItems] deleteStockItem success:', result);
      return result;
    } catch (error) {
      console.error('❌ [useStockItems] deleteStockItem failed:', error);
      throw error;
    }
  };

  // 在庫を追加または更新（既存在庫があれば更新、なければ追加）
  const saveStockItem = async (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    if (stockItem.id) {
      return await updateStockItem(stockItem.id, stockItem);
    } else {
      return await addStockItem(stockItem);
    }
  };

  // 期限切れの在庫を取得
  const getExpiredItems = () => {
    const today = new Date().toISOString().split('T')[0];
    return stockItems.filter(item => 
      item.best_before && item.best_before < today
    );
  };

  // 賞味期限が近い在庫を取得（指定日数以内）
  const getExpiringItems = (days: number = 1) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    return stockItems.filter(item => 
      item.best_before && 
      item.best_before >= today && 
      item.best_before <= targetDateStr
    );
  };

  // 保存場所別の在庫を取得
  const getItemsByLocation = (location: string) => {
    return stockItems.filter(item => item.storage_location === location);
  };

  // 在庫名での検索
  const searchItems = (query: string) => {
    return stockItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    stockItems,
    loading,
    error,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    saveStockItem,
    getExpiredItems,
    getExpiringItems,
    getItemsByLocation,
    searchItems,
    refetch
  };
};