import React, { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import { useMealPlans } from '../../hooks/useMealPlans';
import { RecipeDialog } from '../../components/dialogs/RecipeDialog';
import { RecipeDetailDialog } from '../../components/dialogs/RecipeDetailDialog';
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog';
import { AddToMealPlanDialog } from '../../components/dialogs/AddToMealPlanDialog';
import { useToast } from '../../hooks/useToast.tsx';
import { useRecipeDialogs } from '../../hooks/useRecipeDialogs';
import { RecipesHeader } from '../../components/recipes/RecipesHeader';
import { RecipesFilter } from '../../components/recipes/RecipesFilter';
import { RecipesList } from '../../components/recipes/RecipesList';
import type { SavedRecipe, RecipeFormData } from '../../types/recipe';

// レシピ画面コンポーネント - CLAUDE.md仕様書5.4に準拠
export const Recipes: React.FC = () => {
  const { recipes, loading, error, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { addMealPlan, getMealPlan, getLastCookedDate } = useMealPlans();
  const { showError, showSuccess } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全て');
  
  // ダイアログ状態管理（useRecipeDialogsフックで統合）
  const {
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
    closeReplaceConfirmDialog
  } = useRecipeDialogs();

  // レシピ追加ボタンのハンドラー
  const handleAddNewRecipe = () => {
    showNewRecipeDialog();
  };

  // レシピ保存ハンドラー（新規追加と編集を統合）
  const handleSaveRecipe = async (recipeData: RecipeFormData) => {
    try {
      if (editingRecipe) {
        // 編集の場合
        await updateRecipe(editingRecipe.id, recipeData);
      } else {
        // 新規追加の場合
        await addRecipe(recipeData);
      }
      closeEditRecipeDialog();
    } catch (err) {
      console.error(editingRecipe ? 'レシピの更新に失敗しました:' : 'レシピの追加に失敗しました:', err);
      showError(editingRecipe ? 'レシピの更新に失敗しました' : 'レシピの追加に失敗しました');
    }
  };


  // レシピ詳細表示ハンドラー（issue #5対応）
  const handleShowRecipeDetail = (recipe: SavedRecipe) => {
    showRecipeDetail(recipe);
  };

  // レシピ詳細ダイアログを閉じるハンドラー
  const handleCloseDetailDialog = () => {
    closeRecipeDetail();
  };

  // レシピ編集ボタンのハンドラー
  const handleEditRecipe = (recipe: SavedRecipe) => {
    showEditRecipeDialog(recipe);
  };

  // レシピ削除ボタンのハンドラー
  const handleDeleteRecipe = (recipe: SavedRecipe) => {
    showDeleteConfirmDialog(recipe);
  };

  // レシピ削除確認ダイアログの確認ハンドラー
  const handleConfirmDelete = async () => {
    if (!deletingRecipe) return;
    
    try {
      await deleteRecipe(deletingRecipe.id);
      closeDeleteConfirmDialog();
    } catch (err) {
      console.error('レシピの削除に失敗しました:', err);
      showError('レシピの削除に失敗しました');
    }
  };

  // レシピ削除キャンセルハンドラー
  const handleCancelDelete = () => {
    closeDeleteConfirmDialog();
  };

  // 献立追加ボタンのハンドラー
  const handleAddToMealPlan = (recipe: SavedRecipe) => {
    showAddToMealPlanDialog(recipe);
  };

  // 献立追加ダイアログを閉じるハンドラー
  const handleCloseAddToMealPlanDialog = () => {
    closeAddToMealPlanDialog();
  };

  // 献立追加処理
  const handleAddMealPlan = async (date: string, mealType: '朝' | '昼' | '夜', recipe: SavedRecipe) => {
    if (!recipe) return;

    try {
      // 同じ日時に既に献立があるかチェック
      const existingMealPlan = getMealPlan(new Date(date), mealType);
      
      if (existingMealPlan) {
        // 置き換え確認ダイアログを表示
        showReplaceConfirmDialog({
          recipe: recipe,
          date,
          mealType,
          existingMealPlan
        });
        return;
      }

      // 献立を追加（レシピの材料データを含む）
      await addMealPlan({
        date,
        meal_type: mealType,
        source_type: 'recipe', // レシピから追加
        recipe_url: recipe.url,
        ingredients: recipe.ingredients || [], // レシピの材料データをコピー
        memo: recipe.title,
        consumed_status: 'pending' // デフォルト値を設定
      });

      showSuccess('献立に追加しました');
    } catch (err) {
      console.error('献立への追加に失敗しました:', err);
      showError('献立への追加に失敗しました');
    }
  };

  // 献立置き換え確認ハンドラー
  const handleConfirmReplace = async () => {
    if (!replacementData) return;

    try {
      // 献立を追加（既存を置き換え、レシピの材料データを含む）
      await addMealPlan({
        date: replacementData.date,
        meal_type: replacementData.mealType,
        source_type: 'recipe', // レシピから追加
        recipe_url: replacementData.recipe.url,
        ingredients: replacementData.recipe.ingredients || [], // レシピの材料データをコピー
        memo: replacementData.recipe.title,
        consumed_status: 'pending' // デフォルト値を設定
      });

      showSuccess('献立を置き換えました');
      handleCloseAddToMealPlanDialog();
    } catch (err) {
      console.error('献立の置き換えに失敗しました:', err);
      showError('献立の置き換えに失敗しました');
    } finally {
      closeReplaceConfirmDialog();
    }
  };

  // 献立置き換えキャンセルハンドラー
  const handleCancelReplace = () => {
    closeReplaceConfirmDialog();
  };

  // 検索フィルタリング
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === '全て' || recipe.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // 全タグを取得
  const allTags = ['全て', ...Array.from(new Set(recipes.flatMap(r => r.tags)))];

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <RecipesHeader
        recipeCount={recipes.length}
        loading={loading}
        error={error}
        onAddNewRecipe={handleAddNewRecipe}
      />

      {/* 検索・フィルター */}
      <RecipesFilter
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        allTags={allTags}
        onSearchQueryChange={setSearchQuery}
        onSelectedTagChange={setSelectedTag}
      />

      {/* 保存済みレシピ一覧 */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-center py-8 text-gray-500">
            {recipes.length === 0 ? 'まだレシピが登録されていません' : '検索結果がありません'}
          </div>
        </div>
      ) : (
        <RecipesList
          recipes={filteredRecipes}
          onShowRecipeDetail={handleShowRecipeDetail}
          onEditRecipe={handleEditRecipe}
          onAddToMealPlan={handleAddToMealPlan}
          getLastCookedDate={getLastCookedDate}
        />
      )}

      {/* レシピ詳細ダイアログ（issue #5対応） */}
      <RecipeDetailDialog
        isOpen={isDetailDialogOpen}
        recipe={selectedRecipe || null}
        onClose={handleCloseDetailDialog}
        onEdit={handleEditRecipe}
        onDelete={handleDeleteRecipe}
      />

      {/* レシピ編集ダイアログ */}
      <RecipeDialog
        isOpen={isEditDialogOpen}
        onClose={closeEditRecipeDialog}
        onSave={handleSaveRecipe}
        onDelete={() => editingRecipe && handleDeleteRecipe(editingRecipe)}
        initialData={editingRecipe ? {
          title: editingRecipe.title,
          url: editingRecipe.url,
          servings: editingRecipe.servings,
          ingredients: editingRecipe.ingredients || [], // 保存された材料情報を表示
          tags: editingRecipe.tags
        } : undefined}
        isEditing={!!editingRecipe}
      />

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="確認"
        message="を削除します"
        itemName={deletingRecipe?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* 献立追加ダイアログ */}
      <AddToMealPlanDialog
        isOpen={isAddToMealPlanDialogOpen}
        recipe={addingToMealPlanRecipe || null}
        onClose={handleCloseAddToMealPlanDialog}
        onAdd={handleAddMealPlan}
      />

      {/* 献立置き換え確認ダイアログ */}
      <ConfirmDialog
        isOpen={isReplaceConfirmDialogOpen}
        title="確認"
        message={`${replacementData?.date}の${replacementData?.mealType}食には既に「${(replacementData?.existingMealPlan as {memo?: string})?.memo || '献立'}」が設定されています。\n置き換えますか？`}
        onConfirm={handleConfirmReplace}
        onCancel={handleCancelReplace}
        confirmText="置き換える"
        cancelText="キャンセル"
        isDestructive={false}
      />
    </div>
  );
};