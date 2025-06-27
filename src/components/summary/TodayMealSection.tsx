import React from 'react';
import type { MealPlan, MealType } from '../../types';

interface TodayMealSectionProps {
  /** 今日の献立データ配列 */
  mealPlans: MealPlan[];
  /** 献立データのローディング状態 */
  loading: boolean;
  /** 献立データのエラー状態 */
  error: string | null;
  /** 献立追加ボタンクリック処理 */
  onAddMeal: (mealType: MealType) => void;
  /** 献立編集ボタンクリック処理 */
  onEditMeal: (mealPlan: MealPlan) => void;
}

/**
 * 今日の献立セクションコンポーネント
 * 
 * サマリー画面で当日の朝食・昼食・夕食を表示する専用コンポーネント：
 * - 各食事の献立表示（未設定の場合は「［未設定］」表示）
 * - 食材リスト表示
 * - レシピリンク表示
 * - 編集・追加ボタン
 */
export const TodayMealSection: React.FC<TodayMealSectionProps> = ({
  mealPlans,
  loading,
  error,
  onAddMeal,
  onEditMeal
}) => {
  // 現在の日付を取得
  const today = new Date();
  const todayString = today.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  });
  const todayISOString = today.toISOString().split('T')[0];

  // 今日の献立データを取得する関数
  const getTodayMealPlan = (mealType: MealType): MealPlan | undefined => {
    return mealPlans.find(plan => plan.date === todayISOString && plan.meal_type === mealType);
  };

  // 個別の食事アイテムコンポーネント
  const MealItem: React.FC<{ mealType: MealType; icon: string }> = ({ mealType, icon }) => {
    const mealPlan = getTodayMealPlan(mealType);
    
    return (
      <div className="border-b border-gray-100 pb-3 last:border-b-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="mr-2">{icon}</span>
              <span className="font-medium">{mealType}食:</span>
              <span className="ml-2">
                {mealPlan?.memo || '［未設定］'}
              </span>
            </div>
            {mealPlan && mealPlan.ingredients.length > 0 && (
              <div className="ml-6 text-sm text-gray-600">
                材料: {mealPlan.ingredients.map(ing => ing.name).join(', ')}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {mealPlan?.recipe_url && (
              <button 
                onClick={() => window.open(mealPlan.recipe_url!, '_blank')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                🌐 レシピ
              </button>
            )}
            <button 
              onClick={() => {
                if (mealPlan) {
                  onEditMeal(mealPlan);
                } else {
                  onAddMeal(mealType);
                }
              }}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              {mealPlan ? '編集' : '+ 追加'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">📅</span>
        今日の献立 ({todayString})
        {loading && <span className="ml-2 text-sm text-gray-500">読み込み中...</span>}
        {error && <span className="ml-2 text-sm text-red-500">エラー: {error}</span>}
      </h3>
      
      <div className="space-y-3">
        <MealItem mealType="朝" icon="🌅" />
        <MealItem mealType="昼" icon="🌞" />
        <MealItem mealType="夜" icon="🌙" />
      </div>
    </div>
  );
};