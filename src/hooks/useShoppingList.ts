import { useDataHook } from './useDataHook';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// 買い物リストデータの型定義（types/index.tsと統合）
import type { ShoppingListItem } from '../types';
export type { ShoppingListItem };

// useShoppingListフック - useDataHookベースの買い物リスト管理
export const useShoppingList = () => {
  const { user } = useAuth();

  // useDataHookによる基本CRUD操作
  const {
    data: shoppingList,
    loading,
    error,
    addData,
    updateData,
    deleteData,
    refetch: fetchShoppingList
  } = useDataHook<ShoppingListItem>({
    tableName: 'shopping_list',
    orderBy: [
      { column: 'checked', ascending: true }, // 未完了を先に表示
      { column: 'created_at', ascending: false } // 新しいものを先に表示
    ]
  }, {
    fetch: '買い物リストデータの取得に失敗しました',
    add: '買い物リストアイテムの追加に失敗しました',
    update: '買い物リストアイテムの更新に失敗しました',
    delete: '買い物リストアイテムの削除に失敗しました'
  });

  // 買い物リストアイテムを追加
  const addShoppingItem = async (item: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>) => {
    return await addData(item);
  };

  // 買い物リストアイテムを更新
  const updateShoppingItem = async (id: string, updates: Partial<Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>>) => {
    return await updateData(id, updates);
  };

  // 買い物リストアイテムを削除
  const deleteShoppingItem = async (id: string) => {
    return await deleteData(id);
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
    // 完了済みアイテムを一つずつ削除
    const completedItems = getCompletedItems();
    for (const item of completedItems) {
      if (item.id) {
        await deleteShoppingItem(item.id);
      }
    }
  };

  // 全アイテムを選択
  const selectAllItems = async () => {
    // 未完了のアイテムを一つずつ更新
    const uncompletedItems = getUncompletedItems();
    for (const item of uncompletedItems) {
      if (item.id) {
        await updateShoppingItem(item.id, { checked: true });
      }
    }
  };

  // 完了済みアイテムを在庫に追加して削除
  const addCompletedItemsToStock = async () => {
    const completedItems = getCompletedItems();
    
    if (completedItems.length === 0) return;

    try {
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