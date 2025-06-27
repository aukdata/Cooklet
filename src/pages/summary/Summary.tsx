import React, { useState } from 'react';
import { MealPlanEditDialog } from '../../components/dialogs/MealPlanEditDialog';
import { CostDialog } from '../../components/dialogs/CostDialog';
import { TodayMealSection } from '../../components/summary/TodayMealSection';
import { StockAlertSection } from '../../components/summary/StockAlertSection';
import { MonthlyCostSection } from '../../components/summary/MonthlyCostSection';
import { useMealPlans, useStockItems, useCostRecords } from '../../hooks';
import { type MealPlan, type CostRecord, type MealType } from '../../types';

/**
 * サマリー画面コンポーネント - CLAUDE.md仕様書に準拠
 * 
 * 今日の献立・在庫アラート・月間出費の概要を一画面で表示：
 * - 責任分離によって各セクションを独立コンポーネント化
 * - データ取得ロジックは各フックに委譲
 * - ダイアログ状態管理のみをこのコンポーネントで実行
 */
export const Dashboard: React.FC = () => {
  // 現在の日付を取得
  const today = new Date();
  
  // ダイアログの状態管理
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ date: string; mealType: MealType } | null>(null);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  
  // 献立データの取得（Supabase連携）
  const { mealPlans, loading: mealLoading, error: mealError, saveMealPlan, deleteMealPlan } = useMealPlans();
  
  // 在庫データの取得
  const { getExpiredItems, getExpiringItems, loading: stockLoading } = useStockItems();
  
  // コストデータの取得
  const { getMonthlyStats, saveCostRecord, loading: costLoading } = useCostRecords();

  // 全体のローディング状態
  const isLoading = mealLoading || stockLoading || costLoading;

  // 献立追加ボタンクリック処理
  const handleAddMeal = (mealType: MealType) => {
    const dateStr = today.toISOString().split('T')[0];
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
      handleCloseDialog();
    } catch (err) {
      console.error('献立の保存に失敗しました:', err);
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
        handleCloseDialog();
      }
    } catch (err) {
      console.error('献立の削除に失敗しました:', err);
    }
  };

  // ダイアログを閉じる処理
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMeal(null);
  };

  // コスト追加ボタンクリック処理
  const handleAddCost = () => {
    setIsCostDialogOpen(true);
  };

  // コスト保存処理（Supabase連携）
  const handleSaveCost = async (costData: CostRecord) => {
    try {
      await saveCostRecord(costData);
      handleCloseCostDialog();
    } catch (err) {
      console.error('支出の保存に失敗しました:', err);
    }
  };

  // コストダイアログを閉じる処理
  const handleCloseCostDialog = () => {
    setIsCostDialogOpen(false);
  };

  // 在庫アラートデータ（動的データ）
  const expiredItems = getExpiredItems ? getExpiredItems() : [];
  const expiringItems = getExpiringItems ? getExpiringItems(1) : []; // 明日まで
  
  // 月次コストサマリー（動的データ）
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const monthlySummary = getMonthlyStats ? getMonthlyStats(currentYear, currentMonth) : {
    total: 0,
    homeCooking: { total: 0, count: 0, average: 0 },
    eatingOut: { total: 0, count: 0, average: 0 },
    dailyAverage: 0,
    mealAverage: 0
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ヘッダーセクション */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="mr-2">📊</span>
          サマリー
        </h2>
      </div>

      {/* 今日の献立セクション */}
      <TodayMealSection
        mealPlans={mealPlans}
        loading={mealLoading}
        error={mealError}
        onAddMeal={handleAddMeal}
        onEditMeal={handleEditMeal}
      />

      {/* 在庫アラートセクション */}
      <StockAlertSection
        expiredItems={expiredItems}
        expiringItems={expiringItems}
        loading={stockLoading}
      />

      {/* 今月の出費セクション */}
      <MonthlyCostSection
        monthlySummary={monthlySummary}
        currentMonth={currentMonth}
        loading={costLoading}
        onAddCost={handleAddCost}
      />

      {/* 献立編集ダイアログ */}
      {isDialogOpen && editingMeal && (
        <MealPlanEditDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveMeal}
          onDelete={handleDeleteMeal}
          selectedDate={editingMeal.date}
          selectedMealType={editingMeal.mealType}
          initialData={
            mealPlans.find(plan => 
              plan.date === editingMeal.date && 
              plan.meal_type === editingMeal.mealType
            )
          }
        />
      )}

      {/* コスト追加ダイアログ */}
      {isCostDialogOpen && (
        <CostDialog
          isOpen={isCostDialogOpen}
          onClose={handleCloseCostDialog}
          onSave={handleSaveCost}
          isEditing={false}
        />
      )}
    </div>
  );
};