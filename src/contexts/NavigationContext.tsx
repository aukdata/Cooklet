import React, { createContext, useContext, useState } from 'react';
import { type ReactNode } from 'react';

// ナビゲーションコンテキストの型定義
interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigate: (path: string) => void;
}

// コンテキストの作成
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// プロバイダーコンポーネントのProps型
interface NavigationProviderProps {
  children: ReactNode;
}

// ナビゲーションプロバイダーコンポーネント
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('summary');

  // パス形式でのナビゲーション関数
  const navigate = (path: string) => {
    // パスを正規化してタブIDに変換
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    setActiveTab(normalizedPath);
  };

  const value = {
    activeTab,
    setActiveTab,
    navigate,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// カスタムフック
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};