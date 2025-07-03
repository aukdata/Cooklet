/**
 * 献立編集ダイアログコンポーネント（リファクタリング済み）
 * 元の472行から大幅に簡潔化
 */

import React from 'react';
import { type MealPlan, type MealType } from '../../types';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { MealPlanFormFields } from './MealPlanFormFields';
import { useMealPlanEditForm } from '../../hooks/useMealPlanEditForm';

// ダイアログのProps型定義
interface MealPlanEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mealPlan: MealPlan) => Promise<void>;
  onDelete?: () => void;
  initialData?: MealPlan;
  selectedDate: string;
  selectedMealType?: MealType;
}

// 献立編集ダイアログ（リファクタリング済み）
export const MealPlanEditDialog: React.FC<MealPlanEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  selectedDate,
  selectedMealType = '夜'
}) => {
  // カスタムフックによるビジネスロジック管理
  const {
    // フォーム状態
    mealType,
    setMealType,
    sourceType,
    setSourceType,
    selectedRecipeId,
    selectedStockId,
    stockConsumeQuantity,
    searchQuery,
    setSearchQuery,
    manualRecipeName,
    setManualRecipeName,
    manualRecipeUrl,
    setManualRecipeUrl,
    servings,
    ingredients,
    setIngredients,
    memo,
    setMemo,
    
    // 確認ダイアログ状態
    showConfirmDelete,
    setShowConfirmDelete,
    isSaving,
    
    // ハンドラー関数
    handleRecipeSelect,
    handleStockSelect,
    handleStockConsumeQuantityChange,
    handleServingsChange,
    handleSave,
    
    // バリデーション
    isFormValid
  } = useMealPlanEditForm({
    initialData,
    selectedDate,
    selectedMealType,
    isOpen
  });

  return (
    <>
      <BaseDialog
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? '献立編集' : '献立追加'}
        icon="🍽️"
        onSave={() => handleSave(onSave, onClose)}
        onDelete={initialData && onDelete ? () => setShowConfirmDelete(true) : undefined}
        showDelete={!!(initialData && onDelete)}
        saveText={isSaving ? '保存中...' : (initialData ? '更新' : '追加')}
        disabled={isSaving || !isFormValid}
      >
        <MealPlanFormFields
          // フォーム状態
          mealType={mealType}
          setMealType={setMealType}
          sourceType={sourceType}
          setSourceType={setSourceType}
          selectedRecipeId={selectedRecipeId}
          selectedStockId={selectedStockId}
          stockConsumeQuantity={stockConsumeQuantity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          manualRecipeName={manualRecipeName}
          setManualRecipeName={setManualRecipeName}
          manualRecipeUrl={manualRecipeUrl}
          setManualRecipeUrl={setManualRecipeUrl}
          servings={servings}
          ingredients={ingredients}
          setIngredients={setIngredients}
          memo={memo}
          setMemo={setMemo}
          
          // ハンドラー関数
          handleRecipeSelect={handleRecipeSelect}
          handleStockSelect={handleStockSelect}
          handleStockConsumeQuantityChange={handleStockConsumeQuantityChange}
          handleServingsChange={handleServingsChange}
        />
      </BaseDialog>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="献立を削除"
        message="この献立を削除しますか？"
        itemName={manualRecipeName}
        onConfirm={() => {
          onDelete?.();
          setShowConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
};