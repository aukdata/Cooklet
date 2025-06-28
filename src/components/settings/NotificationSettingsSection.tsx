import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../hooks/useToast.tsx';
import { supabase } from '../../lib/supabase';

// 通知設定セクションコンポーネント
export const NotificationSettingsSection: React.FC = () => {
  const { supabaseUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const { 
    settings: notificationSettings, 
    enableNotifications, 
    disableNotifications, 
    updateExpiryDays, 
    loading: notificationLoading 
  } = useNotificationSettings();
  
  // ローカル状態
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [isSavingTime, setIsSavingTime] = useState(false);

  // 通知時間を読み込み
  useEffect(() => {
    if (supabaseUser?.id) {
      const loadNotificationTime = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('notification_time')
            .eq('id', supabaseUser.id)
            .single();

          if (error) {
            console.warn('通知時間の取得に失敗:', error);
            return;
          }

          if (data?.notification_time) {
            setNotificationTime(data.notification_time);
          }
        } catch (error) {
          console.error('通知時間読み込みエラー:', error);
        }
      };

      loadNotificationTime();
    }
  }, [supabaseUser]);

  // 通知有効化処理
  const handleEnableNotifications = async () => {
    try {
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        await enableNotifications();
        showSuccess('通知を有効化しました');
      } else {
        showError('通知権限が拒否されました');
      }
    } catch (error) {
      console.error('通知有効化エラー:', error);
      showError('通知の有効化に失敗しました');
    }
  };

  // 通知無効化処理
  const handleDisableNotifications = async () => {
    try {
      await disableNotifications();
      showSuccess('通知を無効化しました');
    } catch (error) {
      console.error('通知無効化エラー:', error);
      showError('通知の無効化に失敗しました');
    }
  };

  // 通知時間保存処理
  const handleSaveNotificationTime = async () => {
    if (!supabaseUser?.id) {
      showError('ユーザー情報が取得できません');
      return;
    }

    setIsSavingTime(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ notification_time: notificationTime })
        .eq('id', supabaseUser.id);

      if (error) {
        throw error;
      }

      showSuccess('通知時間を更新しました');
    } catch (error) {
      console.error('通知時間更新エラー:', error);
      showError('通知時間の更新に失敗しました');
    } finally {
      setIsSavingTime(false);
    }
  };

  // 期限日数変更処理
  const handleExpiryDaysChange = async (days: number) => {
    try {
      await updateExpiryDays(days);
      showSuccess(`期限通知を${days}日前に設定しました`);
    } catch (error) {
      console.error('期限日数更新エラー:', error);
      showError('期限日数の更新に失敗しました');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>🔔</span>
        通知設定
      </h2>
      
      {notificationLoading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          設定を読み込み中...
        </div>
      ) : (
        <div className="space-y-4">
          {/* 通知有効/無効 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">賞味期限通知</div>
              <div className="text-sm text-gray-600">
                賞味期限が近い食品を通知します
              </div>
            </div>
            
            {notificationSettings?.notification_enabled ? (
              <button
                onClick={handleDisableNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                無効化
              </button>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                有効化
              </button>
            )}
          </div>

          {/* 通知時間設定 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">通知時間</div>
              <div className="text-sm text-gray-600">毎日の通知時間を設定</div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSavingTime}
              />
              <button
                onClick={handleSaveNotificationTime}
                disabled={isSavingTime}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSavingTime ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          {/* 期限日数設定 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">期限通知</div>
              <div className="text-sm text-gray-600">
                賞味期限の何日前に通知するか設定
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 5, 7].map(days => (
                <button
                  key={days}
                  onClick={() => handleExpiryDaysChange(days)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    notificationSettings?.expiry_notification_days === days
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days}日前
                </button>
              ))}
            </div>
          </div>

          {/* 通知状態表示 */}
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-gray-600">
              <div>現在の設定:</div>
              <div className="mt-1">
                <span className="font-medium">
                  通知: {notificationSettings?.notification_enabled ? '有効' : '無効'}
                </span>
                {notificationSettings?.notification_enabled && (
                  <span className="ml-4">
                    時間: {notificationTime} | 期限: {notificationSettings.expiry_notification_days}日前
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
