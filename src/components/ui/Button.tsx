import React from 'react';

// 共通ボタンコンポーネント - issue #16対応

export interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'edit' | 'delete' | 'add';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  // バリアント別のスタイル定義
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    edit: 'bg-gray-100 text-gray-700 hover:bg-gray-200', // 在庫画面の編集ボタンと同じスタイル
    delete: 'bg-red-500 text-white hover:bg-red-600',
    add: 'bg-indigo-600 text-white hover:bg-indigo-700'
  };

  // サイズ別のスタイル定義
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // 基本スタイル
  const baseStyles = 'rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';
  
  // 無効化スタイル
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // 最終スタイルを組み合わせ
  const finalClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabledStyles,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={finalClassName}
    >
      {children}
    </button>
  );
};

// 専用ボタンコンポーネント
export const EditButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ 
  onClick, 
  disabled = false 
}) => (
  <Button 
    onClick={onClick} 
    variant="edit" 
    size="sm" 
    disabled={disabled}
  >
    編集
  </Button>
);

export const AddButton: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ 
  onClick, 
  children, 
  disabled = false 
}) => (
  <Button 
    onClick={onClick} 
    variant="add" 
    size="md" 
    disabled={disabled}
  >
    {children}
  </Button>
);

export const DeleteButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ 
  onClick, 
  disabled = false 
}) => (
  <Button 
    onClick={onClick} 
    variant="delete" 
    size="md" 
    disabled={disabled}
  >
    削除
  </Button>
);