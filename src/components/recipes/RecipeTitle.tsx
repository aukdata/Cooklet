import React from 'react';
import type { SavedRecipe } from '../../types/recipe';

interface RecipeTitleProps {
  recipe: SavedRecipe;
  onClick: (recipe: SavedRecipe) => void;
}

// クリック可能なレシピタイトル（再利用可能）
export const RecipeTitle: React.FC<RecipeTitleProps> = ({ recipe, onClick }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">📄</span>
      <h3 
        onClick={() => onClick(recipe)}
        className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600 hover:underline"
      >
        {recipe.title}
      </h3>
    </div>
  );
};