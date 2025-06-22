// 商品名正規化ユーティリティ - ingredientsテーブルのoriginalNameと照らし合わせて一般名に変換
import type { Ingredient } from '../types';

/**
 * 商品名正規化結果の型定義
 */
export interface NameNormalizationResult {
  name: string; // 正規化された一般名
  originalName: string; // 元の商品名
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
  originalName: string,
  ingredients: Ingredient[]
): NameNormalizationResult => {
  if (!originalName) {
    return {
      name: '',
      originalName: '',
      isNormalized: false
    };
  }

  // 完全一致で検索
  const exactMatch = ingredients.find(ingredient => 
    ingredient.originalName === originalName
  );

  if (exactMatch) {
    return {
      name: exactMatch.name,
      originalName,
      isNormalized: true,
      matchedIngredient: exactMatch
    };
  }

  // 正規表現一致で検索（大文字小文字を無視）
  const regexMatch = ingredients.find(ingredient => {
    if (!ingredient.originalName) return false;
    try {
      const regex = new RegExp(ingredient.originalName, 'i');
      return regex.test(originalName);
    } catch {
      // 正規表現が無効な場合は文字列一致にフォールバック
      return ingredient.originalName.toLowerCase().includes(originalName.toLowerCase());
    }
  });

  if (regexMatch) {
    return {
      name: regexMatch.name,
      originalName,
      isNormalized: true,
      matchedIngredient: regexMatch
    };
  }

  // 逆向き正規表現一致で検索（商品名がoriginalNameパターンに含まれる場合）
  const reverseRegexMatch = ingredients.find(ingredient => {
    if (!ingredient.originalName) return false;
    try {
      const regex = new RegExp(ingredient.originalName, 'i');
      return regex.test(originalName);
    } catch {
      // 正規表現が無効な場合は文字列一致にフォールバック
      return originalName.toLowerCase().includes(ingredient.originalName.toLowerCase());
    }
  });

  if (reverseRegexMatch) {
    return {
      name: reverseRegexMatch.name,
      originalName,
      isNormalized: true,
      matchedIngredient: reverseRegexMatch
    };
  }

  // マッチしない場合は元の名前をそのまま返す
  return {
    name: originalName,
    originalName,
    isNormalized: false
  };
};

/**
 * レシートアイテムリストの商品名を一括で正規化する関数
 * @param items - レシートから読み取った商品リスト
 * @param ingredients - ingredientsテーブルの食材マスタデータ
 * @returns 正規化されたアイテムリスト（元のアイテムデータ + 正規化情報）
 */
export const normalizeReceiptItems = <T extends { name: string }>(
  items: T[],
  ingredients: Ingredient[]
): Array<T & { normalizationResult: NameNormalizationResult }> => {
  return items.map(item => {
    const normalizationResult = normalizeProductName(item.name, ingredients);
    
    return {
      ...item,
      // 正規化された名前で元の名前を上書き
      name: normalizationResult.name,
      // 正規化の詳細情報を追加
      normalizationResult
    };
  });
};

/**
 * 正規化統計情報を取得する関数
 * @param normalizationResults - 正規化結果のリスト
 * @returns 正規化統計情報
 */
export const getNormalizationStats = (
  normalizationResults: NameNormalizationResult[]
): {
  total: number;
  normalized: number;
  unchanged: number;
  normalizationRate: number;
} => {
  const total = normalizationResults.length;
  const normalized = normalizationResults.filter(result => result.isNormalized).length;
  const unchanged = total - normalized;
  const normalizationRate = total > 0 ? normalized / total : 0;

  return {
    total,
    normalized,
    unchanged,
    normalizationRate
  };
};