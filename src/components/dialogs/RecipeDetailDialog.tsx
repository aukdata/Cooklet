import React from 'react';
import type { SavedRecipe } from '../../hooks/useRecipes';
import { Button, DeleteButton } from '../../components/ui/Button';

interface RecipeDetailDialogProps {
  isOpen: boolean;
  recipe: SavedRecipe | null;
  onClose: () => void;
  onEdit: (recipe: SavedRecipe) => void;
  onDelete: (recipe: SavedRecipe) => void;
}

// レシピ詳細ダイアログコンポーネント - issue #5対応
export const RecipeDetailDialog: React.FC<RecipeDetailDialogProps> = ({
  isOpen,
  recipe,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📄</span>
            レシピ詳細
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-4">
          {/* レシピタイトル */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {recipe.title}
            </h3>
          </div>

          {/* 基本情報 */}
          <div className="grid grid-cols-1 gap-3">
            {/* 人前 */}
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span className="text-sm text-gray-600">人数:</span>
              <span className="ml-2 font-medium">{recipe.servings}人前</span>
            </div>

            {/* URL */}
            {recipe.url && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="mr-2">🌐</span>
                  <span className="text-sm text-gray-600">レシピURL:</span>
                </div>
                <a
                  href={recipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 hover:underline break-all text-sm pl-6"
                >
                  {recipe.url}
                </a>
              </div>
            )}

            {/* 作成日 */}
            <div className="flex items-center">
              <span className="mr-2">📅</span>
              <span className="text-sm text-gray-600">作成日:</span>
              <span className="ml-2 text-sm text-gray-900">
                {new Date(recipe.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>

          {/* タグ */}
          {recipe.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-2">🏷️</span>
                <span className="text-sm text-gray-600">タグ:</span>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 食材情報 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <span className="mr-2">📋</span>
              <span className="text-sm font-medium text-gray-700">食材情報</span>
            </div>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <div className="pl-6 space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    • {ingredient.name} {ingredient.quantity}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 pl-6">
                レシピURLから食材を確認してください
              </p>
            )}
          </div>

          {/* メモ欄（将来的に実装予定） */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <span className="mr-2">📝</span>
              <span className="text-sm font-medium text-gray-700">メモ</span>
            </div>
            <p className="text-sm text-gray-500 pl-6">
              まだメモはありません
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between space-x-3">
            {/* 左側: 危険アクション */}
            <div className="flex-1">
              <DeleteButton
                onClick={() => {
                  onDelete(recipe);
                  onClose();
                }}
              />
            </div>

            {/* 右側: 安全アクション */}
            <div className="flex space-x-2 flex-1">
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                閉じる
              </Button>
              <Button
                onClick={() => {
                  onEdit(recipe);
                  onClose();
                }}
                variant="primary"
                className="flex-1"
              >
                編集
              </Button>
            </div>
          </div>

          {/* 外部リンクボタン */}
          {recipe.url && (
            <div className="mt-3">
              <a
                href={recipe.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors text-sm border border-blue-200"
              >
                🌐 レシピを見る
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};