import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast.tsx';
import { useBuildInfo } from '../../hooks/useBuildInfo';
import { useIngredients } from '../../hooks/useIngredients';
import { IngredientDialog } from '../../components/dialogs/IngredientDialog';
import { type Ingredient } from '../../types';

// ユーザ設定画面コンポーネント - issue #11対応（画面化）
export const Settings: React.FC = () => {
  const { supabaseUser, signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const { version, formatBuildDate } = useBuildInfo();
  const { ingredients, loading: ingredientsLoading, addIngredient, updateIngredient, deleteIngredient } = useIngredients();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 材料設定関連の状態
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>();

  // supabaseUserの変更を監視してdisplayNameを同期
  useEffect(() => {
    const fullName = supabaseUser?.user_metadata?.full_name || '';
    setDisplayName(fullName);
  }, [supabaseUser]);

  // ユーザ名保存処理（Supabaseのuser_metadata更新）
  const handleSaveName = async () => {
    try {
      setIsSaving(true);
      
      // Supabaseのauth.updateUserでuser_metadataを更新
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });

      if (error) {
        console.error('ユーザ名の更新に失敗しました:', error);
        showError('ユーザ名の更新に失敗しました。');
        return;
      }

      // セッションを再取得してAuthContextの状態を更新
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // AuthContextは自動的にセッション変更を検知して更新される
        console.log('ユーザー情報更新完了:', session.user.user_metadata);
      }

      setIsEditing(false);
      // 更新成功を表示
      showSuccess('ユーザ名を更新しました。');
    } catch (error) {
      console.error('ユーザ名の保存に失敗しました:', error);
      showError('ユーザ名の保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // ログアウト成功時は自動的にLogin画面にリダイレクト
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      showError('ログアウトに失敗しました。');
    } finally {
      setIsLoggingOut(false);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="mr-2">⚙️</span>
          設定
        </h2>
      </div>

      {/* ユーザー情報セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">👤</span>
          ユーザー情報
        </h3>
        
        <div className="space-y-4">
          {/* メールアドレス表示 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-900">{supabaseUser?.email}</p>
            </div>
          </div>

          {/* ユーザ名編集 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            {isEditing ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="表示名を入力"
                  disabled={isSaving}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(supabaseUser?.user_metadata?.full_name || '');
                  }}
                  disabled={isSaving}
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-900">
                  {displayName || 'まだ設定されていません'}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  編集
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 材料設定セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">🥕</span>
            材料設定
          </h3>
          <button
            onClick={handleAddIngredient}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            材料を追加
          </button>
        </div>
        
        {/* 材料一覧 */}
        <div className="space-y-2">
          {ingredientsLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500 mt-2">読み込み中...</p>
            </div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">まだ材料が登録されていません</p>
              <p className="text-xs text-gray-400 mt-1">「材料を追加」ボタンから登録してください</p>
            </div>
          ) : (
            ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getCategoryIcon(ingredient.category)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ingredient.name}</p>
                    <p className="text-xs text-gray-500">
                      {getCategoryName(ingredient.category)} • {ingredient.default_unit}
                      {ingredient.typical_price && ` • ${ingredient.typical_price}円`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditIngredient(ingredient)}
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  編集
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* アプリ情報セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📱</span>
          アプリ情報
        </h3>
        
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">バージョン</span>
            <span className="text-sm text-gray-900">{version}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">ビルド日時</span>
            <span className="text-sm text-gray-900">{formatBuildDate}</span>
          </div>
        </div>
      </div>

      {/* ログアウトセクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🚪</span>
          アカウント操作
        </h3>
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ログアウト中...
            </span>
          ) : (
            'ログアウト'
          )}
        </button>
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