import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  // リアルタイム更新の設定
  useEffect(() => {
    if (!user?.id) return;

    let subscriptionRef: any = null;
    let isSubscribed = false;

    const setupSubscription = async () => {
      try {
        // ユニークなチャンネル名を生成（タイムスタンプ付き）
        const channelName = `stock_items_${user.id}_${Date.now()}`;
        
        subscriptionRef = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'stock_items',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              // データが変更された場合は再取得
              console.log('在庫データが変更されました:', payload);
              
              // リアルタイム更新の際はローディングを表示しない
              try {
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
              }
            }
          )
          .subscribe((status: string) => {
            console.log('在庫データのサブスクリプション状態:', status);
            
            if (status === 'SUBSCRIBED') {
              isSubscribed = true;
              console.log('在庫データのリアルタイム更新が開始されました');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('在庫データのサブスクリプションエラー');
              setError('リアルタイム更新に失敗しました');
            } else if (status === 'TIMED_OUT') {
              console.warn('在庫データのサブスクリプションタイムアウト');
              // タイムアウトした場合は再試行
              setTimeout(() => {
                if (!isSubscribed) {
                  setupSubscription();
                }
              }, 5000);
            } else if (status === 'CLOSED') {
              console.log('在庫データのサブスクリプションが閉じられました');
              isSubscribed = false;
            }
          });

      } catch (error) {
        console.error('在庫データのサブスクリプション設定に失敗しました:', error);
        setError('リアルタイム更新の設定に失敗しました');
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (subscriptionRef) {
        try {
          supabase.removeChannel(subscriptionRef);
          console.log('在庫データのサブスクリプションをクリーンアップしました');
        } catch (error) {
          console.error('在庫データのサブスクリプションクリーンアップに失敗しました:', error);
        }
      }
    };
  }, [user?.id]);

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