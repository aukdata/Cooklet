// 材料編集ダイアログコンポーネント - 材料マスタの追加・編集・削除機能を提供

import { useState, useEffect } from 'react';
import { BaseDialog } from '../ui/BaseDialog';
import { type Ingredient } from '../../types';

interface IngredientDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
  /** 編集対象の材料（新規作成時はundefined） */
  ingredient?: Ingredient;
  /** 材料保存時のコールバック */
  onSave: (ingredient: Omit<Ingredient, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  /** 材料削除時のコールバック */
  onDelete?: (id: number) => Promise<void>;
}

/**
 * 材料編集ダイアログコンポーネント
 * 
 * 材料マスタの追加・編集・削除機能を提供：
 * - 材料名の入力・編集
 * - カテゴリ選択（野菜・肉・調味料・その他）
 * - デフォルト単位の設定
 * - 一般的価格の設定（任意）
 */
export const IngredientDialog = ({
  isOpen,
  onClose,
  ingredient,
  onSave,
  onDelete
}: IngredientDialogProps) => {
  // フォーム状態管理
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'vegetables' | 'meat' | 'seasoning' | 'others'>('vegetables');
  const [defaultUnit, setDefaultUnit] = useState('');
  const [typicalPrice, setTypicalPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 編集モードかどうかの判定
  const isEditing = !!ingredient;

  // 材料データをフォームに反映
  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setCategory(ingredient.category);
      setDefaultUnit(ingredient.default_unit);
      setTypicalPrice(ingredient.typical_price ? ingredient.typical_price.toString() : '');
    } else {
      // 新規作成時は初期化
      setName('');
      setCategory('vegetables');
      setDefaultUnit('');
      setTypicalPrice('');
    }
  }, [ingredient]);

  // ダイアログが閉じられた時のクリーンアップ
  const handleClose = () => {
    setName('');
    setCategory('vegetables');
    setDefaultUnit('');
    setTypicalPrice('');
    setIsLoading(false);
    onClose();
  };

  // 保存処理
  const handleSave = async () => {
    if (!name.trim() || !defaultUnit.trim()) {
      alert('材料名とデフォルト単位は必須です');
      return;
    }

    try {
      setIsLoading(true);
      await onSave({
        name: name.trim(),
        category,
        default_unit: defaultUnit.trim(),
        typical_price: typicalPrice ? parseFloat(typicalPrice) : undefined
      });
      handleClose();
    } catch (error) {
      console.error('材料の保存に失敗しました:', error);
      alert('材料の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!ingredient || !onDelete) return;

    const confirmed = confirm(`材料「${ingredient.name}」を削除しますか？`);
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await onDelete(ingredient.id);
      handleClose();
    } catch (error) {
      console.error('材料の削除に失敗しました:', error);
      alert('材料の削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // バリデーション
  const isValid = name.trim() && defaultUnit.trim();

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? '材料を編集' : '材料を追加'}
      icon="🥕"
      size="md"
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      showDelete={isEditing}
      disabled={!isValid || isLoading}
      saveText={isLoading ? '保存中...' : '保存'}
    >
      {/* 材料名入力 */}
      <div>
        <label htmlFor="ingredient-name" className="block text-sm font-medium text-gray-700 mb-1">
          材料名 *
        </label>
        <input
          id="ingredient-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="例: 玉ねぎ"
          disabled={isLoading}
        />
      </div>

      {/* カテゴリ選択 */}
      <div>
        <label htmlFor="ingredient-category" className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ *
        </label>
        <select
          id="ingredient-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as 'vegetables' | 'meat' | 'seasoning' | 'others')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          <option value="vegetables">🥬 野菜</option>
          <option value="meat">🥩 肉・魚</option>
          <option value="seasoning">🧂 調味料</option>
          <option value="others">📦 その他</option>
        </select>
      </div>

      {/* デフォルト単位入力 */}
      <div>
        <label htmlFor="ingredient-unit" className="block text-sm font-medium text-gray-700 mb-1">
          デフォルト単位 *
        </label>
        <input
          id="ingredient-unit"
          type="text"
          value={defaultUnit}
          onChange={(e) => setDefaultUnit(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="例: 個、g、大さじ"
          disabled={isLoading}
        />
      </div>

      {/* 一般的価格入力（任意） */}
      <div>
        <label htmlFor="ingredient-price" className="block text-sm font-medium text-gray-700 mb-1">
          一般的価格（円）
          <span className="text-sm text-gray-500 ml-1">（任意）</span>
        </label>
        <input
          id="ingredient-price"
          type="number"
          value={typicalPrice}
          onChange={(e) => setTypicalPrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="例: 150"
          min="0"
          step="0.01"
          disabled={isLoading}
        />
      </div>
    </BaseDialog>
  );
};