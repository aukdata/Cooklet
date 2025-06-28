import { type SupabaseClient } from '@supabase/supabase-js';
import { type StockItem } from '../../types';
import { type IStockRepository } from '../interfaces/IStockRepository';
import { DatabaseError, NotFoundError, transformSupabaseError } from '../errors';

/**
 * Supabaseを使用した在庫管理Repository実装
 * 
 * IStockRepositoryインターフェースを実装し、
 * Supabaseデータベースとの実際のやり取りを行います。
 */
export class SupabaseStockRepository implements IStockRepository {
  private readonly tableName = 'stock_items';

  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * 指定ユーザーの全在庫アイテムを取得
   */
  async findAll(userId: string): Promise<StockItem[]> {
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
   * IDで在庫アイテムを取得
   */
  async findById(id: string): Promise<StockItem | null> {
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
   * 新しい在庫アイテムを作成
   */
  async create(item: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>): Promise<StockItem> {
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
        throw new DatabaseError('Failed to create stock item');
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'create');
    }
  }

  /**
   * 在庫アイテムを更新
   */
  async update(id: string, updates: Partial<StockItem>): Promise<StockItem> {
    try {
      // updated_atを現在時刻に設定
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw transformSupabaseError(error, 'update');
      }

      if (!data) {
        throw new NotFoundError('StockItem', id);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'update');
    }
  }

  /**
   * 在庫アイテムを削除
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
   * 期限が近い在庫アイテムを取得
   */
  async findExpiringSoon(userId: string, days: number): Promise<StockItem[]> {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateString = targetDate.toISOString().split('T')[0];

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .not('best_before', 'is', null)
        .lte('best_before', targetDateString)
        .gte('best_before', new Date().toISOString().split('T')[0])
        .order('best_before', { ascending: true });

      if (error) {
        throw transformSupabaseError(error, 'findExpiringSoon');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findExpiringSoon');
    }
  }

  /**
   * 期限切れの在庫アイテムを取得
   */
  async findExpired(userId: string): Promise<StockItem[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .not('best_before', 'is', null)
        .lt('best_before', today)
        .order('best_before', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findExpired');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findExpired');
    }
  }

  /**
   * 食材名で在庫を検索（部分一致）
   */
  async findByName(userId: string, name: string): Promise<StockItem[]> {
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
   * 作り置きアイテムのみを取得
   */
  async findHomemade(userId: string): Promise<StockItem[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('is_homemade', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findHomemade');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findHomemade');
    }
  }
}