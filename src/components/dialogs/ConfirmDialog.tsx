import React from 'react';

// 削除確認ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface ConfirmDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  title?: string; // ダイアログのタイトル
  message: string; // 確認メッセージ
  itemName?: string; // 削除対象のアイテム名
  onConfirm: () => void; // 確認ボタンクリック時の処理
  onCancel: () => void; // キャンセルボタンクリック時の処理
  confirmText?: string; // 確認ボタンのテキスト
  cancelText?: string; // キャンセルボタンのテキスト
  isDestructive?: boolean; // 破壊的操作かどうか（削除など）
}

// 削除確認ダイアログコンポーネント - CLAUDE.md仕様書 5.6.7に準拠
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = '確認',
  message,
  itemName,
  onConfirm,
  onCancel,
  confirmText = '削除',
  cancelText = 'キャンセル',
  isDestructive = true
}) => {
  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        {/* ダイアログヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">⚠️</span>
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* メッセージ */}
        <div className="mb-6 text-center">
          {itemName && (
            <div className="mb-2">
              「<span className="font-medium">{itemName}</span>」を{message}
            </div>
          )}
          {!itemName && <div className="mb-2">{message}</div>}
          
          {isDestructive && (
            <div className="text-sm text-gray-600">
              この操作は取り消せません。
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded text-white ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

