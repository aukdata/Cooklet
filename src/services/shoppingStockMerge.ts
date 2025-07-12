import { type ShoppingListItem, type StockItem, type Quantity, type Ingredient } from '../types';
import { mergeStockWithPurchases, createMergeReport, type PurchaseItem } from './stockMergeUtils';

/**
 * 買い物リストの完了済みアイテムを在庫に追加するユーティリティ関数
 */
export class ShoppingStockMergeService {
  /**
   * 完了済み買い物リストアイテムを在庫に統合
   */
  static async mergeCompletedItemsToStock(
    completedItems: ShoppingListItem[],
    editingQuantities: Record<string, Quantity>,
    stockItems: StockItem[],
    ingredients: Ingredient[],
    userId: string,
    callbacks: {
      updateStockItem: (id: string, updates: Partial<Omit<StockItem, 'id' | 'user_id' | 'created_at'>>) => Promise<StockItem>;
      addStockItem: (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<StockItem>;
      deleteCompletedItems: () => Promise<void>;
    }
  ) {
    if (completedItems.length === 0) {
      throw new Error('完了したアイテムがありません');
    }

    // 完了済みアイテムを購入品アイテムに変換
    const purchaseItems: PurchaseItem[] = this.convertCompletedItemsToPurchaseItems(
      completedItems,
      editingQuantities
    );
    
    // 既存在庫と購入品をマージ
    const mergeResult = mergeStockWithPurchases(
      purchaseItems,
      stockItems,
      ingredients,
      userId
    );
    
    // マージされた在庫アイテムを更新
    await this.updateMergedItems(mergeResult.mergedItems, callbacks.updateStockItem);
    
    // 新規在庫アイテムを追加
    await this.addNewItems(mergeResult.newItems, callbacks.addStockItem);
    
    // 在庫追加後、完了アイテムを削除
    await callbacks.deleteCompletedItems();
    
    // マージ結果のレポートを生成
    const report = createMergeReport(mergeResult);
    
    console.log('📦 [マージ結果]', mergeResult);
    
    return {
      report,
      mergeResult
    };
  }

  /**
   * 完了済みアイテムを購入品アイテムに変換
   */
  private static convertCompletedItemsToPurchaseItems(
    completedItems: ShoppingListItem[],
    editingQuantities: Record<string, Quantity>
  ): PurchaseItem[] {
    return completedItems.map((item) => {
      const editedQuantity = editingQuantities[item.id!];
      const quantity = editedQuantity || item.quantity || { amount: '1', unit: '個' };
      
      return {
        name: item.name,
        quantity: quantity,
        best_before: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1週間後
        storage_location: '冷蔵庫',
        is_homemade: false
      };
    });
  }

  /**
   * マージされた在庫アイテムを更新
   */
  private static async updateMergedItems(
    mergedItems: StockItem[],
    updateStockItem: (id: string, updates: Partial<Omit<StockItem, 'id' | 'user_id' | 'created_at'>>) => Promise<StockItem>
  ) {
    for (const mergedItem of mergedItems) {
      await updateStockItem(mergedItem.id, {
        quantity: mergedItem.quantity,
        best_before: mergedItem.best_before,
        storage_location: mergedItem.storage_location,
        is_homemade: mergedItem.is_homemade,
        updated_at: mergedItem.updated_at
      });
    }
  }

  /**
   * 新規在庫アイテムを追加
   */
  private static async addNewItems(
    newItems: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[],
    addStockItem: (stockItem: Omit<StockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<StockItem>
  ) {
    for (const newItem of newItems) {
      await addStockItem(newItem);
    }
  }
}