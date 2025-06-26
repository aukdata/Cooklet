import React from 'react';
import { MealPlanDetail } from './MealPlanDetail';
import { type MealPlan, type MealType } from '../../types';

// 日別詳細表示コンポーネントのProps型定義
interface MealPlanDayDetailProps {
  // 選択中の日付
  selectedDate: Date;
  // 指定日・食事タイプの献立を取得する関数
  getMealPlan: (date: Date, mealType: MealType) => MealPlan | null;
  // 献立追加ハンドラー
  onAddMeal: (date: Date, mealType: MealType) => void;
  // 献立編集ハンドラー
  onEditMeal: (mealPlan: MealPlan) => void;
  // 「作った」ボタンクリックハンドラー
  onCookedClick: (mealPlan: MealPlan) => void;
  // ステータス変更ハンドラー
  onStatusClick: (mealPlan: MealPlan) => void;
}

/**
 * 選択日の献立詳細表示コンポーネント
 * 朝昼夜の献立を一覧表示し、各種アクションボタンを提供
 */
export const MealPlanDayDetail: React.FC<MealPlanDayDetailProps> = ({
  selectedDate,
  getMealPlan,
  onAddMeal,
  onEditMeal,
  onCookedClick,
  onStatusClick
}) => {
  const today = new Date();
  
  // 日付が今日かどうかチェック
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
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
        <MealPlanDetail
          mealType="朝"
          mealPlan={getMealPlan(selectedDate, '朝')}
          onAddMeal={() => onAddMeal(selectedDate, '朝')}
          onEditMeal={() => {
            const plan = getMealPlan(selectedDate, '朝');
            if (plan) onEditMeal(plan);
          }}
          onCookedClick={() => {
            const plan = getMealPlan(selectedDate, '朝');
            if (plan) onCookedClick(plan);
          }}
          onStatusClick={() => {
            const plan = getMealPlan(selectedDate, '朝');
            if (plan) onStatusClick(plan);
          }}
        />

        {/* 昼食 */}
        <MealPlanDetail
          mealType="昼"
          mealPlan={getMealPlan(selectedDate, '昼')}
          onAddMeal={() => onAddMeal(selectedDate, '昼')}
          onEditMeal={() => {
            const plan = getMealPlan(selectedDate, '昼');
            if (plan) onEditMeal(plan);
          }}
          onCookedClick={() => {
            const plan = getMealPlan(selectedDate, '昼');
            if (plan) onCookedClick(plan);
          }}
          onStatusClick={() => {
            const plan = getMealPlan(selectedDate, '昼');
            if (plan) onStatusClick(plan);
          }}
        />

        {/* 夕食 */}
        <MealPlanDetail
          mealType="夜"
          mealPlan={getMealPlan(selectedDate, '夜')}
          onAddMeal={() => onAddMeal(selectedDate, '夜')}
          onEditMeal={() => {
            const plan = getMealPlan(selectedDate, '夜');
            if (plan) onEditMeal(plan);
          }}
          onCookedClick={() => {
            const plan = getMealPlan(selectedDate, '夜');
            if (plan) onCookedClick(plan);
          }}
          onStatusClick={() => {
            const plan = getMealPlan(selectedDate, '夜');
            if (plan) onStatusClick(plan);
          }}
        />
      </div>
    </div>
  );
};