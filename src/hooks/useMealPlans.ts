import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCache, CacheConfig } from './useCache';
import { useTabRefresh } from './useTabRefresh';
import { type MealType, type MealPlan } from '../types';

// 献立消費状態の型定義
export type MealPlanConsumedStatus = 'pending' | 'completed' | 'stored';

// useMealPlansフック - Supabase meal_plansテーブルとの連携（キャッシュ対応）
export const useMealPlans = () => {
  const { user } = useAuth();

  // キャッシュ機能付きデータ取得
  const fetchMealPlansWithCache = useCallback(async (): Promise<MealPlan[]> => {
    if (!user) return [];

    const { data, error: fetchError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    return data || [];
  }, [user]);

  // キャッシュフックの使用
  const {
    data: mealPlans,
    isLoading: loading,
    error,
    setCache,
    invalidateCache,
    refreshData: fetchMealPlans
  } = useCache<MealPlan[]>(
    `meal_plans_${user?.id || 'anonymous'}`,
    fetchMealPlansWithCache,
    {
      ttl: CacheConfig.TTL.MEDIUM,
      persistToStorage: CacheConfig.PERSIST_TO_STORAGE,
      storageKey: `meal_plans_${user?.id || 'anonymous'}`
    }
  );

  // 献立を追加
  const addMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      const { data, error: insertError } = await supabase
        .from('meal_plans')
        .insert([
          {
            user_id: user.id,
            date: mealPlan.date,
            meal_type: mealPlan.meal_type,
            source_type: mealPlan.source_type || 'recipe',
            recipe_url: mealPlan.recipe_url,
            stock_id: mealPlan.stock_id,
            ingredients: mealPlan.ingredients,
            memo: mealPlan.memo,
            consumed_status: mealPlan.consumed_status || 'pending'
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // キャッシュを更新（新しいアイテムを追加）
      const currentPlans = mealPlans || [];
      const updatedPlans = [...currentPlans, data].sort((a, b) => {
        // 日付順、作成日時順でソート
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      setCache(updatedPlans);
      markAsUpdated(); // データ変更後に更新時刻をマーク
      
      return data;
    } catch (err) {
      console.error('献立の追加に失敗しました:', err);
      throw err;
    }
  };

  // 献立を更新
  const updateMealPlan = async (id: string, updates: Partial<Omit<MealPlan, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
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

      // キャッシュを更新（該当アイテムを更新）
      const currentPlans = mealPlans || [];
      const updatedPlans = currentPlans.map(plan => plan.id === id ? data : plan);
      setCache(updatedPlans);
      markAsUpdated(); // データ変更後に更新時刻をマーク
      
      return data;
    } catch (err) {
      console.error('献立の更新に失敗しました:', err);
      throw err;
    }
  };

  // 献立を削除
  const deleteMealPlan = async (id: string) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      const { error: deleteError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // キャッシュを更新（該当アイテムを削除）
      const currentPlans = mealPlans || [];
      const updatedPlans = currentPlans.filter(plan => plan.id !== id);
      setCache(updatedPlans);
      markAsUpdated(); // データ変更後に更新時刻をマーク
    } catch (err) {
      console.error('献立の削除に失敗しました:', err);
      throw err;
    }
  };

  // 献立の消費状態を更新
  const updateMealPlanStatus = async (id: string, status: MealPlanConsumedStatus) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      const { data, error: updateError } = await supabase
        .from('meal_plans')
        .update({
          consumed_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // キャッシュを更新（該当アイテムの状態を更新）
      const currentPlans = mealPlans || [];
      const updatedPlans = currentPlans.map(plan => plan.id === id ? data : plan);
      setCache(updatedPlans);
      markAsUpdated(); // データ変更後に更新時刻をマーク
      
      return data;
    } catch (err) {
      console.error('献立状態の更新に失敗しました:', err);
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

  // 複数の献立を一括追加（バッチ処理）
  const addMealPlansBatch = async (mealPlans: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      console.log('🚀 [Debug] addMealPlansBatch 開始:', mealPlans.length, '件の献立を保存');
      
      // データベースに一括挿入
      const insertData = mealPlans.map(mealPlan => ({
        user_id: user.id,
        date: mealPlan.date,
        meal_type: mealPlan.meal_type,
        source_type: mealPlan.source_type || 'recipe',
        recipe_url: mealPlan.recipe_url,
        stock_id: mealPlan.stock_id,
        ingredients: mealPlan.ingredients,
        memo: mealPlan.memo,
        consumed_status: mealPlan.consumed_status || 'pending'
      }));

      const { data, error: insertError } = await supabase
        .from('meal_plans')
        .insert(insertData)
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log('💾 [Debug] データベース保存完了:', data?.length, '件');
      
      // キャッシュを完全にクリアして再取得
      console.log('🔄 [Debug] キャッシュクリア & 再取得開始');
      invalidateCache();
      
      // 少し待ってから再取得（確実にキャッシュがクリアされるように）
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 強制的にデータを再取得
      const freshData = await fetchMealPlansWithCache();
      console.log('📊 [Debug] 再取得完了:', freshData.length, '件のデータ');
      
      // キャッシュに直接設定
      setCache(freshData);
      markAsUpdated(); // データ変更後に更新時刻をマーク
      
      console.log('✅ [Debug] addMealPlansBatch 完了');
      return data;
    } catch (err) {
      console.error('献立の一括追加に失敗しました:', err);
      throw err;
    }
  };

  // 指定日の献立を取得
  const getMealPlansForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (mealPlans || []).filter(plan => plan.date === dateStr);
  };

  // 指定日・食事タイプの献立を取得
  const getMealPlan = (date: Date, mealType: MealType): MealPlan | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    const result = (mealPlans || []).find(plan => plan.date === dateStr && plan.meal_type === mealType);
    
    // デバッグログ出力
    console.log('🔍 [Debug] getMealPlan 検索:', {
      dateStr,
      mealType,
      totalMealPlans: (mealPlans || []).length,
      matchingPlans: (mealPlans || []).filter(plan => plan.date === dateStr),
      result: result ? '見つかった' : '見つからない',
      resultData: result
    });
    
    return result;
  };

  // レシピURLに基づいて最後に調理された日付を取得（issue #31対応）
  const getLastCookedDate = (recipeUrl: string): string | null => {
    const plansWithRecipe = (mealPlans || [])
      .filter(plan => plan.recipe_url === recipeUrl)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return plansWithRecipe.length > 0 ? plansWithRecipe[0].date : null;
  };

  // タブ切り替え時の更新チェック機能（5分間隔）
  const { markAsUpdated } = useTabRefresh(() => {
    invalidateCache();
    fetchMealPlans();
  }, 5);

  return {
    mealPlans: mealPlans || [],
    loading,
    error,
    addMealPlan,
    addMealPlansBatch, // 複数献立の一括追加
    updateMealPlan,
    deleteMealPlan,
    updateMealPlanStatus, // 献立消費状態更新
    saveMealPlan,
    getMealPlansForDate,
    getMealPlan,
    getLastCookedDate, // レシピURLに基づく最後の調理日取得
    refetch: fetchMealPlans,
    invalidateCache, // キャッシュ無効化
    clearCache: invalidateCache // 後方互換性のためのエイリアス
  };
};