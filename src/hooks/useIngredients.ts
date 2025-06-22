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
  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);
      
      // 新しい食材をマスタテーブルに追加（user_id付き）
      const { data, error } = await supabase
        .from('ingredients')
        .insert([{
          user_id: user.id,
          name: ingredient.name,
          category: ingredient.category,
          default_unit: ingredient.defaultUnit,
          typical_price: ingredient.typicalPrice,
          original_name: ingredient.originalName,
          conversion_quantity: ingredient.conversionQuantity,
          conversion_unit: ingredient.conversionUnit
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

  // 食材マスタを更新する関数
  const updateIngredient = async (id: number, updates: Partial<Omit<Ingredient, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);
      
      // camelCaseをsnake_caseに変換
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.defaultUnit !== undefined) dbUpdates.default_unit = updates.defaultUnit;
      if (updates.typicalPrice !== undefined) dbUpdates.typical_price = updates.typicalPrice;
      if (updates.originalName !== undefined) dbUpdates.original_name = updates.originalName;
      if (updates.conversionQuantity !== undefined) dbUpdates.conversion_quantity = updates.conversionQuantity;
      if (updates.conversionUnit !== undefined) dbUpdates.conversion_unit = updates.conversionUnit;
      
      // 食材マスタを更新
      const { data, error } = await supabase
        .from('ingredients')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // セキュリティ: 自分の食材のみ更新可能
        .select()
        .single();

      if (error) throw error;
      
      // ローカル状態を更新
      setIngredients(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      markAsUpdated(); // データ変更後に更新時刻をマーク
      return data;
    } catch (err) {
      console.error('食材の更新に失敗しました:', err);
      setError(err instanceof Error ? err.message : '食材の更新に失敗しました');
      throw err;
    }
  };

  // 食材マスタを削除する関数
  const deleteIngredient = async (id: number) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);
      
      // 食材マスタを削除
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // セキュリティ: 自分の食材のみ削除可能

      if (error) throw error;
      
      // ローカル状態を更新
      setIngredients(prev => prev.filter(item => item.id !== id));
      markAsUpdated(); // データ変更後に更新時刻をマーク
    } catch (err) {
      console.error('食材の削除に失敗しました:', err);
      setError(err instanceof Error ? err.message : '食材の削除に失敗しました');
      throw err;
    }
  };

  // originalNameで食材を検索する関数（商品名を一般名に変換）
  const findIngredientByOriginalName = useCallback((originalName: string): Ingredient | null => {
    if (!originalName) return null;
    
    // 完全一致で検索
    const exactMatch = ingredients.find(ingredient => 
      ingredient.originalName === originalName
    );
    
    if (exactMatch) return exactMatch;
    
    // 部分一致で検索（大文字小文字を無視）
    const partialMatch = ingredients.find(ingredient => 
      ingredient.originalName && 
      ingredient.originalName.toLowerCase().includes(originalName.toLowerCase())
    );
    
    return partialMatch || null;
  }, [ingredients]);

  // フックが提供する機能を返す
  return {
    ingredients, // 食材マスタ配列
    loading, // 読み込み状態
    error, // エラーメッセージ
    addIngredient, // 食材追加関数
    updateIngredient, // 食材更新関数
    deleteIngredient, // 食材削除関数
    findIngredientByOriginalName, // original_nameで食材検索関数
    refetch: fetchIngredients, // 再取得関数
  };
};