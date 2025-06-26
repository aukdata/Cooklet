import React from 'react';
import { type MealPlan } from '../../types';

// 「作った！」ダイアログコンポーネントのProps型定義
interface CookedDialogProps {
  // ダイアログの表示状態
  isOpen: boolean;
  // 処理中の献立データ
  processingMeal: MealPlan | null;
  // 完食処理ハンドラー
  onCompleted: () => void;
  // 作り置き処理ハンドラー
  onStoreMade: () => void;
  // ダイアログを閉じるハンドラー
  onClose: () => void;
}

/**
 * 「作った！」ダイアログコンポーネント
 * 献立を作った後の状態選択（完食・作り置き）を提供
 */
export const CookedDialog: React.FC<CookedDialogProps> = ({
  isOpen,
  processingMeal,
  onCompleted,
  onStoreMade,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🍽️</span>
            作った！
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            「{processingMeal?.memo}」を作りました！<br/>
            どうしますか？
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onCompleted}
            className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">✅</span>
            完食しました
          </button>
          
          <button
            onClick={onStoreMade}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">🥡</span>
            作り置きにします
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};