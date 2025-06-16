import React, { useState } from 'react';
import { QuantityInput } from '../common/QuantityInput';
import { analyzeRecipeFromUrl, isValidRecipeUrl } from '../../services/recipeAnalysis';

// 手動献立入力ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface ManualMealDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  onSave: (mealData: ManualMealForm) => void; // 献立データを保存する関数
  initialData?: ManualMealForm; // 初期データ（編集時）
}

// 手動献立フォームの型定義
interface ManualMealForm {
  dish_name: string; // 料理名
  recipe_url?: string; // レシピURL（任意）
  servings: number; // 人数
  ingredients: { name: string; quantity: string }[]; // 食材リスト
  memo?: string; // メモ
}

// 手動献立入力ダイアログコンポーネント - CLAUDE.md仕様書 5.6.3に準拠
export const ManualMealDialog: React.FC<ManualMealDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // フォームデータの状態管理
  const [formData, setFormData] = useState<ManualMealForm>({
    dish_name: initialData?.dish_name || '',
    recipe_url: initialData?.recipe_url || '',
    servings: initialData?.servings || 2,
    ingredients: initialData?.ingredients || [{ name: '', quantity: '' }],
    memo: initialData?.memo || ''
  });

  // レシピ解析の状態管理
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 食材を追加する関数
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '' }]
    }));
  };

  // 食材を削除する関数
  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // 食材を更新する関数
  const updateIngredient = (index: number, field: 'name' | 'quantity', value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  // レシピ解析ハンドラ
  const handleAnalyzeRecipe = async () => {
    if (!isValidRecipeUrl(formData.recipe_url || '')) {
      alert('HTTPまたはHTTPSから始まる有効なURLを入力してください');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeRecipeFromUrl(formData.recipe_url!);
      
      if (result.success && result.data) {
        // 解析結果をフォームに反映
        setFormData(prev => ({
          ...prev,
          dish_name: result.data!.recipeName,
          servings: result.data!.servings,
          ingredients: result.data!.ingredients
        }));
        alert('レシピを解析しました！');
      } else {
        alert(result.error || 'レシピの解析に失敗しました');
      }
    } catch {
      alert('解析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dish_name.trim()) {
      alert('料理名を入力してください');
      return;
    }
    onSave(formData);
    onClose();
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ダイアログヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">✏️</span>
            手動で献立入力
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 料理名入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 料理名:
            </label>
            <input
              type="text"
              value={formData.dish_name}
              onChange={(e) => setFormData(prev => ({ ...prev, dish_name: e.target.value }))}
              placeholder="ハンバーグ定食"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* レシピURL入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🌐 レシピURL (任意):
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={formData.recipe_url}
                onChange={(e) => setFormData(prev => ({ ...prev, recipe_url: e.target.value }))}
                placeholder="https://cookpad.com/..."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAnalyzeRecipe}
                disabled={!isValidRecipeUrl(formData.recipe_url || '') || isAnalyzing}
                className={`w-full py-2 px-4 text-sm rounded ${
                  isValidRecipeUrl(formData.recipe_url || '') && !isAnalyzing
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? '🤖 解析中...' : '🔍 解析'}
              </button>
            </div>
          </div>

          {/* 人数入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              👥 人数:
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                max="10"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
              />
              <span className="ml-2 text-sm text-gray-600">人前</span>
            </div>
          </div>

          {/* 食材リスト */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 使用する食材:
            </label>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm text-gray-500">•</span>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder="牛ひき肉"
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <QuantityInput
                    value={ingredient.quantity}
                    onChange={(value) => updateIngredient(index, 'quantity', value)}
                    placeholder="数量"
                    className="w-24"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            >
              + 食材追加
            </button>
          </div>

          {/* メモ入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 メモ:
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              placeholder="特別な調理法やアレンジなど"
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};