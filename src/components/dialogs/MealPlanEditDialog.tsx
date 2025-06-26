import React, { useState, useEffect, useMemo } from 'react';
import { type MealPlan, type MealType } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { BaseDialog } from '../ui/BaseDialog';
import { IngredientsEditor, type Ingredient } from '../ui/IngredientsEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { parseQuantity, formatQuantity } from '../../constants/units';

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
  selectedMealType?: MealType;
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
  const [mealType, setMealType] = useState<MealType>(selectedMealType);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(''); // コンボボックス用
  const [searchQuery, setSearchQuery] = useState(''); // 絡り込み用検索クエリ
  const [manualRecipeName, setManualRecipeName] = useState('');
  const [manualRecipeUrl, setManualRecipeUrl] = useState('');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [memo, setMemo] = useState('');

  // 削除確認ダイアログの状態管理
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // 数量を比例調整するヘルパー関数
  const adjustQuantityByServings = (originalQuantity: string, originalServings: number, newServings: number): string => {
    if (!originalQuantity || originalServings <= 0 || newServings <= 0) {
      return originalQuantity;
    }

    const { amount, unit } = parseQuantity(originalQuantity);
    
    // 数値以外（適量、お好み等）の場合はそのまま返す
    if (!amount || isNaN(parseFloat(amount))) {
      return originalQuantity;
    }

    // 数値を比例計算
    const numericAmount = parseFloat(amount);
    const adjustedAmount = (numericAmount * newServings) / originalServings;
    
    // 小数点第2位まで四捨五入
    const roundedAmount = Math.round(adjustedAmount * 100) / 100;
    
    return formatQuantity(roundedAmount.toString(), unit);
  };

  // 食材配列の数量を一括調整する関数
  const adjustIngredientsQuantity = (ingredients: Ingredient[], originalServings: number, newServings: number): Ingredient[] => {
    return ingredients.map(ingredient => ({
      ...ingredient,
      quantity: adjustQuantityByServings(ingredient.quantity, originalServings, newServings)
    }));
  };

  // DBからレシピデータを取得（実際の食材情報を含む）
  const recipeList: Recipe[] = useMemo(() => {
    if (recipesLoading || !recipes) return [];
    
    // SavedRecipeをRecipe型に変換（実際の食材データを使用）
    return recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      url: recipe.url,
      ingredients: recipe.ingredients || [] // 実際の食材データを使用
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
        setManualRecipeName(recipe.title);
        setManualRecipeUrl(recipe.url);
        
        // レシピの食材データを設定（人数に合わせて調整）
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          // レシピの元の人数を取得（SavedRecipeのservingsフィールドから）
          const savedRecipe = recipes.find(r => r.id === recipeId);
          const recipeServings = savedRecipe?.servings || 2;
          
          // 現在の人数に合わせて食材の数量を調整
          const adjustedIngredients = adjustIngredientsQuantity(
            recipe.ingredients,
            recipeServings,
            servings
          );
          setIngredients(adjustedIngredients);
        } else {
          // 食材データがない場合は空の入力欄を1つ提供
          setIngredients([{ name: '', quantity: '' }]);
        }
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

  // 食材変更ハンドラ
  const handleIngredientsChange = (newIngredients: Ingredient[]) => {
    setIngredients(newIngredients);
  };

  // 人数変更ハンドラ（食材の数量も連動して調整）
  const handleServingsChange = (newServings: number) => {
    const previousServings = servings;
    setServings(newServings);
    
    // レシピが選択されており、食材データがある場合は数量を調整
    // originalServingsからの比例計算ではなく、前回の人数からの調整で実装
    if (selectedRecipe && ingredients.length > 0 && newServings > 0 && previousServings > 0) {
      const adjustedIngredients = adjustIngredientsQuantity(
        ingredients,
        previousServings,
        newServings
      );
      setIngredients(adjustedIngredients);
    }
  };

  // 保存処理
  const handleSave = () => {
    const mealPlan: MealPlan = {
      id: initialData?.id || '',
      user_id: initialData?.user_id || '',
      date: selectedDate,
      meal_type: mealType,
      recipe_url: (selectedRecipeId === 'manual' || selectedRecipeId === '') ? (manualRecipeUrl || undefined) : selectedRecipe?.url,
      ingredients: ingredients.filter(ing => ing.name.trim() !== ''),
      memo: manualRecipeName.trim() || memo.trim() || undefined,
      consumed_status: initialData?.consumed_status || 'pending',
      created_at: initialData?.created_at || '',
      updated_at: initialData?.updated_at || ''
    };

    onSave(mealPlan);
    // 🔑 重要: 保存後に必ずダイアログを閉じる
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
    <>
      <BaseDialog
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? '献立を編集' : '献立を追加'}
        icon="✏️"
        onSave={handleSave}
        showDelete={!!initialData && !!onDelete}
        onDelete={handleDelete}
        size="lg"
      >
      <div className="space-y-4 max-h-[50vh] overflow-y-auto">
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
                onChange={(e) => setMealType(e.target.value as MealType)}
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
                onChange={(e) => handleServingsChange(parseInt(e.target.value) || 1)}
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
            <IngredientsEditor
              ingredients={ingredients}
              onChange={handleIngredientsChange}
              addButtonText="+ 食材追加"
              showEmptyItem={true}
            />
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
      </BaseDialog>

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
    </>
  );
};