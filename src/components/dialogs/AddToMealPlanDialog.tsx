import React, { useState } from 'react';
import { type SavedRecipe } from '../../hooks/useRecipes';

// 献立追加ダイアログのプロパティ
interface AddToMealPlanDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  recipe: SavedRecipe | null; // 追加するレシピ
  onClose: () => void; // ダイアログを閉じる関数
  onAdd: (date: string, mealType: '朝' | '昼' | '夜', recipe: SavedRecipe) => void; // 献立に追加する関数（レシピ情報も含む）
}

// 献立追加ダイアログコンポーネント - issue #31対応
export const AddToMealPlanDialog: React.FC<AddToMealPlanDialogProps> = ({
  isOpen,
  recipe,
  onClose,
  onAdd
}) => {
  // フォームデータの状態管理
  const [selectedDate, setSelectedDate] = useState(() => {
    // デフォルトは今日
    return new Date().toISOString().split('T')[0];
  });
  const [selectedMealType, setSelectedMealType] = useState<'朝' | '昼' | '夜'>('夜');

  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipe) {
      onAdd(selectedDate, selectedMealType, recipe);
    }
    onClose();
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto my-8 max-h-[90vh] overflow-y-auto">
        {/* ダイアログヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📅</span>
            献立に追加
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* レシピ情報表示 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="mr-2">🍳</span>
            <span className="font-medium">{recipe.title}</span>
          </div>
          <div className="text-sm text-gray-600">
            {recipe.servings}人前
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 日付選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 日付:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* 食事タイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🕐 食事:
            </label>
            <div className="space-y-2">
              {[
                { value: '朝', label: '🌅 朝食', emoji: '🌅' },
                { value: '昼', label: '🌞 昼食', emoji: '🌞' },
                { value: '夜', label: '🌙 夕食', emoji: '🌙' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="mealType"
                    value={option.value}
                    checked={selectedMealType === option.value}
                    onChange={(e) => setSelectedMealType(e.target.value as '朝' | '昼' | '夜')}
                    className="mr-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              献立に追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};