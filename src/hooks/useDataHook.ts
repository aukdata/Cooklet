import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTabRefresh } from './useTabRefresh';

// データテーブル設定の型定義
interface TableConfig {
  tableName: string;
  orderBy?: {
    column: string;
    ascending?: boolean;
  }[];
  select?: string;
}

// CRUD操作のオプション
interface CrudOptions {
  skipErrorAlert?: boolean;
  additionalFields?: Record<string, unknown>;
}

/**
 * 汎用データCRUDフック
 * Supabaseテーブルとの共通CRUD操作パターンを抽象化
 */
export const useDataHook = <T extends Record<string, unknown> & { id?: string }>(
  config: TableConfig,
  errorMessages: {
    fetch: string;
    add: string;
    update: string;
    delete: string;
  }
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // データ取得（依存配列を最小限に）
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(config.tableName)
        .select(config.select || '*')
        .eq('user_id', user.id);

      // 並び替え設定を適用
      if (config.orderBy && config.orderBy.length > 0) {
        config.orderBy.forEach(order => {
          query = query.order(order.column, { ascending: order.ascending ?? false });
        });
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setData((fetchedData as unknown as T[]) || []);
    } catch (err) {
      console.error(`${errorMessages.fetch}:`, err);
      setError(err instanceof Error ? err.message : errorMessages.fetch);
    } finally {
      setLoading(false);
    }
  }, [user?.id, config.tableName]); // 最小限の依存配列

  const { markAsUpdated } = useTabRefresh(
    fetchData,
    5 * 60 * 1000 // 5分間隔
  );

  // 初期データ読み込み
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // データ追加
  const addData = async (
    item: Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    options: CrudOptions = {}
  ) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const newItem = {
        ...item,
        user_id: user.id,
        ...options.additionalFields
      };

      const { data: insertedData, error: insertError } = await supabase
        .from(config.tableName)
        .insert(newItem)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setData(prevData => [insertedData, ...prevData]);
      markAsUpdated();
      return insertedData;
    } catch (err) {
      console.error(`${errorMessages.add}:`, err);
      const errorMessage = err instanceof Error ? err.message : errorMessages.add;
      if (!options.skipErrorAlert) {
        setError(errorMessage);
      }
      throw new Error(errorMessage);
    }
  };

  // データ更新
  const updateData = async (
    id: string,
    updates: Partial<Omit<T, 'id' | 'user_id' | 'created_at'>>,
    options: CrudOptions = {}
  ) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        ...options.additionalFields
      };

      const { data: updatedData, error: updateError } = await supabase
        .from(config.tableName)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setData(prevData =>
        prevData.map(item => 
          item.id === id ? updatedData : item
        )
      );
      markAsUpdated();
      return updatedData;
    } catch (err) {
      console.error(`${errorMessages.update}:`, err);
      const errorMessage = err instanceof Error ? err.message : errorMessages.update;
      if (!options.skipErrorAlert) {
        setError(errorMessage);
      }
      throw new Error(errorMessage);
    }
  };

  // データ削除
  const deleteData = async (id: string, options: CrudOptions = {}) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from(config.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setData(prevData => 
        prevData.filter(item => item.id !== id)
      );
      markAsUpdated();
    } catch (err) {
      console.error(`${errorMessages.delete}:`, err);
      const errorMessage = err instanceof Error ? err.message : errorMessages.delete;
      if (!options.skipErrorAlert) {
        setError(errorMessage);
      }
      throw new Error(errorMessage);
    }
  };

  // データ再取得
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    addData,
    updateData,
    deleteData,
    refetch
  };
};