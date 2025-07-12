import React from 'react';
import { RecipeTitle } from './RecipeTitle';
import { RecipeUrlButton } from './RecipeUrlButton';
import { AddToMealPlanButton } from './AddToMealPlanButton';
import { EditButton } from '../ui/Button';
import type { SavedRecipe } from '../../types/recipe';

interface RecipeCardProps {
  recipe: SavedRecipe;
  onShowRecipeDetail: (recipe: SavedRecipe) => void;
  onEditRecipe: (recipe: SavedRecipe) => void;
  onAddToMealPlan: (recipe: SavedRecipe) => void;
  getLastCookedDate: (url: string) => string | null;
}

// 個別レシピカード全体コンポーネント
export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onShowRecipeDetail,
  onEditRecipe,
  onAddToMealPlan,
  getLastCookedDate,
}) => {
  const lastCookedDate = getLastCookedDate(recipe.url);

  // 日付フォーマット用のヘルパー関数（issue #31対応）
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
      <div className="space-y-3">
        {/* 上部: タイトルとアクションボタン */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <RecipeTitle 
              recipe={recipe}
              onClick={onShowRecipeDetail}
            />
          </div>
          <div className="flex gap-2">
            <AddToMealPlanButton 
              recipe={recipe}
              onClick={onAddToMealPlan}
            />
            <EditButton onClick={() => onEditRecipe(recipe)} />
          </div>
        </div>

        {/* 下部: レシピ詳細情報 */}
        <div>
          {/* URL・人前・最後に作った日を横並び */}
          <div className="flex flex-wrap items-center gap-4 mb-2">
            {recipe.url && (
              <RecipeUrlButton url={recipe.url} />
            )}
            
            <div className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">📋</span>
              {recipe.servings}人前
            </div>
            
            {/* 最後に作った日の表示（issue #31対応） */}
            {lastCookedDate && (
              <div className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">📅</span>
                最後に作った日: {formatDate(lastCookedDate)}
              </div>
            )}
          </div>
          
          {/* 材料情報の表示 */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <div className="flex items-center flex-shrink-0">
                <span className="text-xs text-gray-600 mr-1">📋</span>
                <span className="text-xs text-gray-600">材料:</span>
              </div>
              <div className="text-xs text-gray-500 overflow-hidden">
                {recipe.ingredients.slice(0, 5).map(ing => ing.name).join(', ')}
                {recipe.ingredients.length > 5 && '...'}
              </div>
            </div>
          )}
          
          {/* タグ一覧の表示 */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <div className="flex items-center flex-shrink-0">
                <span className="text-xs text-gray-600 mr-1">🏷️</span>
                <span className="text-xs text-gray-600">タグ:</span>
              </div>
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded whitespace-nowrap flex-shrink-0"
                  > 
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};