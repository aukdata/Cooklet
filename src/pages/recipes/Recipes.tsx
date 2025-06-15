import React, { useState } from 'react';
import { useRecipes, type SavedRecipe } from '../../hooks/useRecipes';
import { extractIngredientsFromURL, extractRecipeTitleFromURL } from '../../services/ingredientExtraction';
import { RecipeDialog } from '../../components/dialogs/RecipeDialog';
import { ConfirmDialog } from '../../components/dialogs/ConfirmDialog';

// レシピ画面コンポーネント - CLAUDE.md仕様書5.4に準拠
export const Recipes: React.FC = () => {
  const { recipes, loading, error, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [newRecipeUrl, setNewRecipeUrl] = useState('');
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全て');
  
  // ダイアログの状態管理
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<SavedRecipe | undefined>();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState<SavedRecipe | undefined>();
  
  // 食材自動抽出の状態管理
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{
    ingredients: { name: string; quantity: string }[];
    error?: string;
  } | null>(null);

  // 食材自動抽出処理
  const handleExtractIngredients = async () => {
    if (!newRecipeUrl.trim()) {
      alert('レシピURLを入力してください');
      return;
    }

    setIsExtracting(true);
    setExtractionResult(null);

    try {
      // URLからレシピタイトルを抽出
      if (!newRecipeTitle.trim()) {
        const title = await extractRecipeTitleFromURL(newRecipeUrl);
        setNewRecipeTitle(title);
      }

      // 食材を自動抽出
      const result = await extractIngredientsFromURL(newRecipeUrl);
      
      if (result.success) {
        setExtractionResult({
          ingredients: result.ingredients,
          error: result.error // 警告メッセージがある場合
        });
      } else {
        setExtractionResult({
          ingredients: [],
          error: result.error
        });
      }
    } catch (err) {
      console.error('食材抽出に失敗しました:', err);
      setExtractionResult({
        ingredients: [],
        error: '食材抽出中にエラーが発生しました'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // URLからレシピを追加する処理
  const handleAddRecipe = async () => {
    if (!newRecipeUrl.trim() && !newRecipeTitle.trim()) return;
    
    try {
      await addRecipe({
        title: newRecipeTitle || 'レシピ',
        url: newRecipeUrl,
        servings: 1,
        tags: []
      });
      setNewRecipeUrl('');
      setNewRecipeTitle('');
      setExtractionResult(null);
    } catch (err) {
      console.error('レシピの追加に失敗しました:', err);
    }
  };

  // レシピ編集ボタンのハンドラー
  const handleEditRecipe = (recipe: SavedRecipe) => {
    setEditingRecipe(recipe);
    setIsEditDialogOpen(true);
  };

  // レシピ編集ダイアログの保存ハンドラー
  const handleSaveEditedRecipe = async (recipeData: any) => {
    if (!editingRecipe) return;
    
    try {
      await updateRecipe(editingRecipe.id, {
        title: recipeData.title,
        url: recipeData.url,
        servings: recipeData.servings,
        tags: recipeData.tags
      });
      setIsEditDialogOpen(false);
      setEditingRecipe(undefined);
    } catch (err) {
      console.error('レシピの更新に失敗しました:', err);
      alert('レシピの更新に失敗しました');
    }
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
      alert('レシピの削除に失敗しました');
    }
  };

  // レシピ削除キャンセルハンドラー
  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setDeletingRecipe(undefined);
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
        <button className="text-gray-400 hover:text-gray-600">
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      {/* 新規レシピ登録 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📝</span>
          新しいレシピを追加
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={newRecipeUrl}
              onChange={(e) => setNewRecipeUrl(e.target.value)}
              placeholder="レシピURLを入力..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleExtractIngredients}
              disabled={isExtracting || !newRecipeUrl.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isExtracting ? '解析中...' : '食材抽出'}
            </button>
          </div>
          
          {/* 食材自動抽出結果 */}
          {extractionResult && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <span className="mr-1">🤖</span>
                食材自動抽出結果
              </h4>
              
              {extractionResult.error && (
                <div className="text-orange-600 text-sm mb-2 p-2 bg-orange-50 rounded">
                  ⚠️ {extractionResult.error}
                </div>
              )}
              
              {extractionResult.ingredients.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 mb-2">検出された食材:</div>
                  {extractionResult.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center bg-white rounded px-3 py-2 text-sm">
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-gray-600">{ingredient.quantity}</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 mt-2">
                    ※ 抽出結果は保存時に自動でレシピに追加されます
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">食材を抽出できませんでした</div>
              )}
            </div>
          )}
          
          <div className="text-center text-gray-500 text-sm">または</div>
          <input
            type="text"
            value={newRecipeTitle}
            onChange={(e) => setNewRecipeTitle(e.target.value)}
            placeholder="レシピ名を入力..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddRecipe}
            disabled={!newRecipeUrl.trim() && !newRecipeTitle.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-2 px-4 rounded text-sm"
          >
            {newRecipeUrl ? '解析' : '保存'}
          </button>
        </div>
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
                      <h3 className="font-medium text-gray-900">{recipe.title}</h3>
                    </div>
                    
                    {recipe.url && (
                      <div className="text-sm text-blue-600 mb-1 flex items-center">
                        <span className="mr-1">🌐</span>
                        <a
                          href={recipe.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {recipe.url.replace(/^https?:\/\//, '').substring(0, 50)}...
                        </a>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-2 flex items-center">
                      <span className="mr-1">📋</span>
                      {recipe.servings}人前
                    </div>
                    
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
                      onClick={() => handleEditRecipe(recipe)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      編集
                    </button>
                    <button 
                      onClick={() => handleDeleteRecipe(recipe)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* レシピ編集ダイアログ */}
      <RecipeDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEditedRecipe}
        onExtractIngredients={extractIngredientsFromURL}
        initialData={editingRecipe ? {
          title: editingRecipe.title,
          url: editingRecipe.url,
          servings: editingRecipe.servings,
          ingredients: [], // レシピ仕様では食材は直接保存しないためデフォルト値
          tags: editingRecipe.tags
        } : undefined}
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
    </div>
  );
};