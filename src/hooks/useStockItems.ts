import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStockRepository } from '../contexts/RepositoryContext';
import { useTabRefresh } from './useTabRefresh';
import { DatabaseError } from '../repositories/errors';
import type { StockItem } from '../types/index';

/**
 * 在庫管理機能を提供するカスタムフック（Repository抽象化層対応）
 * 
 * Repository層を使用して在庫データのCRUD操作と便利メソッドを提供します。
 * テスト時のモック化に対応し、型安全なエラーハンドリングを行います。
 */
export const useStockItems = () => {
  const { user } = useAuth();
  const stockRepository = useStockRepository();

  // 状態管理
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 在庫データを取得
   */
  const fetchStockItems = useCallback(async () => {
    if (!user?.id) {
      setStockItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await stockRepository.findAll(user.id);
      setStockItems(items);
    } catch (err) {
      console.error('在庫データの取得に失敗:', err);
      const errorMessage = err instanceof DatabaseError ? err.message : '在庫データの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [stockRepository, user?.id]);

  // タブ切り替え時の自動更新機能
  const { markAsUpdated } = useTabRefresh(fetchStockItems);

  /**
   * 在庫を追加
   */
  const addStockItem = useCallback(async (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      throw new Error('ユーザーがログインしていません');
    }

    try {
      const newItem = await stockRepository.create({
        ...stockItem,
        user_id: user.id,
      });
      
      // ローカル状態を更新
      setStockItems(prev => [newItem, ...prev]);
      markAsUpdated(); // 更新時刻をマーク
      
      return newItem;
    } catch (err) {
      console.error('在庫の追加に失敗:', err);
      const errorMessage = err instanceof DatabaseError ? err.message : '在庫の追加に失敗しました';
      throw new Error(errorMessage);
    }
  }, [stockRepository, user?.id, markAsUpdated]);

  /**
   * 在庫を更新
   */
  const updateStockItem = useCallback(async (id: string, updates: Partial<Omit<StockItem, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const updatedItem = await stockRepository.update(id, updates);
      
      // ローカル状態を更新
      setStockItems(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
      );
      markAsUpdated(); // 更新時刻をマーク
      
      return updatedItem;
    } catch (err) {
      console.error('在庫の更新に失敗:', err);
      const errorMessage = err instanceof DatabaseError ? err.message : '在庫の更新に失敗しました';
      throw new Error(errorMessage);
    }
  }, [stockRepository, markAsUpdated]);

  /**
   * 在庫を削除
   */
  const deleteStockItem = useCallback(async (id: string) => {
    console.log('🗑️ [useStockItems] deleteStockItem called with id:', id);
    
    try {
      await stockRepository.delete(id);
      
      // ローカル状態を更新
      setStockItems(prev => prev.filter(item => item.id !== id));
      markAsUpdated(); // 更新時刻をマーク
      
      console.log('✅ [useStockItems] deleteStockItem success');
    } catch (err) {
      console.error('❌ [useStockItems] deleteStockItem failed:', err);
      const errorMessage = err instanceof DatabaseError ? err.message : '在庫の削除に失敗しました';
      throw new Error(errorMessage);
    }
  }, [stockRepository, markAsUpdated]);

  /**
   * 在庫を追加または更新（既存在庫があれば更新、なければ追加）
   */
  const saveStockItem = useCallback(async (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    if (stockItem.id) {
      return await updateStockItem(stockItem.id, stockItem);
    } else {
      return await addStockItem(stockItem);
    }
  }, [addStockItem, updateStockItem]);

  /**
   * 期限切れの在庫を取得
   */
  const getExpiredItems = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return stockItems.filter(item => 
      item.best_before && item.best_before < today
    );
  }, [stockItems]);

  /**
   * 賞味期限が近い在庫を取得（指定日数以内）
   */
  const getExpiringItems = useCallback((days: number = 1) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    return stockItems.filter(item => 
      item.best_before && 
      item.best_before >= today && 
      item.best_before <= targetDateStr
    );
  }, [stockItems]);

  /**
   * 保存場所別の在庫を取得
   */
  const getItemsByLocation = useCallback((location: string) => {
    return stockItems.filter(item => item.storage_location === location);
  }, [stockItems]);

  /**
   * 在庫名での検索
   */
  const searchItems = useCallback((query: string) => {
    return stockItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [stockItems]);

  /**
   * データを再取得
   */
  const refetch = useCallback(() => {
    return fetchStockItems();
  }, [fetchStockItems]);

  // 初期データ取得とタブ切り替え時の更新
  useEffect(() => {
    fetchStockItems();
  }, [fetchStockItems]);

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