import React, { useState } from 'react';
import { MealPlanEditDialog } from '../../components/dialogs/MealPlanEditDialog';
import { MealPlanHeader } from '../../components/meal-plans/MealPlanHeader';
import { WeeklyNavigation } from '../../components/meal-plans/WeeklyNavigation';
import { WeeklyCalendar } from '../../components/meal-plans/WeeklyCalendar';
import { DayDetail } from '../../components/meal-plans/DayDetail';
import { WeeklySummary } from '../../components/meal-plans/WeeklySummary';
import { MealPlansGenerator } from '../../components/meal-plans/MealPlansGenerator';
import { MealGenerationResultDialog } from '../../components/dialogs/MealGenerationResultDialog';
import { CookedDialog } from '../../components/dialogs/CookedDialog';
import { useMealPlans } from '../../hooks';
import { type MealType, type MealPlan } from '../../types';
import { useStockItems } from '../../hooks/useStockItems';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { generateMealPlan, type MealGenerationSettings, type MealGenerationResult } from '../../services/mealPlanGeneration';

/**
 * 献立計画ページコンポーネント
 * 適切な粒度でコンポーネント化された統合版
 */
export const MealPlans: React.FC = () => {
  const { showSuccess, showError } = useToast();

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
  
  // 献立生成結果ダイアログの状態
  const [isGenerationResultDialogOpen, setIsGenerationResultDialogOpen] = useState(false);
  const [generationResult, setGenerationResult] = useState<MealGenerationResult | null>(null);
  const [currentGenerationType, setCurrentGenerationType] = useState<'today' | 'weekly'>('today');
  const [currentTemperature, setCurrentTemperature] = useState(0.7);
  const [generationStartDate, setGenerationStartDate] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);

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
  const { mealPlans, loading, error, saveMealPlan, addMealPlansBatch, deleteMealPlan, updateMealPlanStatus, getMealPlansForDate, getMealPlan } = useMealPlans();
  
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
        quantity: { amount: '1', unit: '食分' },
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

  // 献立生成結果受信処理
  const handleGenerationResult = (result: MealGenerationResult, type: 'today' | 'weekly', temperature: number, startDate: Date) => {
    setGenerationResult(result);
    setCurrentGenerationType(type);
    setCurrentTemperature(temperature);
    setGenerationStartDate(startDate);
    setIsGenerationResultDialogOpen(true);
  };

  // 献立生成結果確認処理（決定ボタン）
  const handleConfirmGeneration = async () => {
    if (!generationResult) return;
    
    try {
      setIsGenerating(true);
      
      // 生成結果を選択された日付・週に反映（一括処理でキャッシュの整合性確保）
      const sortedMeals = generationResult.mealPlan.sort((a, b) => a.mealNumber - b.mealNumber);
      
      const newMealPlans = sortedMeals.map(meal => {
        const dayIndex = Math.floor((meal.mealNumber - 1) / 3);
        const mealTypeIndex = (meal.mealNumber - 1) % 3;
        const mealTypes = ['朝', '昼', '夜'] as const;
        
        const date = new Date(generationStartDate);
        date.setDate(generationStartDate.getDate() + dayIndex);
        const dateStr = date.toISOString().split('T')[0];
        
        console.log('🍽️ [Debug] 準備する献立データ:', {
          mealNumber: meal.mealNumber,
          dayIndex,
          mealTypeIndex,
          mealType: mealTypes[mealTypeIndex],
          dateStr,
          recipe: meal.recipe
        });
        
        return {
          date: dateStr,
          meal_type: mealTypes[mealTypeIndex],
          source_type: 'recipe' as const,
          memo: meal.recipe,
          ingredients: meal.ingredients ? meal.ingredients.map(ing => ({ name: ing, quantity: { amount: '適量', unit: '' } })) : [],
          consumed_status: 'pending' as const
        };
      });
      
      console.log('🚀 [Debug] 一括保存開始:', newMealPlans.length, '件の献立');
      
      // 一括保存実行
      const savedMealPlans = await addMealPlansBatch(newMealPlans);
      
      console.log('✅ [Debug] 一括保存完了:', savedMealPlans.map(plan => ({
        id: plan.id,
        mealType: plan.meal_type,
        date: plan.date,
        memo: plan.memo
      })));
      
      setIsGenerationResultDialogOpen(false);
      setGenerationResult(null);
      const dateStr = generationStartDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
      showSuccess(`${currentGenerationType === 'today' ? dateStr : `${dateStr}からの週間`}の献立を追加しました！`);
    } catch (err) {
      console.error('献立の反映に失敗しました:', err);
      showError('献立の反映に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // 献立生成やり直し処理
  const handleRetryGeneration = async () => {
    if (!generationResult) return;
    
    try {
      setIsGenerating(true);
      const newTemperature = Math.min(currentTemperature + 0.1, 1.0);
      
      const settings: MealGenerationSettings = {
        stockItems,
        recipes,
        ingredients,
        days: currentGenerationType === 'today' ? 1 : 7,
        mealTypes: [true, true, true],
        temperature: newTemperature
      };
      
      const result = await generateMealPlan(settings);
      setGenerationResult(result);
      setCurrentTemperature(newTemperature);
    } catch (err) {
      console.error('再生成に失敗しました:', err);
      showError('再生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // 献立生成結果ダイアログを閉じる処理
  const handleCloseGenerationDialog = () => {
    setIsGenerationResultDialogOpen(false);
    setGenerationResult(null);
    setIsGenerating(false);
    setGenerationStartDate(new Date());
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

      {/* 献立生成ボタン */}
      <MealPlansGenerator
        mealPlans={mealPlans}
        stockItems={stockItems}
        recipes={recipes}
        ingredients={ingredients}
        selectedDate={selectedDate}
        weekDates={weekDates}
        onGenerationResult={handleGenerationResult}
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
        meal={processingMeal}
        onCompleted={handleCompleted}
        onStoreMade={handleStoreMade}
        onClose={handleCloseConsumedDialog}
      />

      {/* 献立生成結果確認ダイアログ */}
      <MealGenerationResultDialog
        isOpen={isGenerationResultDialogOpen}
        onClose={handleCloseGenerationDialog}
        result={generationResult}
        onConfirm={handleConfirmGeneration}
        onRetry={handleRetryGeneration}
        isGenerating={isGenerating}
      />
    </div>
  );
};