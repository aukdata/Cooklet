import React, { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import { AddRecipeModal } from './AddRecipeModal';

export const Recipes: React.FC = () => {
  const { recipes, loading, error } = useRecipes();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">レシピ管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          レシピ追加
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          まだレシピが登録されていません
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{recipe.name}</h3>
                    {recipe.cooking_time && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {recipe.cooking_time}分
                      </span>
                    )}
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {recipe.servings}人前
                    </span>
                  </div>

                  {recipe.notes && (
                    <p className="text-sm text-gray-600 mb-2">{recipe.notes}</p>
                  )}

                  {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">必要な食材:</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.recipe_ingredients.map((ing) => (
                          <span
                            key={ing.id}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {ing.ingredient?.name} {ing.quantity}{ing.unit}
                            {ing.is_optional && ' (任意)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.estimated_cost && (
                    <div className="text-sm text-gray-600">
                      推定コスト: ¥{recipe.estimated_cost}
                    </div>
                  )}

                  {recipe.external_url && (
                    <div className="mt-2">
                      <a
                        href={recipe.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        レシピを見る →
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    作った
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddRecipeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};