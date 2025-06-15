import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// 献立データの型定義（CLAUDE.md仕様書準拠）
export interface MealPlan {
  id?: string;
  user_id?: string;
  date: string;
  meal_type: '朝' | '昼' | '夜' | '間食';
  recipe_url?: string;
  ingredients: { name: string; quantity: string }[];
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

// useMealPlansフック - Supabase meal_plansテーブルとの連携
export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 献立データを取得
  const fetchMealPlans = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setMealPlans(data || []);
    } catch (err) {
      console.error('献立データの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : '献立データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 献立を追加
  const addMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('meal_plans')
        .insert([
          {
            user_id: user.id,
            date: mealPlan.date,
            meal_type: mealPlan.meal_type,
            recipe_url: mealPlan.recipe_url,
            ingredients: mealPlan.ingredients,
            memo: mealPlan.memo
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // ローカル状態を更新
      setMealPlans(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('献立の追加に失敗しました:', err);
      setError(err instanceof Error ? err.message : '献立の追加に失敗しました');
      throw err;
    }
  };

  // 献立を更新
  const updateMealPlan = async (id: string, updates: Partial<Omit<MealPlan, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('meal_plans')
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
      setMealPlans(prev => 
        prev.map(plan => plan.id === id ? data : plan)
      );
      return data;
    } catch (err) {
      console.error('献立の更新に失敗しました:', err);
      setError(err instanceof Error ? err.message : '献立の更新に失敗しました');
      throw err;
    }
  };

  // 献立を削除
  const deleteMealPlan = async (id: string) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // ローカル状態を更新
      setMealPlans(prev => prev.filter(plan => plan.id !== id));
    } catch (err) {
      console.error('献立の削除に失敗しました:', err);
      setError(err instanceof Error ? err.message : '献立の削除に失敗しました');
      throw err;
    }
  };

  // 献立を保存（追加または更新）
  const saveMealPlan = async (mealPlan: MealPlan) => {
    if (mealPlan.id) {
      return await updateMealPlan(mealPlan.id, mealPlan);
    } else {
      return await addMealPlan(mealPlan);
    }
  };

  // 指定日の献立を取得
  const getMealPlansForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mealPlans.filter(plan => plan.date === dateStr);
  };

  // 指定日・食事タイプの献立を取得
  const getMealPlan = (date: Date, mealType: '朝' | '昼' | '夜' | '間食') => {
    const dateStr = date.toISOString().split('T')[0];
    return mealPlans.find(plan => plan.date === dateStr && plan.meal_type === mealType);
  };

  // 初回データ取得
  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  // リアルタイム更新の設定
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('meal_plans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plans',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // データが変更された場合は再取得
          fetchMealPlans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchMealPlans]);

  return {
    mealPlans,
    loading,
    error,
    addMealPlan,
    updateMealPlan,
    deleteMealPlan,
    saveMealPlan,
    getMealPlansForDate,
    getMealPlan,
    refetch: fetchMealPlans
  };
};