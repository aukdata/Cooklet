import React, { useState } from 'react';
import { MealPlanEditDialog } from '../../components/dialogs/MealPlanEditDialog';
import { WeeklyNavigation } from '../../components/meal-plans/WeeklyNavigation';
import { MealPlanCalendar } from '../../components/meal-plans/MealPlanCalendar';
import { MealPlanDayDetail } from '../../components/meal-plans/MealPlanDayDetail';
import { MealPlanSuggestion } from '../../components/meal-plans/MealPlanSuggestion';
import { CookedDialog } from '../../components/meal-plans/CookedDialog';
import { useMealPlans } from '../../hooks';
import { useMealPlanCalendar } from '../../hooks/useMealPlanCalendar';
import { type MealPlan, type MealType } from '../../types';
import { useStockItems } from '../../hooks/useStockItems';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { generateMealPlan, type MealGenerationSettings } from '../../utils/mealPlanGeneration';

// カレンダー画面コンポーネント - 週間表示・献立追加機能付き
export const MealPlans: React.FC = () => {
  const { showInfo, showSuccess, showError } = useToast();

  // 週間カレンダー状態管理
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
  
  // ダイアログの表示状態
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ date: string; mealType: MealType } | null>(null);
  
  // 作った選択ダイアログの状態
  const [isConsumedDialogOpen, setIsConsumedDialogOpen] = useState(false);
  const [processingMeal, setProcessingMeal] = useState<MealPlan | null>(null);

  // 献立データの取得（Supabase連携）
  const { mealPlans, loading, error, saveMealPlan, deleteMealPlan, updateMealPlanStatus, getMealPlansForDate, getMealPlan } = useMealPlans();
  
  // 在庫データの操作（作り置き機能用）
  const { stockItems, addStockItem } = useStockItems();
  
  // レシピデータの取得（献立生成用）
  const { recipes } = useRecipes();
  
  // 食材マスタデータの取得（献立生成用）
  const { ingredients } = useIngredients();


  // 献立追加ボタンクリック処理
  const handleAddMeal = (date: Date, mealType: MealType) => {
    const dateStr = date.toISOString().split('T')[0];
    setEditingMeal({ date: dateStr, mealType });
    setIsDialogOpen(true);
  };

  // 献立編集ボタンクリック処理
  const handleEditMeal = (mealPlan: MealPlan) => {
    setEditingMeal({ date: mealPlan.date, mealType: mealPlan.meal_type });
    setIsDialogOpen(true);
  };

  // 献立保存処理（Supabase連携）
  const handleSaveMeal = async (newMealPlan: MealPlan) => {
    try {
      await saveMealPlan(newMealPlan);
      // 保存成功時にダイアログを閉じる
      handleCloseDialog();
      showSuccess('献立を保存しました');
    } catch (err) {
      console.error('献立の保存に失敗しました:', err);
      showError('献立の保存に失敗しました');
    }
  };

  // 献立削除処理（Supabase連携）
  const handleDeleteMeal = async () => {
    if (!editingMeal) return;
    
    try {
      const mealPlan = mealPlans.find(plan => 
        plan.date === editingMeal.date && 
        plan.meal_type === editingMeal.mealType
      );
      
      if (mealPlan?.id) {
        await deleteMealPlan(mealPlan.id);
        // 削除成功時にダイアログを閉じる
        handleCloseDialog();
        showSuccess('献立を削除しました');
      }
    } catch (err) {
      console.error('献立の削除に失敗しました:', err);
      showError('献立の削除に失敗しました');
    }
  };

  // ダイアログを閉じる処理
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMeal(null);
  };

  // 「作った」ボタンクリック処理
  const handleCookedClick = (mealPlan: MealPlan) => {
    setProcessingMeal(mealPlan);
    setIsConsumedDialogOpen(true);
  };

  // 完食処理
  const handleCompleted = async () => {
    if (!processingMeal?.id) return;
    
    try {
      await updateMealPlanStatus(processingMeal.id, 'completed');
      setIsConsumedDialogOpen(false);
      setProcessingMeal(null);
    } catch (err) {
      console.error('完食状態の更新に失敗しました:', err);
      // TODO: エラートースト表示
    }
  };

  // 作り置き処理
  const handleStoreMade = async () => {
    if (!processingMeal?.id) return;
    
    try {
      // 献立の状態を「作り置き」に更新
      await updateMealPlanStatus(processingMeal.id, 'stored');
      
      // 作り置きとして在庫テーブルに追加
      const dishName = processingMeal.memo || '作り置き料理';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await addStockItem({
        name: dishName,
        quantity: '1食分',
        bestBefore: tomorrow.toISOString().split('T')[0], // 明日まで
        storageLocation: '冷蔵庫',
        isHomemade: true // 作り置きフラグをtrueに設定
      });
      
      setIsConsumedDialogOpen(false);
      setProcessingMeal(null);
    } catch (err) {
      console.error('作り置き状態の更新に失敗しました:', err);
      // TODO: エラートースト表示
    }
  };

  // 消費ダイアログを閉じる処理
  const handleCloseConsumedDialog = () => {
    setIsConsumedDialogOpen(false);
    setProcessingMeal(null);
  };

  // 今日の献立提案処理
  const handleTodayMealSuggestion = async () => {
    try {
      const settings: MealGenerationSettings = {
        stockItems,
        recipes,
        ingredients,
        days: 1, // 今日1日分
        mealTypes: [true, true, true] // 朝昼夜すべて
      };
      
      const result = await generateMealPlan(settings);
      
      if (result.warnings.length > 0) {
        showInfo(result.warnings.join(', '));
      } else {
        showSuccess('今日の献立を提案しました！');
      }
    } catch (err) {
      console.error('献立提案に失敗しました:', err);
      showError('献立提案に失敗しました');
    }
  };

  // 週間献立提案処理
  const handleWeeklyMealSuggestion = async () => {
    try {
      const settings: MealGenerationSettings = {
        stockItems,
        recipes,
        ingredients,
        days: 7, // 7日分
        mealTypes: [true, true, true] // 朝昼夜すべて
      };
      
      const result = await generateMealPlan(settings);
      
      if (result.warnings.length > 0) {
        showInfo(result.warnings.join(', '));
      } else {
        showSuccess('週間献立を提案しました！');
      }
    } catch (err) {
      console.error('週間献立提案に失敗しました:', err);
      showError('週間献立提案に失敗しました');
    }
  };

  // 週間サマリーデータ
  const weeklySummary = {
    cooking: mealPlans.length,
    eating_out: 2,
    budget: 1200
  };

  // ステータス変更ハンドラ
  const handleStatusClick = async (mealPlan: MealPlan) => {
    if (!mealPlan?.id) return;

    try {
      // 現在のステータスを取得
      const currentStatus = mealPlan.consumed_status || 'pending';
      
      // 次のステータスを決定
      let nextStatus: 'pending' | 'completed' | 'stored';
      if (currentStatus === 'completed') {
        nextStatus = 'stored'; // 完食 → 作り置き
      } else if (currentStatus === 'stored') {
        nextStatus = 'pending'; // 作り置き → 未完了
      } else {
        nextStatus = 'completed'; // 未完了 → 完食
      }

      // ステータスを更新
      await updateMealPlanStatus(mealPlan.id, nextStatus);
      showSuccess(`ステータスを${nextStatus === 'completed' ? '完食' : nextStatus === 'stored' ? '作り置き' : '未完了'}に変更しました`);
    } catch (err) {
      console.error('ステータス変更に失敗しました:', err);
      showError('ステータス変更に失敗しました');
    }
  };

  return (
    <div className="p-4">
      {/* 週間ナビゲーション */}
      <WeeklyNavigation
        currentWeekStart={currentWeekStart}
        weekRange={weekRange}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onThisWeek={goToThisWeek}
        isCurrentWeek={isCurrentWeek}
        loading={loading}
        error={error}
      />

      {/* カレンダービュー */}
      <MealPlanCalendar
        weekDates={weekDates}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        getMealPlansForDate={getMealPlansForDate}
      />

      {/* 選択日の詳細 */}
      <MealPlanDayDetail
        selectedDate={selectedDate}
        getMealPlan={getMealPlan}
        onAddMeal={handleAddMeal}
        onEditMeal={handleEditMeal}
        onCookedClick={handleCookedClick}
        onStatusClick={handleStatusClick}
      />

      {/* 献立提案と週間サマリー */}
      <MealPlanSuggestion
        onTodayMealSuggestion={handleTodayMealSuggestion}
        onWeeklyMealSuggestion={handleWeeklyMealSuggestion}
        weeklySummary={weeklySummary}
        weekRange={weekRange}
      />

      {/* 献立編集ダイアログ */}
      <MealPlanEditDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveMeal}
        onDelete={handleDeleteMeal}
        selectedDate={editingMeal?.date || selectedDate.toISOString().split('T')[0]}
        selectedMealType={editingMeal?.mealType || '夜'}
        initialData={editingMeal ? 
          mealPlans.find(plan => 
            plan.date === editingMeal.date && 
            plan.meal_type === editingMeal.mealType
          ) : undefined
        }
      />

      {/* 完食・作り置き選択ダイアログ */}
      <CookedDialog
        isOpen={isConsumedDialogOpen}
        processingMeal={processingMeal}
        onCompleted={handleCompleted}
        onStoreMade={handleStoreMade}
        onClose={handleCloseConsumedDialog}
      />
    </div>
  );
};