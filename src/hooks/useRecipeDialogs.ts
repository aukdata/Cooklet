import { useState, useCallback } from 'react';
import type { SavedRecipe } from '../types/recipe';
import type { MealType } from '../types';

/**
 * 献立置き換えデータの型定義
 */
interface ReplacementData {
  recipe: SavedRecipe;
  date: string;
  mealType: MealType;
  existingMealPlan: unknown;
}

/**
 * レシピダイアログ状態管理フック
 * 
 * Recipes.tsx で使用される複数のダイアログ状態を統合管理：
 * - レシピ詳細ダイアログ
 * - レシピ編集ダイアログ
 * - 削除確認ダイアログ
 * - 献立追加ダイアログ
 * - 献立置き換え確認ダイアログ
 */
export const useRecipeDialogs = () => {
  // 詳細ダイアログの状態
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | undefined>();
  
  // 編集ダイアログの状態
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<SavedRecipe | undefined>();
  
  // 削除確認ダイアログの状態
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState<SavedRecipe | undefined>();
  
  // 献立追加ダイアログの状態
  const [isAddToMealPlanDialogOpen, setIsAddToMealPlanDialogOpen] = useState(false);
  const [addingToMealPlanRecipe, setAddingToMealPlanRecipe] = useState<SavedRecipe | undefined>();
  
  // 献立置き換え確認ダイアログの状態
  const [isReplaceConfirmDialogOpen, setIsReplaceConfirmDialogOpen] = useState(false);
  const [replacementData, setReplacementData] = useState<ReplacementData | null>(null);

  // === 詳細ダイアログ操作 ===
  
  /**
   * レシピ詳細ダイアログを表示
   */
  const showRecipeDetail = useCallback((recipe: SavedRecipe) => {
    setSelectedRecipe(recipe);
    setIsDetailDialogOpen(true);
  }, []);

  /**
   * レシピ詳細ダイアログを閉じる
   */
  const closeRecipeDetail = useCallback(() => {
    setIsDetailDialogOpen(false);
    setSelectedRecipe(undefined);
  }, []);

  // === 編集ダイアログ操作 ===

  /**
   * 新規レシピ作成ダイアログを表示
   */
  const showNewRecipeDialog = useCallback(() => {
    setEditingRecipe(undefined); // 新規作成なのでundefined
    setIsEditDialogOpen(true);
  }, []);

  /**
   * レシピ編集ダイアログを表示
   * 詳細ダイアログから遷移する場合は詳細ダイアログを閉じる
   */
  const showEditRecipeDialog = useCallback((recipe: SavedRecipe) => {
    // 詳細ダイアログが開いている場合は閉じる（重複防止）
    setIsDetailDialogOpen(false);
    setSelectedRecipe(undefined);
    
    // 編集ダイアログを開く
    setEditingRecipe(recipe);
    setIsEditDialogOpen(true);
  }, []);

  /**
   * レシピ編集ダイアログを閉じる
   */
  const closeEditRecipeDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingRecipe(undefined);
  }, []);

  // === 削除確認ダイアログ操作 ===

  /**
   * 削除確認ダイアログを表示
   * 詳細ダイアログから遷移する場合は詳細ダイアログを閉じる
   */
  const showDeleteConfirmDialog = useCallback((recipe: SavedRecipe) => {
    // 詳細ダイアログが開いている場合は閉じる（重複防止）
    setIsDetailDialogOpen(false);
    setSelectedRecipe(undefined);
    
    // 削除確認ダイアログを開く
    setDeletingRecipe(recipe);
    setIsConfirmDialogOpen(true);
  }, []);

  /**
   * 削除確認ダイアログを閉じる
   */
  const closeDeleteConfirmDialog = useCallback(() => {
    setIsConfirmDialogOpen(false);
    setDeletingRecipe(undefined);
  }, []);

  // === 献立追加ダイアログ操作 ===

  /**
   * 献立追加ダイアログを表示
   */
  const showAddToMealPlanDialog = useCallback((recipe: SavedRecipe) => {
    setAddingToMealPlanRecipe(recipe);
    setIsAddToMealPlanDialogOpen(true);
  }, []);

  /**
   * 献立追加ダイアログを閉じる
   */
  const closeAddToMealPlanDialog = useCallback(() => {
    setIsAddToMealPlanDialogOpen(false);
    setAddingToMealPlanRecipe(undefined);
  }, []);

  // === 献立置き換え確認ダイアログ操作 ===

  /**
   * 献立置き換え確認ダイアログを表示
   */
  const showReplaceConfirmDialog = useCallback((data: ReplacementData) => {
    setReplacementData(data);
    setIsReplaceConfirmDialogOpen(true);
  }, []);

  /**
   * 献立置き換え確認ダイアログを閉じる
   */
  const closeReplaceConfirmDialog = useCallback(() => {
    setIsReplaceConfirmDialogOpen(false);
    setReplacementData(null);
  }, []);

  // === すべてのダイアログを閉じる ===

  /**
   * すべてのダイアログを閉じる（エラー時等の緊急用）
   */
  const closeAllDialogs = useCallback(() => {
    setIsDetailDialogOpen(false);
    setSelectedRecipe(undefined);
    setIsEditDialogOpen(false);
    setEditingRecipe(undefined);
    setIsConfirmDialogOpen(false);
    setDeletingRecipe(undefined);
    setIsAddToMealPlanDialogOpen(false);
    setAddingToMealPlanRecipe(undefined);
    setIsReplaceConfirmDialogOpen(false);
    setReplacementData(null);
  }, []);

  return {
    // 詳細ダイアログ
    isDetailDialogOpen,
    selectedRecipe,
    showRecipeDetail,
    closeRecipeDetail,
    
    // 編集ダイアログ
    isEditDialogOpen,
    editingRecipe,
    showNewRecipeDialog,
    showEditRecipeDialog,
    closeEditRecipeDialog,
    
    // 削除確認ダイアログ
    isConfirmDialogOpen,
    deletingRecipe,
    showDeleteConfirmDialog,
    closeDeleteConfirmDialog,
    
    // 献立追加ダイアログ
    isAddToMealPlanDialogOpen,
    addingToMealPlanRecipe,
    showAddToMealPlanDialog,
    closeAddToMealPlanDialog,
    
    // 献立置き換え確認ダイアログ
    isReplaceConfirmDialogOpen,
    replacementData,
    showReplaceConfirmDialog,
    closeReplaceConfirmDialog,
    
    // ユーティリティ
    closeAllDialogs
  };
};