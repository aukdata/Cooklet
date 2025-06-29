import React, { useState, useEffect } from 'react';
import { BaseDialog } from '../ui/BaseDialog';
import { QuantityInput } from '../common/QuantityInput';
import { type ShoppingListItem, type Quantity } from '../../types';

// 買い物リストアイテムダイアログのProps型定義
interface ShoppingItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onDelete?: () => void; // アイテムを削除する関数（編集時のみ）
  initialData?: ShoppingListItem;
}

// 買い物リストアイテム編集ダイアログコンポーネント - CLAUDE.md仕様書5.6.4準拠
export const ShoppingItemDialog: React.FC<ShoppingItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}) => {
  // フォーム状態管理
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<Quantity>({ amount: '', unit: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 編集モードかどうかの判定
  const isEditing = !!initialData;

  // 初期データをフォームに反映
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setQuantity(initialData.quantity || { amount: '', unit: '' });
    } else {
      setName('');
      setQuantity({ amount: '', unit: '' });
    }
  }, [initialData, isOpen]);

  // フォームリセット
  const resetForm = () => {
    setName('');
    setQuantity({ amount: '', unit: '' });
  };

  // 保存処理
  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      // Quantity型をそのまま使用、空の場合はundefinedに
      const quantityToSave = quantity.amount.trim() === '' ? undefined : quantity;
      
      await onSave({
        name: name.trim(),
        quantity: quantityToSave,
        checked: initialData?.checked || false,
        added_from: initialData?.added_from || 'manual'
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('買い物リストアイテムの保存に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('買い物リストアイテムの削除に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // バリデーション
  const isValid = name?.trim();

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '買い物リストアイテム編集' : '新しいアイテムを追加'}
      icon="🛒"
      onSave={handleSave}
      saveText={isEditing ? '更新' : '追加'}
      onDelete={isEditing ? handleDelete : undefined}
      showDelete={isEditing}
      disabled={!isValid || isLoading}
    >
      <div className="space-y-4">
        {/* アイテム名入力 */}
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
            アイテム名 <span className="text-red-500">*</span>
          </label>
          <input
            id="itemName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: にんじん、牛乳、パン"
            disabled={isLoading}
          />
        </div>

        {/* 数量入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            数量 <span className="text-gray-500">(任意)</span>
          </label>
          <QuantityInput
            value={quantity}
            onChange={setQuantity}
            className="w-full"
            disabled={isLoading}
          />
        </div>
      </div>
    </BaseDialog>
  );
};