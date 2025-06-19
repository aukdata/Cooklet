import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTabRefresh } from './useTabRefresh';

// 在庫データの型定義（CLAUDE.md仕様書準拠）
export interface StockItem {
  id?: string;
  user_id?: string;
  name: string;
  quantity: string;
  best_before?: string;
  storage_location?: string;
  is_homemade: boolean;
  created_at?: string;
  updated_at?: string;
}

// useStockItemsフック - Supabase stock_itemsテーブルとの連携
export const useStockItems = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 在庫データを取得
  const fetchStockItems = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stock_items')
        .select('*')
        .eq('user_id', user.id)
        .order('best_before', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setStockItems(data || []);
    } catch (err) {
      console.error('在庫データの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : '在庫データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 在庫を追加
  const addStockItem = async (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('stock_items')
        .insert([
          {
            user_id: user.id,
            name: stockItem.name,
            quantity: stockItem.quantity,
            best_before: stockItem.best_before,
            storage_location: stockItem.storage_location,
            is_homemade: stockItem.is_homemade
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // ローカル状態を更新
      setStockItems(prev => [...prev, data]);
      markAsUpdated(); // データ変更後に更新時刻をマーク
      return data;
    } catch (err) {
      console.error('在庫の追加に失敗しました:', err);
      setError(err instanceof Error ? err.message : '在庫の追加に失敗しました');
      throw err;
    }
  };

  // 在庫を更新
  const updateStockItem = async (id: string, updates: Partial<Omit<StockItem, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('stock_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // ローカル状態を更新
      setStockItems(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      markAsUpdated(); // データ変更後に更新時刻をマーク
      return data;
    } catch (err) {
      console.error('在庫の更新に失敗しました:', err);
      setError(err instanceof Error ? err.message : '在庫の更新に失敗しました');
      throw err;
    }
  };

  // 在庫を削除
  const deleteStockItem = async (id: string) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // ローカル状態を更新
      setStockItems(prev => prev.filter(item => item.id !== id));
      markAsUpdated(); // データ変更後に更新時刻をマーク
    } catch (err) {
      console.error('在庫の削除に失敗しました:', err);
      setError(err instanceof Error ? err.message : '在庫の削除に失敗しました');
      throw err;
    }
  };

  // 在庫を保存（追加または更新）
  const saveStockItem = async (stockItem: StockItem) => {
    if (stockItem.id) {
      return await updateStockItem(stockItem.id, stockItem);
    } else {
      return await addStockItem(stockItem);
    }
  };

  // 賞味期限切れの在庫を取得
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

  // 初回データ取得
  useEffect(() => {
    fetchStockItems();
  }, [fetchStockItems]);

  // タブ切り替え時の更新チェック機能（5分間隔）
  const { markAsUpdated } = useTabRefresh(fetchStockItems, 5);

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
    refetch: fetchStockItems
  };
};