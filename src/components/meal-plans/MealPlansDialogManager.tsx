import React, { useState } from 'react';
import { MealPlanEditDialog } from '../dialogs/MealPlanEditDialog';
import { MealGenerationResultDialog } from '../dialogs/MealGenerationResultDialog';
import { CookedDialog } from './CookedDialog';
import { type MealPlan, type MealType } from '../../types';
import { type MealGenerationResult } from '../../services/mealPlanGeneration';

// ダイアログ管理の状態型定義
interface DialogStates {
  isEditDialogOpen: boolean;
  isGenerationResultDialogOpen: boolean;
  isConsumedDialogOpen: boolean;
  editingMeal: { date: string; mealType: MealType } | null;
  processingMeal: MealPlan | null;
  generationResult: MealGenerationResult | null;
  currentGenerationType: 'today' | 'weekly';
  currentTemperature: number;
}

// ダイアログ管理コンポーネントのProps
interface MealPlansDialogManagerProps {
  selectedDate: Date;
  onSaveMeal: (mealPlan: MealPlan) => Promise<void>;
  onDeleteMeal: () => Promise<void>;
  onConsumedConfirm: (meal: MealPlan, isConsumed: boolean, isStored?: boolean) => Promise<void>;
  onGenerationConfirm: (result: MealGenerationResult) => Promise<void>;
}

// 献立ページのダイアログ管理を担当するコンポーネント
export const MealPlansDialogManager: React.FC<MealPlansDialogManagerProps> = ({
  selectedDate,
  onSaveMeal,
  onDeleteMeal,
  onConsumedConfirm,
  onGenerationConfirm
}) => {
  // ダイアログ状態管理
  const [dialogStates, setDialogStates] = useState<DialogStates>({
    isEditDialogOpen: false,
    isGenerationResultDialogOpen: false,
    isConsumedDialogOpen: false,
    editingMeal: null,
    processingMeal: null,
    generationResult: null,
    currentGenerationType: 'today',
    currentTemperature: 0.0
  });

  // 全ダイアログを閉じる
  const closeAllDialogs = () => {
    setDialogStates({
      isEditDialogOpen: false,
      isGenerationResultDialogOpen: false,
      isConsumedDialogOpen: false,
      editingMeal: null,
      processingMeal: null,
      generationResult: null,
      currentGenerationType: 'today',
      currentTemperature: 0.0
    });
  };

  return (
    <>
      {/* 献立編集ダイアログ */}
      <MealPlanEditDialog
        isOpen={dialogStates.isEditDialogOpen}
        onClose={closeAllDialogs}
        onSave={onSaveMeal}
        onDelete={onDeleteMeal}
        initialData={undefined} // TODO: 編集時の初期データ設定
        selectedDate={selectedDate.toISOString().split('T')[0]}
        selectedMealType={dialogStates.editingMeal?.mealType}
      />

      {/* 作った確認ダイアログ */}
      {dialogStates.processingMeal && (
        <CookedDialog
          isOpen={dialogStates.isConsumedDialogOpen}
          processingMeal={dialogStates.processingMeal}
          onClose={closeAllDialogs}
          onCompleted={() => {
            onConsumedConfirm(dialogStates.processingMeal!, true, false);
            closeAllDialogs();
          }}
          onStoreMade={() => {
            onConsumedConfirm(dialogStates.processingMeal!, true, true);
            closeAllDialogs();
          }}
        />
      )}

      {/* 自動生成結果ダイアログ */}
      {dialogStates.generationResult && (
        <MealGenerationResultDialog
          isOpen={dialogStates.isGenerationResultDialogOpen}
          result={dialogStates.generationResult}
          onClose={closeAllDialogs}
          onConfirm={() => {
            onGenerationConfirm(dialogStates.generationResult!);
            closeAllDialogs();
          }}
          onRetry={() => {
            // 再生成処理（必要に応じて実装）
            closeAllDialogs();
          }}
        />
      )}
    </>
  );
};

// ダイアログ管理機能を提供するカスタムフック
export const useMealPlansDialogManager = () => {
  // ダイアログ状態管理
  const [dialogStates, setDialogStates] = useState<DialogStates>({
    isEditDialogOpen: false,
    isGenerationResultDialogOpen: false,
    isConsumedDialogOpen: false,
    editingMeal: null,
    processingMeal: null,
    generationResult: null,
    currentGenerationType: 'today',
    currentTemperature: 0.0
  });

  // 献立追加ダイアログを開く
  const openAddMealDialog = (date: Date, mealType: MealType) => {
    const dateStr = date.toISOString().split('T')[0];
    setDialogStates(prev => ({
      ...prev,
      editingMeal: { date: dateStr, mealType },
      isEditDialogOpen: true
    }));
  };

  // 献立編集ダイアログを開く
  const openEditMealDialog = (mealPlan: MealPlan) => {
    setDialogStates(prev => ({
      ...prev,
      editingMeal: { date: mealPlan.date, mealType: mealPlan.meal_type },
      isEditDialogOpen: true
    }));
  };

  // 作った確認ダイアログを開く
  const openConsumedDialog = (meal: MealPlan) => {
    setDialogStates(prev => ({
      ...prev,
      processingMeal: meal,
      isConsumedDialogOpen: true
    }));
  };

  // 生成結果ダイアログを開く
  const openGenerationResultDialog = (
    result: MealGenerationResult,
    generationType: 'today' | 'weekly',
    temperature: number
  ) => {
    setDialogStates(prev => ({
      ...prev,
      generationResult: result,
      currentGenerationType: generationType,
      currentTemperature: temperature,
      isGenerationResultDialogOpen: true
    }));
  };

  // 全ダイアログを閉じる
  const closeAllDialogs = () => {
    setDialogStates({
      isEditDialogOpen: false,
      isGenerationResultDialogOpen: false,
      isConsumedDialogOpen: false,
      editingMeal: null,
      processingMeal: null,
      generationResult: null,
      currentGenerationType: 'today',
      currentTemperature: 0.0
    });
  };

  return {
    dialogStates,
    openAddMealDialog,
    openEditMealDialog,
    openConsumedDialog,
    openGenerationResultDialog,
    closeAllDialogs
  };
};