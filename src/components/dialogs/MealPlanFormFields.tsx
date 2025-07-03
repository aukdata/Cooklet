/**
 * 献立編集フォームの入力フィールドコンポーネント
 * MealPlanEditDialog.tsxから分離されたUI部分
 */

import React from 'react';
import { type MealType, type MealSourceType, type StockItem } from '../../types';
import { useRecipes, type SavedRecipe } from '../../hooks/useRecipes';
import { useStockItems } from '../../hooks/useStockItems';
import { RecipeSelector } from './RecipeSelector';
import { ManualRecipeInput } from './ManualRecipeInput';
import { MealIngredientsEditor } from './MealIngredientsEditor';
import type { Ingredient } from '../ui/IngredientsEditor';
import type { Quantity } from '../../types';
import { quantityToDisplay } from '../../utils/quantityDisplay';

interface MealPlanFormFieldsProps {
  // フォーム状態
  mealType: MealType;
  setMealType: (type: MealType) => void;
  sourceType: MealSourceType;
  setSourceType: (type: MealSourceType) => void;
  selectedRecipeId: string;
  selectedStockId: string;
  stockConsumeQuantity: Quantity;
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
  
  // ハンドラー関数
  handleRecipeSelect: (recipe: SavedRecipe | null) => void;
  handleStockSelect: (stockItem: StockItem | null) => void;
  handleStockConsumeQuantityChange: (quantity: Quantity) => void;
  handleServingsChange: (newServings: number) => void;
}

export const MealPlanFormFields: React.FC<MealPlanFormFieldsProps> = ({
  mealType,
  setMealType,
  sourceType,
  setSourceType,
  selectedRecipeId,
  selectedStockId,
  stockConsumeQuantity,
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
  handleRecipeSelect,
  handleStockSelect,
  handleStockConsumeQuantityChange,
  handleServingsChange
}) => {
  // レシピデータ取得
  const { recipes, loading: recipesLoading } = useRecipes();
  
  // 在庫データ取得
  const { stockItems, loading: stockLoading } = useStockItems();

  // 在庫アイテムを作り置き優先でソート
  const sortedStockItems = [...stockItems].sort((a, b) => {
    if (a.is_homemade && !b.is_homemade) return -1;
    if (!a.is_homemade && b.is_homemade) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
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
            在庫から
          </label>
        </div>
      </div>

      {sourceType === 'recipe' ? (
        <>
          {/* レシピ選択セクション */}
          <RecipeSelector
            selectedRecipeId={selectedRecipeId}
            onRecipeSelect={handleRecipeSelect}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            recipes={recipes}
            loading={recipesLoading}
          />

          {/* 手動入力セクション */}
          <ManualRecipeInput
            recipeName={manualRecipeName}
            onRecipeNameChange={setManualRecipeName}
            recipeUrl={manualRecipeUrl}
            onRecipeUrlChange={setManualRecipeUrl}
          />

          {/* 人数入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              人数
            </label>
            <input
              type="number"
              value={servings}
              onChange={(e) => handleServingsChange(parseInt(e.target.value) || 1)}
              min="1"
              className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">人前</span>
          </div>
        </>
      ) : (
        <>
          {/* 在庫選択セクション */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              在庫アイテム *
            </label>
            {stockLoading ? (
              <div className="text-gray-500">在庫を読み込み中...</div>
            ) : (
              <select
                value={selectedStockId}
                onChange={(e) => {
                  const stockItem = stockItems.find(item => item.id === e.target.value);
                  handleStockSelect(stockItem || null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {sortedStockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.is_homemade ? '🍱 ' : ''}{item.name} ({quantityToDisplay(item.quantity)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 消費数量入力 */}
          {selectedStockId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                消費数量 *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={stockConsumeQuantity.amount}
                  onChange={(e) => handleStockConsumeQuantityChange({
                    ...stockConsumeQuantity,
                    amount: e.target.value
                  })}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="数量"
                />
                <input
                  type="text"
                  value={stockConsumeQuantity.unit}
                  onChange={(e) => handleStockConsumeQuantityChange({
                    ...stockConsumeQuantity,
                    unit: e.target.value
                  })}
                  className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="単位"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* 材料編集セクション */}
      <MealIngredientsEditor
        ingredients={ingredients}
        onIngredientsChange={setIngredients}
      />

      {/* メモ入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="メモを入力してください（任意）"
        />
      </div>
    </div>
  );
};