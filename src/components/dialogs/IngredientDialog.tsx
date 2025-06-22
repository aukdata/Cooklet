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
  onSave: (ingredient: Omit<Ingredient, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
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
  const [originalName, setOriginalName] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<'vegetables' | 'meat' | 'seasoning' | 'others'>('vegetables');
  const [defaultUnit, setDefaultUnit] = useState<string>('');
  const [typicalPrice, setTypicalPrice] = useState<string>('');
  const [conversionQuantity, setConversionQuantity] = useState<string>('');
  const [conversionUnit, setConversionUnit] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 編集モードかどうかの判定
  const isEditing = !!ingredient;

  // 材料データをフォームに反映
  useEffect(() => {
    if (ingredient) {
      setOriginalName(ingredient.originalName || '');
      setName(ingredient.name || '');
      setCategory(ingredient.category);
      setDefaultUnit(ingredient.defaultUnit || '');
      setTypicalPrice(ingredient.typicalPrice ? ingredient.typicalPrice.toString() : '');
      setConversionQuantity(ingredient.conversionQuantity || '');
      setConversionUnit(ingredient.conversionUnit || '');
    } else {
      // 新規作成時は初期化
      setOriginalName('');
      setName('');
      setCategory('vegetables');
      setDefaultUnit('');
      setTypicalPrice('');
      setConversionQuantity('');
      setConversionUnit('');
    }
  }, [ingredient]);

  // ダイアログが閉じられた時のクリーンアップ
  const handleClose = () => {
    setOriginalName('');
    setName('');
    setCategory('vegetables');
    setDefaultUnit('');
    setTypicalPrice('');
    setConversionQuantity('');
    setConversionUnit('');
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
        defaultUnit: defaultUnit.trim(),
        typicalPrice: typicalPrice ? parseFloat(typicalPrice) : undefined,
        originalName: originalName.trim() || name.trim(),
        conversionQuantity: conversionQuantity.trim() || undefined,
        conversionUnit: conversionUnit.trim() || undefined
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
  const isValid = name?.trim() && defaultUnit?.trim();

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
      {/* 商品名入力（original_name） */}
      <div>
        <label htmlFor="ingredient-original-name" className="block text-sm font-medium text-gray-700 mb-1">
          商品名
          <span className="text-sm text-gray-500 ml-1">（レシート読み取り時の変換用）</span>
        </label>
        <input
          id="ingredient-original-name"
          type="text"
          value={originalName}
          onChange={(e) => setOriginalName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="例: 国産玉ねぎ、北海道産じゃがいも"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          レシートの商品名をここに登録すると、読み取り時に下の名前に自動変換されます
        </p>
      </div>

      {/* 名前入力（name） */}
      <div>
        <label htmlFor="ingredient-name" className="block text-sm font-medium text-gray-700 mb-1">
          名前 *
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

      {/* 1個当たりの量入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🔄 1個当たりの量 (任意)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={conversionQuantity}
            onChange={(e) => setConversionQuantity(e.target.value)}
            placeholder="数量 (例: 50, 0.1)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <input
            type="text"
            value={conversionUnit}
            onChange={(e) => setConversionUnit(e.target.value)}
            placeholder="単位 (例: g, ml)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          例: たまご6個パックで1個あたり50gの場合、数量「50」単位「g」と入力
        </p>
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