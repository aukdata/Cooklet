import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTabRefresh } from './useTabRefresh';
import { type Ingredient } from '../types';

// 食材マスタ管理機能を提供するカスタムフック（ユーザー認証対応）
export const useIngredients = () => {
  // 状態管理
  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // 食材マスタ配列
  const [loading, setLoading] = useState(true); // 読み込み状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const { user } = useAuth(); // 認証ユーザー情報

  // 食材マスタデータを取得する関数
  const fetchIngredients = useCallback(async () => {
    if (!user) return; // 認証が必要

    try {
      setLoading(true);
      setError(null);
      
      // ユーザー固有の食材マスタデータを取得
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('user_id', user.id) // ユーザーIDでフィルタ
        .order('category', { ascending: true }) // カテゴリ順で並び替え
        .order('name', { ascending: true }); // 同一カテゴリ内では名前順

      if (error) throw error;
      setIngredients(data || []);
    } catch (err) {
      console.error('食材データの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : '食材データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 認証ユーザー変更時に食材データを取得
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // タブ切り替え時の更新チェック機能（5分間隔）
  const { markAsUpdated } = useTabRefresh(fetchIngredients, 5);

  // 新しい食材をマスタに追加する関数
  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);
      
      // 新しい食材をマスタテーブルに追加（user_id付き）
      const { data, error } = await supabase
        .from('ingredients')
        .insert([{
          ...ingredient,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      // ローカル状態を更新（新しい食材を末尾に追加）
      setIngredients(prev => [...prev, data]);
      markAsUpdated(); // データ変更後に更新時刻をマーク
      return data;
    } catch (err) {
      console.error('食材の追加に失敗しました:', err);
      setError(err instanceof Error ? err.message : '食材の追加に失敗しました');
      throw err;
    }
  };

  // フックが提供する機能を返す
  return {
    ingredients, // 食材マスタ配列
    loading, // 読み込み状態
    error, // エラーメッセージ
    addIngredient, // 食材追加関数
    refetch: fetchIngredients, // 再取得関数
  };
};