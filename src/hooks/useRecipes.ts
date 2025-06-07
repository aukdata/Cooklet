import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe, RecipeIngredient } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecipes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(
            *,
            ingredient:ingredients(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レシピデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([{ ...recipe, user_id: user.id }])
        .select(`
          *,
          recipe_ingredients(
            *,
            ingredient:ingredients(*)
          )
        `)
        .single();

      if (error) throw error;
      setRecipes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レシピの追加に失敗しました');
      throw err;
    }
  };

  const addRecipeIngredients = async (recipeId: number, ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[]) => {
    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .insert(
          ingredients.map(ing => ({ ...ing, recipe_id: recipeId }))
        )
        .select(`
          *,
          ingredient:ingredients(*)
        `);

      if (error) throw error;
      
      // レシピ一覧を更新
      await fetchRecipes();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レシピ食材の追加に失敗しました');
      throw err;
    }
  };

  const updateRecipe = async (id: number, updates: Partial<Recipe>) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          recipe_ingredients(
            *,
            ingredient:ingredients(*)
          )
        `)
        .single();

      if (error) throw error;
      setRecipes(prev => prev.map(recipe => recipe.id === id ? data : recipe));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レシピの更新に失敗しました');
      throw err;
    }
  };

  const deleteRecipe = async (id: number) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レシピの削除に失敗しました');
      throw err;
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  return {
    recipes,
    loading,
    error,
    addRecipe,
    addRecipeIngredients,
    updateRecipe,
    deleteRecipe,
    refetch: fetchRecipes,
  };
};