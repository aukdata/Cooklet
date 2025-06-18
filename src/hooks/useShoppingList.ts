import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// 買い物リストデータの型定義（CLAUDE.md仕様書準拠）
export interface ShoppingListItem {
  id?: string;
  user_id?: string;
  name: string;
  quantity?: string;
  checked: boolean;
  added_from: 'manual' | 'auto';
  created_at?: string;
}

// useShoppingListフック - Supabase shopping_listテーブルとの連携
export const useShoppingList = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 買い物リストデータを取得
  const fetchShoppingList = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', user.id)
        .order('checked', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setShoppingList(data || []);
    } catch (err) {
      console.error('買い物リストデータの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : '買い物リストデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 買い物リストアイテムを追加
  const addShoppingItem = async (item: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('shopping_list')
        .insert([
          {
            user_id: user.id,
            name: item.name,
            quantity: item.quantity,
            checked: item.checked,
            added_from: item.added_from
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // ローカル状態を更新
      setShoppingList(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('買い物リストアイテムの追加に失敗しました:', err);
      setError(err instanceof Error ? err.message : '買い物リストアイテムの追加に失敗しました');
      throw err;
    }
  };

  // 買い物リストアイテムを更新
  const updateShoppingItem = async (id: string, updates: Partial<Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('shopping_list')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // ローカル状態を更新
      setShoppingList(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      return data;
    } catch (err) {
      console.error('買い物リストアイテムの更新に失敗しました:', err);
      setError(err instanceof Error ? err.message : '買い物リストアイテムの更新に失敗しました');
      throw err;
    }
  };

  // 買い物リストアイテムを削除
  const deleteShoppingItem = async (id: string) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // ローカル状態を更新
      setShoppingList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('買い物リストアイテムの削除に失敗しました:', err);
      setError(err instanceof Error ? err.message : '買い物リストアイテムの削除に失敗しました');
      throw err;
    }
  };

  // アイテムのチェック状態を切り替え
  const toggleShoppingItem = async (id: string) => {
    const item = shoppingList.find(item => item.id === id);
    if (!item) return;

    return await updateShoppingItem(id, { checked: !item.checked });
  };

  // 未完了のアイテムを取得
  const getUncompletedItems = () => {
    return shoppingList.filter(item => !item.checked);
  };

  // 完了済みのアイテムを取得
  const getCompletedItems = () => {
    return shoppingList.filter(item => item.checked);
  };

  // 自動追加されたアイテムを取得
  const getAutoAddedItems = () => {
    return shoppingList.filter(item => item.added_from === 'auto');
  };

  // 手動追加されたアイテムを取得
  const getManualAddedItems = () => {
    return shoppingList.filter(item => item.added_from === 'manual');
  };

  // 完了済みアイテムを一括削除
  const deleteCompletedItems = async () => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', user.id)
        .eq('checked', true);

      if (deleteError) {
        throw deleteError;
      }

      // ローカル状態を更新
      setShoppingList(prev => prev.filter(item => !item.checked));
    } catch (err) {
      console.error('完了済みアイテムの削除に失敗しました:', err);
      setError(err instanceof Error ? err.message : '完了済みアイテムの削除に失敗しました');
      throw err;
    }
  };

  // 全アイテムを選択
  const selectAllItems = async () => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('shopping_list')
        .update({ checked: true })
        .eq('user_id', user.id)
        .eq('checked', false);

      if (updateError) {
        throw updateError;
      }

      // ローカル状態を更新
      setShoppingList(prev => 
        prev.map(item => ({ ...item, checked: true }))
      );
    } catch (err) {
      console.error('全選択に失敗しました:', err);
      setError(err instanceof Error ? err.message : '全選択に失敗しました');
      throw err;
    }
  };

  // 完了済みアイテムを在庫に追加して削除
  const addCompletedItemsToStock = async () => {
    const completedItems = getCompletedItems();
    
    if (completedItems.length === 0) return;

    try {
      setError(null);

      // 在庫アイテムとして追加
      const stockItemsToAdd = completedItems.map(item => ({
        user_id: user?.id,
        name: item.name,
        quantity: item.quantity || '1個',
        storage_location: '冷蔵庫', // デフォルト保存場所
        is_homemade: false
      }));

      const { error: insertError } = await supabase
        .from('stock_items')
        .insert(stockItemsToAdd);

      if (insertError) {
        throw insertError;
      }

      // 完了済みアイテムを削除
      await deleteCompletedItems();
      
    } catch (err) {
      console.error('在庫への追加に失敗しました:', err);
      setError(err instanceof Error ? err.message : '在庫への追加に失敗しました');
      throw err;
    }
  };

  // アイテム検索
  const searchItems = (query: string) => {
    return shoppingList.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  // 統計情報を取得
  const getStats = () => {
    const completed = getCompletedItems();
    const uncompleted = getUncompletedItems();
    
    return {
      total: shoppingList.length,
      completed: completed.length,
      uncompleted: uncompleted.length,
      autoAdded: getAutoAddedItems().filter(item => !item.checked).length,
      manualAdded: getManualAddedItems().filter(item => !item.checked).length
    };
  };

  // 初回データ取得
  useEffect(() => {
    fetchShoppingList();
  }, [fetchShoppingList]);

  // リアルタイム更新の設定
  useEffect(() => {
    if (!user?.id) return;

    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel(`shopping_list_${user.id}_${Date.now()}`) // ユニークなチャンネル名
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'shopping_list',
              filter: `user_id=eq.${user.id}`
            },
            async () => {
              // データが変更された場合は再取得
              fetchShoppingList();
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('Shopping list subscription ready');
            }
          });
      } catch (error) {
        console.warn('Shopping list subscription failed, will work without realtime:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (error) {
          console.warn('Error removing subscription:', error);
        }
      }
    };
  }, [user?.id, fetchShoppingList]);

  return {
    shoppingList,
    loading,
    error,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingItem,
    getUncompletedItems,
    getCompletedItems,
    getAutoAddedItems,
    getManualAddedItems,
    deleteCompletedItems,
    selectAllItems,
    addCompletedItemsToStock,
    searchItems,
    getStats,
    refetch: fetchShoppingList
  };
};