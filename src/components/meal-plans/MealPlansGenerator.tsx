import React, { useState } from 'react';
// import { useStockItems } from '../../hooks/useStockItems';
// import { useRecipes } from '../../hooks/useRecipes';
// import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { generateMealPlan, type MealGenerationResult } from '../../utils/mealPlanGeneration';
import { type MealPlan, type StockItem, type Ingredient } from '../../types';
import { type SavedRecipe } from '../../types/recipe';

// 献立自動生成コンポーネントのProps
interface MealPlansGeneratorProps {
  mealPlans: MealPlan[];
  stockItems: StockItem[];
  recipes: SavedRecipe[];
  ingredients: Ingredient[];
  onGenerationResult: (result: MealGenerationResult, type: 'today' | 'weekly', temperature: number) => void;
}

// 献立自動生成機能を担当するコンポーネント
export const MealPlansGenerator: React.FC<MealPlansGeneratorProps> = ({
  mealPlans: _mealPlans,
  stockItems,
  recipes,
  ingredients,
  onGenerationResult
}) => {
  const { showInfo, showError } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // データはProps経由で受け取り

  // 今日の献立を自動生成
  const handleGenerateToday = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      showInfo('今日の献立を生成中...');

      // 実際のデータを使用して献立生成設定を作成
      const settings = {
        stockItems,
        recipes,
        ingredients,
        days: 1,
        mealTypes: [true, true, true] as [boolean, boolean, boolean], // [朝, 昼, 夜]
        temperature: 0.7
      };
      
      console.log('献立生成設定:', { 
        stockItemsCount: stockItems.length, 
        recipesCount: recipes.length, 
        ingredientsCount: ingredients.length 
      });

      const result = await generateMealPlan(settings);

      if (result) {
        onGenerationResult(result, 'today', 0.7);
      } else {
        throw new Error('生成に失敗しました');
      }
    } catch (error) {
      console.error('献立自動生成エラー:', error);
      showError('献立の生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // 今週の献立を自動生成
  const handleGenerateWeekly = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      showInfo('今週の献立を生成中...');

      // 実際のデータを使用して献立生成設定を作成
      const settings = {
        stockItems,
        recipes,
        ingredients,
        days: 7,
        mealTypes: [true, true, true] as [boolean, boolean, boolean], // [朝, 昼, 夜]
        temperature: 0.5
      };
      
      console.log('献立生成設定:', { 
        stockItemsCount: stockItems.length, 
        recipesCount: recipes.length, 
        ingredientsCount: ingredients.length 
      });

      const result = await generateMealPlan(settings);

      if (result) {
        onGenerationResult(result, 'weekly', 0.5);
      } else {
        throw new Error('生成に失敗しました');
      }
    } catch (error) {
      console.error('献立自動生成エラー:', error);
      showError('献立の生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-4 flex gap-2">
      <button
        onClick={handleGenerateToday}
        disabled={isGenerating}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>💡</span>
        {isGenerating ? '生成中...' : '今日の献立を自動生成'}
      </button>
      
      <button
        onClick={handleGenerateWeekly}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>📅</span>
        {isGenerating ? '生成中...' : '今週の献立を自動生成'}
      </button>
    </div>
  );
};
