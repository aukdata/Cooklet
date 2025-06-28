import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useToast } from '../../hooks/useToast.tsx';

// 設定アクションセクションコンポーネント
export const SettingsActions: React.FC = () => {
  const { signOut } = useAuth();
  const { navigate } = useNavigation();
  const { showSuccess, showError } = useToast();
  
  // ローカル状態
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ログアウト処理
  const handleLogout = async () => {
    const confirmed = window.confirm('ログアウトしますか？');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await signOut();
      showSuccess('ログアウトしました');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      showError('ログアウトに失敗しました');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 材料管理画面への遷移
  const handleIngredientManagement = () => {
    navigate('settings/ingredients');
  };

  return (
    <div className="space-y-4">
      {/* 材料設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🥬</span>
          材料設定
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">材料マスタ管理</div>
              <div className="text-sm text-gray-600">
                料理で使用する材料のマスタデータを管理します
              </div>
            </div>
            
            <button
              onClick={handleIngredientManagement}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
            >
              <span>⚙️</span>
              管理画面へ
            </button>
          </div>
        </div>
      </div>

      {/* アカウントアクション */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔐</span>
          アカウント
        </h2>
        
        <div className="space-y-3">
          {/* ログアウトボタン */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">ログアウト</div>
              <div className="text-sm text-gray-600">
                アカウントからサインアウトします
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ログアウト中...
                </>
              ) : (
                <>
                  <span>🚪</span>
                  ログアウト
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
