import React, { useState } from 'react';

// コスト管理画面コンポーネント - CLAUDE.md仕様書に準拠
export const Cost: React.FC = () => {
  // 現在の月を管理
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);

  // 新規記録用の状態
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    is_eating_out: false
  });

  // 月の表示用フォーマット
  const monthString = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;

  // サンプルの月間サマリーデータ
  const monthlySummary = {
    cooking: { amount: 3200, count: 12, average: 267 },
    eating_out: { amount: 2100, count: 3, average: 700 },
    total: { amount: 5300, count: 15, average: 353, dailyAverage: 353 }
  };

  // サンプルの支出履歴データ
  const costHistory = [
    { id: '1', date: '6/15', description: '朝食 - トースト', amount: 120, is_eating_out: false },
    { id: '2', date: '6/14', description: '夕食 - 居酒屋', amount: 1500, is_eating_out: true },
    { id: '3', date: '6/14', description: '昼食 - 自作弁当', amount: 200, is_eating_out: false },
    { id: '4', date: '6/13', description: '夕食 - ハンバーグ', amount: 350, is_eating_out: false },
    { id: '5', date: '6/13', description: '昼食 - パスタ', amount: 180, is_eating_out: false }
  ];

  // 月別推移データ
  const monthlyTrend = [
    { month: '4月', amount: 4800 },
    { month: '5月', amount: 5100 },
    { month: '6月', amount: 5300, isCurrent: true }
  ];

  // 月を変更する関数
  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  // 新規記録を保存する関数（今後API実装）
  const handleSaveRecord = () => {
    // TODO: API連携実装
    console.log('新規記録保存:', newRecord);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      is_eating_out: false
    });
    setShowAddForm(false);
  };

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => changeMonth('prev')}
            className="p-1 text-gray-600 hover:text-gray-800 mr-2"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">💰</span>
            コスト管理
          </h2>
          <button 
            onClick={() => changeMonth('next')}
            className="p-1 text-gray-600 hover:text-gray-800 ml-2"
          >
            →
          </button>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      {/* 月表示 */}
      <div className="text-center mb-4">
        <span className="text-gray-600">＜ {monthString} ＞</span>
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
                  ¥{monthlySummary.cooking.amount.toLocaleString()} ({monthlySummary.cooking.count}回)
                </span>
                <div className="text-xs text-gray-500">
                  └ 1回平均: ¥{monthlySummary.cooking.average}
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
                  ¥{monthlySummary.eating_out.amount.toLocaleString()} ({monthlySummary.eating_out.count}回)
                </span>
                <div className="text-xs text-gray-500">
                  └ 1回平均: ¥{monthlySummary.eating_out.average}
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
                ¥{monthlySummary.total.amount.toLocaleString()} ({monthlySummary.total.count}回)
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 flex items-center">
                <span className="mr-1">📈</span>
                1日平均:
              </span>
              <span className="font-medium">¥{monthlySummary.total.dailyAverage}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 flex items-center">
                <span className="mr-1">📈</span>
                1回平均:
              </span>
              <span className="font-medium">¥{monthlySummary.total.average}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 新規記録 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">➕</span>
            新しい支出を記録
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {showAddForm ? '閉じる' : '追加'}
          </button>
        </div>

        {showAddForm && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付:
                </label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金額:
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="金額"
                    className="flex-1 border border-gray-300 rounded-l px-2 py-1 text-sm"
                  />
                  <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r px-2 py-1 text-sm text-gray-600">
                    円
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容:
              </label>
              <input
                type="text"
                value={newRecord.description}
                onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                placeholder="昼食 - 牛丼"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="meal_type"
                  checked={!newRecord.is_eating_out}
                  onChange={() => setNewRecord(prev => ({ ...prev, is_eating_out: false }))}
                  className="mr-2"
                />
                <span className="text-sm flex items-center">
                  <span className="mr-1">🏠</span>自炊
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="meal_type"
                  checked={newRecord.is_eating_out}
                  onChange={() => setNewRecord(prev => ({ ...prev, is_eating_out: true }))}
                  className="mr-2"
                />
                <span className="text-sm flex items-center">
                  <span className="mr-1">🍽️</span>外食
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveRecord}
                className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
              >
                保存
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 支出履歴 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">📋</span>
            支出履歴
          </h3>
          <div className="flex space-x-2">
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
              週間
            </button>
            <button className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              月間
            </button>
            <button className="text-xs text-gray-500 hover:text-gray-700">
              🔍 検索...
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {costHistory.map((record) => (
            <div key={record.id} className="border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      📅 {record.date}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({record.date === '6/15' ? '今日' : ''})
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
                <div className="flex space-x-2 ml-3">
                  <button className="text-xs text-gray-500 hover:text-gray-700">
                    編集
                  </button>
                  <button className="text-xs text-gray-500 hover:text-red-600">
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
};