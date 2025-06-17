import { useState, useCallback, useRef } from 'react';

// キャッシュエントリの型定義
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live (ミリ秒)
}

// キャッシュオプションの型定義
interface CacheOptions {
  ttl?: number; // デフォルト5分
  persistToStorage?: boolean; // LocalStorageに永続化するか
  storageKey?: string; // LocalStorageのキー
}

// キャッシュフックの戻り値型定義
interface CacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  setCache: (data: T) => void;
  clearCache: () => void;
  invalidateCache: () => void;
  refreshData: () => Promise<void>;
}

/**
 * 汎用キャッシュフック
 * タブ切り替え時のパフォーマンス向上とPWA対応準備
 * 
 * @param key キャッシュキー
 * @param fetchFunction データ取得関数
 * @param options キャッシュオプション
 */
export const useCache = <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  options: CacheOptions = {}
): CacheReturn<T> => {
  const {
    ttl = 5 * 60 * 1000, // デフォルト5分
    persistToStorage = false,
    storageKey = `cache_${key}`
  } = options;

  // キャッシュストレージ（メモリベース）
  const cacheStore = useRef<Map<string, CacheEntry<any>>>(new Map());
  
  // 状態管理
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // キャッシュの有効性チェック
  const isCacheValid = useCallback((entry: CacheEntry<T>): boolean => {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }, []);

  // LocalStorageからキャッシュを読み込み
  const loadFromStorage = useCallback((): T | null => {
    if (!persistToStorage) return null;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (isCacheValid(entry)) {
        return entry.data;
      } else {
        // 期限切れのキャッシュを削除
        localStorage.removeItem(storageKey);
        return null;
      }
    } catch (error) {
      console.warn('キャッシュの読み込みに失敗しました:', error);
      return null;
    }
  }, [storageKey, persistToStorage, isCacheValid]);

  // LocalStorageにキャッシュを保存
  const saveToStorage = useCallback((cacheData: T): void => {
    if (!persistToStorage) return;
    
    try {
      const entry: CacheEntry<T> = {
        data: cacheData,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('キャッシュの保存に失敗しました:', error);
    }
  }, [storageKey, persistToStorage, ttl]);

  // キャッシュからデータを取得
  const getFromCache = useCallback((): T | null => {
    // まずメモリキャッシュを確認
    const memoryEntry = cacheStore.current.get(key);
    if (memoryEntry && isCacheValid(memoryEntry)) {
      return memoryEntry.data;
    }

    // メモリキャッシュにない場合はLocalStorageを確認
    const storageData = loadFromStorage();
    if (storageData) {
      // LocalStorageから取得したデータをメモリキャッシュにも保存
      const entry: CacheEntry<T> = {
        data: storageData,
        timestamp: Date.now(),
        ttl
      };
      cacheStore.current.set(key, entry);
      return storageData;
    }

    return null;
  }, [key, isCacheValid, loadFromStorage, ttl]);

  // キャッシュにデータを設定
  const setCache = useCallback((newData: T): void => {
    const entry: CacheEntry<T> = {
      data: newData,
      timestamp: Date.now(),
      ttl
    };
    
    // メモリキャッシュに保存
    cacheStore.current.set(key, entry);
    
    // LocalStorageに保存（オプション）
    saveToStorage(newData);
    
    // 状態を更新
    setData(newData);
    setError(null);
  }, [key, ttl, saveToStorage]);

  // キャッシュをクリア
  const clearCache = useCallback((): void => {
    cacheStore.current.delete(key);
    
    if (persistToStorage) {
      localStorage.removeItem(storageKey);
    }
    
    setData(null);
    setError(null);
  }, [key, persistToStorage, storageKey]);

  // キャッシュを無効化（次回取得時に強制更新）
  const invalidateCache = useCallback((): void => {
    clearCache();
  }, [clearCache]);

  // データを更新（キャッシュ経由）
  const refreshData = useCallback(async (): Promise<void> => {
    // まずキャッシュから取得を試みる
    const cachedData = getFromCache();
    if (cachedData) {
      setData(cachedData);
      setError(null);
      return;
    }

    // キャッシュにない場合は新規取得
    setIsLoading(true);
    setError(null);
    
    try {
      const newData = await fetchFunction();
      setCache(newData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました';
      setError(errorMessage);
      console.error('データ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getFromCache, fetchFunction, setCache]);

  // 初回実行：キャッシュから取得またはAPI取得
  const initialize = useCallback((): void => {
    const cachedData = getFromCache();
    if (cachedData) {
      setData(cachedData);
      setError(null);
    } else {
      // キャッシュにない場合は非同期で取得
      void refreshData();
    }
  }, [getFromCache, refreshData]);

  // 初期化（一度だけ実行）
  const initializeRef = useRef(false);
  if (!initializeRef.current) {
    initializeRef.current = true;
    initialize();
  }

  return {
    data,
    isLoading,
    error,
    setCache,
    clearCache,
    invalidateCache,
    refreshData
  };
};

/**
 * テスト環境でのモックデータ対応
 * 環境変数 VITE_USE_MOCK_DATA=true の場合、モックデータを返す
 */
export const createMockCacheHook = <T>(mockData: T) => {
  return (
    _key: string,
    _fetchFunction: () => Promise<T>,
    _options: CacheOptions = {}
  ): CacheReturn<T> => {
    const [data] = useState<T>(mockData);
    
    return {
      data,
      isLoading: false,
      error: null,
      setCache: () => {},
      clearCache: () => {},
      invalidateCache: () => {},
      refreshData: async () => {}
    };
  };
};

/**
 * キャッシュの設定管理
 */
export const CacheConfig = {
  // 標準TTL設定
  TTL: {
    SHORT: 2 * 60 * 1000,   // 2分
    MEDIUM: 5 * 60 * 1000,  // 5分
    LONG: 30 * 60 * 1000,   // 30分
  },
  
  // テスト・デバッグ用設定
  IS_MOCK_MODE: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  
  // PWA用設定
  PERSIST_TO_STORAGE: true, // 将来的にServiceWorkerと連携
} as const;