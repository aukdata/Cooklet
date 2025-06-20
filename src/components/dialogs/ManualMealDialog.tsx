import React, { useState } from 'react';
import { BaseDialog } from '../ui/BaseDialog';
import { IngredientsEditor, type Ingredient } from '../ui/IngredientsEditor';
import { useToast } from '../../hooks/useToast.tsx';
import { useRecipeExtraction } from '../../hooks/useRecipeExtraction';

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
  ingredients: Ingredient[]; // 食材リスト
  memo?: string; // メモ
}

// 手動献立入力ダイアログコンポーネント - CLAUDE.md仕様書 5.6.3に準拠
export const ManualMealDialog: React.FC<ManualMealDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const { showError, showSuccess } = useToast();
  const { state: extractionState, extractFromUrl } = useRecipeExtraction();

  // フォームデータの状態管理
  const [formData, setFormData] = useState<ManualMealForm>({
    dish_name: initialData?.dish_name || '',
    recipe_url: initialData?.recipe_url || '',
    servings: initialData?.servings || 2,
    ingredients: initialData?.ingredients || [],
    memo: initialData?.memo || ''
  });

  // 食材リスト変更ハンドラ
  const handleIngredientsChange = (newIngredients: Ingredient[]) => {
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  // レシピ解析ハンドラ
  const handleAnalyzeRecipe = async () => {
    const url = formData.recipe_url?.trim();
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      showError('HTTPまたはHTTPSから始まる有効なURLを入力してください');
      return;
    }

    const extraction = await extractFromUrl(formData.recipe_url!);
    
    if (extraction) {
      // 解析結果をフォームに反映
      setFormData(prev => ({
        ...prev,
        dish_name: extraction.title || prev.dish_name,
        servings: extraction.servings || prev.servings,
        ingredients: extraction.ingredients.length > 0 ? 
          extraction.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.unit ? `${ing.quantity}${ing.unit}` : ing.quantity
          })) : prev.ingredients
      }));

      if (extraction.isRecipeSite) {
        showSuccess(`レシピを解析しました！（信頼度: ${Math.round(extraction.confidence * 100)}%）`);
      } else {
        showError('レシピサイトではない可能性があります。内容を確認してください。');
      }
    }
  };

  // 保存ハンドラ
  const handleSave = () => {
    if (!formData.dish_name.trim()) {
      showError('料理名を入力してください');
      return;
    }
    onSave(formData);
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="手動で献立入力"
      icon="✏️"
      onSave={handleSave}
      size="lg"
    >
      <div className="space-y-4 max-h-[50vh] overflow-y-auto">
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
                placeholder="https://..."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAnalyzeRecipe}
                disabled={!formData.recipe_url?.trim() || extractionState.isExtracting}
                className={`w-full py-2 px-4 text-sm rounded ${
                  formData.recipe_url?.trim() && !extractionState.isExtracting
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {extractionState.isExtracting ? '🔍 解析中...' : '🔍 抽出'}
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
            <IngredientsEditor
              ingredients={formData.ingredients}
              onChange={handleIngredientsChange}
              addButtonText="+ 食材追加"
              showEmptyItem={true}
            />
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

      </div>
    </BaseDialog>
  );
};