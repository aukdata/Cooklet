import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast.tsx';
import { useBuildInfo } from '../../hooks/useBuildInfo';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';
import { EditButton } from '../../components/ui/Button';

// ユーザ設定画面コンポーネント - issue #11対応（画面化）
export const Settings: React.FC = () => {
  const { supabaseUser, signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const { version, formatBuildDate } = useBuildInfo();
  const { navigate } = useNavigation();
  const { settings: notificationSettings, enableNotifications, disableNotifications, updateExpiryDays, loading: notificationLoading } = useNotificationSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // 材料マスタ管理画面への遷移
  const handleIngredientManagement = () => {
    navigate('settings/ingredients');
  };

  // 通知機能の有効化処理
  const handleEnableNotifications = async () => {
    try {
      const success = await enableNotifications();
      if (success) {
        showSuccess('通知機能を有効にしました');
      } else {
        showError('通知権限が拒否されました。ブラウザの設定から通知を許可してください。');
      }
    } catch (error) {
      console.error('通知有効化エラー:', error);
      showError('通知機能の有効化に失敗しました');
    }
  };

  // 通知機能の無効化処理
  const handleDisableNotifications = async () => {
    try {
      await disableNotifications();
      showSuccess('通知機能を無効にしました');
    } catch (error) {
      console.error('通知無効化エラー:', error);
      showError('通知機能の無効化に失敗しました');
    }
  };

  // 期限通知日数の変更処理
  const handleExpiryDaysChange = async (days: number) => {
    try {
      await updateExpiryDays(days);
      showSuccess(`期限通知を${days}日前に設定しました`);
    } catch (error) {
      console.error('期限日数変更エラー:', error);
      showError('期限通知日数の変更に失敗しました');
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
                <EditButton
                  onClick={() => setIsEditing(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 材料設定セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🥕</span>
          材料設定
        </h3>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">材料マスタ管理</p>
              <p className="text-xs text-gray-500 mt-1">
                よく使う材料を登録・編集できます
              </p>
            </div>
            <button
              onClick={handleIngredientManagement}
              className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors flex items-center"
            >
              管理画面
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 通知設定セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🔔</span>
          通知設定
        </h3>
        
        <div className="space-y-4">
          {/* 通知機能の有効/無効 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">期限通知</p>
              <p className="text-xs text-gray-500 mt-1">
                賞味期限が近い食品をプッシュ通知でお知らせします
              </p>
            </div>
            <div className="flex items-center">
              {notificationLoading ? (
                <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              ) : (
                <button
                  onClick={notificationSettings.notification_enabled ? handleDisableNotifications : handleEnableNotifications}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    notificationSettings.notification_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notificationSettings.notification_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* 期限通知日数設定 */}
          {notificationSettings.notification_enabled && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                通知タイミング
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <select
                    value={notificationSettings.expiry_notification_days}
                    onChange={(e) => handleExpiryDaysChange(Number(e.target.value))}
                    className="block w-32 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={notificationLoading}
                  >
                    {/* よく使われる日数を優先表示 */}
                    <optgroup label="よく使われる設定">
                      <option value={1}>1日前</option>
                      <option value={2}>2日前</option>
                      <option value={3}>3日前</option>
                      <option value={5}>5日前</option>
                      <option value={7}>1週間前</option>
                    </optgroup>
                    <optgroup label="その他の設定">
                      <option value={4}>4日前</option>
                      <option value={6}>6日前</option>
                      <option value={10}>10日前</option>
                      <option value={14}>2週間前</option>
                      <option value={21}>3週間前</option>
                      <option value={30}>1ヶ月前</option>
                    </optgroup>
                  </select>
                  <span className="text-sm text-gray-500">から通知を開始</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs text-blue-700">
                    <strong>現在の設定:</strong> 賞味期限の{notificationSettings.expiry_notification_days}日前から通知
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    例: 今日が1月1日で3日前に設定している場合、1月4日が賞味期限の食品から通知されます
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* ブラウザ通知権限の説明 */}
          {!notificationSettings.notification_enabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    通知を有効にするには、ブラウザの通知権限が必要です。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 朝の通知設定 */}
      <NotificationSettings supabaseUser={supabaseUser} />

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

    </div>
  );
};