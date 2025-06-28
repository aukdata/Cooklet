import { type MealPlan, type MealType } from '../../types';

/**
 * 献立管理用Repositoryインターフェース
 * 
 * 献立データのCRUD操作と期間検索機能を提供します。
 * テスト時のモック化とSupabase実装の抽象化を目的としています。
 */
export interface IMealPlanRepository {
  /**
   * 指定ユーザーの全献立計画を取得
   * @param userId ユーザーID
   * @returns 献立計画配列
   */
  findAll(userId: string): Promise<MealPlan[]>;

  /**
   * IDで献立計画を取得
   * @param id 献立計画ID
   * @returns 献立計画（存在しない場合はnull）
   */
  findById(id: string): Promise<MealPlan | null>;

  /**
   * 指定期間の献立計画を取得
   * @param userId ユーザーID
   * @param startDate 開始日（YYYY-MM-DD）
   * @param endDate 終了日（YYYY-MM-DD）
   * @returns 期間内の献立計画配列
   */
  findByDateRange(userId: string, startDate: string, endDate: string): Promise<MealPlan[]>;

  /**
   * 指定日の献立計画を取得
   * @param userId ユーザーID
   * @param date 対象日（YYYY-MM-DD）
   * @returns 指定日の献立計画配列
   */
  findByDate(userId: string, date: string): Promise<MealPlan[]>;

  /**
   * 指定日・食事タイプの献立計画を取得
   * @param userId ユーザーID
   * @param date 対象日（YYYY-MM-DD）
   * @param mealType 食事タイプ
   * @returns 献立計画（存在しない場合はnull）
   */
  findByDateAndMealType(userId: string, date: string, mealType: MealType): Promise<MealPlan | null>;

  /**
   * 新しい献立計画を作成
   * @param item 作成する献立計画（IDと日時は自動生成）
   * @returns 作成された献立計画
   */
  create(item: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlan>;

  /**
   * 献立計画を更新
   * @param id 更新対象のID
   * @param updates 更新データ（部分更新可能）
   * @returns 更新後の献立計画
   */
  update(id: string, updates: Partial<MealPlan>): Promise<MealPlan>;

  /**
   * 献立計画を削除
   * @param id 削除対象のID
   */
  delete(id: string): Promise<void>;

  /**
   * 消費状態別の献立計画を取得
   * @param userId ユーザーID
   * @param status 消費状態
   * @returns 該当する献立計画配列
   */
  findByConsumedStatus(userId: string, status: 'pending' | 'completed' | 'stored'): Promise<MealPlan[]>;

  /**
   * 特定のレシピURLを使用している献立計画を取得
   * @param userId ユーザーID
   * @param recipeUrl レシピURL
   * @returns 該当する献立計画配列
   */
  findByRecipeUrl(userId: string, recipeUrl: string): Promise<MealPlan[]>;

  /**
   * 今週の献立計画を取得（日曜始まり）
   * @param userId ユーザーID
   * @returns 今週の献立計画配列
   */
  findCurrentWeek(userId: string): Promise<MealPlan[]>;
}