import React, { useState } from 'react';
import { MealPlanEditDialog } from '../../components/dialogs/MealPlanEditDialog';
import { MealPlanHeader } from '../../components/meal-plans/MealPlanHeader';
import { WeeklyNavigation } from '../../components/meal-plans/WeeklyNavigation';
import { WeeklyCalendar } from '../../components/meal-plans/WeeklyCalendar';
import { DayDetail } from '../../components/meal-plans/DayDetail';
import { WeeklySummary } from '../../components/meal-plans/WeeklySummary';
import { MealSuggestions } from '../../components/meal-plans/MealSuggestions';
import { useMealPlans } from '../../hooks';
import { type MealType, type MealPlan } from '../../types';
import { useStockItems } from '../../hooks/useStockItems';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { generateMealPlan, type MealGenerationSettings } from '../../utils/mealPlanGeneration';

/**
 * 献立計画ページコンポーネント
 * 適切な粒度でコンポーネント化された統合版
 */
export const MealPlans: React.FC = () => {
  const { showInfo, showSuccess, showError } = useToast();

  // 選択された日付（今日がデフォルト）
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 現在表示している週の開始日（今日基準）
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    // 今日を開始日として設定
    return today;
  });
  
  // ダイアログの表示状態
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ date: string; mealType: MealType } | null>(null);
  
  // 作った選択ダイアログの状態
  const [isConsumedDialogOpen, setIsConsumedDialogOpen] = useState(false);
  const [processingMeal, setProcessingMeal] = useState<MealPlan | null>(null);

  // 指定した週の開始日から7日分の日付を取得
  const getWeekDates = (weekStart: Date) => {
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 先週に移動
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  // 来週に移動
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  // 今日を基準にした週に戻る
  const goToThisWeek = () => {
    const today = new Date();
    setCurrentWeekStart(today);
  };

  const weekDates = getWeekDates(currentWeekStart);

  // 献立データの取得（Supabase連携）
  const { mealPlans, loading, error, saveMealPlan, deleteMealPlan, updateMealPlanStatus, getMealPlansForDate, getMealPlan } = useMealPlans();
  
  // 在庫データの操作（作り置き機能用）
  const { stockItems, addStockItem } = useStockItems();
  
  // レシピデータの取得（献立生成用）
  const { recipes } = useRecipes();
  
  // 食材マスタデータの取得（献立生成用）
  const { ingredients } = useIngredients();

  // 週の範囲を表示用にフォーマット
  const weekRange = `${weekDates[0].getMonth() + 1}/${weekDates[0].getDate()} - ${weekDates[6].getMonth() + 1}/${weekDates[6].getDate()}`;
  
  // 今日を基準とした週かどうかを判定
  const isCurrentWeek = () => {
    const today = new Date();
    return currentWeekStart.toDateString() === today.toDateString();
  };

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
      setIsDialogOpen(false);
      setEditingMeal(null);
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
        setIsDialogOpen(false);
        setEditingMeal(null);
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
      showError('完食状態の更新に失敗しました');
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
        best_before: tomorrow.toISOString().split('T')[0], // 明日まで
        storage_location: '冷蔵庫',
        is_homemade: true // 作り置きフラグをtrueに設定
      });
      
      setIsConsumedDialogOpen(false);
      setProcessingMeal(null);
    } catch (err) {
      console.error('作り置き状態の更新に失敗しました:', err);
      showError('作り置き状態の更新に失敗しました');
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

  // 週間サマリーデータ
  const weeklySummary = {
    cooking: mealPlans.length,
    eating_out: 2,
    budget: 1200
  };

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <MealPlanHeader
        weekRange={weekRange}
        loading={loading}
        error={error}
      />

      {/* 週間ナビゲーション */}
      <WeeklyNavigation
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onThisWeek={goToThisWeek}
        isCurrentWeek={isCurrentWeek()}
      />

      {/* カレンダービュー */}
      <WeeklyCalendar
        weekDates={weekDates}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        getMealPlansForDate={getMealPlansForDate}
      />

      {/* 選択日の詳細 */}
      <DayDetail
        selectedDate={selectedDate}
        getMealPlan={getMealPlan}
        onAddMeal={handleAddMeal}
        onEditMeal={handleEditMeal}
        onCookedClick={handleCookedClick}
        onStatusClick={handleStatusClick}
      />

      {/* 週間サマリー */}
      <WeeklySummary
        weekRange={weekRange}
        summaryData={weeklySummary}
      />

      {/* 献立の提案ボタン */}
      <MealSuggestions
        onTodayMealSuggestion={handleTodayMealSuggestion}
        onWeeklyMealSuggestion={handleWeeklyMealSuggestion}
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
      {isConsumedDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <span className="mr-2">🍽️</span>
                作った！
              </h2>
              <button
                onClick={handleCloseConsumedDialog}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                「{processingMeal?.memo}」を作りました！<br/>
                どうしますか？
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCompleted}
                className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">✅</span>
                完食しました
              </button>
              
              <button
                onClick={handleStoreMade}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">🥡</span>
                作り置きにします
              </button>
              
              <button
                onClick={handleCloseConsumedDialog}
                className="w-full px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};