import React, { useState } from 'react';

// 買い物リストアイテムの型定義
interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  checked: boolean;
  added_from: 'manual' | 'auto';
}

// 買い物リスト画面コンポーネント - CLAUDE.md仕様書5.3に準拠
export const Shopping: React.FC = () => {
  // 新規追加フォームの状態
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  
  // 完了アイテムの表示状態（折りたたみ機能）
  const [showCompleted, setShowCompleted] = useState(false);
  
  // 全選択の状態
  const [selectAll, setSelectAll] = useState(false);

  // サンプルの買い物リストデータ（CLAUDE.md仕様書準拠）
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    // 未完了アイテム
    { id: '1', name: '牛ひき肉', quantity: '200g', checked: false, added_from: 'auto' },
    { id: '2', name: '玉ねぎ', quantity: '1個', checked: false, added_from: 'auto' },
    { id: '3', name: 'パン', quantity: '', checked: false, added_from: 'manual' },
    { id: '4', name: '牛乳', quantity: '1本', checked: false, added_from: 'auto' },
    { id: '5', name: 'レタス', quantity: '', checked: false, added_from: 'manual' },
    
    // 完了済みアイテム
    { id: '6', name: 'にんじん', quantity: '2本', checked: true, added_from: 'manual' },
    { id: '7', name: 'たまご', quantity: '1パック', checked: true, added_from: 'auto' },
    { id: '8', name: '醤油', quantity: '', checked: true, added_from: 'manual' },
  ]);

  // 未完了・完了アイテムの分離
  const pendingItems = shoppingItems.filter(item => !item.checked);
  const completedItems = shoppingItems.filter(item => item.checked);

  // 新規アイテム追加処理
  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        quantity: newItemQuantity.trim(),
        checked: false,
        added_from: 'manual'
      };
      setShoppingItems([...shoppingItems, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
    }
  };

  // アイテムチェック状態変更
  const handleToggleItem = (id: string) => {
    setShoppingItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // 全選択・全解除処理
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setShoppingItems(items =>
      items.map(item =>
        !item.checked ? { ...item, checked: newSelectAll } : item
      )
    );
  };

  // 完了アイテム一括削除
  const handleDeleteCompleted = () => {
    setShoppingItems(items => items.filter(item => !item.checked));
  };

  // 完了アイテムを在庫に追加（今後実装予定）
  const handleAddToInventory = () => {
    // TODO: 在庫管理機能と連携
    alert('在庫追加機能は今後実装予定です');
  };

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
            未完了: {pendingItems.length}件  完了: {completedItems.length}件
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <span className="text-xl">⚙️</span>
        </button>
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
            <input
              type="text"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="数量 (任意)"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
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
                  onChange={() => handleToggleItem(item.id)}
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
              onClick={handleDeleteCompleted}
              className="text-sm text-red-600 hover:text-red-500"
            >
              削除
            </button>
          </div>

          {showCompleted && (
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleItem(item.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700 line-through">
                      {item.name}
                      {item.quantity && (
                        <span className="text-gray-500 ml-1">({item.quantity})</span>
                      )}
                    </span>
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
            onClick={handleDeleteCompleted}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm"
          >
            完了をまとめて削除
          </button>
          <button
            onClick={handleAddToInventory}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm"
          >
            在庫に追加して削除
          </button>
        </div>
      )}
    </div>
  );
};