import React, { useState, useEffect } from 'react';
import { type MealPlan, type MealType } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { BaseDialog } from '../ui/BaseDialog';
import { RecipeSelector } from './RecipeSelector';
import { ManualRecipeInput } from './ManualRecipeInput';
import { MealIngredientsEditor } from './MealIngredientsEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { parseQuantity, formatQuantity } from '../../constants/units';
import type { Ingredient } from '../ui/IngredientsEditor';

// レシピデータ型
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
  onDelete?: () => void;
  initialData?: MealPlan;
  selectedDate: string;
  selectedMealType?: MealType;
}

// 献立編集ダイアログ（モジュール化済み）
export const MealPlanEditDialog: React.FC<MealPlanEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  selectedDate,
  selectedMealType = '夜'
}) => {
  // レシピデータ取得
  const { recipes, loading: recipesLoading } = useRecipes();

  // フォーム状態管理
  const [mealType, setMealType] = useState<MealType>(selectedMealType);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualRecipeName, setManualRecipeName] = useState('');
  const [manualRecipeUrl, setManualRecipeUrl] = useState('');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [memo, setMemo] = useState('');
  
  // 確認ダイアログ状態
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 初期化処理
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 編集モード: 初期データをセット
        setMealType(initialData.meal_type);
        setManualRecipeName(initialData.recipe_name || '');
        setManualRecipeUrl(initialData.recipe_url || '');
        setServings(Number(initialData.servings) || 2);
        setMemo(initialData.memo || '');
        
        // 材料データを変換
        const ingredientList = (initialData.ingredients || []).map(ing => ({
          name: ing.name,
          quantity: ing.quantity || ''
        }));
        setIngredients(ingredientList);
      } else {
        // 新規モード: デフォルト値をセット
        setMealType(selectedMealType);
        setSelectedRecipe(null);
        setSelectedRecipeId('');
        setSearchQuery('');
        setManualRecipeName('');
        setManualRecipeUrl('');
        setServings(2);
        setIngredients([]);
        setMemo('');
      }
    }
  }, [isOpen, initialData, selectedMealType]);

  // レシピ選択処理
  const handleRecipeSelect = (recipe: Recipe | null) => {
    setSelectedRecipe(recipe);
    setSelectedRecipeId(recipe?.id || '');
    
    if (recipe) {
      // レシピ情報をフォームに設定
      setManualRecipeName(recipe.title);
      setManualRecipeUrl(recipe.url);
      
      // 材料情報を自動設定
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const recipeIngredients = recipe.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity
        }));
        setIngredients(recipeIngredients);
      }
    } else {
      // 手動入力モード: 材料をクリア
      setIngredients([]);
    }
  };

  // 人数変更時の数量調整
  const handleServingsChange = (newServings: number) => {
    if (selectedRecipe && ingredients.length > 0) {
      // 数量を比例調整
      const ratio = newServings / (servings || 1);
      const adjustedIngredients = ingredients.map(ing => {
        const parsed = parseQuantity(ing.quantity);
        if (parsed.amount !== null) {
          const newAmount = parsed.amount * ratio;
          return {
            ...ing,
            quantity: formatQuantity(newAmount, parsed.unit || '')
          };
        }
        return ing;
      });
      setIngredients(adjustedIngredients);
    }
    setServings(newServings);
  };

  // 保存処理
  const handleSave = async () => {
    if (!manualRecipeName.trim()) {
      alert('料理名を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const mealPlan: MealPlan = {
        id: initialData?.id,
        date: selectedDate,
        meal_type: mealType,
        recipe_name: manualRecipeName,
        recipe_url: manualRecipeUrl || null,
        servings,
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity
        })),
        memo: memo || undefined,
        consumed_status: 'pending'
      };

      await onSave(mealPlan);
      onClose();
    } catch (error) {
      console.error('献立保存エラー:', error);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      <BaseDialog
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? '献立編集' : '献立追加'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          {/* 食事タイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              食事タイプ *
            </label>
            <div className="flex gap-3">
              {(['朝', '昼', '夜'] as MealType[]).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="mealType"
                    value={type}
                    checked={mealType === type}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="mr-2"
                  />
                  {type}食
                </label>
              ))}
            </div>
          </div>

          {/* レシピ選択 */}
          <RecipeSelector
            recipes={recipes}
            selectedRecipeId={selectedRecipeId}
            searchQuery={searchQuery}
            onRecipeSelect={handleRecipeSelect}
            onSearchQueryChange={setSearchQuery}
            loading={recipesLoading}
          />

          {/* 手動入力フィールド */}
          <ManualRecipeInput
            recipeName={manualRecipeName}
            recipeUrl={manualRecipeUrl}
            onRecipeNameChange={setManualRecipeName}
            onRecipeUrlChange={setManualRecipeUrl}
          />

          {/* 人数設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              人数 *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={servings}
              onChange={(e) => handleServingsChange(parseInt(e.target.value) || 1)}
              required
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="ml-2 text-gray-600">人前</span>
          </div>

          {/* 材料編集 */}
          <MealIngredientsEditor
            ingredients={ingredients}
            onIngredientsChange={setIngredients}
          />

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              placeholder="メモやコメントを入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* ボタンエリア */}
          <div className="flex gap-3 pt-4">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                削除
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            
            <button
              type="submit"
              disabled={isSaving || !manualRecipeName.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : initialData ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </BaseDialog>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="献立を削除"
        message="この献立を削除しますか？"
        itemName={manualRecipeName}
        onConfirm={() => {
          onDelete?.();
          setShowConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
};

