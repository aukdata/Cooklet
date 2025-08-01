/**
 * 献立編集フォームのビジネスロジック管理フック
 * MealPlanEditDialog.tsxから分離したカスタムフック
 */

import { useState, useMemo, useCallback } from 'react';
import { type MealPlan, type MealType, type MealSourceType, type StockItem } from '../types';
import type { Ingredient } from '../components/ui/IngredientsEditor';
import type { Quantity } from '../types';
import { type SavedRecipe } from './useRecipes';

interface UseMealPlanEditFormProps {
  initialData?: MealPlan;
  selectedDate: string;
  selectedMealType: MealType;
  isOpen: boolean;
}

interface UseMealPlanEditFormReturn {
  // フォーム状態
  mealType: MealType;
  setMealType: (type: MealType) => void;
  sourceType: MealSourceType;
  setSourceType: (type: MealSourceType) => void;
  selectedRecipe: SavedRecipe | null;
  selectedRecipeId: string;
  selectedStockId: string;
  stockConsumeQuantity: Quantity;
  setStockConsumeQuantity: (quantity: Quantity) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  manualRecipeName: string;
  setManualRecipeName: (name: string) => void;
  manualRecipeUrl: string;
  setManualRecipeUrl: (url: string) => void;
  servings: number;
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  memo: string;
  setMemo: (memo: string) => void;
  
  // 確認ダイアログ状態
  showConfirmDelete: boolean;
  setShowConfirmDelete: (show: boolean) => void;
  isSaving: boolean;
  
  // ハンドラー関数
  handleRecipeSelect: (recipe: SavedRecipe | null) => void;
  handleStockSelect: (stockItem: StockItem | null) => void;
  handleStockConsumeQuantityChange: (quantity: Quantity) => void;
  handleServingsChange: (newServings: number) => void;
  handleSave: (onSave: (mealPlan: MealPlan) => Promise<void>, onClose: () => void) => Promise<void>;
  
  // バリデーション
  isFormValid: boolean;
}

// 初期値を計算する関数（通常の関数として定義）
const getInitialFormState = (initialData?: MealPlan, selectedMealType: MealType = '夜') => {
  if (initialData) {
    // 編集モード: 初期データをセット
    const stockQuantity = initialData.source_type === 'stock' && initialData.ingredients.length > 0
      ? initialData.ingredients[0].quantity || { amount: '', unit: '' }
      : { amount: '', unit: '' };
    
    const recipeName = initialData.source_type === 'stock' && initialData.ingredients.length > 0
      ? initialData.ingredients[0].name
      : '';
    
    const ingredientList = (initialData.ingredients || []).map(ing => ({
      name: ing.name,
      quantity: ing.quantity || { amount: '', unit: '' }
    }));

    return {
      mealType: initialData.meal_type,
      sourceType: initialData.source_type || 'recipe',
      selectedRecipe: null,
      selectedRecipeId: '',
      selectedStockId: initialData.stock_id || '',
      stockConsumeQuantity: stockQuantity,
      searchQuery: '',
      manualRecipeName: recipeName,
      manualRecipeUrl: initialData.recipe_url || '',
      servings: 2,
      ingredients: ingredientList,
      memo: initialData.memo || ''
    };
  } else {
    // 新規モード: デフォルト値をセット
    return {
      mealType: selectedMealType,
      sourceType: 'recipe' as MealSourceType,
      selectedRecipe: null,
      selectedRecipeId: '',
      selectedStockId: '',
      stockConsumeQuantity: { amount: '', unit: '' },
      searchQuery: '',
      manualRecipeName: '',
      manualRecipeUrl: '',
      servings: 2,
      ingredients: [] as Ingredient[],
      memo: ''
    };
  }
};

