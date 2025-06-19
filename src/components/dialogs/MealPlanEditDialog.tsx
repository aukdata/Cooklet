import React, { useState, useEffect, useMemo } from 'react';
import { type MealPlan } from '../../hooks';
import { useRecipes } from '../../hooks/useRecipes';
import { QuantityInput } from '../common/QuantityInput';
import { ConfirmDialog } from './ConfirmDialog';

// レシピデータ型（食材情報付き）
interface Recipe {
  id: string;
  title: string;
  url: string;
  ingredients: { name: string; quantity: string }[];
}

// ダイアログのProps型定義
interface MealPlanEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mealPlan: MealPlan) => void;
  onDelete?: () => void; // 献立を削除する関数（編集時のみ）
  initialData?: MealPlan;
  selectedDate: string;
  selectedMealType?: '朝' | '昼' | '夜' | '間食';
}

// 献立編集ダイアログコンポーネント - CLAUDE.md仕様書5.6.2/5.6.3準拠
export const MealPlanEditDialog: React.FC<MealPlanEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  selectedDate,
  selectedMealType = '夜'
}) => {
  // レシピデータ取得フック
  const { recipes, loading: recipesLoading } = useRecipes();

  // フォームの状態管理
  const [mealType, setMealType] = useState<'朝' | '昼' | '夜' | '間食'>(selectedMealType);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(''); // コンボボックス用
  const [searchQuery, setSearchQuery] = useState(''); // 絡り込み用検索クエリ
  const [manualRecipeName, setManualRecipeName] = useState('');
  const [manualRecipeUrl, setManualRecipeUrl] = useState('');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string }[]>([]);
  const [memo, setMemo] = useState('');

  // 削除確認ダイアログの状態管理
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // DBからレシピデータを取得（食材情報は献立計画時に入力）
  const recipeList: Recipe[] = useMemo(() => {
    if (recipesLoading || !recipes) return [];
    
    // SavedRecipeをRecipe型に変換（食材は空配列）
    return recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      url: recipe.url,
      ingredients: [] // 食材は献立計画時に入力
    }));
  }, [recipes, recipesLoading]);

  // 検索クエリでフィルタリングされたレシピ
  const filteredRecipes = recipeList.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // コンボボックス用のレシピオプション（新規追加オプション付き）
  const recipeOptions = [
    { value: '', label: 'レシピを選択してください' },
    ...filteredRecipes.map(recipe => ({ value: recipe.id, label: recipe.title })),
    { value: 'manual', label: '新規追加（手動入力）' }
  ];

  // 初期データの設定
  useEffect(() => {
    if (initialData) {
      setMealType(initialData.meal_type);
      setManualRecipeName(initialData.memo || '');
      setManualRecipeUrl(initialData.recipe_url || '');
      setIngredients(initialData.ingredients);
      setMemo(initialData.memo || '');
      
      // 既存レシピの場合はIDを設定、そうでなければ手動入力
      if (initialData.recipe_url) {
        const existingRecipe = recipeList.find(r => r.url === initialData.recipe_url);
        if (existingRecipe) {
          setSelectedRecipeId(existingRecipe.id);
          setSelectedRecipe(existingRecipe);
        } else {
          setSelectedRecipeId('manual');
        }
      } else {
        setSelectedRecipeId('manual');
      }
    } else {
      // 新規作成時はリセット
      setMealType(selectedMealType);
      setSelectedRecipe(null);
      setSelectedRecipeId('');
      setSearchQuery(''); // 検索クエリもリセット
      setManualRecipeName('');
      setManualRecipeUrl('');
      setIngredients([]);
      setMemo('');
    }
  }, [initialData, selectedMealType, isOpen, recipeList]);


  // レシピ選択処理（コンボボックス用）
  const handleRecipeChange = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    
    if (recipeId === '' || recipeId === 'manual') {
      // 未選択または手動入力の場合
      setSelectedRecipe(null);
      if (ingredients.length === 0) {
        setIngredients([{ name: '', quantity: '' }]);
      }
    } else {
      // 既存レシピを選択した場合
      const recipe = recipeList.find(r => r.id === recipeId);
      if (recipe) {
        setSelectedRecipe(recipe);
        // 食材は空なので、空の食材を1つ追加して入力を促す
        setIngredients([{ name: '', quantity: '' }]);
        setManualRecipeName(recipe.title);
        setManualRecipeUrl(recipe.url);
      }
    }
  };
  
  // 検索クエリが変更されたときの処理
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    // 現在選択されているレシピがフィルター結果に含まれない場合は選択をリセット
    if (selectedRecipeId && selectedRecipeId !== '' && selectedRecipeId !== 'manual') {
      const isSelectedRecipeVisible = recipeList.some(recipe => 
        recipe.id === selectedRecipeId && 
        recipe.title.toLowerCase().includes(query.toLowerCase())
      );
      if (!isSelectedRecipeVisible) {
        setSelectedRecipeId('');
        setSelectedRecipe(null);
      }
    }
  };

  // 食材追加
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  // 食材削除
  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // 食材変更
  const handleIngredientChange = (index: number, field: 'name' | 'quantity', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // 保存処理
  const handleSave = () => {
    const mealPlan: MealPlan = {
      id: initialData?.id,
      date: selectedDate,
      meal_type: mealType,
      recipe_url: (selectedRecipeId === 'manual' || selectedRecipeId === '') ? (manualRecipeUrl || undefined) : selectedRecipe?.url,
      ingredients: ingredients.filter(ing => ing.name.trim() !== ''),
      memo: manualRecipeName.trim() || memo.trim() || undefined
    };

    onSave(mealPlan);
    onClose();
  };

  // 削除確認ハンドラ
  const handleDelete = () => {
    setIsConfirmDialogOpen(true);
  };

  // 削除実行ハンドラ
  const handleConfirmDelete = () => {
    onDelete?.();
    onClose();
    setIsConfirmDialogOpen(false);
  };

  // 削除キャンセルハンドラ
  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  // 削除対象の説明文を生成
  const getMealDescription = () => {
    return manualRecipeName || memo || `${mealType}食`;
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  // 日付を表示用にフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return `${date.getMonth() + 1}/${date.getDate()}${isToday ? ' (今日)' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">✏️</span>
            {initialData ? '献立を編集' : '献立を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 日付・食事 */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 日付:
              </label>
              <div className="text-sm text-gray-900">{formatDate(selectedDate)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🕐 食事:
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as '朝' | '昼' | '夜' | '間食')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="朝">朝食</option>
                <option value="昼">昼食</option>
                <option value="夜">夕食</option>
                <option value="間食">間食</option>
              </select>
            </div>
          </div>

          {/* レシピ選択（コンボボックス） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🍳 レシピ:
            </label>
            
            {/* レシピ検索フィールド */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              placeholder="レシピを検索..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 min-w-0"
            />
            
            {/* レシピ選択コンボボックス */}
            <select
              value={selectedRecipeId}
              onChange={(e) => handleRecipeChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {recipeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* 検索結果情報 */}
            {searchQuery && (
              <div className="text-xs text-gray-500 mt-1">
                {filteredRecipes.length}件のレシピが見つかりました
              </div>
            )}
          </div>

          {/* 手動入力フォーム（新規追加選択時のみ） */}
          {selectedRecipeId === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 料理名:
                </label>
                <input
                  type="text"
                  value={manualRecipeName}
                  onChange={(e) => setManualRecipeName(e.target.value)}
                  placeholder="料理名を入力..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-w-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🌐 レシピURL (任意):
                </label>
                <input
                  type="url"
                  value={manualRecipeUrl}
                  onChange={(e) => setManualRecipeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-w-0 overflow-hidden"
                  style={{ wordBreak: 'break-all' }}
                />
              </div>
            </div>
          )}

          {/* 人数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              👥 人数:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <span className="text-sm text-gray-600">人前</span>
            </div>
          </div>

          {/* 食材 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 使用する食材:
            </label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="text-sm">•</div>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="食材名"
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm min-w-0"
                  />
                  <QuantityInput
                    value={ingredient.quantity}
                    onChange={(value) => handleIngredientChange(index, 'quantity', value)}
                    placeholder="分量"
                    className="w-32"
                  />
                  <button
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-600 hover:text-red-500 text-sm"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddIngredient}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                + 食材追加
              </button>
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 メモ:
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="特別な調理法やアレンジなど"
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        {/* フッター */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          {initialData && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              削除
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm"
          >
            保存
          </button>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="確認"
        message="の献立を削除しますか？"
        itemName={getMealDescription()}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="削除"
        cancelText="キャンセル"
        isDestructive={true}
      />
    </div>
  );
};