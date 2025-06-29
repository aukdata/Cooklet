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
  // originalNameが空の場合は正規化しない
  if (!item.originalName || item.originalName.trim() === '') {
    return {
      item,
      isNormalized: false
    };
  }

  // 完全一致で検索
  const exactMatch = ingredients.find(ingredient => 
    ingredient.original_name === item.originalName
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

  // 部分一致で検索（大文字小文字を無視）
  const partialMatch = ingredients.find(ingredient => {
    if (!ingredient.original_name) return false;
    const originalLower = item.originalName.toLowerCase();
    const ingredientLower = ingredient.original_name.toLowerCase();
    const ingredientNameLower = ingredient.name.toLowerCase();
    
    // 1. レシート商品名が食材のoriginal_nameに含まれる
    // 2. 食材のoriginal_nameがレシート商品名に含まれる  
    // 3. レシート商品名が食材のnameに含まれる
    // 4. 食材のnameがレシート商品名に含まれる
    return originalLower.includes(ingredientLower) || 
           ingredientLower.includes(originalLower) ||
           originalLower.includes(ingredientNameLower) ||
           ingredientNameLower.includes(originalLower);
  });

  if (partialMatch) {
    return {
      item: {
        ...item,
        name: partialMatch.name // 部分一致の場合はingredientsのnameを使用
      },
      isNormalized: true,
      matchedIngredient: partialMatch
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
export const normalizeReceiptItems = <T extends ReceiptItem>(
  items: T[], 
  ingredients: Ingredient[]
): Array<T & { normalizationResult: NameNormalizationResult }> => {
  return items.map(item => {
    const normalizationResult = normalizeProductName(item, ingredients);
    return {
      ...item,
      ...normalizationResult.item,
      normalizationResult
    };
  });
};

/**
 * 正規化統計情報の型定義
 */
export interface Stats {
  total: number;        // 総件数
  normalized: number;   // 正規化された件数
  unchanged: number;    // 変更されなかった件数
  successRate: number;  // 正規化成功率（％）
}

/**
 * 正規化統計情報を計算する関数
 * @param results - 正規化結果のリスト
 * @returns Stats - 統計情報
 */
export const getNormalizationStats = (results: NameNormalizationResult[]): Stats => {
  const total = results.length;
  const normalized = results.filter(result => result.isNormalized).length;
  const unchanged = total - normalized;
  const successRate = total > 0 ? Math.round((normalized / total) * 100) : 0;

  return {
    total,
    normalized,
    unchanged,
    successRate
  };
};
