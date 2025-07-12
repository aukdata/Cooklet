import React from 'react';
import type { SavedRecipe } from '../../types/recipe';

interface AddToMealPlanButtonProps {
  recipe: SavedRecipe;
  onClick: (recipe: SavedRecipe) => void;
}

// 献立追加ボタン（再利用可能）
export const AddToMealPlanButton: React.FC<AddToMealPlanButtonProps> = ({
  recipe,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(recipe)}
      className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
    >
      📅 献立に追加
    </button>
  );
};