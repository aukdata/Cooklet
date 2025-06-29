import { useMealPlans } from '../../hooks';
import { useStockItems } from '../../hooks/useStockItems';
import { useToast } from '../../hooks/useToast.tsx';
import { type MealPlan, type MealType } from '../../types';
import { type MealGenerationResult } from '../../utils/mealPlanGeneration';

// 献立操作フックの戻り値型
export interface MealPlansActionsReturn {
  // データ
  mealPlans: MealPlan[];
  loading: boolean;
  error: string | null;
  
  // 操作関数
  handleSaveMeal: (mealPlan: MealPlan) => Promise<void>;
  handleDeleteMeal: (editingMeal: { date: string; mealType: string } | null) => Promise<void>;
  handleConsumedConfirm: (meal: MealPlan, isConsumed: boolean, isStored?: boolean) => Promise<void>;
  handleGenerationConfirm: (result: MealGenerationResult) => Promise<void>;
  
  // ヘルパー関数
  getMealPlansForDate: (date: Date) => MealPlan[];
  getMealPlan: (date: Date, mealType: string) => MealPlan | null;
}

// 献立操作機能を提供するカスタムフック
export const useMealPlansActions = (): MealPlansActionsReturn => {
  const { showSuccess, showError } = useToast();
  
  // データ取得フック
  const { 
    mealPlans, 
    loading, 
    error, 
    saveMealPlan, 
    deleteMealPlan, 
    updateMealPlanStatus,
    getMealPlansForDate,
    getMealPlan
  } = useMealPlans();
  
  const { addStockItem } = useStockItems();

  // 献立保存処理
  const handleSaveMeal = async (newMealPlan: MealPlan): Promise<void> => {
    try {
      await saveMealPlan(newMealPlan);
      showSuccess('献立を保存しました');
    } catch (err) {
      console.error('献立の保存に失敗しました:', err);
      showError('献立の保存に失敗しました');
      throw err;
    }
  };

  // 献立削除処理
  const handleDeleteMeal = async (editingMeal: { date: string; mealType: string } | null): Promise<void> => {
    if (!editingMeal) return;
    
    try {
      const mealPlan = mealPlans.find(plan => 
        plan.date === editingMeal.date && 
        plan.meal_type === editingMeal.mealType
      );
      
      if (mealPlan?.id) {
        await deleteMealPlan(mealPlan.id);
        showSuccess('献立を削除しました');
      }
    } catch (err) {
      console.error('献立の削除に失敗しました:', err);
      showError('献立の削除に失敗しました');
      throw err;
    }
  };

  // 作った確認処理
  const handleConsumedConfirm = async (
    meal: MealPlan, 
    isConsumed: boolean, 
    isStored = false
  ): Promise<void> => {
    try {
      if (meal.id) {
        // 消費状態を更新
        const newStatus = isConsumed ? 'completed' : (isStored ? 'stored' : 'pending');
        await updateMealPlanStatus(meal.id, newStatus);
        
        if (isStored && meal.ingredients) {
          // 作り置きとして在庫に追加
          for (const ingredient of meal.ingredients) {
            const stockData = {
              name: `手作り料理（作り置き）`,
              quantity: ingredient.quantity || '1人前',
              unit: '人前',
              best_before: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3日後
              storage_location: '冷蔵庫',
              is_homemade: true
            };
            await addStockItem(stockData);
          }
          showSuccess('作り置きとして在庫に追加しました');
        } else if (isConsumed) {
          showSuccess('献立を「作った」にマークしました');
        }
      }
    } catch (err) {
      console.error('消費状態の更新に失敗しました:', err);
      showError('消費状態の更新に失敗しました');
      throw err;
    }
  };

  // 自動生成結果確認処理
  const handleGenerationConfirm = async (result: MealGenerationResult): Promise<void> => {
    try {
      if (result.mealPlan) {
        // 生成された献立を一括保存
        for (const _mealPlanItem of result.mealPlan) {
          // MealPlanItemをMealPlanに変換して保存
          const mealPlan: MealPlan = {
            id: '', // 新規作成時は空
            user_id: '', // 実際の実装では認証済みユーザーIDを設定
            date: new Date().toISOString().split('T')[0], // 今日の日付
            meal_type: '夜' as MealType, // デフォルトの食事タイプ
            recipe_url: undefined,
            ingredients: [],
            memo: undefined,
            consumed_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          await saveMealPlan(mealPlan);
        }
        showSuccess(`${result.mealPlan.length}件の献立を保存しました`);
      }
    } catch (err) {
      console.error('生成献立の保存に失敗しました:', err);
      showError('生成献立の保存に失敗しました');
      throw err;
    }
  };

  return {
    // データ
    mealPlans,
    loading,
    error,
    
    // 操作関数
    handleSaveMeal,
    handleDeleteMeal,
    handleConsumedConfirm,
    handleGenerationConfirm,
    
    // ヘルパー関数
    getMealPlansForDate,
    getMealPlan: (date: Date, mealType: string) => getMealPlan(date, mealType as MealType) || null
  };
};
