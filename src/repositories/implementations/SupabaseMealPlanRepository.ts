import { type SupabaseClient } from '@supabase/supabase-js';
import { type MealPlan, type MealType } from '../../types';
import { type IMealPlanRepository } from '../interfaces/IMealPlanRepository';
import { DatabaseError, NotFoundError, transformSupabaseError } from '../errors';

/**
 * Supabaseを使用した献立管理Repository実装
 * 
 * IMealPlanRepositoryインターフェースを実装し、
 * Supabaseデータベースとの実際のやり取りを行います。
 */
export class SupabaseMealPlanRepository implements IMealPlanRepository {
  private readonly tableName = 'meal_plans';

  constructor(private readonly client: SupabaseClient) {}

  /**
   * 指定ユーザーの全献立計画を取得
   */
  async findAll(userId: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('meal_type', { ascending: true });

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
   * IDで献立計画を取得
   */
  async findById(id: string): Promise<MealPlan | null> {
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
   * 指定期間の献立計画を取得
   */
  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('meal_type', { ascending: true });

      if (error) {
        throw transformSupabaseError(error, 'findByDateRange');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByDateRange');
    }
  }

  /**
   * 指定日の献立計画を取得
   */
  async findByDate(userId: string, date: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('meal_type', { ascending: true });

      if (error) {
        throw transformSupabaseError(error, 'findByDate');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByDate');
    }
  }

  /**
   * 指定日・食事タイプの献立計画を取得
   */
  async findByDateAndMealType(userId: string, date: string, mealType: MealType): Promise<MealPlan | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .eq('meal_type', mealType)
        .single();

      if (error) {
        // レコードが見つからない場合はnullを返す
        if (error.code === 'PGRST116') {
          return null;
        }
        throw transformSupabaseError(error, 'findByDateAndMealType');
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByDateAndMealType');
    }
  }

  /**
   * 新しい献立計画を作成
   */
  async create(item: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlan> {
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
        throw new DatabaseError('Failed to create meal plan');
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'create');
    }
  }

  /**
   * 献立計画を更新
   */
  async update(id: string, updates: Partial<MealPlan>): Promise<MealPlan> {
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
        throw new NotFoundError('MealPlan', id);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'update');
    }
  }

  /**
   * 献立計画を削除
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
   * 消費状態別の献立計画を取得
   */
  async findByConsumedStatus(userId: string, status: 'pending' | 'completed' | 'stored'): Promise<MealPlan[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('consumed_status', status)
        .order('date', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findByConsumedStatus');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByConsumedStatus');
    }
  }

  /**
   * 特定のレシピURLを使用している献立計画を取得
   */
  async findByRecipeUrl(userId: string, recipeUrl: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_url', recipeUrl)
        .order('date', { ascending: false });

      if (error) {
        throw transformSupabaseError(error, 'findByRecipeUrl');
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findByRecipeUrl');
    }
  }

  /**
   * 今週の献立計画を取得（日曜始まり）
   */
  async findCurrentWeek(userId: string): Promise<MealPlan[]> {
    try {
      // 今週の日曜日と土曜日を計算
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];

      return this.findByDateRange(userId, startDate, endDate);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw transformSupabaseError(error, 'findCurrentWeek');
    }
  }
}