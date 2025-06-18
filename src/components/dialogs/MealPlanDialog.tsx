import React, { useState, useMemo } from 'react';
import { useRecipes } from '../../hooks/useRecipes';

// 献立編集ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface MealPlanDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  onSave: (mealPlan: MealPlanForm) => void; // 献立を保存する関数
  onDelete?: () => void; // 献立を削除する関数（編集時のみ）
  initialData?: MealPlanForm; // 初期データ（編集時）
  isEditing?: boolean; // 編集モードかどうか
}

// 献立フォームの型定義
interface MealPlanForm {
  date: string; // 日付（YYYY-MM-DD形式）
  meal_type: '朝' | '昼' | '夜'; // 食事タイプ
  recipe_id?: string; // レシピID（任意）
  recipe_name?: string; // レシピ名
  recipe_url?: string; // レシピURL（手動入力時）
  servings: number; // 人数
  memo?: string; // メモ
}

// レシピ選択用の型定義
interface RecipeOption {
  id: string;
  name: string;
}

// 献立編集ダイアログコンポーネント - CLAUDE.md仕様書 5.6.2に準拠
export const MealPlanDialog: React.FC<MealPlanDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing = false
}) => {
  // DBからレシピデータを取得・操作
  const { recipes, loading: recipesLoading, addRecipe } = useRecipes();
  
  // レシピオプションの生成（DBデータ + 手動入力オプション）
  const recipeOptions: RecipeOption[] = useMemo(() => {
    if (recipesLoading || !recipes) {
      return [{ id: 'manual', name: '手動入力' }];
    }
    
    const dbRecipes = recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.title
    }));
    
    return [...dbRecipes, { id: 'manual', name: '手動入力' }];
  }, [recipes, recipesLoading]);
  
  // フォームデータの状態管理
  const [formData, setFormData] = useState<MealPlanForm>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    meal_type: initialData?.meal_type || '夜',
    recipe_id: initialData?.recipe_id || '',
    recipe_name: initialData?.recipe_name || '',
    recipe_url: initialData?.recipe_url || '',
    servings: initialData?.servings || 2,
    memo: initialData?.memo || ''
  });

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 手動入力の場合は、レシピも同時に保存
      if (formData.recipe_id === 'manual' && formData.recipe_name?.trim()) {
        // 重複チェック: 同じタイトルのレシピが既に存在するかチェック
        const existingRecipe = recipes?.find(
          recipe => recipe.title.toLowerCase() === formData.recipe_name?.toLowerCase()
        );
        
        if (!existingRecipe) {
          // 新しいレシピを保存
          const newRecipe = await addRecipe({
            title: formData.recipe_name.trim(),
            url: formData.recipe_url?.trim() || '',
            servings: formData.servings,
            tags: [] // デフォルトでは空のタグ配列
          });
          
          // 保存されたレシピのIDを献立データに設定
          const updatedFormData = {
            ...formData,
            recipe_id: newRecipe.id,
            recipe_name: newRecipe.title
          };
          
          onSave(updatedFormData);
        } else {
          // 既存のレシピを使用
          const updatedFormData = {
            ...formData,
            recipe_id: existingRecipe.id,
            recipe_name: existingRecipe.title
          };
          
          onSave(updatedFormData);
        }
      } else {
        // 手動入力以外の場合は通常の保存
        onSave(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('献立の保存に失敗しました:', error);
      alert('献立の保存に失敗しました。もう一度お試しください。');
    }
  };

  // 削除確認ハンドラ
  const handleDelete = () => {
    if (window.confirm('この献立を削除しますか？')) {
      onDelete?.();
      onClose();
    }
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
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
                {recipeOptions.map((recipe) => (
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
              
              {/* レシピ読み込み状態表示 */}
              {recipesLoading && (
                <div className="text-xs text-gray-500 mt-2">
                  レシピを読み込み中...
                </div>
              )}
            </div>
          </div>

          {/* 手動入力時の詳細フィールド */}
          {formData.recipe_id === 'manual' && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 料理名:
                </label>
                <input
                  type="text"
                  value={formData.recipe_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipe_name: e.target.value }))}
                  placeholder="ハンバーグ定食"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🌐 レシピURL (任意):
                </label>
                <input
                  type="url"
                  value={formData.recipe_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipe_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          )}

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
            {/* 削除ボタン（編集時のみ表示） */}
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
            )}
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