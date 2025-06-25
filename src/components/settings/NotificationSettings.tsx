import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast.tsx';
import { notificationService } from '../../services/notificationService';
import { type User } from '@supabase/supabase-js';

interface NotificationSettingsProps {
  /** Supabaseユーザー情報 */
  supabaseUser: User | null;
}

/**
 * 通知設定コンポーネント
 * 朝の時間指定通知の有効/無効切り替えと時間設定を管理
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  supabaseUser
}) => {
  const { showSuccess, showError } = useToast();

  // 朝の通知設定状態
  const [morningNotificationTime, setMorningNotificationTime] = useState('08:00');
  const [morningNotificationEnabled, setMorningNotificationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 朝の通知設定を読み込み
  useEffect(() => {
    if (supabaseUser?.id) {
      const loadMorningSettings = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('notification_enabled, notification_time')
            .eq('id', supabaseUser.id)
            .single();

          if (error) {
            console.warn('朝の通知設定の取得に失敗:', error);
            return;
          }

          if (data) {
            setMorningNotificationEnabled(data.notification_enabled || false);
            setMorningNotificationTime(data.notification_time || '08:00');
            
            // 有効な場合は通知をスケジュール
            if (data.notification_enabled) {
              notificationService.scheduleMorningNotification({
                enabled: true,
                time: data.notification_time || '08:00'
              }, supabaseUser.id);
            }
          }
        } catch (error) {
          console.error('朝の通知設定読み込みエラー:', error);
        }
      };

      loadMorningSettings();
    }
  }, [supabaseUser?.id]);

  // 朝の通知設定の有効化
  const handleEnableMorningNotification = async () => {
    if (!supabaseUser?.id) return;

    try {
      setIsLoading(true);

      // 通知権限を確認・要求
      const hasPermission = await notificationService.requestNotificationPermission();
      if (!hasPermission) {
        showError('通知権限が拒否されました。ブラウザの設定から通知を許可してください。');
        return;
      }

      // データベースに保存
      const { error } = await supabase
        .from('users')
        .update({
          notification_enabled: true,
          notification_time: morningNotificationTime
        })
        .eq('id', supabaseUser.id);

      if (error) {
        console.error('朝の通知設定の保存に失敗:', error);
        showError('朝の通知設定の保存に失敗しました');
        return;
      }

      setMorningNotificationEnabled(true);
      
      // 通知をスケジュール
      notificationService.scheduleMorningNotification({
        enabled: true,
        time: morningNotificationTime
      }, supabaseUser.id);

      showSuccess('朝の通知を有効にしました');
    } catch (error) {
      console.error('朝の通知有効化エラー:', error);
      showError('朝の通知の有効化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 朝の通知設定の無効化
  const handleDisableMorningNotification = async () => {
    if (!supabaseUser?.id) return;

    try {
      setIsLoading(true);

      // データベースに保存
      const { error } = await supabase
        .from('users')
        .update({ notification_enabled: false })
        .eq('id', supabaseUser.id);

      if (error) {
        console.error('朝の通知設定の保存に失敗:', error);
        showError('朝の通知設定の保存に失敗しました');
        return;
      }

      setMorningNotificationEnabled(false);
      
      // 通知スケジュールをクリア
      notificationService.clearMorningNotifications();

      showSuccess('朝の通知を無効にしました');
    } catch (error) {
      console.error('朝の通知無効化エラー:', error);
      showError('朝の通知の無効化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 朝の通知時間の変更
  const handleMorningTimeChange = async (time: string) => {
    if (!supabaseUser?.id) return;

    try {
      setIsLoading(true);

      // データベースに保存
      const { error } = await supabase
        .from('users')
        .update({ notification_time: time })
        .eq('id', supabaseUser.id);

      if (error) {
        console.error('朝の通知時間の保存に失敗:', error);
        showError('朝の通知時間の保存に失敗しました');
        return;
      }

      setMorningNotificationTime(time);
      
      // 有効な場合は再スケジュール
      if (morningNotificationEnabled) {
        notificationService.scheduleMorningNotification({
          enabled: true,
          time: time
        }, supabaseUser.id);
      }

      showSuccess(`朝の通知時間を${time}に設定しました`);
    } catch (error) {
      console.error('朝の通知時間変更エラー:', error);
      showError('朝の通知時間の変更に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">🌅</span>
        朝の通知設定
      </h3>
      
      <div className="space-y-4">
        {/* 朝の通知の有効/無効切り替え */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">朝の通知</p>
            <p className="text-xs text-gray-500">毎朝指定した時間に期限の近い食材を通知します</p>
          </div>
          <div className="flex items-center space-x-2">
            {morningNotificationEnabled ? (
              <button
                onClick={handleDisableMorningNotification}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
              >
                無効にする
              </button>
            ) : (
              <button
                onClick={handleEnableMorningNotification}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
              >
                有効にする
              </button>
            )}
          </div>
        </div>

        {/* 朝の通知時間設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            通知時間
          </label>
          <input
            type="time"
            value={morningNotificationTime}
            onChange={(e) => handleMorningTimeChange(e.target.value)}
            disabled={isLoading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            毎日この時間に期限の近い食材を通知します
          </p>
        </div>

        {/* 現在の設定状態表示 */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-700">
            <span className="font-medium">現在の設定:</span>
            {morningNotificationEnabled ? (
              <span className="text-green-600 ml-1">
                有効（{morningNotificationTime}に通知）
              </span>
            ) : (
              <span className="text-gray-500 ml-1">無効</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};