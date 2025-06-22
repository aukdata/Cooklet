import React, { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';
import type { CreateRecipeData } from '../../types/recipe';

interface AddRecipeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface RecipeIngredientForm {
  ingredient_id: number;
  quantity: number;
  unit: string;
  is_optional: boolean;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ onClose, onSuccess }) => {
  const { addRecipe } = useRecipes();
  const { ingredients } = useIngredients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    external_url: '',
    cooking_time: '',
    servings: 1,
    estimated_cost: '',
    notes: '',
  });
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientForm[]>([]);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [ingredientForm, setIngredientForm] = useState({
    ingredient_id: '',
    quantity: '',
    unit: '',
    is_optional: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recipe: CreateRecipeData = {
        title: formData.name,
        url: formData.external_url || '',
        servings: formData.servings,
        tags: [],
        ingredients: [] // 空の材料配列を追加
      };

      await addRecipe(recipe);

      // フォームデータをリセット
      setFormData({
        name: '',
        external_url: '',
        cooking_time: '',
        servings: 1,
        estimated_cost: '',
        notes: '',
      });
      setRecipeIngredients([]);
      setShowIngredientForm(false);
      setIngredientForm({
        ingredient_id: '',
        quantity: '',
        unit: '',
        is_optional: false,
      });

      onSuccess();
    } catch (error) {
      console.error('レシピ追加エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    if (!ingredientForm.ingredient_id || !ingredientForm.quantity) {
      return;
    }

    const ingredient = ingredients.find(ing => ing.id === parseInt(ingredientForm.ingredient_id));
    if (!ingredient) return;

    const newIngredient: RecipeIngredientForm = {
      ingredient_id: parseInt(ingredientForm.ingredient_id),
      quantity: parseFloat(ingredientForm.quantity),
      unit: ingredientForm.unit || ingredient.defaultUnit,
      is_optional: ingredientForm.is_optional,
    };

    setRecipeIngredients(prev => [...prev, newIngredient]);
    setIngredientForm({
      ingredient_id: '',
      quantity: '',
      unit: '',
      is_optional: false,
    });
    setShowIngredientForm(false);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">レシピ追加</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レシピ名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                調理時間（分）
              </label>
              <input
                type="number"
                value={formData.cooking_time}
                onChange={(e) => setFormData(prev => ({ ...prev, cooking_time: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                人前 *
              </label>
              <input
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              外部レシピURL
            </label>
            <input
              type="url"
              value={formData.external_url}
              onChange={(e) => setFormData(prev => ({ ...prev, external_url: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              推定コスト（円）
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.estimated_cost}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                必要な食材
              </label>
              <button
                type="button"
                onClick={() => setShowIngredientForm(true)}
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                + 食材追加
              </button>
            </div>

            {recipeIngredients.length > 0 && (
              <div className="space-y-2 mb-3">
                {recipeIngredients.map((ing, index) => {
                  const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        {ingredient?.name} {ing.quantity}{ing.unit}
                        {ing.is_optional && ' (任意)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {showIngredientForm && (
              <div className="border border-gray-200 rounded p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={ingredientForm.ingredient_id}
                    onChange={(e) => {
                      const ingredient = ingredients.find(ing => ing.id === parseInt(e.target.value));
                      setIngredientForm(prev => ({
                        ...prev,
                        ingredient_id: e.target.value,
                        unit: ingredient?.defaultUnit || '',
                      }));
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">食材を選択</option>
                    {ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    value={ingredientForm.quantity}
                    onChange={(e) => setIngredientForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="数量"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ingredientForm.unit}
                    onChange={(e) => setIngredientForm(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="単位"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ingredientForm.is_optional}
                      onChange={(e) => setIngredientForm(prev => ({ ...prev, is_optional: e.target.checked }))}
                      className="mr-1"
                    />
                    <span className="text-sm">任意</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                  >
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIngredientForm(false)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};