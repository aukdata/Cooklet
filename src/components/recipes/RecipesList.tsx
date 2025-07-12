import React from 'react';
import { RecipeCard } from './RecipeCard';
import type { SavedRecipe } from '../../types/recipe';

interface RecipesListProps {
  recipes: SavedRecipe[];
  onShowRecipeDetail: (recipe: SavedRecipe) => void;
  onEditRecipe: (recipe: SavedRecipe) => void;
  onAddToMealPlan: (recipe: SavedRecipe) => void;
  getLastCookedDate: (url: string) => string | null;
}

// レシピ一覧表示部分（個別レシピカード含む）
export const RecipesList: React.FC<RecipesListProps> = ({
  recipes,
  onShowRecipeDetail,
  onEditRecipe,
  onAddToMealPlan,
  getLastCookedDate,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onShowRecipeDetail={onShowRecipeDetail}
            onEditRecipe={onEditRecipe}
            onAddToMealPlan={onAddToMealPlan}
            getLastCookedDate={getLastCookedDate}
          />
        ))}
      </div>
    </div>
  );
};