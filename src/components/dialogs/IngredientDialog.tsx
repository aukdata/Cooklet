// 材料編集ダイアログコンポーネント - 材料マスタの追加・編集・削除機能を提供

import { useState } from 'react';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { type Ingredient } from '../../types';
import { FOOD_UNITS } from '../../constants/units';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useToast } from '../../hooks/useToast';

interface IngredientDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
  /** 編集対象の材料（新規作成時はundefined） */
  ingredient?: Ingredient;
  /** 材料保存時のコールバック */
  onSave: (ingredient: Omit<Ingredient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  /** 材料削除時のコールバック */
  onDelete?: (id: string) => Promise<void>;
}

/**
 * 材料編集ダイアログコンポーネント
 * 
 * 材料マスタの追加・編集・削除機能を提供：
 * - 材料名の入力・編集
 * - カテゴリ選択（野菜・肉・調味料・その他）
 * - デフォルト単位の設定
 * - 一般的価格の設定（任意）
 * - 在庫消費なし設定（infinityフラグ）
 */
// 初期値を計算する関数
const getInitialFormValues = (ingredient?: Ingredient) => {
  if (ingredient) {
    return {
      originalName: ingredient.original_name || '',
      name: ingredient.name || '',
      category: ingredient.category,
      defaultUnit: ingredient.default_unit || '',
      typicalPrice: ingredient.typical_price ? ingredient.typical_price.toString() : '',
      conversionQuantity: ingredient.conversion_quantity || '',
      conversionUnit: ingredient.conversion_unit || '',
      infinity: ingredient.infinity || false
    };
  } else {
    return {
      originalName: '',
      name: '',
      category: 'vegetables' as const,
      defaultUnit: '',
      typicalPrice: '',
      conversionQuantity: '',
      conversionUnit: '',
      infinity: false
    };
  }
};

export const IngredientDialog = ({
  isOpen,
  onClose,
  ingredient,
  onSave,
  onDelete
}: IngredientDialogProps) => {
  // フック
  const { showError } = useToast();
  const { showConfirm, isOpen: confirmIsOpen, handleConfirm, closeConfirm, config } = useConfirmDialog();

  // 初期値を計算（keyによる再マウント時に再計算される）
  const initialValues = getInitialFormValues(ingredient);

  // フォーム状態管理（propsから直接初期化）
  const [originalName, setOriginalName] = useState<string>(initialValues.originalName);
  const [name, setName] = useState<string>(initialValues.name);
  const [category, setCategory] = useState<'vegetables' | 'meat' | 'seasoning' | 'others'>(initialValues.category);
  const [defaultUnit, setDefaultUnit] = useState<string>(initialValues.defaultUnit);
  const [typicalPrice, setTypicalPrice] = useState<string>(initialValues.typicalPrice);
  const [conversionQuantity, setConversionQuantity] = useState<string>(initialValues.conversionQuantity);
  const [conversionUnit, setConversionUnit] = useState<string>(initialValues.conversionUnit);
  const [infinity, setInfinity] = useState<boolean>(initialValues.infinity);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 編集モードかどうかの判定
  const isEditing = !!ingredient;

  // ダイアログが閉じられた時のクリーンアップ
  const handleClose = () => {
    setOriginalName('');
    setName('');
    setCategory('vegetables');
    setDefaultUnit('');
    setTypicalPrice('');
    setConversionQuantity('');
    setConversionUnit('');
    setInfinity(false);
    setIsLoading(false);
    onClose();
  };

  // 保存処理
  const handleSave = async () => {
    if (!name.trim() || !defaultUnit.trim()) {
      showError('材料名とデフォルト単位は必須です');
      return;
    }

    try {
      setIsLoading(true);
      await onSave({
        name: name.trim(),
        category,
        default_unit: defaultUnit.trim(),
        typical_price: typicalPrice ? parseFloat(typicalPrice) : undefined,
        infinity: infinity, // 在庫消費なしフラグ
        original_name: originalName.trim() || name.trim(),
        conversion_quantity: conversionQuantity.trim() || undefined,
        conversion_unit: conversionUnit.trim() || undefined
      });
      handleClose();
    } catch (error) {
      console.error('材料の保存に失敗しました:', error);
      showError('材料の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 削除処理
  const handleDelete = () => {
    if (!ingredient || !onDelete) return;

    showConfirm({
      title: '材料削除',
      message: '削除すると復元できません。本当に削除してもよろしいですか？',
      itemName: ingredient.name,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await onDelete(ingredient.id);
          handleClose();
        } catch (error) {
          console.error('材料の削除に失敗しました:', error);
          showError('削除に失敗しました');
        } finally {
          setIsLoading(false);
        }
      },
      isDestructive: true
    });
  };

  // バリデーション
  const isValid = name?.trim() && defaultUnit?.trim();

  return (
    <>
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

      {/* デフォルト単位選択 */}
      <div>
        <label htmlFor="ingredient-unit" className="block text-sm font-medium text-gray-700 mb-1">
          デフォルト単位 *
        </label>
        <select
          id="ingredient-unit"
          value={defaultUnit}
          onChange={(e) => setDefaultUnit(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          disabled={isLoading}
        >
          <option value="">-- 単位を選択 --</option>
          {FOOD_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit === '-' ? '単位なし' : unit}
            </option>
          ))}
        </select>
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
          <select
            value={conversionUnit}
            onChange={(e) => setConversionUnit(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            disabled={isLoading}
          >
            <option value="">-- 単位を選択 --</option>
            {FOOD_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit === '-' ? '単位なし' : unit}
              </option>
            ))}
          </select>
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

      {/* 在庫消費なし設定 */}
      <div className="space-y-2">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={infinity}
            onChange={(e) => setInfinity(e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            disabled={isLoading}
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              在庫消費なし
            </span>
            <p className="text-xs text-gray-500">
              醤油・塩・砂糖など、1回の使用量が少なく在庫管理が不要な調味料をチェック
            </p>
          </div>
        </label>
      </div>
    </BaseDialog>

    {/* 削除確認ダイアログ */}
    <ConfirmDialog
      isOpen={confirmIsOpen}
      title={config.title}
      message={config.message}
      itemName={config.itemName}
      onConfirm={handleConfirm}
      onCancel={closeConfirm}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      isDestructive={config.isDestructive}
    />
  </>
  );
};