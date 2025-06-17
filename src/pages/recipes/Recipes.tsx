import React, { useState } from 'react';
import { useRecipes, type SavedRecipe } from '../../hooks/useRecipes';
import { useMealPlans } from '../../hooks/useMealPlans';
import { extractIngredientsFromURL } from '../../services/ingredientExtraction';
import { RecipeDialog } from '../../components/dialogs/RecipeDialog';
import { RecipeDetailDialog } from '../../components/dialogs/RecipeDetailDialog';
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog';
import { AddToMealPlanDialog } from '../../components/dialogs/AddToMealPlanDialog';
import { EditButton } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast.tsx';

// レシピ画面コンポーネント - CLAUDE.md仕様書5.4に準拠
export const Recipes: React.FC = () => {
  const { recipes, loading, error, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { addMealPlan, getMealPlan, getLastCookedDate } = useMealPlans();
  const { showError, showSuccess } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全て');
  
  // ダイアログの状態管理
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<SavedRecipe | undefined>();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState<SavedRecipe | undefined>();
  
  // 献立追加ダイアログの状態管理
  const [isAddToMealPlanDialogOpen, setIsAddToMealPlanDialogOpen] = useState(false);
  const [addingToMealPlanRecipe, setAddingToMealPlanRecipe] = useState<SavedRecipe | undefined>();

  // レシピ追加ボタンのハンドラー
  const handleAddNewRecipe = () => {
    setEditingRecipe(undefined); // 新規追加なのでundefined
    setIsEditDialogOpen(true);
  };

  // レシピ保存ハンドラー（新規追加と編集を統合）
  const handleSaveRecipe = async (recipeData: { title: string; url: string; servings: number; tags: string[] }) => {
    try {
      if (editingRecipe) {
        // 編集の場合
        await updateRecipe(editingRecipe.id, recipeData);
      } else {
        // 新規追加の場合
        await addRecipe(recipeData);
      }
      setIsEditDialogOpen(false);
      setEditingRecipe(undefined);
    } catch (err) {
      console.error(editingRecipe ? 'レシピの更新に失敗しました:' : 'レシピの追加に失敗しました:', err);
      showError(editingRecipe ? 'レシピの更新に失敗しました' : 'レシピの追加に失敗しました');
    }
  };


  // レシピ詳細表示ハンドラー（issue #5対応）
  const handleShowRecipeDetail = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe);
    setIsDetailDialogOpen(true);
  };

  // レシピ詳細ダイアログを閉じるハンドラー
  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedRecipe(undefined);
  };

  // レシピ編集ボタンのハンドラー
  const handleEditRecipe = (recipe: SavedRecipe) => {
    setEditingRecipe(recipe);
    setIsEditDialogOpen(true);
  };


  // レシピ削除ボタンのハンドラー
  const handleDeleteRecipe = (recipe: SavedRecipe) => {
    setDeletingRecipe(recipe);
    setIsConfirmDialogOpen(true);
  };

  // レシピ削除確認ダイアログの確認ハンドラー
  const handleConfirmDelete = async () => {
    if (!deletingRecipe) return;
    
    try {
      await deleteRecipe(deletingRecipe.id);
      setIsConfirmDialogOpen(false);
      setDeletingRecipe(undefined);
    } catch (err) {
      console.error('レシピの削除に失敗しました:', err);
      showError('レシピの削除に失敗しました');
    }
  };

  // レシピ削除キャンセルハンドラー
  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setDeletingRecipe(undefined);
  };

  // 献立追加ボタンのハンドラー
  const handleAddToMealPlan = (recipe: SavedRecipe) => {
    setAddingToMealPlanRecipe(recipe);
    setIsAddToMealPlanDialogOpen(true);
  };

  // 献立追加ダイアログを閉じるハンドラー
  const handleCloseAddToMealPlanDialog = () => {
    setIsAddToMealPlanDialogOpen(false);
    setAddingToMealPlanRecipe(undefined);
  };

  // 献立追加処理
  const handleAddMealPlan = async (date: string, mealType: '朝' | '昼' | '夜') => {
    if (!addingToMealPlanRecipe) return;

    try {
      // 同じ日時に既に献立があるかチェック
      const existingMealPlan = getMealPlan(new Date(date), mealType);
      
      if (existingMealPlan) {
        const confirmReplace = window.confirm(
          `${date}の${mealType}食には既に「${existingMealPlan.memo || '献立'}」が設定されています。\n置き換えますか？`
        );
        
        if (!confirmReplace) {
          return;
        }
      }

      // 献立を追加
      await addMealPlan({
        date,
        meal_type: mealType,
        recipe_url: addingToMealPlanRecipe.url,
        ingredients: [], // TODO: レシピから食材を取得する機能実装時に対応
        memo: addingToMealPlanRecipe.title
      });

      showSuccess('献立に追加しました');
    } catch (err) {
      console.error('献立への追加に失敗しました:', err);
      showError('献立への追加に失敗しました');
    }
  };

  // 検索フィルタリング
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === '全て' || recipe.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // 全タグを取得
  const allTags = ['全て', ...Array.from(new Set(recipes.flatMap(r => r.tags)))];

  // 日付フォーマット用のヘルパー関数（issue #31対応）
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🍳</span>
            レシピ管理
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            保存済み: {recipes.length}件
            {loading && <span className="ml-2">読み込み中...</span>}
            {error && <span className="ml-2 text-red-500">エラー: {error}</span>}
          </div>
        </div>
        <button
          onClick={handleAddNewRecipe}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          + レシピを追加
        </button>
      </div>


      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">絞込</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">🏷️ タグ:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-2 py-1 rounded ${
                  selectedTag === tag 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 保存済みレシピ一覧 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {recipes.length === 0 ? 'まだレシピが登録されていません' : '検索結果がありません'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">📄</span>
                      <h3 
                        onClick={() => handleShowRecipeDetail(recipe)}
                        className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600 hover:underline"
                      >
                        {recipe.title}
                      </h3>
                    </div>
                    
                    {recipe.url && (
                      <div className="mb-1">
                        <button 
                          onClick={() => window.open(recipe.url, '_blank')}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          🌐 レシピを見る
                        </button>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-2 flex items-center">
                      <span className="mr-1">📋</span>
                      {recipe.servings}人前
                    </div>
                    
                    {/* 最後に作った日の表示（issue #31対応） */}
                    {(() => {
                      const lastCookedDate = getLastCookedDate(recipe.url);
                      return lastCookedDate ? (
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <span className="mr-1">📅</span>
                          最後に作った日: {formatDate(lastCookedDate)}
                        </div>
                      ) : null;
                    })()}
                    
                    {recipe.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600">🏷️</span>
                        {recipe.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToMealPlan(recipe)}
                      className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
                    >
                      📅 献立に追加
                    </button>
                    <EditButton onClick={() => handleEditRecipe(recipe)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveRecipe}
        onDelete={() => editingRecipe && handleDeleteRecipe(editingRecipe)}
        onExtractIngredients={async (url: string) => {
          const result = await extractIngredientsFromURL(url);
          return result.ingredients;
        }}
        initialData={editingRecipe ? {
          title: editingRecipe.title,
          url: editingRecipe.url,
          servings: editingRecipe.servings,
          ingredients: [], // レシピ仕様では食材は直接保存しないためデフォルト値
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
    </div>
  );
};