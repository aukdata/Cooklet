import React, { useState } from 'react';
import { useCostRecords, type CostRecord } from '../../hooks';
import { CostDialog } from '../../components/dialogs';
import { EditButton } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast.tsx';

// コスト管理画面コンポーネント - CLAUDE.md仕様書に準拠
export const Cost: React.FC = () => {
  const { showError } = useToast();

  // 現在の月を管理
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // 期間フィルタと検索の状態管理
  const [periodFilter, setPeriodFilter] = useState<'weekly' | 'monthly'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');

  // useCostRecordsフックを使用してデータを取得
  const { 
    costRecords, 
    loading, 
    error, 
    addCostRecord, 
    updateCostRecord,
    deleteCostRecord,
    getMonthlyStats, 
    getCurrentMonthStats 
  } = useCostRecords();

  // ダイアログの状態管理
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [editingCost, setEditingCost] = useState<CostRecord | null>(null);


  // 月の表示用フォーマット
  const monthString = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;

  // 現在の月間サマリーを取得
  const monthlySummary = getCurrentMonthStats();

  // 支出履歴を期間と検索でフィルタリング
  const costHistory = costRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      
      // 期間フィルタリング
      if (periodFilter === 'weekly') {
        // 過去7日間
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (recordDate < sevenDaysAgo || recordDate > today) {
          return false;
        }
      } else {
        // 月間フィルタ
        if (recordDate.getFullYear() !== currentMonth.getFullYear() || 
            recordDate.getMonth() !== currentMonth.getMonth()) {
          return false;
        }
      }
      
      // 検索フィルタリング
      if (searchQuery.trim() !== '') {
        return (record.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    })
    .slice(0, 20) // 表示件数を増やす
    .map(record => ({
      ...record,
      date: new Date(record.date).toLocaleDateString('ja-JP', { 
        month: 'numeric', 
        day: 'numeric' 
      })
    }));

  // 月別推移データ（過去3ヶ月）
  const monthlyTrend = [-2, -1, 0].map(offset => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + offset);
    const stats = getMonthlyStats(date.getFullYear(), date.getMonth() + 1);
    return {
      month: `${date.getMonth() + 1}月`,
      amount: stats.total,
      isCurrent: offset === 0
    };
  });

  // 月を変更する関数
  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  // 新規追加ダイアログを開く
  const handleAddCost = () => {
    setEditingCost(null);
    setShowAddDialog(true);
  };

  // コスト編集ボタンクリック処理
  const handleEditCost = (record: CostRecord) => {
    setEditingCost(record);
    setShowCostDialog(true);
  };

  // コスト保存処理（ダイアログから）
  const handleSaveCost = async (costData: CostRecord) => {
    try {
      if (editingCost?.id) {
        // 更新
        await updateCostRecord(editingCost.id, costData);
      } else {
        // 新規追加
        await addCostRecord(costData);
      }
      setShowCostDialog(false);
      setShowAddDialog(false);
      setEditingCost(null);
    } catch (err) {
      console.error('コスト記録の保存に失敗しました:', err);
      showError('保存に失敗しました');
    }
  };

  // コスト削除処理
  const handleDeleteCost = async () => {
    if (editingCost?.id) {
      try {
        await deleteCostRecord(editingCost.id);
        setShowCostDialog(false);
        setEditingCost(null);
      } catch (err) {
        console.error('コスト記録の削除に失敗しました:', err);
        showError('削除に失敗しました');
      }
    }
  };

  // ローディング・エラー状態の処理
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
           <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">💰</span>
            コスト管理
          </h2>
        </div>
      </div>

      {/* 月間ナビゲーション */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth('prev')}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="mr-1">‹</span>
          前月
        </button>
        
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-700">
            {monthString}
          </span>
        </div>
        
        <button
          onClick={() => changeMonth('next')}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          次月
          <span className="ml-1">›</span>
        </button>
      </div>

      {/* 月間サマリー */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          今月の支出
        </h3>

        <div className="space-y-3">
          {/* 自炊・外食の内訳 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">🏠</span>
                自炊:
              </span>
              <div className="text-right">
                <span className="text-sm font-medium">
                  ¥{monthlySummary.homeCooking.total.toLocaleString()} ({monthlySummary.homeCooking.count}回)
                </span>
                <div className="text-xs text-gray-500">
                  └ 1回平均: ¥{monthlySummary.homeCooking.average}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">🍽️</span>
                外食:
              </span>
              <div className="text-right">
                <span className="text-sm font-medium">
                  ¥{monthlySummary.eatingOut.total.toLocaleString()} ({monthlySummary.eatingOut.count}回)
                </span>
                <div className="text-xs text-gray-500">
                  └ 1回平均: ¥{monthlySummary.eatingOut.average}
                </div>
              </div>
            </div>
          </div>

          {/* 合計・平均 */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center">
                <span className="mr-1">💯</span>
                合計:
              </span>
              <span className="font-medium text-lg">
                ¥{monthlySummary.total.toLocaleString()} ({monthlySummary.homeCooking.count + monthlySummary.eatingOut.count}回)
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 flex items-center">
                <span className="mr-1">📈</span>
                1日平均:
              </span>
              <span className="font-medium">¥{monthlySummary.dailyAverage}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 flex items-center">
                <span className="mr-1">📈</span>
                1回平均:
              </span>
              <span className="font-medium">¥{monthlySummary.mealAverage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 新規記録 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">➕</span>
            新しい支出を記録
          </h3>
          <button
            onClick={handleAddCost}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            追加
          </button>
        </div>
      </div>

      {/* 支出履歴 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">📋</span>
            支出履歴
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPeriodFilter('weekly')}
              className={`text-xs px-2 py-1 rounded ${
                periodFilter === 'weekly' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              週間
            </button>
            <button 
              onClick={() => setPeriodFilter('monthly')}
              className={`text-xs px-2 py-1 rounded ${
                periodFilter === 'monthly' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              月間
            </button>
          </div>
        </div>

        {/* 検索フィールド */}
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 支出内容を検索..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        {/* 検索・フィルタ結果の件数表示 */}
        {(searchQuery.trim() !== '' || periodFilter === 'weekly') && (
          <div className="text-xs text-gray-500 mb-2">
            {periodFilter === 'weekly' ? '過去7日間' : '月間'}で
            {searchQuery.trim() !== '' && `「${searchQuery}」を含む`}
            {costHistory.length}件の支出が見つかりました
          </div>
        )}

        <div className="space-y-3">
          {costHistory.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {searchQuery.trim() !== '' ? '検索条件に一致する支出がありません' : '支出データがありません'}
            </div>
          ) : (
            costHistory.map((record) => (
              <div key={record.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        📅 {record.date}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="mr-1">
                        {record.is_eating_out ? '🍽️' : '🏠'}
                      </span>
                      <span className="text-gray-700">{record.description}</span>
                      <span className="ml-auto font-medium">
                        ¥{record.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <EditButton onClick={() => handleEditCost(record)} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 統計・分析 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📈</span>
          月別推移
        </h3>

        <div className="flex justify-between items-center text-sm">
          {monthlyTrend.map((month, index) => (
            <div key={index} className="text-center">
              <div className="text-gray-600">{month.month}:</div>
              <div className={`font-medium ${month.isCurrent ? 'text-indigo-600' : 'text-gray-900'}`}>
                ¥{month.amount.toLocaleString()}
                {month.isCurrent && <span className="text-xs text-gray-500 ml-1">(進行中)</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* コスト記録ダイアログ（編集用） */}
      {showCostDialog && (
        <CostDialog
          isOpen={showCostDialog}
          onClose={() => {
            setShowCostDialog(false);
            setEditingCost(null);
          }}
          onSave={handleSaveCost}
          onDelete={handleDeleteCost}
          initialData={editingCost || undefined}
          isEditing={!!editingCost?.id}
        />
      )}

      {/* コスト記録ダイアログ（新規追加用） */}
      {showAddDialog && (
        <CostDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={handleSaveCost}
          isEditing={false}
        />
      )}
    </div>
  );
};