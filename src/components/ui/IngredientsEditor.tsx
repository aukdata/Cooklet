// 食材編集コンポーネント - 食材リストの追加・編集・削除機能を統一

import { QuantityInput } from '../common/QuantityInput';

// 食材データの型定義
export interface Ingredient {
  name: string;
  quantity: string;
}

export interface IngredientsEditorProps {
  /** 食材リスト */
  ingredients: Ingredient[];
  /** 食材リスト変更時のコールバック */
  onChange: (ingredients: Ingredient[]) => void;
  /** 無効化状態 */
  disabled?: boolean;
  /** 最大食材数（制限なしの場合は undefined） */
  maxItems?: number;
  /** 食材追加ボタンのテキスト */
  addButtonText?: string;
  /** 空の食材項目を表示するかどうか */
  showEmptyItem?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 食材編集コンポーネント
 * 
 * 統一された食材リスト編集機能を提供：
 * - 食材の追加・削除・編集
 * - QuantityInputコンポーネントとの統合
 * - キーボードナビゲーション対応
 * - バリデーション機能
 */
export const IngredientsEditor = ({
  ingredients,
  onChange,
  disabled = false,
  maxItems,
  addButtonText = '+ 食材追加',
  showEmptyItem = true,
  className = ''
}: IngredientsEditorProps) => {
  
  // 食材を追加
  const addIngredient = () => {
    if (maxItems && ingredients.length >= maxItems) {
      return;
    }
    
    const newIngredients = [...ingredients, { name: '', quantity: '' }];
    onChange(newIngredients);
  };

  // 食材を削除
  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    onChange(newIngredients);
  };

  // 食材の名前を更新
  const updateIngredientName = (index: number, name: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], name };
    onChange(newIngredients);
  };

  // 食材の数量を更新
  const updateIngredientQuantity = (index: number, quantity: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], quantity };
    onChange(newIngredients);
  };

  // Enterキー押下時の処理（名前フィールドのみ対応）
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // 最後の項目の場合は新規追加
      if (index === ingredients.length - 1) {
        addIngredient();
        setTimeout(() => {
          const nameInput = document.querySelector(`[data-ingredient-name="${ingredients.length}"]`) as HTMLInputElement;
          nameInput?.focus();
        }, 0);
      } else {
        // 次の項目にフォーカス移動
        const nextNameInput = document.querySelector(`[data-ingredient-name="${index + 1}"]`) as HTMLInputElement;
        nextNameInput?.focus();
      }
    }
  };

  // 表示する食材リスト（空の項目表示オプション対応）
  const displayIngredients = showEmptyItem && ingredients.length === 0 
    ? [{ name: '', quantity: '' }] 
    : ingredients;

  const canAddMore = !maxItems || ingredients.length < maxItems;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 食材リスト */}
      <div className="space-y-2">
        {displayIngredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 items-center">
            {/* 食材名入力 */}
            <div className="flex-1">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => updateIngredientName(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="食材名"
                disabled={disabled}
                data-ingredient-name={index}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* 数量入力 */}
            <div className="w-32">
              <QuantityInput
                value={ingredient.quantity}
                onChange={(quantity) => updateIngredientQuantity(index, quantity)}
                disabled={disabled}
                placeholder="数量"
                className="text-sm"
              />
            </div>

            {/* 削除ボタン */}
            {ingredients.length > 0 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 text-sm disabled:text-gray-300 disabled:cursor-not-allowed p-1"
                title="この食材を削除"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 追加ボタン */}
      {canAddMore && (
        <button
          type="button"
          onClick={addIngredient}
          disabled={disabled}
          className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {addButtonText}
        </button>
      )}

      {/* 制限表示 */}
      {maxItems && (
        <div className="text-xs text-gray-500">
          {ingredients.length} / {maxItems} 項目
        </div>
      )}
    </div>
  );
};

// バリデーション用のユーティリティ関数

/**
 * 食材リストのバリデーション
 */
export const validateIngredients = (ingredients: Ingredient[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // 空の食材チェック
  const validIngredients = ingredients.filter(ing => ing.name.trim() !== '');
  
  if (validIngredients.length === 0) {
    errors.push('少なくとも1つの食材を入力してください');
  }

  // 重複チェック
  const names = validIngredients.map(ing => ing.name.trim().toLowerCase());
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    errors.push('重複する食材があります');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 食材リストから空の項目を除去
 */
export const cleanIngredients = (ingredients: Ingredient[]): Ingredient[] => {
  return ingredients.filter(ing => ing.name.trim() !== '');
};

/**
 * 食材リストを正規化（空白除去、小文字変換等）
 */
export const normalizeIngredients = (ingredients: Ingredient[]): Ingredient[] => {
  return ingredients.map(ing => ({
    name: ing.name.trim(),
    quantity: ing.quantity.trim() || '適量'
  })).filter(ing => ing.name !== '');
};