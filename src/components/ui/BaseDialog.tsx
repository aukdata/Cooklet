// 基盤ダイアログコンポーネント - 全ダイアログで共通のUI構造を提供

import { type ReactNode } from 'react';

export interface BaseDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
  /** ダイアログのタイトル */
  title: string;
  /** タイトル前の絵文字アイコン */
  icon: string;
  /** ダイアログ内のコンテンツ */
  children: ReactNode;
  /** ボタンエリアのカスタマイズ（省略時は標準のキャンセル・保存ボタン） */
  actions?: ReactNode;
  /** ダイアログのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 保存ボタンのテキスト */
  saveText?: string;
  /** キャンセルボタンのテキスト */
  cancelText?: string;
  /** 保存処理 */
  onSave?: () => void;
  /** 削除ボタン表示フラグ（編集時） */
  showDelete?: boolean;
  /** 削除処理 */
  onDelete?: () => void;
  /** 保存ボタンの無効化状態 */
  disabled?: boolean;
}

/**
 * 基盤ダイアログコンポーネント
 * 
 * 全ダイアログで共通のUI構造を提供：
 * - モーダルオーバーレイ
 * - ヘッダー（タイトル + 閉じるボタン）
 * - コンテンツエリア
 * - ボタンエリア（3段階配置）
 */
export const BaseDialog = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  actions,
  size = 'md',
  saveText = '保存',
  cancelText = 'キャンセル',
  onSave,
  showDelete = false,
  onDelete,
  disabled = false
}: BaseDialogProps) => {
  if (!isOpen) return null;

  // サイズ別のCSSクラス
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className={`bg-white rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">{icon}</span>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            aria-label="ダイアログを閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツエリア（スクロール可能） */}
        <div className="space-y-4 px-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* ボタンエリア（固定表示） */}
        <div className="p-6 pt-4 flex-shrink-0 border-t bg-white">
          {actions || (
            <div className="flex gap-3">
              {/* 左側：削除ボタン（編集時のみ表示） */}
              {showDelete && onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  type="button"
                >
                  削除
                </button>
              )}

              {/* 右側：キャンセル・保存ボタン */}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                type="button"
              >
                {cancelText}
              </button>
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={disabled}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  {saveText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};