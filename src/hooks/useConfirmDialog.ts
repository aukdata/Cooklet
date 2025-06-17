import React from 'react';

// 削除確認ダイアログ用のヘルパーフック
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }>({
    title: '確認',
    message: '',
    onConfirm: () => {}
  });

  // 削除確認ダイアログを表示する関数
  const showConfirm = (options: {
    title?: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }) => {
    setConfig({
      title: options.title || '確認',
      message: options.message,
      itemName: options.itemName,
      onConfirm: options.onConfirm,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      isDestructive: options.isDestructive
    });
    setIsOpen(true);
  };

  // ダイアログを閉じる関数
  const closeConfirm = () => {
    setIsOpen(false);
  };

  // 確認ボタンクリック時の処理
  const handleConfirm = () => {
    config.onConfirm();
    closeConfirm();
  };

  return {
    isOpen,
    showConfirm,
    closeConfirm,
    handleConfirm,
    config
  };
};