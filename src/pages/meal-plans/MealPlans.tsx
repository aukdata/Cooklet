import React, { useRef, useCallback } from 'react';
import { WeeklyNavigation } from '../../components/meal-plans/WeeklyNavigation';
import { MealPlanCalendar } from '../../components/meal-plans/MealPlanCalendar';
import { MealPlanDayDetail } from '../../components/meal-plans/MealPlanDayDetail';
// import { MealPlanSuggestion } from '../../components/meal-plans/MealPlanSuggestion';
// import { MealPlansDialogManager } from '../../components/meal-plans/MealPlansDialogManager';
import { MealPlansGenerator } from '../../components/meal-plans/MealPlansGenerator';
import { LoadingErrorDisplay } from '../../components/ui/LoadingErrorDisplay';
import { useMealPlansActions } from '../../components/meal-plans/MealPlansActions';
import { useMealPlanCalendar } from '../../hooks/useMealPlanCalendar';
import { type MealType, type MealPlan } from '../../types';
import { type MealGenerationResult } from '../../utils/mealPlanGeneration';

// 献立ページコンポーネント（モジュール化済み）
export const MealPlans: React.FC = () => {
  // カレンダー状態管理
  const {
    selectedDate,
    setSelectedDate,
    currentWeekStart,
    weekDates,
    weekRange,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToThisWeek
  } = useMealPlanCalendar();

  // 献立操作機能
  const {
    mealPlans,
    loading,
    error,
    // handleSaveMeal,
    // handleConsumedConfirm,
    // handleGenerationConfirm,
    getMealPlansForDate,
    getMealPlan
  } = useMealPlansActions();

  // ダイアログ管理コンポーネントへの参照
  const mealPlanDialogManagerRef = useRef<{
    openAddMealDialog: (date: Date, mealType: MealType) => void;
    openEditMealDialog: (mealPlan: MealPlan) => void;
    openConsumedDialog: (meal: MealPlan) => void;
    openGenerationResultDialog: (result: MealGenerationResult, type: 'today' | 'weekly', temp: number) => void;
  } | null>(null);

  // 献立追加ダイアログを開く
  const handleAddMeal = useCallback((date: Date, mealType: MealType) => {
    mealPlanDialogManagerRef.current?.openAddMealDialog(date, mealType);
  }, []);

  // 献立編集ダイアログを開く
  const handleEditMeal = useCallback((mealPlan: MealPlan) => {
    mealPlanDialogManagerRef.current?.openEditMealDialog(mealPlan);
  }, []);

  // 消費状態変更ダイアログを開く
  const handleCookedMeal = useCallback((meal: MealPlan) => {
    mealPlanDialogManagerRef.current?.openConsumedDialog(meal);
  }, []);

  // AI生成結果ダイアログを開く
  const handleAIGenerationResult = useCallback((
    result: MealGenerationResult, 
    type: 'today' | 'weekly', 
    temperature: number
  ) => {
    mealPlanDialogManagerRef.current?.openGenerationResultDialog(result, type, temperature);
  }, []);

  // TODO: 編集中の献立削除処理は後で実装
  // const handleDeleteCurrentEditingMeal = useCallback(async () => {
  //   console.warn('献立削除処理の実装が必要です');
  // }, []);

  // ローディング・エラー状態の統一表示
  return (
    <LoadingErrorDisplay
      loading={loading}
      error={error}
      loadingMessage="献立データを読み込み中..."
      onRetry={() => window.location.reload()}
    >

      <div className="space-y-6">
        {/* ページタイトル */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📅</span>
            献立計画
          </h1>
        </div>

        {/* AI献立生成コンポーネント */}
        <MealPlansGenerator 
          mealPlans={mealPlans}
          onGenerationResult={handleAIGenerationResult}
        />

        {/* 週間ナビゲーション */}
        <WeeklyNavigation
          currentWeekStart={currentWeekStart}
          weekRange={weekRange}
          isCurrentWeek={isCurrentWeek}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onThisWeek={goToThisWeek}
        />

        {/* 7日間カレンダー */}
        <MealPlanCalendar
          weekDates={weekDates}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          getMealPlansForDate={getMealPlansForDate}
          onAddMeal={handleAddMeal}
          onEditMeal={handleEditMeal}
        />

        {/* 選択日の献立詳細 */}
        <MealPlanDayDetail
          selectedDate={selectedDate}
          getMealPlan={getMealPlan}
          onAddMeal={handleAddMeal}
          onEditMeal={handleEditMeal}
          onCookedMeal={handleCookedMeal}
        />

        {/* 献立提案 - TODO: Props修正待ち */}
        {/* <MealPlanSuggestion /> */}

        {/* 献立ダイアログ管理コンポーネント - TODO: refパターン修正待ち */}
        {/* <MealPlansDialogManager
          selectedDate={selectedDate}
          onSaveMeal={handleSaveMeal}
          onDeleteMeal={handleDeleteCurrentEditingMeal}
          onConsumedConfirm={handleConsumedConfirm}
          onGenerationConfirm={handleGenerationConfirm}
        /> */}
      </div>
    </LoadingErrorDisplay>
  );
};

