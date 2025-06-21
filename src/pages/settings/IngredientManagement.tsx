import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { IngredientDialog } from '../../components/dialogs/IngredientDialog';
import { type Ingredient } from '../../types';

// 材料マスタ管理画面コンポーネント
export const IngredientManagement: React.FC = () => {
  const { navigate } = useNavigation();
  const { showSuccess, showError } = useToast();
  const { ingredients, loading: ingredientsLoading, addIngredient, updateIngredient, deleteIngredient } = useIngredients();
  
  // 材料設定関連の状態
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>();

  // 材料追加処理
  const handleAddIngredient = () => {
    setEditingIngredient(undefined);
    setIsIngredientDialogOpen(true);
  };

  // 材料編集処理
  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsIngredientDialogOpen(true);
  };

  // 材料保存処理
  const handleSaveIngredient = async (ingredientData: Omit<Ingredient, 'id' | 'user_id' | 'created_at'>) => {
    try {
      if (editingIngredient) {
        // 編集モード
        await updateIngredient(editingIngredient.id, ingredientData);
        showSuccess('材料を更新しました');
      } else {
        // 新規作成モード
        await addIngredient(ingredientData);
        showSuccess('材料を追加しました');
      }
    } catch (error) {
      console.error('材料の保存に失敗しました:', error);
      showError('材料の保存に失敗しました');
      throw error;
    }
  };

  // 材料削除処理
  const handleDeleteIngredient = async (id: number) => {
    try {
      await deleteIngredient(id);
      showSuccess('材料を削除しました');
    } catch (error) {
      console.error('材料の削除に失敗しました:', error);
      showError('材料の削除に失敗しました');
      throw error;
    }
  };

  // カテゴリ別のアイコンを取得
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vegetables': return '🥬';
      case 'meat': return '🥩';
      case 'seasoning': return '🧂';
      case 'others': return '📦';
      default: return '🥕';
    }
  };

  // カテゴリ別の日本語名を取得
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'vegetables': return '野菜';
      case 'meat': return '肉・魚';
      case 'seasoning': return '調味料';
      case 'others': return 'その他';
      default: return '不明';
    }
  };

  return (
    <div className="p-4">
      {/* ヘッダーセクション */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('settings')}
          className="mr-3 p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold flex items-center">
          <span className="mr-2">🥕</span>
          材料マスタ管理
        </h2>
      </div>

      {/* 材料管理メインセクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-medium text-gray-900">登録済み材料</h3>
            <p className="text-sm text-gray-500 mt-1">
              よく使う材料を登録しておくと、レシピ作成時に選択できます
            </p>
          </div>
          <button
            onClick={handleAddIngredient}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            材料を追加
          </button>
        </div>
        
        {/* 材料一覧 */}
        <div className="space-y-3">
          {ingredientsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500 mt-3">読み込み中...</p>
            </div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🥕</div>
              <p className="text-gray-500 mb-2">まだ材料が登録されていません</p>
              <p className="text-sm text-gray-400 mb-4">
                「材料を追加」ボタンから、よく使う材料を登録してください
              </p>
              <button
                onClick={handleAddIngredient}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                最初の材料を追加
              </button>
            </div>
          ) : (
            <>
              {/* カテゴリ別に材料を表示 */}
              {['vegetables', 'meat', 'seasoning', 'others'].map((category) => {
                const categoryIngredients = ingredients.filter((ingredient) => ingredient.category === category);
                if (categoryIngredients.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <span className="mr-2 text-lg">{getCategoryIcon(category)}</span>
                      {getCategoryName(category)}
                      <span className="ml-2 text-sm text-gray-400">({categoryIngredients.length}件)</span>
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryIngredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getCategoryIcon(ingredient.category)}</span>
                              <h5 className="font-medium text-gray-900">{ingredient.name}</h5>
                            </div>
                            <button
                              onClick={() => handleEditIngredient(ingredient)}
                              className="text-indigo-600 hover:text-indigo-500 text-sm"
                            >
                              編集
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>単位:</span>
                              <span>{ingredient.default_unit}</span>
                            </div>
                            {ingredient.typical_price && (
                              <div className="flex justify-between">
                                <span>価格:</span>
                                <span>{ingredient.typical_price}円</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 材料編集ダイアログ */}
      <IngredientDialog
        isOpen={isIngredientDialogOpen}
        onClose={() => setIsIngredientDialogOpen(false)}
        ingredient={editingIngredient}
        onSave={handleSaveIngredient}
        onDelete={handleDeleteIngredient}
      />
    </div>
  );
};