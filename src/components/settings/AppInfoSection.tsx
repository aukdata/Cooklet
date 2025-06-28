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
        
        {/* 甲武線 */}
        <hr className="border-gray-200" />
        
        {/* アプリ紹介 */}
        <div>
          <div className="text-gray-600 mb-2">アプリ紹介</div>
          <div className="text-sm text-gray-700 leading-relaxed">
            Cookletは一人暮らしユーザーのための献立・在庫・買い物・コストを
            一元管理できるスマートな献立管理Webアプリです。
            レシピはURL管理とし、軽量かつシンプルなPWAとして設計されています。
          </div>
        </div>
        
        {/* サポート情報 */}
        <div>
          <div className="text-gray-600 mb-2">サポート</div>
          <div className="text-sm text-gray-700">
            問題が発生した場合は、ブラウザのキャッシュをクリアするか、
            ページをリロードしてください。
          </div>
        </div>
        
        {/* オープンソース情報 */}
        <div>
          <div className="text-gray-600 mb-2">技術スタック</div>
          <div className="text-sm text-gray-700">
            React + TypeScript + Supabase + Netlify
          </div>
        </div>
      </div>
    </div>
  );
};
