import React, { useState, useEffect } from 'react';
import type { StockItem } from '../../types/index';
import { QuantityInput } from '../common/QuantityInput';
import { useToast } from '../../hooks/useToast.tsx';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from './ConfirmDialog';

// フォーム用の在庫データ型（UI表示用のcamelCase）
interface StockFormData {
  name: string;
  quantity: string;
  bestBefore?: string;
  storageLocation?: string;
  isHomemade: boolean;
}

// 在庫編集ダイアログのプロパティ - CLAUDE.md仕様書に準拠
interface StockDialogProps {
  isOpen: boolean; // ダイアログの表示状態
  onClose: () => void; // ダイアログを閉じる関数
  onSave: (stockData: StockItem) => void; // 在庫データを保存する関数
  onDelete?: () => void; // 在庫を削除する関数（編集時のみ）
  initialData?: StockItem; // 初期データ（編集時）
  isEditing?: boolean; // 編集モードかどうか
}


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
  const { showError } = useToast();

  // フォームデータの状態管理（UI用のcamelCase形式）
  const [formData, setFormData] = useState<StockFormData>({
    name: '',
    quantity: '',
    bestBefore: '',
    storageLocation: '冷蔵庫',
    isHomemade: false
  });

  // 削除確認ダイアログの状態管理
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // 今日の日付を取得
  const today = new Date().toISOString().split('T')[0];
  const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];


  // initialDataが変更されたときにフォームデータを更新（snake_case → camelCase変換）
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        quantity: initialData.quantity || '',
        bestBefore: initialData.best_before || '',
        storageLocation: initialData.storage_location || '冷蔵庫',
        isHomemade: initialData.is_homemade || false
      });
    } else {
      // 新規作成時はフォームをリセット
      setFormData({
        name: '',
        quantity: '',
        bestBefore: '',
        storageLocation: '冷蔵庫',
        isHomemade: false
      });
    }
  }, [initialData]);

  // フォーム送信ハンドラ（camelCase → snake_case変換）
  const handleSave = () => {
    if (!formData.name?.trim()) {
      showError('食材名を入力してください');
      return;
    }
    if (!formData.quantity?.trim()) {
      showError('数量を入力してください');
      return;
    }
    
    // フォームデータをStockItem形式に変換
    const stockData: StockItem = {
      id: initialData?.id || '',
      user_id: initialData?.user_id || '',
      name: formData.name,
      quantity: formData.quantity,
      best_before: formData.bestBefore || undefined,
      storage_location: formData.storageLocation || undefined,
      is_homemade: formData.isHomemade,
      created_at: initialData?.created_at || '',
      updated_at: initialData?.updated_at || ''
    };
    
    onSave(stockData);
  };

  // 削除確認ハンドラ
  const handleDelete = () => {
    setIsConfirmDialogOpen(true);
  };

  // 削除実行ハンドラ
  const handleConfirmDelete = () => {
    onDelete?.();
    onClose();
    setIsConfirmDialogOpen(false);
  };

  // 削除キャンセルハンドラ
  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  // 日付クイック設定ハンドラ
  const setQuickDate = (dateType: 'today' | 'week') => {
    const date = dateType === 'today' ? today : oneWeekLater;
    setFormData(prev => ({ ...prev, bestBefore: date }));
  };

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <>
      <BaseDialog
        isOpen={isOpen}
        onClose={onClose}
        title={`在庫を${isEditing ? '編集' : '追加'}`}
        icon="✏️"
        onSave={handleSave}
        showDelete={!!isEditing && !!onDelete}
        onDelete={handleDelete}
        size="md"
      >
        <div className="space-y-4">
          {/* 食材名入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 食材名:
            </label>
            <input
              type="text"
              value={formData.name || ''}
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
            <QuantityInput
              value={formData.quantity || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, quantity: value }))}
              placeholder="数量"
              className="w-full"
            />
          </div>


          {/* 賞味期限入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 賞味期限:
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.bestBefore || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bestBefore: e.target.value || undefined }))}
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
                    checked={formData.storageLocation === location}
                    onChange={(e) => setFormData(prev => ({ ...prev, storageLocation: e.target.value }))}
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
                checked={formData.isHomemade}
                onChange={(e) => setFormData(prev => ({ ...prev, isHomemade: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-1">🍱</span>
                作り置き: はい
              </span>
            </label>
          </div>

        </div>
      </BaseDialog>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="確認"
        message="削除しますか？"
        itemName={formData.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="削除"
        cancelText="キャンセル"
        isDestructive={true}
      />
    </>
  );
};