export const useMealPlanEditForm = ({
  initialData,
  selectedDate,
  selectedMealType,
  isOpen
}: UseMealPlanEditFormProps): UseMealPlanEditFormReturn => {
  
  // 初期値をメモ化（isOpenとinitialDataが変わった時のみ再計算）
  const initialFormState = useMemo(() => {
    if (!isOpen) return null;
    return getInitialFormState(initialData, selectedMealType);
  }, [isOpen, initialData, selectedMealType]);

  // フォーム状態管理（初期値から設定、isOpenがfalseの場合はデフォルト値）
  const [mealType, setMealType] = useState<MealType>(initialFormState?.mealType || selectedMealType);
  const [sourceType, setSourceType] = useState<MealSourceType>(initialFormState?.sourceType || 'recipe');
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(initialFormState?.selectedRecipe || null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(initialFormState?.selectedRecipeId || '');
  const [selectedStockId, setSelectedStockId] = useState<string>(initialFormState?.selectedStockId || '');
  const [stockConsumeQuantity, setStockConsumeQuantity] = useState<Quantity>(initialFormState?.stockConsumeQuantity || { amount: '', unit: '' });
  const [searchQuery, setSearchQuery] = useState(initialFormState?.searchQuery || '');
  const [manualRecipeName, setManualRecipeName] = useState(initialFormState?.manualRecipeName || '');
  const [manualRecipeUrl, setManualRecipeUrl] = useState(initialFormState?.manualRecipeUrl || '');
  const [servings, setServings] = useState(initialFormState?.servings || 2);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialFormState?.ingredients || []);
  const [memo, setMemo] = useState(initialFormState?.memo || '');
  
  // 確認ダイアログ状態
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // フォーム初期化処理（レンダー時計算でstate更新を回避）
  const resetForm = useCallback(() => {
    if (initialFormState) {
      setMealType(initialFormState.mealType);
      setSourceType(initialFormState.sourceType);
      setSelectedRecipe(initialFormState.selectedRecipe);
      setSelectedRecipeId(initialFormState.selectedRecipeId);
      setSelectedStockId(initialFormState.selectedStockId);
      setStockConsumeQuantity(initialFormState.stockConsumeQuantity);
      setSearchQuery(initialFormState.searchQuery);
      setManualRecipeName(initialFormState.manualRecipeName);
      setManualRecipeUrl(initialFormState.manualRecipeUrl);
      setServings(initialFormState.servings);
      setIngredients(initialFormState.ingredients);
      setMemo(initialFormState.memo);
    }
  }, [initialFormState]);

  // ダイアログが開かれた時に初期化実行（イベントハンドラーパターン）
  const [lastInitialData, setLastInitialData] = useState<MealPlan | undefined>(undefined);
  if (isOpen && initialData !== lastInitialData) {
    setLastInitialData(initialData);
    resetForm();
  }

  // レシピ選択処理
  const handleRecipeSelect = (recipe: SavedRecipe | null) => {
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
          quantity: ing.quantity // SavedRecipe.ingredientsは既にQuantity型
        }));
        setIngredients(recipeIngredients);
      }
    } else {
      // 手動入力モード: 材料をクリア
      setIngredients([]);
    }
  };
  
  // 在庫選択処理
  const handleStockSelect = (stockItem: StockItem | null) => {
    setSelectedStockId(stockItem?.id || '');
    
    if (stockItem) {
      // 在庫アイテム情報をフォームに設定
      setManualRecipeName(stockItem.name);
      setManualRecipeUrl('');
      
      // デフォルトで全量消費に設定（ユーザーが編集可能）
      setStockConsumeQuantity(stockItem.quantity);
      
      // 在庫の数量情報を材料として設定
      const stockIngredients = [{
        name: stockItem.name,
        quantity: stockItem.quantity
      }];
      setIngredients(stockIngredients);
    } else {
      // 手動入力モード: 材料をクリア
      setStockConsumeQuantity({ amount: '', unit: '' });
      setIngredients([]);
    }
  };
  
  // 在庫消費数量変更処理
  const handleStockConsumeQuantityChange = (quantity: Quantity) => {
    setStockConsumeQuantity(quantity);
    
    // 材料リストも更新
    if (selectedStockId && manualRecipeName) {
      const stockIngredients = [{
        name: manualRecipeName,
        quantity: quantity
      }];
      setIngredients(stockIngredients);
    }
  };

  // 人数変更時の数量調整
  const handleServingsChange = (newServings: number) => {
    if (selectedRecipe && ingredients.length > 0) {
      // 数量を比例調整
      const ratio = newServings / (servings || 1);
      const adjustedIngredients = ingredients.map(ing => {
        const numericAmount = parseFloat(ing.quantity.amount);
        if (!isNaN(numericAmount)) {
          const newAmount = numericAmount * ratio;
          return {
            ...ing,
            quantity: { amount: newAmount.toString(), unit: ing.quantity.unit }
          };
        }
        return ing;
      });
      setIngredients(adjustedIngredients);
    }
    setServings(newServings);
  };

  // 保存処理
  const handleSave = async (onSave: (mealPlan: MealPlan) => Promise<void>, onClose: () => void) => {
    if (!manualRecipeName.trim()) {
      alert('料理名を入力してください');
      return;
    }

    if (sourceType === 'stock' && !selectedStockId) {
      alert('在庫アイテムを選択してください');
      return;
    }

    if (sourceType === 'stock' && !stockConsumeQuantity.amount.trim()) {
      alert('消費数量を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const mealPlan: MealPlan = {
        id: initialData?.id || '', // 新規の場合は空文字、サーバー側でUUID生成
        user_id: initialData?.user_id || '', // 既存データから取得、新規の場合はサーバー側で設定
        date: selectedDate,
        meal_type: mealType,
        source_type: sourceType,
        recipe_url: sourceType === 'recipe' ? (manualRecipeUrl || undefined) : undefined,
        stock_id: sourceType === 'stock' ? selectedStockId : undefined,
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity
        })),
        memo: memo || undefined,
        consumed_status: 'pending',
        created_at: initialData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onSave(mealPlan);
      onClose();
    } catch (error) {
      console.error('献立保存エラー:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // バリデーション
  const isFormValid = !!(
    manualRecipeName.trim() &&
    (sourceType !== 'stock' || (selectedStockId && stockConsumeQuantity.amount.trim()))
  );

  return {
    // フォーム状態
    mealType,
    setMealType,
    sourceType,
    setSourceType,
    selectedRecipe,
    selectedRecipeId,
    selectedStockId,
    stockConsumeQuantity,
    setStockConsumeQuantity,
    searchQuery,
    setSearchQuery,
    manualRecipeName,
    setManualRecipeName,
    manualRecipeUrl,
    setManualRecipeUrl,
    servings,
    ingredients,
    setIngredients,
    memo,
    setMemo,
    
    // 確認ダイアログ状態
    showConfirmDelete,
    setShowConfirmDelete,
    isSaving,
    
    // ハンドラー関数
    handleRecipeSelect,
    handleStockSelect,
    handleStockConsumeQuantityChange,
    handleServingsChange,
    handleSave,
    
    // バリデーション
    isFormValid
  };
};