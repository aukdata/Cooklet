import React, { useState, useEffect } from 'react';
import { useShoppingList, useMealPlans, useStockItems, useAutoShoppingList } from '../../hooks';
import { type StockItem } from '../../hooks/useStockItems';
import { QuantityInput } from '../../components/common/QuantityInput';
import { useToast } from '../../hooks/useToast.tsx';

// 買い物リスト画面コンポーネント - CLAUDE.md仕様書5.3に準拠
export const Shopping: React.FC = () => {
  const { showError, showSuccess, showInfo } = useToast();

  // useShoppingListフックを使用してデータを取得
  const {
    loading,
    error,
    addShoppingItem,
    toggleShoppingItem,
    getUncompletedItems,
    getCompletedItems,
    deleteCompletedItems,
    getStats
  } = useShoppingList();

  // 献立と在庫データを取得（自動作成機能用）
  const { mealPlans } = useMealPlans();
  const { stockItems, addStockItem } = useStockItems();

  // 自動生成フック
  const {
    generateShoppingList,
    previewShoppingList,
    isGenerating,
    lastResult,
    error: autoGenerationError
  } = useAutoShoppingList();

  // 新規追加フォームの状態
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  
  // 完了アイテムの表示状態（折りたたみ機能）
  const [showCompleted, setShowCompleted] = useState(false);
  
  // 完了アイテムの量編集状態
  const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({});


  // 全選択状態の管理
  const [selectAll, setSelectAll] = useState(false);

  // 統計情報を取得
  const stats = getStats();
  
  // 未完了・完了アイテムの分離
  const pendingItems = getUncompletedItems();
  const completedItems = getCompletedItems();

  // 全選択状態の自動更新
  useEffect(() => {
    const allItemsSelected = pendingItems.length > 0 && pendingItems.every(item => item.checked);
    setSelectAll(allItemsSelected);
  }, [pendingItems]);

  // 新規アイテム追加処理
  const handleAddItem = async () => {
    if (newItemName.trim()) {
      try {
        await addShoppingItem({
          name: newItemName.trim(),
          quantity: newItemQuantity.trim() || undefined,
          checked: false,
          added_from: 'manual'
        });
        setNewItemName('');
        setNewItemQuantity('');
      } catch (err) {
        console.error('買い物リストアイテムの追加に失敗しました:', err);
        showError('追加に失敗しました');
      }
    }
  };

  // アイテムチェック状態変更
  const handleToggleItem = async (id: string) => {
    try {
      await toggleShoppingItem(id);
    } catch (err) {
      console.error('チェック状態の変更に失敗しました:', err);
      showError('操作に失敗しました');
    }
  };

  // 全選択・全解除処理
  const handleSelectAll = async () => {
    try {
      if (selectAll) {
        // 現在全選択状態の場合は全解除
        const checkedItems = pendingItems.filter(item => item.checked);
        for (const item of checkedItems) {
          if (item.id) await toggleShoppingItem(item.id);
        }
      } else {
        // 現在未選択状態の場合は全選択
        const uncheckedItems = pendingItems.filter(item => !item.checked);
        for (const item of uncheckedItems) {
          if (item.id) await toggleShoppingItem(item.id);
        }
      }
    } catch (err) {
      console.error('全選択に失敗しました:', err);
      showError('操作に失敗しました');
    }
  };


  // 完了済みアイテムの量編集処理
  const handleQuantityEdit = (itemId: string, newQuantity: string) => {
    setEditingQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  // 完了済みアイテムを在庫に追加（ダイアログなしで直接追加）
  const handleAddToStock = async () => {
    const completedItems = getCompletedItems();
    if (completedItems.length === 0) {
      showInfo('完了したアイテムがありません');
      return;
    }
    
    try {
      // 各完了アイテムを在庫に追加
      for (const item of completedItems) {
        const quantity = editingQuantities[item.id!] || item.quantity || '1個';
        
        const stockData: StockItem = {
          name: item.name,
          quantity: quantity,
          best_before: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1週間後
          storage_location: '冷蔵庫',
          is_homemade: false
        };
        
        await addStockItem(stockData);
      }
      
      // 在庫追加後、完了アイテムを削除
      await deleteCompletedItems();
      
      // 編集中の量をクリア
      setEditingQuantities({});
      
      showSuccess(`${completedItems.length}件のアイテムを在庫に追加しました`);
    } catch (err) {
      console.error('在庫追加に失敗しました:', err);
      showError('在庫追加に失敗しました');
    }
  };


  // 今週の買い物リストを自動作成
  const handleGenerateWeeklyList = async () => {
    try {
      const result = await generateShoppingList(7);
      
      if (result.itemsAdded > 0) {
        showSuccess(`買い物リストを作成しました！\n追加されたアイテム: ${result.itemsAdded}件\nスキップされたアイテム: ${result.itemsSkipped}件`);
      } else {
        showInfo('追加する必要のある食材はありませんでした');
      }
    } catch (err) {
      console.error('買い物リスト作成に失敗しました:', err);
      showError('作成に失敗しました');
    }
  };

  // 次の3日分の買い物リストを自動作成
  const handleGenerateNext3Days = async () => {
    try {
      const result = await generateShoppingList(3);
      
      if (result.itemsAdded > 0) {
        showSuccess(`買い物リストを作成しました！\n追加されたアイテム: ${result.itemsAdded}件\nスキップされたアイテム: ${result.itemsSkipped}件`);
      } else {
        showInfo('追加する必要のある食材はありませんでした');
      }
    } catch (err) {
      console.error('買い物リスト作成に失敗しました:', err);
      showError('作成に失敗しました');
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
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🛒</span>
            買い物リスト
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            未完了: {stats.uncompleted}件  完了: {stats.completed}件
          </div>
        </div>
      </div>

      {/* 自動作成セクション */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">⚡</span>
          献立から自動追加
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={handleGenerateNext3Days}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? '追加中...' : '次の3日分'}
            </button>
            <button
              onClick={handleGenerateWeeklyList}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? '追加中...' : '今週分'}
            </button>
          </div>
          
          {generationResult && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm">
                <div className="font-medium mb-1">買い物リストに追加しました！</div>
                <div className="text-gray-600">
                  必要な食材: {generationResult.summary.totalIngredients}件 / 
                  在庫あり: {generationResult.summary.inStock}件 / 
                  購入が必要: {generationResult.summary.needToBuy}件
                </div>
                {generationResult.error && (
                  <div className="text-orange-600 mt-1">
                    ⚠️ {generationResult.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新規追加フォーム */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">➕</span>
          新規追加
        </h3>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="食材名を入力..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <QuantityInput
              value={newItemQuantity}
              onChange={setNewItemQuantity}
              placeholder="数量 (任意)"
              className="flex-1"
            />
            <button
              onClick={handleAddItem}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 未完了アイテム */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900">未完了アイテム</h3>
          <button
            onClick={handleSelectAll}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {selectAll ? '全解除' : '全選択'}
          </button>
        </div>

        <div className="space-y-3">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => item.id && handleToggleItem(item.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="text-gray-900">
                    {item.name}
                    {item.quantity && (
                      <span className="text-gray-600 ml-1">({item.quantity})</span>
                    )}
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                item.added_from === 'auto' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {item.added_from === 'auto' ? '自動' : '手動'}
              </span>
            </div>
          ))}
          
          {pendingItems.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              未完了のアイテムはありません
            </div>
          )}
        </div>
      </div>

      {/* 完了アイテム（折りたたみ） */}
      {completedItems.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center text-gray-900 font-medium"
            >
              <span className="mr-2">
                {showCompleted ? '▼' : '▶'}
              </span>
              完了済み ({completedItems.length}件)
            </button>
            <button
              onClick={() => deleteCompletedItems()}
              className="text-sm text-red-600 hover:text-red-500"
            >
              削除
            </button>
          </div>

          {showCompleted && (
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => item.id && handleToggleItem(item.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-gray-700 line-through">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* 量調整エディット */}
                  <div className="flex items-center ml-3">
                    <QuantityInput
                      value={editingQuantities[item.id!] || item.quantity || ''}
                      onChange={(value) => handleQuantityEdit(item.id!, value)}
                      placeholder="数量"
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* アクションボタン */}
      {completedItems.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={handleAddToStock}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
          >
            完了済みを在庫に追加
          </button>
        </div>
      )}

    </div>
  );
};