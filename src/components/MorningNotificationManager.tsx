import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/notificationService';

// 朝の通知管理コンポーネント - 認証済みユーザー向け毎朝通知機能
export const MorningNotificationManager: React.FC = () => {
  const { supabaseUser } = useAuth();

  // アプリ起動時の朝の通知設定読み込みとスケジュール
  useEffect(() => {
    if (supabaseUser?.id) {
      const initializeMorningNotifications = async () => {
        try {
          // ユーザーの朝の通知設定を取得
          const { data, error } = await supabase
            .from('users')
            .select('notification_enabled, notification_time')
            .eq('id', supabaseUser.id)
            .single();

          if (error) {
            console.warn('朝の通知設定の取得に失敗:', error);
            return;
          }

          if (data && data.notification_enabled) {
            // 朝の通知が有効な場合はスケジュール
            notificationService.scheduleMorningNotification({
              enabled: true,
              time: data.notification_time || '08:00'
            }, supabaseUser.id);

            console.log('朝の通知をスケジュールしました:', {
              time: data.notification_time || '08:00',
              userId: supabaseUser.id
            });
          }
        } catch (error) {
          console.error('朝の通知初期化エラー:', error);
        }
      };

      initializeMorningNotifications();
    }

    // クリーンアップ: コンポーネントアンマウント時に通知をクリア
    return () => {
      notificationService.clearMorningNotifications();
    };
  }, [supabaseUser?.id]);

  // このコンポーネントは表示されない（通知管理のみ）
  return null;
};