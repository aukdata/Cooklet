import { useDataHook } from './useDataHook';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { SavedRecipe, CreateRecipeData, UpdateRecipeData } from '../types/recipe';
import type { IngredientItem } from '../types';

// 再エクスポート（後方互換性のため）
export type { SavedRecipe } from '../types/recipe';

// レシピ管理機能を提供するカスタムフック
export const useRecipes = () => {
  const { user } = useAuth(); // 認証ユーザー情報

  // useDataHookによる基本CRUD操作
  const {
    data: recipes,
    loading,
    error,
    addData,
    updateData,
    deleteData,
    refetch: fetchRecipes
  } = useDataHook<SavedRecipe>({
    tableName: 'saved_recipes',
    orderBy: [
      { column: 'created_at', ascending: false } // 新しいレシピを先に表示
    ]
  }, {
    fetch: 'レシピデータの取得に失敗しました',
    add: 'レシピの追加に失敗しました',
    update: 'レシピの更新に失敗しました',
    delete: 'レシピの削除に失敗しました'
  });

  // 材料をingredientsマスタテーブルに追加する補助関数
  const addIngredientsToMaster = async (ingredients: IngredientItem[]) => {
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
          category: '自動追加', // 自動抽出材料のデフォルトカテゴリ
          default_unit: ing.quantity.unit || '個', // Quantity型から単位を取得
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
    const newRecipe = {
      title: recipe.title,
      url: recipe.url,
      servings: recipe.servings,
      tags: recipe.tags,
      ingredients: recipe.ingredients || [] // 材料情報を保存
    };

    const result = await addData(newRecipe);

    // 材料をingredientsマスタテーブルに追加（非同期、エラーは無視）
    if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      addIngredientsToMaster(recipe.ingredients);
    }

    return result;
  };

  // レシピを更新する関数
  const updateRecipe = async (id: string, updates: UpdateRecipeData) => {
    const result = await updateData(id, updates);

    // 材料が更新された場合、ingredientsマスタテーブルにも追加
    if (updates.ingredients && Array.isArray(updates.ingredients) && updates.ingredients.length > 0) {
      addIngredientsToMaster(updates.ingredients);
    }

    return result;
  };

  // レシピを削除する関数
  const deleteRecipe = async (id: string) => {
    return await deleteData(id);
  };


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