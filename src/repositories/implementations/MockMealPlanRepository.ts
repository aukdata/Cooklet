import { type MealPlan, type MealType } from '../../types';
import { type IMealPlanRepository } from '../interfaces/IMealPlanRepository';
import { NotFoundError } from '../errors';

/**
 * テスト用の献立管理Repository実装
 * 
 * IMealPlanRepositoryインターフェースを実装し、
 * メモリ内でのデータ管理を行います。テスト時のモックとして使用します。
 */
export class MockMealPlanRepository implements IMealPlanRepository {
  private data: Map<string, MealPlan> = new Map();
  private idCounter: number = 1;

  /**
   * モックデータを設定（テスト用）
   * @param items 設定する献立計画配列
   */
  setMockData(items: MealPlan[]): void {
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
   * 指定ユーザーの全献立計画を取得
   */
  async findAll(userId: string): Promise<MealPlan[]> {
    const items = Array.from(this.data.values())
      .filter(item => item.user_id === userId)
      .sort((a, b) => {
        // 日付順、その次に食事タイプ順でソート
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        
        const mealOrder = { '朝': 0, '昼': 1, '夜': 2, '間食': 3 };
        return (mealOrder[a.meal_type] || 4) - (mealOrder[b.meal_type] || 4);
      });
    
    return Promise.resolve(items);
  }

  /**
   * IDで献立計画を取得
   */
  async findById(id: string): Promise<MealPlan | null> {
    const item = this.data.get(id);
    return Promise.resolve(item ? { ...item } : null);
  }

  /**
   * 指定期間の献立計画を取得
   */
  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<MealPlan[]> {
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.date >= startDate &&
        item.date <= endDate
      )
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        
        const mealOrder = { '朝': 0, '昼': 1, '夜': 2, '間食': 3 };
        return (mealOrder[a.meal_type] || 4) - (mealOrder[b.meal_type] || 4);
      });

    return Promise.resolve(items);
  }

  /**
   * 指定日の献立計画を取得
   */
  async findByDate(userId: string, date: string): Promise<MealPlan[]> {
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.date === date
      )
      .sort((a, b) => {
        const mealOrder = { '朝': 0, '昼': 1, '夜': 2, '間食': 3 };
        return (mealOrder[a.meal_type] || 4) - (mealOrder[b.meal_type] || 4);
      });

    return Promise.resolve(items);
  }

  /**
   * 指定日・食事タイプの献立計画を取得
   */
  async findByDateAndMealType(userId: string, date: string, mealType: MealType): Promise<MealPlan | null> {
    const item = Array.from(this.data.values())
      .find(item => 
        item.user_id === userId &&
        item.date === date &&
        item.meal_type === mealType
      );

    return Promise.resolve(item ? { ...item } : null);
  }

  /**
   * 新しい献立計画を作成
   */
  async create(item: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlan> {
    const now = this.getCurrentTimestamp();
    const newItem: MealPlan = {
      ...item,
      id: this.generateId(),
      created_at: now,
      updated_at: now,
    };
    
    this.data.set(newItem.id, newItem);
    return Promise.resolve({ ...newItem });
  }

  /**
   * 献立計画を更新
   */
  async update(id: string, updates: Partial<MealPlan>): Promise<MealPlan> {
    const existingItem = this.data.get(id);
    if (!existingItem) {
      throw new NotFoundError('MealPlan', id);
    }

    const updatedItem: MealPlan = {
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
   * 献立計画を削除
   */
  async delete(id: string): Promise<void> {
    if (!this.data.has(id)) {
      throw new NotFoundError('MealPlan', id);
    }
    
    this.data.delete(id);
    return Promise.resolve();
  }

  /**
   * 消費状態別の献立計画を取得
   */
  async findByConsumedStatus(userId: string, status: 'pending' | 'completed' | 'stored'): Promise<MealPlan[]> {
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.consumed_status === status
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    return Promise.resolve(items);
  }

  /**
   * 特定のレシピURLを使用している献立計画を取得
   */
  async findByRecipeUrl(userId: string, recipeUrl: string): Promise<MealPlan[]> {
    const items = Array.from(this.data.values())
      .filter(item => 
        item.user_id === userId &&
        item.recipe_url === recipeUrl
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    return Promise.resolve(items);
  }

  /**
   * 今週の献立計画を取得（日曜始まり）
   */
  async findCurrentWeek(userId: string): Promise<MealPlan[]> {
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
  }
}