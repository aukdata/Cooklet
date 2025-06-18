import React from 'react';

// タブナビゲーションコンポーネントのProps型定義
interface TabNavigationProps {
  activeTab: string; // 現在アクティブなタブID
  onTabChange: (tab: string) => void; // タブ変更時のコールバック関数
}

// 下部固定のタブナビゲーションコンポーネント
export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  // タブの定義（ID、ラベル、アイコン） - CLAUDE.md仕様書に準拠
  const tabs = [
    { id: 'summary', label: 'サマリー', icon: '📊' },
    { id: 'recipes', label: 'レシピ', icon: '🍳' },
    { id: 'meal-plans', label: '献立', icon: '📅' },
    { id: 'shopping', label: '買い物', icon: '🛒' },
    { id: 'stock', label: '在庫', icon: '📦' },
    { id: 'cost', label: 'コスト', icon: '💰' },
  ];

  return (
    // 下部固定のナビゲーションバー（iPhone PWA対応で下部セーフエリア追加）
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[90] pb-safe">
      <div className="grid grid-cols-6 gap-1">
        {/* 各タブボタンをレンダリング */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-1 ${
              // アクティブタブのスタイリング
              activeTab === tab.id
                ? 'text-indigo-600' // アクティブ時：インディゴ色
                : 'text-gray-500 hover:text-gray-700' // 非アクティブ時：グレー＋ホバー効果
            }`}
          >
            {/* アイコン */}
            <span className="text-2xl mb-1">{tab.icon}</span>
            {/* ラベル */}
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      {/* iPhone PWA用の下部セーフエリア */}
      <div className="h-safe-bottom"></div>
    </nav>
  );
};