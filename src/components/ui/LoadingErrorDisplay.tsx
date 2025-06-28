import React from 'react';

// ローディング・エラー表示コンポーネントのProps
interface LoadingErrorDisplayProps {
  loading: boolean;
  error: string | null;
  loadingMessage?: string;
  className?: string;
  children?: React.ReactNode;
  onRetry?: () => void;
}

// ローディング・エラー状態を統一的に表示するコンポーネント
export const LoadingErrorDisplay: React.FC<LoadingErrorDisplayProps> = ({
  loading,
  error,
  loadingMessage = 'データを読み込み中...',
  className = '',
  children,
  onRetry
}) => {
  // ローディング状態
  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">{loadingMessage}</span>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600 text-xl">⚠️</span>
          <p className="text-red-800 font-medium">エラーが発生しました</p>
        </div>
        <p className="text-red-700 text-sm mb-3">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            再試行
          </button>
        )}
      </div>
    );
  }

  // 正常状態: 子要素を表示
  return <>{children}</>;
};

// シンプルなローディングスピナーコンポーネント
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
      {message && <span className="text-gray-600 text-sm">{message}</span>}
    </div>
  );
};

// エラーメッセージコンポーネント
interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <span className="text-red-600 text-lg">⚠️</span>
        <div className="flex-1">
          <p className="text-red-800 text-sm">{error}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
