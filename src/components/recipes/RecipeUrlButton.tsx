import React from 'react';

interface RecipeUrlButtonProps {
  url: string;
}

// レシピURL開くボタン（再利用可能）
export const RecipeUrlButton: React.FC<RecipeUrlButtonProps> = ({ url }) => {
  return (
    <button 
      onClick={() => window.open(url, '_blank')}
      className="text-sm text-blue-600 hover:text-blue-500"
    >
      🌐 レシピを見る
    </button>
  );
};