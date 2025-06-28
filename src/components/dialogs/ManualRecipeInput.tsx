import React from 'react';

// 手動入力コンポーネントのProps
interface ManualRecipeInputProps {
  recipeName: string;
  recipeUrl: string;
  onRecipeNameChange: (name: string) => void;
  onRecipeUrlChange: (url: string) => void;
  disabled?: boolean;
}

// 手動レシピ入力コンポーネント
export const ManualRecipeInput: React.FC<ManualRecipeInputProps> = ({
  recipeName,
  recipeUrl,
  onRecipeNameChange,
  onRecipeUrlChange,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      {/* 料理名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          料理名 *
        </label>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => onRecipeNameChange(e.target.value)}
          required
          placeholder="例: ハンバーグステーキ"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={disabled}
        />
      </div>

      {/* レシピURL（任意） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          レシピURL（任意）
        </label>
        <input
          type="url"
          value={recipeUrl}
          onChange={(e) => onRecipeUrlChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={disabled}
        />
        <div className="text-xs text-gray-500 mt-1">
          参考にしたレシピのURLを入力できます
        </div>
      </div>
    </div>
  );
};
