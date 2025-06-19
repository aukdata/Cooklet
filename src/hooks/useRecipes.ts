import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { SavedRecipe, CreateRecipeData, UpdateRecipeData, RecipeIngredient } from '../types/recipe';

// 再エクスポート（後方互換性のため）
export type { SavedRecipe } from '../types/recipe';

// レシピ管理機能を提供するカスタムフック
export const useRecipes = () => {
  // 状態管理
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]); // レシピ配列
  const [loading, setLoading] = useState(true); // 読み込み状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const { user } = useAuth(); // 認証ユーザー情報

  // レシピデータを取得する関数
  const fetchRecipes = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRecipes(data || []);
    } catch (err) {
      console.error('レシピデータの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'レシピデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 材料をingredientsマスタテーブルに追加する補助関数
  const addIngredientsToMaster = async (ingredients: RecipeIngredient[]) => {
    if (!user || !ingredients.length) return;

    try {
      // 既存の材料を取得
      const { data: existingIngredients } = await supabase
        .from('ingredients')
        .select('name')
        .eq('user_id', user.id);

      const existingNames = new Set(existingIngredients?.map(ing => ing.name.toLowerCase()) || []);

      // 新しい材料のみを抽出
      const newIngredients = ingredients
        .filter(ing => ing.name.trim() && !existingNames.has(ing.name.toLowerCase().trim()))
        .map(ing => ({
          user_id: user.id,
          name: ing.name.trim(),
          category: '自動追加', // AI抽出材料のデフォルトカテゴリ
          default_unit: ing.quantity.match(/[a-zA-Zぁ-んァ-ヶー]/g)?.join('') || '個', // 数量から単位を抽出
        }));

      if (newIngredients.length > 0) {
        const { error } = await supabase
          .from('ingredients')
          .insert(newIngredients);

        if (error) {
          console.warn('材料マスタへの追加に失敗しました:', error);
        } else {
          console.log(`${newIngredients.length}個の新しい材料をマスタに追加しました`);
        }
      }
    } catch (err) {
      console.warn('材料マスタへの追加処理でエラーが発生しました:', err);
    }
  };

  // 新しいレシピを追加する関数
  const addRecipe = async (recipe: CreateRecipeData) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('saved_recipes')
        .insert([
          {
            user_id: user.id,
            title: recipe.title,
            url: recipe.url,
            servings: recipe.servings,
            tags: recipe.tags,
            ingredients: recipe.ingredients || [] // 材料情報を保存
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // 材料をingredientsマスタテーブルに追加（非同期、エラーは無視）
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        addIngredientsToMaster(recipe.ingredients);
      }

      // ローカル状態を更新（新しいレシピを先頭に追加）
      setRecipes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('レシピの追加に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'レシピの追加に失敗しました');
      throw err;
    }
  };

  // レシピを更新する関数
  const updateRecipe = async (id: string, updates: UpdateRecipeData) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('saved_recipes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // 材料が更新された場合、ingredientsマスタテーブルにも追加
      if (updates.ingredients && updates.ingredients.length > 0) {
        addIngredientsToMaster(updates.ingredients);
      }

      // ローカル状態を更新
      setRecipes(prev => 
        prev.map(recipe => recipe.id === id ? data : recipe)
      );
      return data;
    } catch (err) {
      console.error('レシピの更新に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'レシピの更新に失敗しました');
      throw err;
    }
  };

  // レシピを削除する関数
  const deleteRecipe = async (id: string) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // ローカル状態を更新
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (err) {
      console.error('レシピの削除に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'レシピの削除に失敗しました');
      throw err;
    }
  };

  // 初回データ取得
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // リアルタイム更新の設定
  useEffect(() => {
    if (!user?.id) return;

    let subscriptionRef: any = null;
    let isSubscribed = false;

    const setupSubscription = async () => {
      try {
        // ユニークなチャンネル名を生成（タイムスタンプ付き）
        const channelName = `saved_recipes_${user.id}_${Date.now()}`;
        
        subscriptionRef = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'saved_recipes',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              // データが変更された場合は再取得
              console.log('レシピデータが変更されました:', payload);
              
              // リアルタイム更新の際はローディングを表示しない
              try {
                setError(null);

                const { data, error: fetchError } = await supabase
                  .from('saved_recipes')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('created_at', { ascending: false });

                if (fetchError) {
                  throw fetchError;
                }

                setRecipes(data || []);
              } catch (err) {
                console.error('レシピデータの取得に失敗しました:', err);
                setError(err instanceof Error ? err.message : 'レシピデータの取得に失敗しました');
              }
            }
          )
          .subscribe((status: string) => {
            console.log('レシピデータのサブスクリプション状態:', status);
            
            if (status === 'SUBSCRIBED') {
              isSubscribed = true;
              console.log('レシピデータのリアルタイム更新が開始されました');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('レシピデータのサブスクリプションエラー');
              setError('リアルタイム更新に失敗しました');
            } else if (status === 'TIMED_OUT') {
              console.warn('レシピデータのサブスクリプションタイムアウト');
              // タイムアウトした場合は再試行
              setTimeout(() => {
                if (!isSubscribed) {
                  setupSubscription();
                }
              }, 5000);
            } else if (status === 'CLOSED') {
              console.log('レシピデータのサブスクリプションが閉じられました');
              isSubscribed = false;
            }
          });

      } catch (error) {
        console.error('レシピデータのサブスクリプション設定に失敗しました:', error);
        setError('リアルタイム更新の設定に失敗しました');
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (subscriptionRef) {
        try {
          supabase.removeChannel(subscriptionRef);
          console.log('レシピデータのサブスクリプションをクリーンアップしました');
        } catch (error) {
          console.error('レシピデータのサブスクリプションクリーンアップに失敗しました:', error);
        }
      }
    };
  }, [user?.id]);

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    refetch: fetchRecipes
  };
};