import React from 'react';

interface RecipesHeaderProps {
  recipeCount: number;
  loading: boolean;
  error: string | null;
  onAddNewRecipe: () => void;
}

// レシピページのヘッダー部分（タイトル・件数・追加ボタン）
export const RecipesHeader: React.FC<RecipesHeaderProps> = ({
  recipeCount,
  loading,
  error,
  onAddNewRecipe,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center">
          <span className="mr-2">🍳</span>
          レシピ管理
        </h2>
        <div className="text-sm text-gray-600 mt-1">
          保存済み: {recipeCount}件
          {loading && <span className="ml-2">読み込み中...</span>}
          {error && <span className="ml-2 text-red-500">エラー: {error}</span>}
        </div>
      </div>
      <button
        onClick={onAddNewRecipe}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        + レシピを追加
      </button>
    </div>
  );
};