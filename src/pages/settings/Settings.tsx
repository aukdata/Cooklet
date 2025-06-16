import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsProps {
  onClose: () => void;
}

// ユーザ設定画面コンポーネント - issue #8対応
export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState((user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name || '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ユーザ名保存処理（仮実装 - Supabaseのプロファイル更新は将来実装）
  const handleSaveName = () => {
    // TODO: Supabaseのuser_metadataを更新する処理を実装
    setIsEditing(false);
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // ログアウト成功時は自動的にLogin画面にリダイレクト
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      alert('ログアウトに失敗しました。');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">⚙️</span>
            設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-6">
          {/* ユーザー情報セクション */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">ユーザー情報</h3>
            
            {/* メールアドレス表示 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-900">{user?.email}</p>
              </div>
            </div>

            {/* ユーザ名編集 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName((user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name || '');
                    }}
                    className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
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

          {/* アプリ情報セクション */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">アプリ情報</h3>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">バージョン</span>
                <span className="text-sm text-gray-900">1.0.0</span>
              </div>
            </div>
          </div>

          {/* ログアウトボタン */}
          <div className="pt-4 border-t border-gray-200">
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
      </div>
    </div>
  );
};