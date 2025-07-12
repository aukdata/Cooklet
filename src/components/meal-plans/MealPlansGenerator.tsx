import React, { useState } from 'react';
// import { useStockItems } from '../../hooks/useStockItems';
// import { useRecipes } from '../../hooks/useRecipes';
// import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { generateMealPlan, type MealGenerationResult } from '../../services/mealPlanGeneration';
import { type MealPlan, type StockItem, type Ingredient } from '../../types';
import { type SavedRecipe } from '../../types/recipe';

// 献立自動生成コンポーネントのProps
interface MealPlansGeneratorProps {
  mealPlans: MealPlan[];
  stockItems: StockItem[];
  recipes: SavedRecipe[];
  ingredients: Ingredient[];
  selectedDate: Date;
  weekDates: Date[];
  onGenerationResult: (result: MealGenerationResult, type: 'today' | 'weekly', temperature: number, startDate: Date) => void;
}

// 献立自動生成機能を担当するコンポーネント
export const MealPlansGenerator: React.FC<MealPlansGeneratorProps> = ({
  mealPlans: _mealPlans,
  stockItems,
  recipes,
  ingredients,
  selectedDate,
  weekDates,
  onGenerationResult
}) => {
  const { showInfo, showError } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // データはProps経由で受け取り

  // 選択された日の献立を自動生成
  const handleGenerateToday = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      const dateStr = selectedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
      showInfo(`${dateStr}の献立を生成中...`);

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
        onGenerationResult(result, 'today', 0.7, selectedDate);
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

  // 選択された週の献立を自動生成
  const handleGenerateWeekly = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      const weekStartStr = weekDates[0].toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
      const weekEndStr = weekDates[6].toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
      showInfo(`${weekStartStr}～${weekEndStr}の献立を生成中...`);

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
        onGenerationResult(result, 'weekly', 0.5, weekDates[0]);
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
        {isGenerating ? '生成中...' : 'この日の献立を生成'}
      </button>
      
      <button
        onClick={handleGenerateWeekly}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>📅</span>
        {isGenerating ? '生成中...' : 'この週の献立を生成'}
      </button>
    </div>
  );
};
