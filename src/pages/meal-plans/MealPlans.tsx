import React, { useState } from 'react';
import { MealPlanEditDialog } from '../../components/dialogs/MealPlanEditDialog';
import { useMealPlans, type MealPlan } from '../../hooks';


// カレンダー画面コンポーネント - 週間表示・献立追加機能付き
export const MealPlans: React.FC = () => {
  // 選択された日付（今日がデフォルト）
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 現在表示している週の開始日（今日基準）
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    // 今日を開始日として設定
    return today;
  });
  
  // ダイアログの表示状態
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ date: string; mealType: '朝' | '昼' | '夜' | '間食' } | null>(null);

  // 指定した週の開始日から7日分の日付を取得
  const getWeekDates = (weekStart: Date) => {
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 先週に移動
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  // 来週に移動
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  // 今日を基準にした週に戻る
  const goToThisWeek = () => {
    const today = new Date();
    setCurrentWeekStart(today);
  };

  const weekDates = getWeekDates(currentWeekStart);
  const today = new Date();

  // 献立データの取得（Supabase連携）
  const { mealPlans, loading, error, saveMealPlan, getMealPlansForDate, getMealPlan } = useMealPlans();

  // 週の範囲を表示用にフォーマット
  const weekRange = `${weekDates[0].getMonth() + 1}/${weekDates[0].getDate()} - ${weekDates[6].getMonth() + 1}/${weekDates[6].getDate()}`;
  
  // 今日を基準とした週かどうかを判定
  const isCurrentWeek = () => {
    const today = new Date();
    return currentWeekStart.toDateString() === today.toDateString();
  };


  // 献立追加ボタンクリック処理
  const handleAddMeal = (date: Date, mealType: '朝' | '昼' | '夜' | '間食') => {
    const dateStr = date.toISOString().split('T')[0];
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

  // 週間サマリーデータ
  const weeklySummary = {
    cooking: mealPlans.length,
    eating_out: 2,
    budget: 1200
  };

  // 日付選択ハンドラ
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // 日付が今日かどうかチェック
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📅</span>
            献立カレンダー
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            {weekRange}
            {loading && <span className="ml-2">読み込み中...</span>}
            {error && <span className="ml-2 text-red-500">エラー: {error}</span>}
          </div>
        </div>
      </div>

      {/* 週間ナビゲーション */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousWeek}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="mr-1">‹</span>
          前週
        </button>
        
        <div className="flex items-center space-x-2">
          {!isCurrentWeek() && (
            <button
              onClick={goToThisWeek}
              className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              今日
            </button>
          )}
          <span className="text-sm text-gray-500">
            {isCurrentWeek() ? '今日' : ''}
          </span>
        </div>
        
        <button
          onClick={goToNextWeek}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          次週
          <span className="ml-1">›</span>
        </button>
      </div>

      {/* カレンダービュー */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        {/* 日付と食事アイコン */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const dayMeals = getMealPlansForDate(date);
            const mealCount = dayMeals.length;
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            // 曜日を取得
            const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
            
            return (
              <button
                key={date.toDateString()}
                onClick={() => handleDateSelect(date)}
                className={`p-2 text-center rounded border transition-colors ${
                  isSelected 
                    ? 'bg-indigo-100 border-indigo-300' 
                    : 'border-gray-200 hover:bg-gray-50'
                } ${isToday(date) ? 'ring-2 ring-blue-300' : ''}`}
              >
                <div className="text-xs text-gray-500 mb-1">{dayOfWeek}</div>
                <div className={`font-medium ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
                <div className="flex justify-center mt-1">
                  {mealCount > 0 ? (
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 選択日の詳細 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📅</span>
          {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          {isToday(selectedDate) && ' (今日)'}
        </h3>

        <div className="space-y-3">
          {/* 朝食 */}
          {(() => {
            const breakfastPlan = getMealPlan(selectedDate, '朝');
            return (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="mr-2">🌅</span>
                    <span className="font-medium">朝食:</span>
                    <span className="ml-2">
                      {breakfastPlan ? (breakfastPlan.memo || '朝食メニュー') : '［未設定］'}
                    </span>
                  </div>
                  {breakfastPlan && (
                    <div className="ml-6 text-sm text-gray-600">
                      📋 材料: {breakfastPlan.ingredients.map(ing => ing.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {breakfastPlan?.recipe_url && (
                    <button 
                      onClick={() => window.open(breakfastPlan.recipe_url, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      🌐 レシピを見る
                    </button>
                  )}
                  <button 
                    onClick={() => breakfastPlan ? handleEditMeal(breakfastPlan) : handleAddMeal(selectedDate, '朝')}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {breakfastPlan ? '編集' : '+ 追加'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 昼食 */}
          {(() => {
            const lunchPlan = getMealPlan(selectedDate, '昼');
            return (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="mr-2">🌞</span>
                    <span className="font-medium">昼食:</span>
                    <span className="ml-2">
                      {lunchPlan ? (lunchPlan.memo || '昼食メニュー') : '［未設定］'}
                    </span>
                  </div>
                  {lunchPlan && (
                    <div className="ml-6 text-sm text-gray-600">
                      📋 材料: {lunchPlan.ingredients.map(ing => ing.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {lunchPlan?.recipe_url && (
                    <button 
                      onClick={() => window.open(lunchPlan.recipe_url, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      🌐 レシピを見る
                    </button>
                  )}
                  <button 
                    onClick={() => lunchPlan ? handleEditMeal(lunchPlan) : handleAddMeal(selectedDate, '昼')}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {lunchPlan ? '編集' : '+ 追加'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 夕食 */}
          {(() => {
            const dinnerPlan = getMealPlan(selectedDate, '夜');
            return (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="mr-2">🌙</span>
                    <span className="font-medium">夕食:</span>
                    <span className="ml-2">
                      {dinnerPlan ? (dinnerPlan.memo || '夕食メニュー') : '［未設定］'}
                    </span>
                  </div>
                  {dinnerPlan && (
                    <div className="ml-6 text-sm text-gray-600">
                      📋 材料: {dinnerPlan.ingredients.map(ing => ing.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {dinnerPlan?.recipe_url && (
                    <button 
                      onClick={() => window.open(dinnerPlan.recipe_url, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      🌐 レシピを見る
                    </button>
                  )}
                  <button 
                    onClick={() => dinnerPlan ? handleEditMeal(dinnerPlan) : handleAddMeal(selectedDate, '夜')}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {dinnerPlan ? '編集' : '+ 追加'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 週間サマリー */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          今週の予定 ({weekRange})
        </h3>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="mr-1">🏠</span>
              自炊: {weeklySummary.cooking}回
            </span>
            <span className="flex items-center">
              <span className="mr-1">🍽️</span>
              外食: {weeklySummary.eating_out}回
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">💰</span>
            予算: ¥{weeklySummary.budget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 献立の提案ボタン */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          献立の提案
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            在庫の食材や栄養バランスを考慮した献立を提案します
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => alert('献立の提案機能は今後実装予定です')}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              💡 今日の献立を提案
            </button>
            <button 
              onClick={() => alert('週間提案機能は今後実装予定です')}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              📅 週間献立を提案
            </button>
          </div>
        </div>
      </div>

      {/* 献立編集ダイアログ */}
      <MealPlanEditDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveMeal}
        selectedDate={editingMeal?.date || selectedDate.toISOString().split('T')[0]}
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