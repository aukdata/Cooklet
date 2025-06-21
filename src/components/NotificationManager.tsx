import React, { useEffect } from 'react';
import { useExpiryNotifications } from '../hooks/useExpiryNotifications';

// 通知管理コンポーネント - 認証済みユーザー向け期限通知機能
export const NotificationManager: React.FC = () => {
  const { checkAndNotify, loading } = useExpiryNotifications();

  // アプリ起動時の初回通知チェック
  useEffect(() => {
    if (!loading) {
      // 5秒後に初回チェックを実行（アプリ起動の完了を待つ）
      const timer = setTimeout(() => {
        checkAndNotify();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [checkAndNotify, loading]);

  // アプリがアクティブになった時の通知チェック
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading) {
        // ページがアクティブになったら通知をチェック
        setTimeout(() => {
          checkAndNotify();
        }, 1000);
      }
    };

    const handleFocus = () => {
      if (!loading) {
        // ウィンドウがフォーカスされたら通知をチェック
        setTimeout(() => {
          checkAndNotify();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAndNotify, loading]);

  // このコンポーネントは表示されない（通知管理のみ）
  return null;
};