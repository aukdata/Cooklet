import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ingredient } from '../types';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setIngredients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '食材データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([ingredient])
        .select()
        .single();

      if (error) throw error;
      setIngredients(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '食材の追加に失敗しました');
      throw err;
    }
  };

  return {
    ingredients,
    loading,
    error,
    addIngredient,
    refetch: fetchIngredients,
  };
};