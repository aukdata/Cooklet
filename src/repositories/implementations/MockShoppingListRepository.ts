import { type ShoppingListItem } from '../../types';
import { type IShoppingListRepository } from '../interfaces/IShoppingListRepository';
import { NotFoundError } from '../errors';

/**
 * テスト用の買い物リスト管理Repository実装
 * 
 * IShoppingListRepositoryインターフェースを実装し、
 * メモリ内でのデータ管理を行います。テスト時のモックとして使用します。
 */
export class MockShoppingListRepository implements IShoppingListRepository {
  private data: Map<string, ShoppingListItem> = new Map();
  private idCounter: number = 1;

  /**
   * モックデータを設定（テスト用）
   * @param items 設定する買い物リストアイテム配列
   */
  setMockData(items: ShoppingListItem[]): void {
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
   * 指定ユーザーの全買い物リストアイテムを取得
   */
  async findAll(userId: string): Promise<ShoppingListItem[]> {
    const items = Array.from(this.data.values())
      .filter(item => item.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return Promise.resolve(items);
  }

  /**
   * IDで買い物リストアイテムを取得
   */
  async findById(id: string): Promise<ShoppingListItem | null> {
    const item = this.data.get(id);
    return Promise.resolve(item ? { ...item } : null);
  }

  /**
   * 新しい買い物リストアイテムを作成
   */
  async create(item: Omit<ShoppingListItem, 'id' | 'created_at'>): Promise<ShoppingListItem> {
    const newItem: ShoppingListItem = {
      id: this.generateId(),
      user_id: item.user_id,
      name: item.name,
      checked: item.checked ?? false,
      added_from: item.added_from || 'manual',
      created_at: this.getCurrentTimestamp(),
    };
    
    this.data.set(newItem.id, newItem);
    return Promise.resolve({ ...newItem });
  }

  /**
   * 買い物リストアイテムを更新
   */
  async update(id: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
    const existingItem = this.data.get(id);
    if (!existingItem) {
      throw new NotFoundError('ShoppingListItem', id);
    }

    const updatedItem: ShoppingListItem = {
      ...existingItem,
      ...updates,
      id: existingItem.id, // IDは変更不可
      created_at: existingItem.created_at, // 作成日時は変更不可
    };

    this.data.set(id, updatedItem);
    return Promise.resolve({ ...updatedItem });
  }

  /**
   * 買い物リストアイテムを削除
   */
  async delete(id: string): Promise<void> {
    if (!this.data.has(id)) {
      throw new NotFoundError('ShoppingListItem', id);
    }
    
    this.data.delete(id);
    return Promise.resolve();
  }

  /**
   * アイテムのチェック状態を切り替え
   */
  async toggleCheck(id: string, checked: boolean): Promise<ShoppingListItem> {
    const existingItem = this.data.get(id);
    if (!existingItem) {
      throw new NotFoundError('ShoppingListItem', id);
    }

    const updatedItem: ShoppingListItem = {
      ...existingItem,
      checked,
    };

    this.data.set(id, updatedItem);
    return Promise.resolve({ ...updatedItem });
  }

  /**
   * チェック状態別の買い物リストアイテムを取得
   */
  async findByChecked(userId: string, checked: boolean): Promise<ShoppingListItem[]> {
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.checked === checked
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return Promise.resolve(items);
  }

  /**
   * 追加方法別の買い物リストアイテムを取得
   */
  async findByAddedFrom(userId: string, addedFrom: 'manual' | 'auto'): Promise<ShoppingListItem[]> {
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.added_from === addedFrom
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return Promise.resolve(items);
  }

  /**
   * 食材名で買い物リストアイテムを検索（部分一致）
   */
  async findByName(userId: string, name: string): Promise<ShoppingListItem[]> {
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
   * 完了済みアイテムを一括削除
   */
  async deleteCompleted(userId: string): Promise<number> {
    const toDelete = Array.from(this.data.entries())
      .filter(([_, item]) => item.user_id === userId && item.checked === true);
    
    toDelete.forEach(([id, _]) => this.data.delete(id));
    
    return Promise.resolve(toDelete.length);
  }

  /**
   * 自動生成アイテムを一括削除
   */
  async deleteAutoGenerated(userId: string): Promise<number> {
    const toDelete = Array.from(this.data.entries())
      .filter(([_, item]) => item.user_id === userId && item.added_from === 'auto');
    
    toDelete.forEach(([id, _]) => this.data.delete(id));
    
    return Promise.resolve(toDelete.length);
  }

  /**
   * 複数アイテムを一括作成
   */
  async createMany(items: Omit<ShoppingListItem, 'id' | 'created_at'>[]): Promise<ShoppingListItem[]> {
    const createdItems: ShoppingListItem[] = [];
    
    for (const item of items) {
      const newItem: ShoppingListItem = {
        id: this.generateId(),
        user_id: item.user_id,
        name: item.name,
        checked: item.checked ?? false,
        added_from: item.added_from || 'manual',
        created_at: this.getCurrentTimestamp(),
      };
      
      this.data.set(newItem.id, newItem);
      createdItems.push({ ...newItem });
    }
    
    return Promise.resolve(createdItems);
  }
}