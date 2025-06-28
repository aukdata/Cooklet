import React, { useState, useMemo } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../../hooks/useToast.tsx';
import { IngredientDialog } from '../../components/dialogs/IngredientDialog';
import { EditButton } from '../../components/ui/Button';
import { type Ingredient } from '../../types';

// 材料マスタ管理画面コンポーネント
export const IngredientManagement: React.FC = () => {
  const { navigate } = useNavigation();
  const { showSuccess, showError } = useToast();
  const { ingredients, loading: ingredientsLoading, addIngredient, updateIngredient, deleteIngredient } = useIngredients();
  
  // 材料設定関連の状態
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>();
  
  // 検索関連の状態
  const [searchQuery, setSearchQuery] = useState('');

  // 検索フィルター処理
  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) {
      return ingredients;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return ingredients.filter((ingredient) => {
      // 材料名での検索
      const matchesName = ingredient.name.toLowerCase().includes(query);
      
      // カテゴリでの検索（日本語名も対象）
      const categoryName = getCategoryName(ingredient.category).toLowerCase();
      const matchesCategory = categoryName.includes(query) || ingredient.category.toLowerCase().includes(query);
      
      // 単位での検索
      const matchesUnit = ingredient.defaultUnit.toLowerCase().includes(query);
      
      return matchesName || matchesCategory || matchesUnit;
    });
  }, [ingredients, searchQuery]);

  // 検索クリア処理
  const handleClearSearch = () => {
    setSearchQuery('');
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
  const handleSaveIngredient = async (ingredientData: Omit<Ingredient, 'id' | 'userId' | 'createdAt'>) => {
    try {
      if (editingIngredient) {
        // 編集モード
        await updateIngredient(editingIngredient.id.toString(), ingredientData);
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
  const handleDeleteIngredient = async (id: string) => {
    try {
      await deleteIngredient(id);
      showSuccess('材料を削除しました');
    } catch (error) {
      console.error('材料の削除に失敗しました:', error);
      showError('材料の削除に失敗しました');
      throw error;
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
          </div>
          <button
            onClick={handleAddIngredient}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            材料を追加
          </button>
        </div>
        
        {/* 検索フィールド */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="材料名、カテゴリ、単位で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* 検索結果の表示 */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              「{searchQuery}」の検索結果: {filteredIngredients.length}件
              {filteredIngredients.length === 0 && (
                <span className="ml-2 text-blue-600">該当する材料が見つかりませんでした</span>
              )}
            </p>
          </div>
        )}

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
          ) : filteredIngredients.length === 0 && searchQuery ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 mb-2">検索結果が見つかりませんでした</p>
              <p className="text-sm text-gray-400 mb-4">
                別のキーワードで検索してみてください
              </p>
              <button
                onClick={handleClearSearch}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                検索をクリア
              </button>
            </div>
          ) : (
            <>
              {/* カテゴリ別に材料を表示 */}
              {['vegetables', 'meat', 'seasoning', 'others'].map((category) => {
                const categoryIngredients = filteredIngredients.filter((ingredient) => ingredient.category === category);
                if (categoryIngredients.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <span className="mr-2 text-lg">{getCategoryIcon(category)}</span>
                      {getCategoryName(category)}
                      <span className="ml-2 text-sm text-gray-400">({categoryIngredients.length}件)</span>
                    </h4>
                    <div className="space-y-2">
                      {categoryIngredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="bg-gray-50 p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center text-sm">
                                <span className="text-gray-500">{ingredient.originalName}</span>
                                <span className="text-gray-400 mx-2">→</span>
                                <span className="text-gray-900 font-medium">{ingredient.name}</span>
                              </div>
                              {ingredient.typicalPrice && (
                                <div className="text-xs text-gray-500 mt-1">
                                  ¥{ingredient.typicalPrice}
                                </div>
                              )}
                            </div>
                            <EditButton
                              onClick={() => handleEditIngredient(ingredient)}
                            />
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