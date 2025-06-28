import React from 'react';
import { useBuildInfo } from '../../hooks/useBuildInfo';

// アプリ情報セクションコンポーネント
export const AppInfoSection: React.FC = () => {
  const { version, formatBuildDate } = useBuildInfo();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>📱</span>
        アプリ情報
      </h2>
      
      <div className="space-y-3">
        {/* アプリ名 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">アプリ名</span>
          <span className="font-medium text-gray-900">Cooklet</span>
        </div>
        
        {/* バージョン */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">バージョン</span>
          <span className="font-medium text-gray-900">{version || 'v1.0.0'}</span>
        </div>
        
        {/* ビルド日時 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">ビルド日時</span>
          <span className="font-medium text-gray-900">{formatBuildDate || '不明'}</span>
        </div>
      </div>
    </div>
  );
};
