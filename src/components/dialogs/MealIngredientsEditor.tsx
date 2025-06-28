import React from 'react';
import { IngredientsEditor, type Ingredient } from '../ui/IngredientsEditor';

// 材料編集コンポーネントのProps
interface MealIngredientsEditorProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
  disabled?: boolean;
  showTitle?: boolean;
}

// 献立材料編集コンポーネント
export const MealIngredientsEditor: React.FC<MealIngredientsEditorProps> = ({
  ingredients,
  onIngredientsChange,
  disabled = false,
  showTitle = true
}) => {
  return (
    <div className="space-y-3">
      {showTitle && (
        <label className="block text-sm font-medium text-gray-700">
          必要な材料
        </label>
      )}
      
      <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <IngredientsEditor
          ingredients={ingredients}
          onChange={onIngredientsChange}
        />
      </div>
      
      {ingredients.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-md">
          材料が登録されていません。
          <br />
          レシピを選択するか、手動で追加してください。
        </div>
      )}
      
      {!disabled && ingredients.length > 0 && (
        <div className="text-xs text-gray-600">
          材料をクリックして編集、×ボタンで削除できます。
        </div>
      )}
    </div>
  );
};
