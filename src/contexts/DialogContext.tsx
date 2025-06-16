import React, { createContext, useContext, useState } from 'react';

// ダイアログ表示状態を管理するContextの型定義
interface DialogContextType {
  isDialogOpen: boolean; // ダイアログが開いているかどうか
  openDialog: () => void; // ダイアログを開く関数
  closeDialog: () => void; // ダイアログを閉じる関数
}

// ダイアログコンテキストを作成
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// ダイアログコンテキストを利用するためのカスタムフック
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

// ダイアログプロバイダーコンポーネント
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ダイアログの表示状態管理
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ダイアログを開く関数
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  // ダイアログを閉じる関数
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const value = {
    isDialogOpen,
    openDialog,
    closeDialog,
  };

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};