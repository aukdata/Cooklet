import { type StockItem } from '../../types';
import { type IStockRepository } from '../interfaces/IStockRepository';
import { NotFoundError } from '../errors';

/**
 * テスト用の在庫管理Repository実装
 * 
 * IStockRepositoryインターフェースを実装し、
 * メモリ内でのデータ管理を行います。テスト時のモックとして使用します。
 */
export class MockStockRepository implements IStockRepository {
  private data: Map<string, StockItem> = new Map();
  private idCounter: number = 1;

  /**
   * モックデータを設定（テスト用）
   * @param items 設定する在庫アイテム配列
   */
  setMockData(items: StockItem[]): void {
    this.data.clear();
    items.forEach(item => this.data.set(item.id, { ...item }));
    
    // IDカウンターを最大値+1に設定
    const maxId = Math.max(0, ...items.map(item => parseInt(item.id) || 0));
    this.idCounter = maxId + 1;
  }

  /**
   * モックデータをクリア（テスト用）
   */
  clearMockData(): void {
    this.data.clear();
    this.idCounter = 1;
  }

  /**
   * 新しいIDを生成
   */
  private generateId(): string {
    return (this.idCounter++).toString();
  }

  /**
   * 現在時刻のISO文字列を取得
   */
  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * 指定ユーザーの全在庫アイテムを取得
   */
  async findAll(userId: string): Promise<StockItem[]> {
    const items = Array.from(this.data.values())
      .filter(item => item.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return Promise.resolve(items);
  }

  /**
   * IDで在庫アイテムを取得
   */
  async findById(id: string): Promise<StockItem | null> {
    const item = this.data.get(id);
    return Promise.resolve(item ? { ...item } : null);
  }

  /**
   * 新しい在庫アイテムを作成
   */
  async create(item: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>): Promise<StockItem> {
    const now = this.getCurrentTimestamp();
    const newItem: StockItem = {
      id: this.generateId(),
      user_id: item.user_id,
      name: item.name,
      quantity: item.quantity,
      is_homemade: item.is_homemade ?? false,
      best_before: item.best_before || undefined,
      storage_location: item.storage_location || undefined,
      memo: item.memo || undefined,
      created_at: now,
      updated_at: now,
    };
    
    this.data.set(newItem.id, newItem);
    return Promise.resolve({ ...newItem });
  }

  /**
   * 在庫アイテムを更新
   */
  async update(id: string, updates: Partial<StockItem>): Promise<StockItem> {
    const existingItem = this.data.get(id);
    if (!existingItem) {
      throw new NotFoundError('StockItem', id);
    }

    const updatedItem: StockItem = {
      ...existingItem,
      ...updates,
      id: existingItem.id, // IDは変更不可
      created_at: existingItem.created_at, // 作成日時は変更不可
      updated_at: this.getCurrentTimestamp(),
    };

    this.data.set(id, updatedItem);
    return Promise.resolve({ ...updatedItem });
  }

  /**
   * 在庫アイテムを削除
   */
  async delete(id: string): Promise<void> {
    if (!this.data.has(id)) {
      throw new NotFoundError('StockItem', id);
    }
    
    this.data.delete(id);
    return Promise.resolve();
  }

  /**
   * 期限が近い在庫アイテムを取得
   */
  async findExpiringSoon(userId: string, days: number): Promise<StockItem[]> {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);
    
    const todayString = today.toISOString().split('T')[0];
    const targetDateString = targetDate.toISOString().split('T')[0];

    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.best_before &&
        item.best_before >= todayString &&
        item.best_before <= targetDateString
      )
      .sort((a, b) => (a.best_before || '').localeCompare(b.best_before || ''));

    return Promise.resolve(items);
  }

  /**
   * 期限切れの在庫アイテムを取得
   */
  async findExpired(userId: string): Promise<StockItem[]> {
    const today = new Date().toISOString().split('T')[0];

    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.best_before &&
        item.best_before < today
      )
      .sort((a, b) => (b.best_before || '').localeCompare(a.best_before || ''));

    return Promise.resolve(items);
  }

  /**
   * 食材名で在庫を検索（部分一致）
   */
  async findByName(userId: string, name: string): Promise<StockItem[]> {
    const searchTerm = name.toLowerCase();
    
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.name.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return Promise.resolve(items);
  }

  /**
   * 作り置きアイテムのみを取得
   */
  async findHomemade(userId: string): Promise<StockItem[]> {
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.is_homemade === true
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return Promise.resolve(items);
  }
}