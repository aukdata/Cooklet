import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { type StockItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

// 在庫管理機能を提供するカスタムフック
export const useInventory = () => {
  // 状態管理
  const [inventory, setInventory] = useState<StockItem[]>([]); // 在庫アイテム配列
  const [loading, setLoading] = useState(true); // 読み込み状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const { user } = useAuth(); // 認証ユーザー情報

  // 在庫データを取得する関数
  const fetchInventory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // inventoryテーブルとingredientsテーブルをJOINして取得
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // 作成日降順で並び替え

      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '在庫データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 新しい在庫アイテムを追加する関数
  const addInventoryItem = async (item: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // ユーザーIDを付与して在庫アイテムを作成
      const { data, error } = await supabase
        .from('inventory')
        .insert([{ ...item, user_id: user.id }])
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .single();

      if (error) throw error;
      // ローカル状態を更新（新しいアイテムを先頭に追加）
      setInventory(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '在庫の追加に失敗しました');
      throw err;
    }
  };

  // 在庫アイテムを更新する関数
  const updateInventoryItem = async (id: string, updates: Partial<StockItem>) => {
    try {
      // 指定されたIDの在庫アイテムを更新
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .single();

      if (error) throw error;
      // ローカル状態を更新（該当アイテムのみ更新）
      setInventory(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '在庫の更新に失敗しました');
      throw err;
    }
  };

  // 在庫アイテムを削除する関数
  const deleteInventoryItem = async (id: string) => {
    try {
      // 指定されたIDの在庫アイテムを削除
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      // ローカル状態から削除されたアイテムを除外
      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '在庫の削除に失敗しました');
      throw err;
    }
  };

  // ユーザーが変更されたら在庫データを再取得
  useEffect(() => {
    fetchInventory();
  }, [user]);

  // フックが提供する機能を返す
  return {
    inventory, // 在庫アイテム配列
    loading, // 読み込み状態
    error, // エラーメッセージ
    addInventoryItem, // 在庫追加関数
    updateInventoryItem, // 在庫更新関数
    deleteInventoryItem, // 在庫削除関数
    refetch: fetchInventory, // 再取得関数
  };
};