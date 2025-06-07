import React, { useState } from 'react';
import { TabNavigation } from './TabNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { MealPlans } from '../../pages/meal-plans/MealPlans';
import { Recipes } from '../../pages/recipes/Recipes';
import { Inventory } from '../../pages/inventory/Inventory';
import { Shopping } from '../../pages/shopping/Shopping';

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('meal-plans');
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'meal-plans':
        return <MealPlans />
      case 'recipes':
        return <Recipes />
      case 'inventory':
        return <Inventory />
      case 'shopping':
        return <Shopping />
      default:
        return <MealPlans />
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Cooklet</h1>
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

      <main className="pb-16">
        {renderContent()}
      </main>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};