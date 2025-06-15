import React, { useState } from 'react';
import { MealPlanEditDialog } from '../../components/dialogs/MealPlanEditDialog';
import { useMealPlans, type MealPlan } from '../../hooks';


// ダッシュボード画面コンポーネント - CLAUDE.md仕様書に準拠
export const Dashboard: React.FC = () => {
  // 現在の日付を取得
  const today = new Date();
  const todayString = today.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  });
  
  // ダイアログの状態管理
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ date: string; mealType: '朝' | '昼' | '夜' | '間食' } | null>(null);
  
  // 献立データの取得（Supabase連携）
  const { mealPlans, loading, error, saveMealPlan } = useMealPlans();

  // 今日の献立データを取得
  const getTodayMealPlan = (mealType: '朝' | '昼' | '夜') => {
    const todayStr = today.toISOString().split('T')[0];
    return mealPlans.find(plan => plan.date === todayStr && plan.meal_type === mealType);
  };
  
  // 献立追加ボタンクリック処理
  const handleAddMeal = (mealType: '朝' | '昼' | '夜') => {
    const dateStr = today.toISOString().split('T')[0];
    setEditingMeal({ date: dateStr, mealType });
    setIsDialogOpen(true);
  };

  // 献立編集ボタンクリック処理
  const handleEditMeal = (mealPlan: MealPlan) => {
    setEditingMeal({ date: mealPlan.date, mealType: mealPlan.meal_type });
    setIsDialogOpen(true);
  };

  // 献立保存処理（Supabase連携）
  const handleSaveMeal = async (newMealPlan: MealPlan) => {
    try {
      await saveMealPlan(newMealPlan);
    } catch (err) {
      console.error('献立の保存に失敗しました:', err);
      // TODO: エラートースト表示
    }
  };

  // ダイアログを閉じる処理
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMeal(null);
  };

  const stockAlerts = {
    expired: [
      { name: 'にんじん', expiry: '6/13' },
      { name: '牛乳', expiry: '6/14' }
    ],
    expiringSoon: [
      { name: 'たまご', expiry: '6/16' },
      { name: 'ヨーグルト', expiry: '6/16' }
    ]
  };

  const monthlyCosts = {
    cooking: { amount: 3200, count: 12 },
    eating_out: { amount: 2100, count: 3 },
    total: 5300,
    dailyAverage: 353
  };

  return (
    <div className="p-4">
      {/* ヘッダーセクション */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="mr-2">📊</span>
          ダッシュボード
        </h2>
        <button className="text-gray-400 hover:text-gray-600">
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      {/* 今日の献立セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📅</span>
          今日の献立 ({todayString})
          {loading && <span className="ml-2 text-sm text-gray-500">読み込み中...</span>}
          {error && <span className="ml-2 text-sm text-red-500">エラー: {error}</span>}
        </h3>
        
        <div className="space-y-3">
          {/* 朝食 */}
          <div className="border-b border-gray-100 pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="mr-2">🌅</span>
                  <span className="font-medium">朝食:</span>
                  <span className="ml-2">
                    {getTodayMealPlan('朝')?.memo || '未設定'}
                  </span>
                </div>
                {getTodayMealPlan('朝') && (
                  <div className="ml-6 text-sm text-gray-600">
                    材料: {getTodayMealPlan('朝')!.ingredients.map(ing => ing.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {getTodayMealPlan('朝')?.recipe_url && (
                  <button 
                    onClick={() => window.open(getTodayMealPlan('朝')!.recipe_url, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    🌐 レシピを見る
                  </button>
                )}
                <button 
                  onClick={() => {
                    const plan = getTodayMealPlan('朝');
                    plan ? handleEditMeal(plan) : handleAddMeal('朝');
                  }}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {getTodayMealPlan('朝') ? '編集' : '+ 追加'}
                </button>
              </div>
            </div>
          </div>

          {/* 昼食 */}
          <div className="border-b border-gray-100 pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="mr-2">🌞</span>
                  <span className="font-medium">昼食:</span>
                  <span className="ml-2">
                    {getTodayMealPlan('昼')?.memo || '［未設定］'}
                  </span>
                </div>
                {getTodayMealPlan('昼') && (
                  <div className="ml-6 text-sm text-gray-600">
                    材料: {getTodayMealPlan('昼')!.ingredients.map(ing => ing.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {getTodayMealPlan('昼')?.recipe_url && (
                  <button 
                    onClick={() => window.open(getTodayMealPlan('昼')!.recipe_url, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    🌐 レシピを見る
                  </button>
                )}
                <button 
                  onClick={() => {
                    const plan = getTodayMealPlan('昼');
                    plan ? handleEditMeal(plan) : handleAddMeal('昼');
                  }}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {getTodayMealPlan('昼') ? '編集' : '+ 追加'}
                </button>
              </div>
            </div>
          </div>

          {/* 夕食 */}
          <div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="mr-2">🌙</span>
                  <span className="font-medium">夕食:</span>
                  <span className="ml-2">
                    {getTodayMealPlan('夜')?.memo || '［未設定］'}
                  </span>
                </div>
                {getTodayMealPlan('夜') && (
                  <div className="ml-6 text-sm text-gray-600">
                    材料: {getTodayMealPlan('夜')!.ingredients.map(ing => ing.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {getTodayMealPlan('夜')?.recipe_url && (
                  <button 
                    onClick={() => window.open(getTodayMealPlan('夜')!.recipe_url, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    🌐 レシピを見る
                  </button>
                )}
                <button 
                  onClick={() => {
                    const plan = getTodayMealPlan('夜');
                    plan ? handleEditMeal(plan) : handleAddMeal('夜');
                  }}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {getTodayMealPlan('夜') ? '編集' : '+ 追加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 在庫アラートセクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">⚠️</span>
          在庫アラート
        </h3>
        
        <div className="space-y-3">
          {/* 賞味期限切れ */}
          {stockAlerts.expired.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                <span className="mr-1">🔴</span>
                賞味期限切れ
              </h4>
              <div className="ml-4 space-y-1">
                {stockAlerts.expired.map((item, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    • {item.name} ({item.expiry}期限)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 期限間近 */}
          {stockAlerts.expiringSoon.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-600 mb-2 flex items-center">
                <span className="mr-1">🟡</span>
                明日まで
              </h4>
              <div className="ml-4 space-y-1">
                {stockAlerts.expiringSoon.map((item, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    • {item.name} ({item.expiry}期限)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 今月の出費セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💰</span>
          今月の出費 (6月)
        </h3>
        
        <div className="space-y-3">
          {/* 自炊・外食の内訳 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">🏠</span>
                自炊:
              </span>
              <span className="text-sm font-medium">
                ¥{monthlyCosts.cooking.amount.toLocaleString()} ({monthlyCosts.cooking.count}回)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">🍽️</span>
                外食:
              </span>
              <span className="text-sm font-medium">
                ¥{monthlyCosts.eating_out.amount.toLocaleString()} ({monthlyCosts.eating_out.count}回)
              </span>
            </div>
          </div>

          {/* 合計・平均 */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center">
                <span className="mr-1">📊</span>
                合計:
              </span>
              <span className="font-medium text-lg">
                ¥{monthlyCosts.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">📈</span>
                1日平均:
              </span>
              <span className="text-sm font-medium">
                ¥{monthlyCosts.dailyAverage}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 献立編集ダイアログ */}
      <MealPlanEditDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveMeal}
        selectedDate={editingMeal?.date || today.toISOString().split('T')[0]}
        selectedMealType={editingMeal?.mealType || '夜'}
        initialData={editingMeal ? 
          mealPlans.find(plan => 
            plan.date === editingMeal.date && 
            plan.meal_type === editingMeal.mealType
          ) : undefined
        }
      />
    </div>
  );
};