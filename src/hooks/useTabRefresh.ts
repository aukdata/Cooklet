import { useEffect, useRef, useCallback } from 'react';

// タブ切り替え時のデータ更新チェック機能
export const useTabRefresh = (refreshFunction: () => void | Promise<void>, intervalMinutes: number = 5) => {
  const lastUpdateRef = useRef<number>(Date.now());
  const refreshFunctionRef = useRef(refreshFunction);

  // refreshFunctionの最新版を保持
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  // データ更新の実行
  const performRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    const intervalMs = intervalMinutes * 60 * 1000;

    // 指定時間経過していれば更新
    if (timeSinceLastUpdate > intervalMs) {
      console.log(`タブアクティブ時の更新チェック: ${timeSinceLastUpdate}ms経過、データを更新中...`);
      try {
        await refreshFunctionRef.current();
        lastUpdateRef.current = now;
      } catch (error) {
        console.warn('タブアクティブ時のデータ更新に失敗:', error);
      }
    } else {
      console.log(`タブアクティブ時の更新チェック: ${timeSinceLastUpdate}ms経過、更新不要`);
    }
  }, [intervalMinutes]);

  // Page Visibility API でタブの表示状態を監視
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // タブがアクティブになった時
        performRefresh();
      }
    };

    // フォーカス時にもチェック（ブラウザによっては visibilitychange が発火しない場合の対策）
    const handleFocus = () => {
      performRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [performRefresh]);

  // 手動で更新時刻をリセット（データ変更操作後などに使用）
  const markAsUpdated = useCallback(() => {
    lastUpdateRef.current = Date.now();
  }, []);

  return {
    markAsUpdated,
    forceRefresh: performRefresh
  };
};