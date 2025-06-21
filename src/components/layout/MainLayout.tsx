import React from 'react';
import { TabNavigation } from './TabNavigation';
import { useDialog } from '../../contexts/DialogContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Dashboard } from '../../pages/summary/Summary';
import { MealPlans } from '../../pages/meal-plans/MealPlans';
import { Recipes } from '../../pages/recipes/Recipes';
import { Shopping } from '../../pages/shopping/Shopping';
import { Stock } from '../../pages/stock/Stock';
import { Cost } from '../../pages/cost/Cost';
import { Settings } from '../../pages/settings/Settings';
import { IngredientManagement } from '../../pages/settings/IngredientManagement';
import { ErrorBoundary } from '../ErrorBoundary';

// アプリケーションのメインレイアウトコンポーネント
export const MainLayout: React.FC = () => {
  // ナビゲーション状態を取得
  const { activeTab, setActiveTab } = useNavigation();
  // ダイアログの表示状態を取得
  const { isDialogOpen } = useDialog();

  // アクティブタブに応じてコンテンツをレンダリングする関数
  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <ErrorBoundary fallback={
            <div className="p-4 text-center">
              <div className="text-red-600">サマリーの読み込みに失敗しました</div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded"
              >
                再読み込み
              </button>
            </div>
          }>
            <Dashboard />
          </ErrorBoundary>
        ) // サマリーページ
      case 'recipes':
        return <Recipes /> // レシピ管理ページ
      case 'meal-plans':
        return <MealPlans /> // カレンダー画面（献立計画表示）
      case 'shopping':
        return <Shopping /> // 買い物リストページ
      case 'stock':
        return <Stock /> // 在庫管理ページ
      case 'cost':
        return <Cost /> // コスト管理ページ
      case 'settings':
        return <Settings /> // 設定ページ
      case 'settings/ingredients':
        return <IngredientManagement /> // 材料マスタ管理ページ
      default:
        return <Dashboard /> // デフォルトはサマリーページ
    }
  };

  return (
    // メインコンテナ（最小高さ100vh）
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーセクション */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          {/* アプリタイトル */}
          <h1 className="text-xl font-bold text-gray-900">🍳Cooklet</h1>
          {/* 設定ボタン（issue #8: ユーザ設定画面表示） */}
          <div className="flex items-center">
            <button 
              onClick={() => setActiveTab('settings')}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア（下部タブナビ分のパディングあり + PWAセーフエリア対応） */}
      <main className="pb-16" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        {renderContent()}
      </main>

      {/* 下部固定タブナビゲーション（ダイアログ表示時は非表示） */}
      {!isDialogOpen && (
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};