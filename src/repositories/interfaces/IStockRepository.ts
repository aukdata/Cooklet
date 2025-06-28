import { type StockItem } from '../../types';

/**
 * 在庫管理用Repositoryインターフェース
 * 
 * 在庫データのCRUD操作と期限管理機能を提供します。
 * テスト時のモック化とSupabase実装の抽象化を目的としています。
 */
export interface IStockRepository {
  /**
   * 指定ユーザーの全在庫アイテムを取得
   * @param userId ユーザーID
   * @returns 在庫アイテム配列
   */
  findAll(userId: string): Promise<StockItem[]>;

  /**
   * IDで在庫アイテムを取得
   * @param id 在庫アイテムID
   * @returns 在庫アイテム（存在しない場合はnull）
   */
  findById(id: string): Promise<StockItem | null>;

  /**
   * 新しい在庫アイテムを作成
   * @param item 作成する在庫アイテム（IDと日時は自動生成）
   * @returns 作成された在庫アイテム
   */
  create(item: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>): Promise<StockItem>;

  /**
   * 在庫アイテムを更新
   * @param id 更新対象のID
   * @param updates 更新データ（部分更新可能）
   * @returns 更新後の在庫アイテム
   */
  update(id: string, updates: Partial<StockItem>): Promise<StockItem>;

  /**
   * 在庫アイテムを削除
   * @param id 削除対象のID
   */
  delete(id: string): Promise<void>;

  /**
   * 期限が近い在庫アイテムを取得
   * @param userId ユーザーID
   * @param days 何日後までを対象とするか
   * @returns 期限が近い在庫アイテム配列
   */
  findExpiringSoon(userId: string, days: number): Promise<StockItem[]>;

  /**
   * 期限切れの在庫アイテムを取得
   * @param userId ユーザーID
   * @returns 期限切れの在庫アイテム配列
   */
  findExpired(userId: string): Promise<StockItem[]>;

  /**
   * 食材名で在庫を検索（部分一致）
   * @param userId ユーザーID
   * @param name 検索する食材名
   * @returns 該当する在庫アイテム配列
   */
  findByName(userId: string, name: string): Promise<StockItem[]>;

  /**
   * 作り置きアイテムのみを取得
   * @param userId ユーザーID
   * @returns 作り置きアイテム配列
   */
  findHomemade(userId: string): Promise<StockItem[]>;
}