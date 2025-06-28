import { type SupabaseClient } from '@supabase/supabase-js';
import { type ShoppingListItem } from '../../types';
import { type IShoppingListRepository } from '../interfaces/IShoppingListRepository';
import { DatabaseError, NotFoundError, transformSupabaseError } from '../errors';

/**
 * Supabaseを使用した買い物リスト管理Repository実装
 * 
 * IShoppingListRepositoryインターフェースを実装し、
 * Supabaseデータベースとの実際のやり取りを行います。
 */
export class SupabaseShoppingListRepository implements IShoppingListRepository {
  private readonly tableName = 'shopping_list';

  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * 指定ユーザーの全買い物リストアイテムを取得
   */
  async findAll(userId: string): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findAll');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findAll');
    }
  }

  /**
   * IDで買い物リストアイテムを取得
   */
  async findById(id: string): Promise<ShoppingListItem | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // レコードが見つからない場合はnullを返す
        if (error.code === 'PGRST116') {
          return null;
        }
        throw transformSupabaseError(error, 'findById');
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findById');
    }
  }

  /**
   * 新しい買い物リストアイテムを作成
   */
  async create(item: Omit<ShoppingListItem, 'id' | 'created_at'>): Promise<ShoppingListItem> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .insert(item)
        .select()
        .single();

      if (error) {
        throw transformSupabaseError(error, 'create');
      }

      if (!data) {
        throw new DatabaseError('Failed to create shopping list item');
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'create');
    }
  }

  /**
   * 買い物リストアイテムを更新
   */
  async update(id: string, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw transformSupabaseError(error, 'update');
      }

      if (!data) {
        throw new NotFoundError('ShoppingListItem', id);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'update');
    }
  }

  /**
   * 買い物リストアイテムを削除
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw transformSupabaseError(error, 'delete');
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'delete');
    }
  }

  /**
   * アイテムのチェック状態を切り替え
   */
  async toggleCheck(id: string, checked: boolean): Promise<ShoppingListItem> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update({ checked })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw transformSupabaseError(error, 'toggleCheck');
      }

      if (!data) {
        throw new NotFoundError('ShoppingListItem', id);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'toggleCheck');
    }
  }

  /**
   * チェック状態別の買い物リストアイテムを取得
   */
  async findByChecked(userId: string, checked: boolean): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('checked', checked)
        .order('created_at', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findByChecked');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByChecked');
    }
  }

  /**
   * 追加方法別の買い物リストアイテムを取得
   */
  async findByAddedFrom(userId: string, addedFrom: 'manual' | 'auto'): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('added_from', addedFrom)
        .order('created_at', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findByAddedFrom');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByAddedFrom');
    }
  }

  /**
   * 食材名で買い物リストアイテムを検索（部分一致）
   */
  async findByName(userId: string, name: string): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${name}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findByName');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByName');
    }
  }

  /**
   * 完了済みアイテムを一括削除
   */
  async deleteCompleted(userId: string): Promise<number> {
    try {
      const { count, error } = await this.client
        .from(this.tableName)
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .eq('checked', true);

      if (error) {
        throw transformSupabaseError(error, 'deleteCompleted');
      }

      return count || 0;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'deleteCompleted');
    }
  }

  /**
   * 自動生成アイテムを一括削除
   */
  async deleteAutoGenerated(userId: string): Promise<number> {
    try {
      const { count, error } = await this.client
        .from(this.tableName)
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .eq('added_from', 'auto');

      if (error) {
        throw transformSupabaseError(error, 'deleteAutoGenerated');
      }

      return count || 0;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'deleteAutoGenerated');
    }
  }

  /**
   * 複数アイテムを一括作成
   */
  async createMany(items: Omit<ShoppingListItem, 'id' | 'created_at'>[]): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .insert(items)
        .select();

      if (error) {
        throw transformSupabaseError(error, 'createMany');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'createMany');
    }
  }
}