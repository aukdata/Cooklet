import React, { useState } from 'react';

// 献立編集ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface MealPlanDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  onSave: (mealPlan: MealPlanForm) => void; // 献立を保存する関数
  initialData?: MealPlanForm; // 初期データ（編集時）
}

// 献立フォームの型定義
interface MealPlanForm {
  date: string; // 日付（YYYY-MM-DD形式）
  meal_type: '朝' | '昼' | '夜'; // 食事タイプ
  recipe_id?: string; // レシピID（任意）
  recipe_name?: string; // レシピ名
  servings: number; // 人数
  memo?: string; // メモ
}

// サンプルレシピデータ
const sampleRecipes = [
  { id: '1', name: 'ハンバーグ定食' },
  { id: '2', name: '親子丼' },
  { id: '3', name: 'トマトパスタ' },
  { id: 'manual', name: '手動入力' }
];

// 献立編集ダイアログコンポーネント - CLAUDE.md仕様書 5.6.2に準拠
export const MealPlanDialog: React.FC<MealPlanDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // フォームデータの状態管理
  const [formData, setFormData] = useState<MealPlanForm>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    meal_type: initialData?.meal_type || '夜',
    recipe_id: initialData?.recipe_id || '',
    recipe_name: initialData?.recipe_name || '',
    servings: initialData?.servings || 2,
    memo: initialData?.memo || ''
  });

  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* ダイアログヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">✏️</span>
            献立を編集
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 日付選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 日付: {formData.date} {formData.date === new Date().toISOString().split('T')[0] ? '(今日)' : ''}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* 食事タイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🕐 食事:
            </label>
            <select
              value={formData.meal_type}
              onChange={(e) => setFormData(prev => ({ ...prev, meal_type: e.target.value as '朝' | '昼' | '夜' }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="朝">朝食</option>
              <option value="昼">昼食</option>
              <option value="夜">夕食</option>
            </select>
          </div>

          {/* レシピ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🍳 レシピを選択:
            </label>
            <div className="border border-gray-300 rounded p-3 max-h-32 overflow-y-auto">
              <input
                type="text"
                placeholder="🔍 レシピを検索..."
                className="w-full border border-gray-200 rounded px-2 py-1 mb-2 text-sm"
              />
              <div className="space-y-1">
                {sampleRecipes.map((recipe) => (
                  <label key={recipe.id} className="flex items-center">
                    <input
                      type="radio"
                      name="recipe"
                      value={recipe.id}
                      checked={formData.recipe_id === recipe.id}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        recipe_id: e.target.value,
                        recipe_name: recipe.name
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm">{recipe.name}</span>
                  </label>
                ))}
              </div>
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