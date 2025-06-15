import React, { useState } from 'react';
import { type StockItem } from '../../hooks';

// 在庫編集ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface StockDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  onSave: (stockData: StockItem) => void; // 在庫データを保存する関数
  onDelete?: () => void; // 在庫を削除する関数（編集時のみ）
  initialData?: StockItem; // 初期データ（編集時）
  isEditing?: boolean; // 編集モードかどうか
}

// 単位の選択肢
const unitOptions = [
  '個', '本', 'パック', 'g', 'kg', 'ml', 'l', '袋', '缶', '適量'
];

// 保存場所の選択肢
const storageOptions = ['冷蔵庫', '冷凍庫', '常温'];

// 在庫編集ダイアログコンポーネント - CLAUDE.md仕様書 5.6.5に準拠
export const StockDialog: React.FC<StockDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing = false
}) => {
  // フォームデータの状態管理（StockItem型に合わせて調整）
  // quantityは"数量 + 単位"の形式で管理（例: "2本"、"200g"）
  const [formData, setFormData] = useState<StockItem>({
    name: initialData?.name || '',
    quantity: initialData?.quantity || '',
    best_before: initialData?.best_before || '',
    storage_location: initialData?.storage_location || '冷蔵庫',
    is_homemade: initialData?.is_homemade || false
  });

  // quantityフィールドから数量と単位を分離
  const [quantityValue, setQuantityValue] = useState(() => {
    if (!formData.quantity) return '';
    // 数字部分を抽出
    const match = formData.quantity.match(/^(\d+(?:\.\d+)?)/);
    return match ? match[1] : '';
  });

  const [selectedUnit, setSelectedUnit] = useState(() => {
    if (!formData.quantity) return '個';
    // 単位部分を抽出
    const match = formData.quantity.match(/^(\d+(?:\.\d+)?)(.*)$/);
    return match && match[2] ? match[2] : '個';
  });

  // 今日の日付を取得
  const today = new Date().toISOString().split('T')[0];
  const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('食材名を入力してください');
      return;
    }
    if (!formData.quantity.trim()) {
      alert('数量を入力してください');
      return;
    }
    onSave(formData);
    onClose();
  };

  // 削除確認ハンドラ
  const handleDelete = () => {
    if (window.confirm(`「${formData.name}」を在庫から削除しますか？`)) {
      onDelete?.();
      onClose();
    }
  };

  // 日付クイック設定ハンドラ
  const setQuickDate = (dateType: 'today' | 'week') => {
    const date = dateType === 'today' ? today : oneWeekLater;
    setFormData(prev => ({ ...prev, best_before: date }));
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* ダイアログヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">✏️</span>
            在庫を{isEditing ? '編集' : '追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 食材名入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 食材名:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="にんじん"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* 数量・単位入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 数量:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quantityValue}
                onChange={(e) => {
                  setQuantityValue(e.target.value);
                  // quantityフィールドを更新（数量 + 単位の形式）
                  setFormData(prev => ({ 
                    ...prev, 
                    quantity: e.target.value + selectedUnit 
                  }));
                }}
                placeholder="2"
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                required
              />
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  // quantityフィールドを更新（数量 + 単位の形式）
                  setFormData(prev => ({ 
                    ...prev, 
                    quantity: quantityValue + e.target.value 
                  }));
                }}
                className="w-24 border border-gray-300 rounded px-2 py-2"
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 賞味期限入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 賞味期限:
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.best_before}
                onChange={(e) => setFormData(prev => ({ ...prev, best_before: e.target.value }))}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={() => setQuickDate('today')}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                今日
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('week')}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                1週間
              </button>
            </div>
          </div>

          {/* 保存場所選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏠 保存場所:
            </label>
            <div className="flex gap-4">
              {storageOptions.map((location) => (
                <label key={location} className="flex items-center">
                  <input
                    type="radio"
                    name="storage_location"
                    value={location}
                    checked={formData.storage_location === location}
                    onChange={(e) => setFormData(prev => ({ ...prev, storage_location: e.target.value }))}
                    className="mr-2"
                  />
                  <span className="text-sm">{location}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 作り置きチェック */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_homemade}
                onChange={(e) => setFormData(prev => ({ ...prev, is_homemade: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-1">🍱</span>
                作り置き: はい
              </span>
            </label>
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