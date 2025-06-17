import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast.tsx';

// ユーザ設定画面コンポーネント - issue #11対応（画面化）
export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState((user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name || '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
              <p className="text-sm text-gray-900">{user?.email}</p>
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
                    setDisplayName((user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name || '');
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

      {/* アプリ情報セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📱</span>
          アプリ情報
        </h3>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">バージョン</span>
            <span className="text-sm text-gray-900">1.0.0</span>
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
    </div>
  );
};