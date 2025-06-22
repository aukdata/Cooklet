// 商品名正規化ユーティリティ - ingredientsテーブルのoriginalNameと照らし合わせて一般名に変換
import type { ReceiptItem } from '../lib/ai/types';
import type { Ingredient } from '../types';

/**
 * 商品名正規化結果の型定義
 */
export interface NameNormalizationResult {
  item: ReceiptItem; // 正規化対象のレシートアイテム
  isNormalized: boolean; // 正規化が行われたかどうか
  matchedIngredient?: Ingredient; // マッチしたingredientsテーブルの食材情報
}

/**
 * 商品名をingredientsテーブルのoriginalNameと照らし合わせて一般名に変換する関数
 * @param originalName - 元の商品名（レシートから読み取った名前）
 * @param ingredients - ingredientsテーブルの食材マスタデータ
 * @returns NameNormalizationResult - 正規化結果
 */
export const normalizeProductName = (
  item: ReceiptItem,
  ingredients: Ingredient[]
): NameNormalizationResult => {
  // 完全一致で検索
  const exactMatch = ingredients.find(ingredient => 
    ingredient.originalName === item.originalName
  );

  if (exactMatch) {
    return {
      item: {
        ...item,
        name: exactMatch.name // 完全一致の場合はingredientsのnameを使用
      },
      isNormalized: true,
      matchedIngredient: exactMatch
    };
  }

  // 正規表現一致で検索（大文字小文字を無視）
  const regexMatch = ingredients.find(ingredient => {
    if (!ingredient.originalName) return false;
    try {
      const regex = new RegExp(ingredient.originalName, 'i');
      return regex.test(item.originalName);
    } catch {
      // 正規表現が無効な場合は文字列一致にフォールバック
      return ingredient.originalName.toLowerCase().includes(item.originalName.toLowerCase());
    }
  });

  if (regexMatch) {
    return {
      item: {
        ...item,
        name: regexMatch.name // 正規表現一致の場合はingredientsのnameを使用
      },
      isNormalized: true,
      matchedIngredient: regexMatch
    };
  }

  // マッチしない場合は元の名前をそのまま返す
  return {
    item,
    isNormalized: false
  };
};

/**
 * レシートアイテムリストの商品名を一括で正規化する関数
 * @param items - レシートから読み取った商品リスト
 * @param ingredients - ingredientsテーブルの食材マスタデータ
 * @returns 正規化されたアイテムリスト（元のアイテムデータ + 正規化情報）
 */
export const normalizeReceiptItems = (
  items: ReceiptItem[], 
  ingredients: Ingredient[]
): NameNormalizationResult[] => {
  return items.map(item => normalizeProductName(item, ingredients));
};
