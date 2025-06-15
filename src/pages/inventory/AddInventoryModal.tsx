import React, { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useIngredients } from '../../hooks/useIngredients';
import { InventoryItem } from '../../types';

interface AddInventoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<InventoryItem>;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ onClose, onSuccess, addInventoryItem }) => {
  const { ingredients, addIngredient } = useIngredients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ingredient_id: '',
    custom_ingredient_name: '',
    use_custom_ingredient: false,
    quantity: '',
    unit: '',
    purchase_price: '',
    purchase_date: '',
    expiry_date: '',
    location: 'refrigerator' as const,
    is_leftover: false,
  });

  const selectedIngredient = ingredients.find(ing => ing.id === parseInt(formData.ingredient_id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let ingredientId: number;

      if (formData.use_custom_ingredient && formData.custom_ingredient_name.trim()) {
        // 新しい食材を追加
        const newIngredient = await addIngredient({
          name: formData.custom_ingredient_name.trim(),
          category: 'others',
          default_unit: formData.unit || 'g',
          typical_price: undefined,
        });
        ingredientId = newIngredient.id;
      } else if (formData.ingredient_id) {
        ingredientId = parseInt(formData.ingredient_id);
      } else {
        throw new Error('食材を選択するか、新しい食材名を入力してください');
      }

      const inventoryItem: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        ingredient_id: ingredientId,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit || selectedIngredient?.default_unit || 'g',
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        purchase_date: formData.purchase_date || undefined,
        expiry_date: formData.expiry_date || undefined,
        location: formData.location,
        is_leftover: formData.is_leftover,
        leftover_recipe_id: undefined,
      };

      await addInventoryItem(inventoryItem);
      onSuccess();
    } catch (error) {
      console.error('在庫追加エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (ingredientId: string) => {
    const ingredient = ingredients.find(ing => ing.id === parseInt(ingredientId));
    setFormData(prev => ({
      ...prev,
      ingredient_id: ingredientId,
      unit: ingredient?.default_unit || 'g',
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">在庫追加</h3>
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
              食材 *
            </label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="ingredient_type"
                    checked={!formData.use_custom_ingredient}
                    onChange={() => setFormData(prev => ({ ...prev, use_custom_ingredient: false, custom_ingredient_name: '' }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">リストから選択</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="ingredient_type"
                    checked={formData.use_custom_ingredient}
                    onChange={() => setFormData(prev => ({ ...prev, use_custom_ingredient: true, ingredient_id: '' }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">新しい食材を追加</span>
                </label>
              </div>

              {!formData.use_custom_ingredient ? (
                <select
                  value={formData.ingredient_id}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  required={!formData.use_custom_ingredient}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">選択してください</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.category})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.custom_ingredient_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_ingredient_name: e.target.value }))}
                  placeholder="新しい食材名を入力"
                  required={formData.use_custom_ingredient}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数量 *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                単位
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder={formData.use_custom_ingredient ? 'g' : (selectedIngredient?.default_unit || 'g')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              保存場所 *
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="refrigerator">冷蔵庫</option>
              <option value="freezer">冷凍庫</option>
              <option value="pantry">常温</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              賞味期限
            </label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              購入価格
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.purchase_price}
              onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
              placeholder="円"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              購入日
            </label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_leftover"
              checked={formData.is_leftover}
              onChange={(e) => setFormData(prev => ({ ...prev, is_leftover: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_leftover" className="ml-2 block text-sm text-gray-900">
              作り置き料理
            </label>
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