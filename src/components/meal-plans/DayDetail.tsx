import React from 'react';
import { type MealPlan, type MealType } from '../../types';

// 選択日詳細コンポーネントのProps型定義
interface DayDetailProps {
  // 選択された日付
  selectedDate: Date;
  // 指定日・食事タイプの献立取得関数
  getMealPlan: (date: Date, mealType: MealType) => MealPlan | undefined;
  // 献立追加ハンドラー
  onAddMeal: (date: Date, mealType: MealType) => void;
  // 献立編集ハンドラー
  onEditMeal: (mealPlan: MealPlan) => void;
  // 食べたボタンクリックハンドラー
  onCookedClick: (mealPlan: MealPlan) => void;
  // ステータス変更ハンドラー
  onStatusClick: (mealPlan: MealPlan) => void;
}

/**
 * 選択日の詳細コンポーネント
 * 朝昼夜の献立詳細を表示し、各種アクションを提供
 */
export const DayDetail: React.FC<DayDetailProps> = ({
  selectedDate,
  getMealPlan,
  onAddMeal,
  onEditMeal,
  onCookedClick,
  onStatusClick
}) => {
  const today = new Date();
  
  // 日付が今日かどうかチェック
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  // 献立表示ロジックを統一化する関数
  const renderMealPlan = (mealType: MealType, icon: string, label: string) => {
    const mealPlan = getMealPlan(selectedDate, mealType);
    const isCompleted = mealPlan?.consumed_status === 'completed';
    const isStored = mealPlan?.consumed_status === 'stored';
    const isDone = isCompleted || isStored;
    
    return (
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="mr-2">{icon}</span>
            <span className="font-medium">{label}:</span>
            <span className={`ml-2 ${isDone ? 'text-gray-500 line-through' : ''}`}>
              {mealPlan ? (mealPlan.memo || `${label}メニュー`) : '［未設定］'}
            </span>
            {isDone && mealPlan && (
              <button 
                onClick={() => onStatusClick(mealPlan)}
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
              onClick={() => onCookedClick(mealPlan)}
              className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
            >
              🍽️ 食べた
            </button>
          )}
          <button 
            onClick={() => mealPlan ? onEditMeal(mealPlan) : onAddMeal(selectedDate, mealType)}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            {mealPlan ? '編集' : '+ 追加'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">📅</span>
        {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
        {isToday(selectedDate) && ' (今日)'}
      </h3>

      <div className="space-y-3">
        {/* 朝食 */}
        {renderMealPlan('朝', '🌅', '朝食')}
        
        {/* 昼食 */}
        {renderMealPlan('昼', '🌞', '昼食')}
        
        {/* 夕食 */}
        {renderMealPlan('夜', '🌙', '夕食')}
      </div>
    </div>
  );
};