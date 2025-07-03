import React, { useMemo } from 'react';
import { type SavedRecipe } from '../../hooks/useRecipes';

// レシピセレクターコンポーネントのProps
interface RecipeSelectorProps {
  recipes: SavedRecipe[];
  selectedRecipeId: string;
  searchQuery: string;
  onRecipeSelect: (recipe: SavedRecipe | null) => void;
  onSearchQueryChange: (query: string) => void;
  loading?: boolean;
}

// レシピ選択コンポーネント
export const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  recipes,
  selectedRecipeId,
  searchQuery,
  onRecipeSelect,
  onSearchQueryChange,
  loading = false
}) => {
  // フィルタリングされたレシピ一覧
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return recipes;
    }
    
    const query = searchQuery.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
    );
  }, [recipes, searchQuery]);

  // レシピ選択処理
  const handleRecipeChange = (recipeId: string) => {
    if (recipeId === '') {
      onRecipeSelect(null);
      return;
    }
    
    const recipe = recipes.find(r => r.id === recipeId);
    onRecipeSelect(recipe || null);
  };

  return (
    <div className="space-y-3">
      {/* レシピ検索 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          レシピ検索
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="レシピ名または材料名で検索..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        />
      </div>

      {/* レシピ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          レシピ選択
          {searchQuery && (
            <span className="text-sm text-gray-500 ml-2">
              ({filteredRecipes.length}件表示)
            </span>
          )}
        </label>
        <select
          value={selectedRecipeId}
          onChange={(e) => handleRecipeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        >
          <option value="">手動で入力する</option>
          {filteredRecipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.title}
              {recipe.ingredients.length > 0 && (
                ` (材料${recipe.ingredients.length}種類)`
              )}
            </option>
          ))}
        </select>
      </div>

      {/* 検索結果情報 */}
      {searchQuery && (
        <div className="text-sm text-gray-600">
          {filteredRecipes.length === 0 ? (
            <span className="text-red-600">検索結果がありません</span>
          ) : (
            <span>
              「{searchQuery}」の検索結果: {filteredRecipes.length}件
            </span>
          )}
        </div>
      )}

      {/* 検索クリア */}
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchQueryChange('')}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          検索をクリア
        </button>
      )}
    </div>
  );
};
