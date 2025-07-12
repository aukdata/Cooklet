/**
 * 在庫マージユーティリティ
 * 購入品を既存在庫とマージする機能を提供
 */

import { addQuantities, isValidQuantity } from '../utils/quantityUtils';
import { normalizeProductName } from '../utils/nameNormalizer';
import type { StockItem } from '../types';
import type { Ingredient } from '../types';
import type { Quantity } from '../utils/quantityUtils';
import type { ReceiptItem } from '../lib/ai/types';
import type { FoodUnit } from '../constants/units';

/**
 * 購入品アイテムの型定義
 */
export interface PurchaseItem {
  /** 商品名 */
  name: string;
  /** 元の商品名（レシートから読み取った名前） */
  originalName?: string;
  /** 数量 */
  quantity: Quantity;
  /** 賞味期限（任意） */
  best_before?: string;
  /** 保存場所（任意） */
  storage_location?: string;
  /** 価格（任意） */
  price?: number;
  /** 作り置きフラグ（デフォルト: false） */
  is_homemade?: boolean;
}

/**
 * マージ結果の型定義
 */
export interface StockMergeResult {
  /** マージされた在庫アイテム（更新対象） */
  mergedItems: StockItem[];
  /** 新規追加する在庫アイテム */
  newItems: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>[];
  /** マージ統計情報 */
  stats: {
    /** 処理した購入品の総数 */
    totalPurchaseItems: number;
    /** 既存在庫にマージされた数 */
    mergedCount: number;
    /** 新規追加された数 */
    newCount: number;
    /** 正規化された商品名の数 */
    normalizedCount: number;
  };
}

/**
 * 商品名の類似度チェック（正規化後の名前でマッチング）
 * @param purchaseName - 購入品の名前
 * @param stockName - 在庫品の名前
 * @returns 類似している場合true
 */
function isNameMatch(purchaseName: string, stockName: string): boolean {
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      // 全角数字を半角に変換
      .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xFEE0))
      // 括弧や記号を除去
      .replace(/[（）()【】「」〈〉]/g, '')
      // 連続する空白を単一の空白に
      .replace(/\s+/g, ' ');
  };

  const normalizedPurchase = normalizeName(purchaseName);
  const normalizedStock = normalizeName(stockName);

  // 完全一致
  if (normalizedPurchase === normalizedStock) {
    return true;
  }

  // 部分一致（より短い名前が長い名前に含まれる）
  const shorter = normalizedPurchase.length <= normalizedStock.length 
    ? normalizedPurchase 
    : normalizedStock;
  const longer = normalizedPurchase.length > normalizedStock.length 
    ? normalizedPurchase 
    : normalizedStock;

  return longer.includes(shorter) && shorter.length >= 2; // 2文字以上で部分一致
}

/**
 * 購入品を既存在庫とマージする
 * @param purchaseItems - 購入品リスト
 * @param existingStock - 既存在庫リスト
 * @param ingredients - 食材マスタ（商品名正規化用）
 * @param userId - ユーザーID
 * @returns マージ結果
 */
