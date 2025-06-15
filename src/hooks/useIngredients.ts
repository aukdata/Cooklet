import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ingredient } from '../types';

// 食材マスタ管理機能を提供するカスタムフック
export const useIngredients = () => {
  // 状態管理
  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // 食材マスタ配列
  const [loading, setLoading] = useState(true); // 読み込み状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ

  // 食材マスタデータを取得する関数
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      // 全ユーザー共通の食材マスタデータを取得
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('category', { ascending: true }) // カテゴリ順で並び替え
        .order('name', { ascending: true }); // 同一カテゴリ内では名前順

      if (error) throw error;
      setIngredients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '食材データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時に食材データを取得（認証不要）
  useEffect(() => {
    fetchIngredients();
  }, []);

  // 新しい食材をマスタに追加する関数
  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'created_at'>) => {
    try {
      // 新しい食材をマスタテーブルに追加
      const { data, error } = await supabase
        .from('ingredients')
        .insert([ingredient])
        .select()
        .single();

      if (error) throw error;
      // ローカル状態を更新（新しい食材を末尾に追加）
      setIngredients(prev => [...prev, data]);
      return data;
    } catch (err) {
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