import React, { useState, useEffect } from 'react';
import { QuantityInput } from '../common/QuantityInput';
import { useToast } from '../../hooks/useToast.tsx';
import { useRecipeExtraction, validateRecipeExtraction } from '../../hooks/useRecipeExtraction';

// レシピ編集ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface RecipeDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  onSave: (recipeData: RecipeForm) => void; // レシピデータを保存する関数
  onDelete?: () => void; // レシピ削除関数（編集時）
  initialData?: RecipeForm; // 初期データ（編集時）
  isEditing?: boolean; // 編集モードかどうか
}

// レシピフォームの型定義
interface RecipeForm {
  title: string; // レシピ名
  url: string; // レシピURL
  servings: number; // 人数
  ingredients: { name: string; quantity: string }[]; // 食材リスト
  tags: string[]; // タグ
}

// レシピ編集ダイアログコンポーネント - CLAUDE.md仕様書 5.6.4に準拠
export const RecipeDialog: React.FC<RecipeDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing = false
}) => {
  const { showError, showSuccess } = useToast();
  const { state: extractionState, extractFromUrl, clearResult, clearError } = useRecipeExtraction();

  // フォームデータの状態管理
  const [formData, setFormData] = useState<RecipeForm>({
    title: '',
    url: '',
    servings: 2,
    ingredients: [{ name: '', quantity: '' }],
    tags: []
  });

  const [newTag, setNewTag] = useState(''); // 新しいタグ入力用


  // initialDataが変更されたときにフォームデータを更新
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        url: initialData.url || '',
        servings: initialData.servings || 2,
        ingredients: initialData.ingredients || [{ name: '', quantity: '' }],
        tags: initialData.tags || []
      });
    } else {
      // 新規作成時はフォームをリセット
      setFormData({
        title: '',
        url: '',
        servings: 2,
        ingredients: [{ name: '', quantity: '' }],
        tags: []
      });
    }
  }, [initialData]);

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

  // レシピ抽出ハンドラー
  const handleExtractRecipe = async () => {
    if (!formData.url.trim()) {
      showError('URLを入力してください');
      return;
    }

    clearError(); // 前回のエラーをクリア
    
    const extraction = await extractFromUrl(formData.url);
    
    if (extraction) {
      // 抽出結果を検証
      const validation = validateRecipeExtraction(extraction);
      
      // フォームデータを更新
      setFormData(prev => ({
        ...prev,
        title: extraction.title || prev.title,
        servings: extraction.servings || prev.servings,
        ingredients: extraction.ingredients.length > 0 ? 
          extraction.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.unit ? `${ing.quantity}${ing.unit}` : ing.quantity
          })) : prev.ingredients
      }));

      // 結果をユーザーに通知
      if (validation.isValid) {
        showSuccess(`レシピ情報を抽出しました（信頼度: ${Math.round(extraction.confidence * 100)}%）`);
      } else {
        showSuccess('レシピ情報を抽出しましたが、内容を確認してください');
        // 問題があれば詳細をコンソールに出力
        console.warn('抽出結果の検証:', validation);
      }
    }
  };

  // タグを追加する関数 - 複数タグの同時追加に対応
  const addTag = () => {
    if (!newTag.trim()) return;
    
    // デリミタで分割（半角スペース、全角スペース、「,」、「、」）
    const delimiters = /[\s\u3000,、]+/;
    const inputTags = newTag
      .split(delimiters)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0); // 空文字列を除外
    
    // 重複を除外して新しいタグのみを追加
    const newTags = inputTags.filter(tag => !formData.tags.includes(tag));
    
    if (newTags.length > 0) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, ...newTags]
      }));
    }
    
    setNewTag('');
  };

  // タグを削除する関数
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 削除ハンドラー
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError('レシピ名を入力してください');
      return;
    }
    onSave(formData);
    onClose();
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ダイアログヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">✏️</span>
            レシピ編集
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* レシピ名入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 レシピ名:
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ハンバーグ定食"
              className="w-full border border-gray-300 rounded px-3 py-2 min-w-0"
              required
            />
          </div>

          {/* URL入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🌐 URL:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 min-w-0 overflow-hidden"
                style={{ wordBreak: 'break-all' }}
              />
              <button
                type="button"
                onClick={handleExtractRecipe}
                disabled={!formData.url.trim() || extractionState.isExtracting}
                className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 disabled:opacity-50 whitespace-nowrap"
              >
                {extractionState.isExtracting ? '抽出中...' : 'レシピ抽出'}
              </button>
            </div>
            
            {/* 抽出進行状況の表示 */}
            {extractionState.progress.step !== 'idle' && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">
                  {extractionState.progress.message}
                </div>
                {extractionState.isExtracting && (
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-indigo-600 h-1 rounded-full animate-pulse w-1/2"></div>
                  </div>
                )}
                {extractionState.error && (
                  <div className="text-xs text-red-600 mt-1">
                    ⚠️ {extractionState.error}
                  </div>
                )}
                {extractionState.result && extractionState.progress.step === 'completed' && (
                  <div className="text-xs text-green-600 mt-1 flex items-center">
                    ✅ 抽出完了 - 信頼度: {Math.round(extractionState.result.confidence * 100)}%
                    <button
                      type="button"
                      onClick={clearResult}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
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
              📋 食材:
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
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm min-w-0"
                  />
                  <QuantityInput
                    value={ingredient.quantity}
                    onChange={(value) => updateIngredient(index, 'quantity', value)}
                    placeholder="数量"
                    className="w-32"
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

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ タグ:
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="肉料理 和食 簡単 (複数可)"
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm min-w-0"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                追加
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              複数タグ入力可能（スペース・カンマ・句点で区切り）
            </p>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
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