import React, { useState, useEffect } from 'react';
import { type MealPlan, type MealType, type MealSourceType, type StockItem } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { useStockItems } from '../../hooks/useStockItems';
import { BaseDialog } from '../ui/BaseDialog';
import { RecipeSelector } from './RecipeSelector';
import { ManualRecipeInput } from './ManualRecipeInput';
import { MealIngredientsEditor } from './MealIngredientsEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { parseQuantity } from '../../constants/units';
import type { Ingredient } from '../ui/IngredientsEditor';
import type { Quantity } from '../../types';
import { quantityToDisplay } from '../../utils/quantityDisplay';

// レシピデータ型（型互換性のためlocal interface）
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
  
  // 在庫データ取得
  const { stockItems, loading: stockLoading } = useStockItems();

  // フォーム状態管理
  const [mealType, setMealType] = useState<MealType>(selectedMealType);
  const [sourceType, setSourceType] = useState<MealSourceType>('recipe');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [stockConsumeQuantity, setStockConsumeQuantity] = useState<Quantity>({ amount: '', unit: '' });
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
        setSourceType(initialData.source_type || 'recipe');
        setSelectedStockId(initialData.stock_id || '');
        
        // 在庫数量は材料リストから取得
        if (initialData.source_type === 'stock' && initialData.ingredients.length > 0) {
          setStockConsumeQuantity(initialData.ingredients[0].quantity || { amount: '', unit: '' });
        }
        // 在庫ベースの場合は材料名から、レシピベースの場合は空文字
        if (initialData.source_type === 'stock' && initialData.ingredients.length > 0) {
          setManualRecipeName(initialData.ingredients[0].name);
        } else {
          setManualRecipeName(''); // recipe_nameプロパティは存在しない
        }
        setManualRecipeUrl(initialData.recipe_url || '');
        setServings(2); // servingsプロパティは存在しないため固定値
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
        setSourceType('recipe');
        setSelectedRecipe(null);
        setSelectedRecipeId('');
        setSelectedStockId('');
        setStockConsumeQuantity({ amount: '', unit: '' });
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
          quantity: parseQuantity(ing.quantity)
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
  const handleSave = async () => {
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


  return (
    <>
      <BaseDialog
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? '献立編集' : '献立追加'}
        icon="🍽️"
        onSave={handleSave}
        onDelete={initialData && onDelete ? () => setShowConfirmDelete(true) : undefined}
        showDelete={!!(initialData && onDelete)}
        saveText={isSaving ? '保存中...' : (initialData ? '更新' : '追加')}
        disabled={isSaving || !manualRecipeName.trim() || (sourceType === 'stock' && (!selectedStockId || !stockConsumeQuantity.amount.trim()))}
      >
        <div className="space-y-4">
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

          {/* 献立ソースタイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              献立ソース *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sourceType"
                  value="recipe"
                  checked={sourceType === 'recipe'}
                  onChange={(e) => setSourceType(e.target.value as MealSourceType)}
                  className="mr-2"
                />
                レシピ
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sourceType"
                  value="stock"
                  checked={sourceType === 'stock'}
                  onChange={(e) => setSourceType(e.target.value as MealSourceType)}
                  className="mr-2"
                />
                在庫
              </label>
            </div>
          </div>

          {/* レシピ選択 */}
          {sourceType === 'recipe' && (
            <RecipeSelector
              recipes={recipes.map(r => ({
                id: r.id,
                title: r.title,
                url: r.url,
                ingredients: r.ingredients.map(ing => ({
                  name: ing.name,
                  quantity: `${ing.quantity.amount}${ing.quantity.unit}`
                }))
              }))}
              selectedRecipeId={selectedRecipeId}
              searchQuery={searchQuery}
              onRecipeSelect={handleRecipeSelect}
              onSearchQueryChange={setSearchQuery}
              loading={recipesLoading}
            />
          )}

          {/* 在庫選択 */}
          {sourceType === 'stock' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                在庫アイテム *
              </label>
              <select
                value={selectedStockId}
                onChange={(e) => {
                  const stockItem = stockItems.find(item => item.id === e.target.value);
                  handleStockSelect(stockItem || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={stockLoading}
              >
                <option value="">在庫アイテムを選択してください</option>
                {/* 作り置きを上に表示 */}
                {stockItems
                  .filter(item => item.is_homemade)
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      🍲 {item.name} ({quantityToDisplay(item.quantity)})
                    </option>
                  ))
                }
                {/* 通常の在庫アイテム */}
                {stockItems
                  .filter(item => !item.is_homemade)
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({quantityToDisplay(item.quantity)})
                    </option>
                  ))
                }
              </select>
              {stockLoading && (
                <p className="text-sm text-gray-500 mt-1">在庫を読み込み中...</p>
              )}
            </div>
          )}

          {/* 手動入力フィールド */}
          {sourceType === 'recipe' && (
            <ManualRecipeInput
              recipeName={manualRecipeName}
              recipeUrl={manualRecipeUrl}
              onRecipeNameChange={setManualRecipeName}
              onRecipeUrlChange={setManualRecipeUrl}
            />
          )}

          {/* 在庫アイテム名表示・消費数量設定 */}
          {sourceType === 'stock' && selectedStockId && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  選択したアイテム
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="text-gray-900">{manualRecipeName}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  消費数量 *
                </label>
                <input
                  type="text"
                  value={quantityToDisplay(stockConsumeQuantity)}
                  onChange={(e) => handleStockConsumeQuantityChange(parseQuantity(e.target.value))}
                  placeholder="例: 200g, 1個, 半分"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  在庫から消費する数量を入力してください
                </p>
              </div>
            </div>
          )}

          {/* 人数設定 */}
          {sourceType === 'recipe' && (
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
          )}

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

        </div>
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

