import React, { useState, useEffect } from 'react';
import { type CostRecord } from '../../hooks';
import { useToast } from '../../hooks/useToast.tsx';

// コスト記録ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface CostDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  onSave: (costData: CostRecord) => void; // コストデータを保存する関数
  onDelete?: () => void; // コストを削除する関数（編集時のみ）
  initialData?: CostRecord; // 初期データ（編集時）
  isEditing?: boolean; // 編集モードかどうか
}

// コスト記録ダイアログコンポーネント - CLAUDE.md仕様書 5.6.6に準拠
export const CostDialog: React.FC<CostDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing = false
}) => {
  const { showError } = useToast();

  // フォームデータの状態管理（CostRecord型に合わせて調整）
  const [formData, setFormData] = useState<CostRecord>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    is_eating_out: initialData?.is_eating_out || false
  });

  // 金額を文字列で管理するローカル状態
  const [amountString, setAmountString] = useState(
    initialData?.amount ? initialData.amount.toString() : ''
  );

  // 今日の日付を取得
  const today = new Date().toISOString().split('T')[0];


  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description?.trim()) {
      showError('内容を入力してください');
      return;
    }
    if (!amountString.trim() || isNaN(Number(amountString))) {
      showError('正しい金額を入力してください');
      return;
    }
    
    // amountを数値に変換してフォームデータに設定
    const finalData = {
      ...formData,
      amount: parseInt(amountString)
    };
    
    onSave(finalData);
    onClose();
  };

  // 削除確認ハンドラ
  const handleDelete = () => {
    if (window.confirm(`「${formData.description}」の支出記録を削除しますか？`)) {
      onDelete?.();
      onClose();
    }
  };

  // 今日の日付を設定
  const setToday = () => {
    setFormData(prev => ({ ...prev, date: today }));
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* ダイアログヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">✏️</span>
            支出を{isEditing ? '編集' : '記録'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 日付入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 日付:
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                required
              />
              <button
                type="button"
                onClick={setToday}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                今日
              </button>
            </div>
          </div>

          {/* 内容入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 内容:
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="昼食 - 牛丼"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* 金額入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💰 金額:
            </label>
            <div className="flex">
              <input
                type="number"
                value={amountString}
                onChange={(e) => setAmountString(e.target.value)}
                placeholder="500"
                min="0"
                step="1"
                className="flex-1 border border-gray-300 rounded-l px-3 py-2"
                required
              />
              <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r px-3 py-2 text-gray-600">
                円
              </span>
            </div>
          </div>

          {/* 食事タイプ選択 */}
          <div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="meal_type"
                  checked={!formData.is_eating_out}
                  onChange={() => setFormData(prev => ({ ...prev, is_eating_out: false }))}
                  className="mr-2"
                />
                <span className="text-sm flex items-center">
                  <span className="mr-1">🏠</span>
                  自炊
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="meal_type"
                  checked={formData.is_eating_out}
                  onChange={() => setFormData(prev => ({ ...prev, is_eating_out: true }))}
                  className="mr-2"
                />
                <span className="text-sm flex items-center">
                  <span className="mr-1">🍽️</span>
                  外食
                </span>
              </label>
            </div>
          </div>

          {/* メモ入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 メモ (任意):
            </label>
            <textarea
              value=""
              onChange={() => {}}
              placeholder="すき家で食べた"
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};