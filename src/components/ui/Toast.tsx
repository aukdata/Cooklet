import React from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  // 5秒後に自動で閉じる
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getToastClasses = (): string => {
    const baseClasses = 'flex items-center justify-between p-3 rounded-lg shadow-lg transition-all duration-300 mb-2';
    
    switch (type) {
      case 'error':
        return `${baseClasses} bg-red-50 text-red-800 border border-red-200`;
      case 'success':
        return `${baseClasses} bg-green-50 text-green-800 border border-green-200`;
      case 'info':
        return `${baseClasses} bg-blue-50 text-blue-800 border border-blue-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-800 border border-gray-200`;
    }
  };

  return (
    <div className={getToastClasses()}>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => onClose(id)}
        className={`ml-3 rounded-full p-1 hover:bg-opacity-20 ${
          type === 'error' ? 'hover:bg-red-500' :
          type === 'success' ? 'hover:bg-green-500' :
          'hover:bg-blue-500'
        }`}
        aria-label="閉じる"
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  );
};

export default Toast;