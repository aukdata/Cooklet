import { useState, useEffect } from 'react';

// ビルド情報の型定義
export interface BuildInfo {
  version: string;
  buildDate: string;
  buildTimestamp: number;
}

// ビルド情報取得フック
export const useBuildInfo = () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBuildInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // public/build-info.jsonを取得
        const response = await fetch('/build-info.json');
        
        if (!response.ok) {
          throw new Error('ビルド情報の取得に失敗しました');
        }

        const data: BuildInfo = await response.json();
        setBuildInfo(data);
      } catch (err) {
        console.error('ビルド情報の読み込みエラー:', err);
        setError(err instanceof Error ? err.message : 'ビルド情報の取得に失敗しました');
        
        // フォールバック情報を設定
        setBuildInfo({
          version: '1.0.0',
          buildDate: new Date().toISOString(),
          buildTimestamp: Date.now()
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBuildInfo();
  }, []);

  // 日時フォーマット関数（JST表示）
  const formatBuildDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo'
      });
    } catch {
      return '不明';
    }
  };

  return {
    buildInfo,
    isLoading,
    error,
    formatBuildDate: buildInfo ? formatBuildDate(buildInfo.buildDate) : '不明'
  };
};