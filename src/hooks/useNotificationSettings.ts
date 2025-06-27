import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// 通知設定の型定義
export interface NotificationSettings {
  notification_enabled: boolean;
  expiry_notification_days: number;
}

// 通知設定管理のカスタムフック
export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    notification_enabled: false,
    expiry_notification_days: 3,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 通知設定の取得
  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select('notification_enabled, expiry_notification_days')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setSettings({
          notification_enabled: data.notification_enabled ?? false,
          expiry_notification_days: data.expiry_notification_days ?? 3,
        });
      }
    } catch (err) {
      console.error('通知設定の取得に失敗:', err);
      setError('通知設定の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 通知設定の更新
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (!user?.id) return;

    console.log('⚙️ updateSettings 開始:', newSettings);
    try {
      setError(null);

      const { error } = await supabase
        .from('users')
        .update({
          notification_enabled: newSettings.notification_enabled ?? settings.notification_enabled,
          expiry_notification_days: newSettings.expiry_notification_days ?? settings.expiry_notification_days,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // ローカル状態を更新
      setSettings(prev => ({
        ...prev,
        ...newSettings,
      }));

      console.log('⚙️ updateSettings 完了、通知設定を更新しました:', newSettings);
    } catch (err) {
      console.error('通知設定の更新に失敗:', err);
      setError('通知設定の更新に失敗しました');
      throw err;
    }
  }, [user?.id, settings]);

  // 通知権限の要求
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知機能をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // 通知機能の有効化（権限要求も含む）
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
      await updateSettings({ notification_enabled: true });
      return true;
    } else {
      console.warn('通知権限が拒否されました');
      return false;
    }
  }, [updateSettings, requestNotificationPermission]);

  // 通知機能の無効化
  const disableNotifications = useCallback(async () => {
    console.log('🔕 disableNotifications 開始');
    await updateSettings({ notification_enabled: false });
    console.log('🔕 disableNotifications 完了');
  }, [updateSettings]);

  // 期限通知日数の変更
  const updateExpiryDays = useCallback(async (days: number) => {
    // バリデーション: 1-30日の範囲
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      throw new Error('期限通知日数は1-30日の整数で設定してください');
    }
    await updateSettings({ expiry_notification_days: days });
  }, [updateSettings]);

  // 有効な期限通知日数の範囲を取得
  const getValidExpiryDaysRange = useCallback(() => {
    return { min: 1, max: 30 };
  }, []);

  // 初期読み込み
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    enableNotifications,
    disableNotifications,
    updateExpiryDays,
    requestNotificationPermission,
    getValidExpiryDaysRange,
    refetch: fetchSettings,
  };
};