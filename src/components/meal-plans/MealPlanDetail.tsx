import React from 'react';
import { type MealPlan, type MealType } from '../../types';

// 食事タイプに対応するアイコンと名前のマッピング
const MEAL_CONFIGS: Record<MealType, { icon: string; name: string; defaultMenu: string }> = {
  '朝': { icon: '🌅', name: '朝食', defaultMenu: '朝食メニュー' },
  '昼': { icon: '🌞', name: '昼食', defaultMenu: '昼食メニュー' },
  '夜': { icon: '🌙', name: '夕食', defaultMenu: '夕食メニュー' },
  '間食': { icon: '🍪', name: '間食', defaultMenu: '間食メニュー' }
};

interface MealPlanDetailProps {
  /** 食事タイプ */
  mealType: MealType;
  /** 献立データ（未設定の場合はnull） */
  mealPlan: MealPlan | null;
  /** 献立追加のハンドラー */
  onAddMeal: () => void;
  /** 献立編集のハンドラー */
  onEditMeal: () => void;
  /** 食べた状態変更のハンドラー */
  onCookedClick: () => void;
  /** ステータス変更のハンドラー */
  onStatusClick: () => void;
}

/**
 * 献立詳細表示コンポーネント
 * 朝食・昼食・夕食の表示ロジックを統一
 */
export const MealPlanDetail: React.FC<MealPlanDetailProps> = ({
  mealType,
  mealPlan,
  onAddMeal,
  onEditMeal,
  onCookedClick,
  onStatusClick
}) => {
  const config = MEAL_CONFIGS[mealType];
  const isCompleted = mealPlan?.consumed_status === 'completed';
  const isStored = mealPlan?.consumed_status === 'stored';
  const isDone = isCompleted || isStored;

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="mr-2">{config.icon}</span>
          <span className="font-medium">{config.name}:</span>
          <span className={`ml-2 ${isDone ? 'text-gray-500 line-through' : ''}`}>
            {mealPlan ? (mealPlan.memo || config.defaultMenu) : '［未設定］'}
          </span>
          {isDone && mealPlan && (
            <button 
              onClick={onStatusClick}
              className="ml-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 px-1 py-0.5 rounded cursor-pointer"
              title="ステータスを変更"
            >
              ✅ {isCompleted ? '完食' : '作り置き'}
            </button>
          )}
        </div>
        {mealPlan && (
          <div className={`ml-6 text-sm text-gray-600 ${isDone ? 'opacity-50' : ''}`}>
            📋 材料: {mealPlan.ingredients.map(ing => ing.name).join(', ')}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {mealPlan?.recipe_url && (
          <button 
            onClick={() => window.open(mealPlan.recipe_url, '_blank')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            🌐 レシピ
          </button>
        )}
        {mealPlan && !isDone && (
          <button 
            onClick={onCookedClick}
            className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
          >
            🍽️ 食べた
          </button>
        )}
        <button 
          onClick={mealPlan ? onEditMeal : onAddMeal}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
        >
          {mealPlan ? '編集' : '+ 追加'}
        </button>
      </div>
    </div>
  );
};