import React, { useState } from 'react';
// import { useStockItems } from '../../hooks/useStockItems';
// import { useRecipes } from '../../hooks/useRecipes';
// import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { generateMealPlan, type MealGenerationResult } from '../../utils/mealPlanGeneration';
import { type MealPlan } from '../../types';

// AI生成コンポーネントのProps
interface MealPlansGeneratorProps {
  mealPlans: MealPlan[];
  onGenerationResult: (result: MealGenerationResult, type: 'today' | 'weekly', temperature: number) => void;
}

// AI献立生成機能を担当するコンポーネント
export const MealPlansGenerator: React.FC<MealPlansGeneratorProps> = ({
  mealPlans: _mealPlans,
  onGenerationResult
}) => {
  const { showInfo, showError } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // TODO: データ取得フックは後で使用
  // const { stockItems } = useStockItems();
  // const { recipes } = useRecipes();
  // const { ingredients } = useIngredients();

  // 今日の献立をAI生成
  const handleGenerateToday = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      showInfo('今日の献立を生成中...');

      // TODO: MealGenerationSettingsの実際の構造に合わせて実装
      const settings = {
        stockItems: [], // 実際の在庫データを後で追加
        recipes: [], // 実際のレシピデータを後で追加
        ingredients: [], // 実際の食材マスタデータを後で追加
        days: 1,
        mealTypes: [true, true, true] as [boolean, boolean, boolean], // [朝, 昼, 夜]
        temperature: 0.7
      };

      const result = await generateMealPlan(settings);

      if (result) {
        onGenerationResult(result, 'today', 0.7);
      } else {
        throw new Error('生成に失敗しました');
      }
    } catch (error) {
      console.error('AI献立生成エラー:', error);
      showError('献立の生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // 今週の献立をAI生成
  const handleGenerateWeekly = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      showInfo('今週の献立を生成中...');

      // TODO: MealGenerationSettingsの実際の構造に合わせて実装
      const settings = {
        stockItems: [], // 実際の在庫データを後で追加
        recipes: [], // 実際のレシピデータを後で追加
        ingredients: [], // 実際の食材マスタデータを後で追加
        days: 7,
        mealTypes: [true, true, true] as [boolean, boolean, boolean], // [朝, 昼, 夜]
        temperature: 0.5
      };

      const result = await generateMealPlan(settings);

      if (result) {
        onGenerationResult(result, 'weekly', 0.5);
      } else {
        throw new Error('生成に失敗しました');
      }
    } catch (error) {
      console.error('AI献立生成エラー:', error);
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
        <span>🤖</span>
        {isGenerating ? '生成中...' : '今日の献立をAI生成'}
      </button>
      
      <button
        onClick={handleGenerateWeekly}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>📅</span>
        {isGenerating ? '生成中...' : '今週の献立をAI生成'}
      </button>
    </div>
  );
};
