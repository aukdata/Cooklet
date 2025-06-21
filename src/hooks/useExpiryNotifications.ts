import { useState, useEffect, useCallback } from 'react';
import { useStockItems } from './useStockItems';
import { useNotificationSettings } from './useNotificationSettings';
import { useAuth } from '../contexts/AuthContext';

// 期限近い食品の情報
export interface ExpiryItem {
  id: string;
  name: string;
  best_before: string;
  days_until_expiry: number;
  storage_location?: string;
}

// 期限通知の結果
export interface ExpiryNotificationResult {
  items: ExpiryItem[];
  count: number;
  shouldNotify: boolean;
}

// 賞味期限チェックと通知管理のカスタムフック
export const useExpiryNotifications = () => {
  const { user } = useAuth();
  const { stockItems, loading: stockLoading } = useStockItems();
  const { settings, loading: settingsLoading } = useNotificationSettings();
  const [lastNotificationDate, setLastNotificationDate] = useState<string | null>(null);

  // 期限が近い食品をチェック
  const checkExpiryItems = useCallback((): ExpiryNotificationResult => {
    if (!stockItems.length || !settings.notification_enabled) {
      return { items: [], count: 0, shouldNotify: false };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + settings.expiry_notification_days);

    const expiryItems: ExpiryItem[] = stockItems
      .filter(item => item.best_before && item.id) // 賞味期限とIDがある食品のみ
      .map(item => {
        const expiryDate = new Date(item.best_before!);
        expiryDate.setHours(0, 0, 0, 0);
        
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        return {
          id: item.id!,
          name: item.name,
          best_before: item.best_before!,
          days_until_expiry: daysDiff,
          storage_location: item.storage_location,
        };
      })
      .filter(item => 
        item.days_until_expiry >= 0 && // 今日以降
        item.days_until_expiry <= settings.expiry_notification_days // 設定日数以内
      )
      .sort((a, b) => a.days_until_expiry - b.days_until_expiry); // 期限が近い順

    // 今日通知済みかチェック
    const todayStr = today.toISOString().split('T')[0];
    const shouldNotify = expiryItems.length > 0 && 
                        settings.notification_enabled && 
                        lastNotificationDate !== todayStr;

    return {
      items: expiryItems,
      count: expiryItems.length,
      shouldNotify,
    };
  }, [stockItems, settings, lastNotificationDate]);

  // Web Push通知を送信
  const sendNotification = useCallback(async (result: ExpiryNotificationResult) => {
    if (!result.shouldNotify || !('Notification' in window)) {
      return false;
    }

    try {
      // 通知権限を確認
      if (Notification.permission !== 'granted') {
        console.warn('通知権限がありません');
        return false;
      }

      const { count, items } = result;
      
      // 通知メッセージの作成
      let title = '🍳 Cooklet - 賞味期限のお知らせ';
      let body = '';
      
      if (count === 1) {
        const item = items[0];
        const daysText = item.days_until_expiry === 0 ? '今日' : `${item.days_until_expiry}日後`;
        body = `${item.name}の賞味期限が${daysText}です`;
      } else {
        body = `${count}点の食品の賞味期限が近づいています`;
      }

      // 通知の送信
      const notification = new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'expiry-notification',
        requireInteraction: false,
        silent: false,
      });

      // 通知クリック時の処理
      notification.onclick = () => {
        window.focus();
        notification.close();
        // 在庫画面に遷移（実装は後で追加）
      };

      // 通知日時を記録
      const today = new Date().toISOString().split('T')[0];
      setLastNotificationDate(today);
      
      // ローカルストレージに保存
      if (user?.id) {
        localStorage.setItem(`lastNotificationDate_${user.id}`, today);
      }

      console.log('期限通知を送信しました:', { count, items: items.map(i => i.name) });
      return true;

    } catch (error) {
      console.error('通知の送信に失敗しました:', error);
      return false;
    }
  }, [user?.id]);

  // 期限チェックと通知の実行
  const checkAndNotify = useCallback(async (): Promise<ExpiryNotificationResult> => {
    const result = checkExpiryItems();
    
    if (result.shouldNotify) {
      await sendNotification(result);
    }

    return result;
  }, [checkExpiryItems, sendNotification]);

  // 最後の通知日時をローカルストレージから復元
  useEffect(() => {
    if (user?.id) {
      const lastDate = localStorage.getItem(`lastNotificationDate_${user.id}`);
      setLastNotificationDate(lastDate);
    }
  }, [user?.id]);

  // 定期的な期限チェック（1時間ごと）
  useEffect(() => {
    if (stockLoading || settingsLoading || !settings.notification_enabled) {
      return;
    }

    // 初回チェック
    checkAndNotify();

    // 1時間ごとのチェック
    const interval = setInterval(() => {
      checkAndNotify();
    }, 60 * 60 * 1000); // 1時間

    return () => clearInterval(interval);
  }, [checkAndNotify, stockLoading, settingsLoading, settings.notification_enabled]);

  return {
    checkExpiryItems,
    sendNotification,
    checkAndNotify,
    loading: stockLoading || settingsLoading,
  };
};