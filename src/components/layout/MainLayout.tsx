import React, { useState } from 'react';
import { TabNavigation } from './TabNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { Dashboard } from '../../pages/dashboard/Dashboard';
import { MealPlans } from '../../pages/meal-plans/MealPlans';
import { Recipes } from '../../pages/recipes/Recipes';
import { Shopping } from '../../pages/shopping/Shopping';
import { Cost } from '../../pages/cost/Cost';

// アプリケーションのメインレイアウトコンポーネント
export const MainLayout: React.FC = () => {
  // アクティブタブの状態管理（デフォルトはダッシュボード）
  const [activeTab, setActiveTab] = useState('dashboard');
  // 認証情報とサインアウト関数を取得
  const { user, signOut } = useAuth();
  
  // タブ名のマッピング
  const getTabName = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'ダッシュボード';
      case 'meal-plans':
        return '献立';
      case 'shopping':
        return '買い物';
      case 'recipes':
        return 'レシピ';
      case 'cost':
        return 'コスト';
      default:
        return 'ダッシュボード';
    }
  };

  // サインアウト処理
  const handleSignOut = async () => {
    await signOut();
  };

  // アクティブタブに応じてコンテンツをレンダリングする関数
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard /> // ダッシュボードページ
      case 'meal-plans':
        return <MealPlans /> // カレンダー画面（献立計画表示）
      case 'shopping':
        return <Shopping /> // 買い物リストページ
      case 'recipes':
        return <Recipes /> // レシピ管理ページ
      case 'cost':
        return <Cost /> // コスト管理ページ
      default:
        return <Dashboard /> // デフォルトはダッシュボードページ
    }
  };

  return (
    // メインコンテナ（最小高さ100vh）
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーセクション */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          {/* アプリタイトル */}
          <h1 className="text-xl font-bold text-gray-900">Cooklet - {getTabName()}</h1>
          {/* ユーザー情報とログアウトボタン */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア（下部タブナビ分のパディングあり） */}
      <main className="pb-16">
        {renderContent()}
      </main>

      {/* 下部固定タブナビゲーション */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};