export function mergeStockWithPurchases(
  purchaseItems: PurchaseItem[],
  existingStock: StockItem[],
  ingredients: Ingredient[],
  userId: string
): StockMergeResult {
  const mergedItems: StockItem[] = [];
  const newItems: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>[] = [];
  let normalizedCount = 0;

  // 既存在庫のコピーを作成（変更を追跡するため）
  const stockCopy = [...existingStock];

  for (const purchaseItem of purchaseItems) {
    // 商品名正規化を実行（ReceiptItemを模擬的に作成）
    const mockReceiptItem: ReceiptItem = {
      name: purchaseItem.name,
      originalName: purchaseItem.name,
      quantity: purchaseItem.quantity.amount,
      unit: purchaseItem.quantity.unit as FoodUnit,
      price: 0
    };
    const normalizedResult = normalizeProductName(
      mockReceiptItem,
      ingredients
    );

    const finalName = normalizedResult.isNormalized 
      ? normalizedResult.item.name 
      : purchaseItem.name;

    if (normalizedResult.isNormalized) {
      normalizedCount++;
    }

    // 既存在庫で同名のアイテムを検索
    const existingItemIndex = stockCopy.findIndex(stockItem => 
      isNameMatch(finalName, stockItem.name)
    );

    if (existingItemIndex !== -1) {
      // 既存在庫が見つかった場合 - マージ処理
      const existingItem = stockCopy[existingItemIndex];
      
      // 数量を加算
      const currentQuantity: Quantity = {
        amount: existingItem.quantity.amount,
        unit: existingItem.quantity.unit
      };

      const addedQuantity = addQuantities(currentQuantity, purchaseItem.quantity);

      if (addedQuantity && isValidQuantity(addedQuantity)) {
        // マージされたアイテムを作成
        const mergedItem: StockItem = {
          ...existingItem,
          quantity: addedQuantity,
          // 賞味期限は新しい方（購入品）を優先
          best_before: purchaseItem.best_before || existingItem.best_before,
          // 保存場所は購入品があれば優先、なければ既存を維持
          storage_location: purchaseItem.storage_location || existingItem.storage_location,
          // 作り置きフラグは購入品を優先
          is_homemade: purchaseItem.is_homemade ?? existingItem.is_homemade,
          // 更新日時は後で設定される
          updated_at: new Date().toISOString()
        };

        mergedItems.push(mergedItem);
        
        // 処理済みのアイテムを配列から削除
        stockCopy.splice(existingItemIndex, 1);
      } else {
        // 数量加算に失敗した場合は新規アイテムとして追加
        console.warn(`数量加算に失敗: ${finalName} (${purchaseItem.quantity.amount}${purchaseItem.quantity.unit})`);
        
        newItems.push({
          user_id: userId,
          name: finalName,
          quantity: purchaseItem.quantity,
          best_before: purchaseItem.best_before,
          storage_location: purchaseItem.storage_location,
          is_homemade: purchaseItem.is_homemade ?? false
        });
      }
    } else {
      // 既存在庫が見つからない場合 - 新規アイテムとして追加
      newItems.push({
        user_id: userId,
        name: finalName,
        quantity: purchaseItem.quantity,
        best_before: purchaseItem.best_before,
        storage_location: purchaseItem.storage_location,
        is_homemade: purchaseItem.is_homemade ?? false
      });
    }
  }

  return {
    mergedItems,
    newItems,
    stats: {
      totalPurchaseItems: purchaseItems.length,
      mergedCount: mergedItems.length,
      newCount: newItems.length,
      normalizedCount
    }
  };
}

/**
 * レシートアイテムを購入品アイテムに変換する
 * @param receiptItems - レシートから読み取ったアイテムリスト
 * @param defaultBestBefore - デフォルト賞味期限（任意）
 * @param defaultStorageLocation - デフォルト保存場所（任意）
 * @returns 購入品アイテムリスト
 */
export function convertReceiptItemsToPurchaseItems(
  receiptItems: Array<{
    name: string;
    originalName?: string;
    quantity: string;
    price?: number;
  }>,
  defaultBestBefore?: string,
  defaultStorageLocation?: string
): PurchaseItem[] {
  return receiptItems.map(item => {
    // 数量文字列をQuantity型に変換
    const quantityMatch = item.quantity.match(/^(.+?)([^\d\s.,]+)$/);
    let quantity: Quantity;
    
    if (quantityMatch) {
      const [, amount, unit] = quantityMatch;
      quantity = {
        amount: amount.trim(),
        unit: unit.trim()
      };
    } else {
      // 単位が見つからない場合はデフォルトを使用
      quantity = {
        amount: item.quantity.replace(/[^\d.,]/g, '') || '1',
        unit: '個'
      };
    }

    return {
      name: item.name,
      originalName: item.originalName,
      quantity,
      price: item.price,
      best_before: defaultBestBefore,
      storage_location: defaultStorageLocation,
      is_homemade: false
    };
  });
}

/**
 * マージ結果を日本語でレポート
 * @param result - マージ結果
 * @returns レポート文字列
 */
export function createMergeReport(result: StockMergeResult): string {
  const { stats } = result;
  
  const reports = [
    `📦 購入品 ${stats.totalPurchaseItems}件を処理しました`,
  ];

  if (stats.mergedCount > 0) {
    reports.push(`🔄 既存在庫 ${stats.mergedCount}件に数量を追加しました`);
  }

  if (stats.newCount > 0) {
    reports.push(`➕ 新規在庫 ${stats.newCount}件を追加しました`);
  }

  if (stats.normalizedCount > 0) {
    reports.push(`🏷️ 商品名 ${stats.normalizedCount}件を正規化しました`);
  }

  return reports.join('\n');
}