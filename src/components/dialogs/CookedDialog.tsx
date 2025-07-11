import React from 'react';
import { type MealPlan } from '../../types';

/**
 * CookedDialogのプロパティ型定義
 */
interface CookedDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** 処理対象の献立データ */
  meal: MealPlan | null;
  /** 完食処理のコールバック */
  onCompleted: () => void;
  /** 作り置き処理のコールバック */
  onStoreMade: () => void;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
}

/**
 * 完食・作り置き選択ダイアログコンポーネント
 * 
 * 「作った！」ボタンクリック後に表示される選択肢ダイアログ：
 * - 完食しました（完食状態に更新）
 * - 作り置きにします（作り置き状態に更新 + 在庫追加）
 * - キャンセル（ダイアログを閉じる）
 */
export const CookedDialog: React.FC<CookedDialogProps> = ({
  isOpen,
  meal,
  onCompleted,
  onStoreMade,
  onClose
}) => {
  // ダイアログが非表示の場合は何も表示しない
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        {/* ヘッダー部分 */}
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

        {/* メッセージ部分 */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            「{meal?.memo}」を作りました！<br/>
            どうしますか？
          </p>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          {/* 完食ボタン */}
          <button
            onClick={onCompleted}
            className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">✅</span>
            完食しました
          </button>
          
          {/* 作り置きボタン */}
          <button
            onClick={onStoreMade}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">🥡</span>
            作り置きにします
          </button>
          
          {/* キャンセルボタン */}
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