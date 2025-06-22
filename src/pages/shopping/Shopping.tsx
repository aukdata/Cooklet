import React, { useState, useEffect, useRef } from 'react';
import { useShoppingList, useMealPlans, useStockItems, useAutoShoppingList, useIngredients } from '../../hooks';
import { type StockItem } from '../../hooks/useStockItems';
import { QuantityInput } from '../../components/common/QuantityInput';
import { useToast } from '../../hooks/useToast.tsx';
import { readReceiptFromImage, validateImageFile, type ReceiptResult } from '../../utils/receiptReader';

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
  const { mealPlans: _mealPlans } = useMealPlans();
  const { stockItems: _stockItems, addStockItem } = useStockItems();

  // 自動生成フック
  const {
    generateShoppingList,
    previewShoppingList: _previewShoppingList,
    isGenerating,
    lastResult: generationResult,
    error: _autoGenerationError
  } = useAutoShoppingList();

  // 食材マスタフック（商品名正規化用）
  const { ingredients } = useIngredients();

  // 新規追加フォームの状態
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  
  // 完了アイテムの表示状態（折りたたみ機能）
  const [showCompleted, setShowCompleted] = useState(false);
  
  // 完了アイテムの量編集状態
  const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({});

  // レシート読み取り関連の状態
  const [isReadingReceipt, setIsReadingReceipt] = useState(false);
  const [receiptResult, setReceiptResult] = useState<ReceiptResult | null>(null);
  const [editingReceiptItems, setEditingReceiptItems] = useState<Array<{
    name: string;
    quantity: string;
    unit: string;
    price?: number;
    normalizationResult?: any;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // レシート読み取り機能
  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイル妥当性チェック
    if (!validateImageFile(file)) {
      showError('JPEGまたはPNG形式の画像ファイル（10MB以下）を選択してください');
      return;
    }

    setIsReadingReceipt(true);
    
    try {
      // 食材マスタデータを渡してレシート読み取り実行（商品名正規化付き）
      const result: ReceiptResult = await readReceiptFromImage(file, ingredients);
      
      // レシート読み取り結果を状態に保存し、編集可能にする
      setReceiptResult(result);
      
      // 編集用のアイテムリストを初期化（quantityを分解してunit付きに）
      const editableItems = result.items.map(item => {
        const { quantity, unit } = parseQuantityAndUnit(item.quantity || '');
        return {
          name: item.name,
          quantity,
          unit,
          price: item.price,
          normalizationResult: item.normalizationResult
        };
      });
      setEditingReceiptItems(editableItems);
      
      showSuccess(`レシートから${result.items.length}件のアイテムを読み取りました。内容を確認してください。`);
    } catch (err) {
      console.error('レシート読み取りに失敗しました:', err);
      showError('レシート読み取りに失敗しました');
    } finally {
      setIsReadingReceipt(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // レシート読み取り結果を完了リストに追加する関数
  const handleAddReceiptItems = async (receiptResult: ReceiptResult) => {
    for (const item of receiptResult.items) {
      try {
        await addShoppingItem({
          name: item.name,
          quantity: item.quantity,
          checked: true, // レシートのアイテムは既に購入済みなので完了状態で追加
          added_from: 'manual'
        });
      } catch (err) {
        console.error(`アイテム追加に失敗: ${item.name}`, err);
      }
    }
  };

  // レシートアップロードボタンクリック
  const handleReceiptButtonClick = () => {
    fileInputRef.current?.click();
  };

  // quantityとunitを分解する関数
  const parseQuantityAndUnit = (quantityString: string): { quantity: string; unit: string } => {
    if (!quantityString) return { quantity: '', unit: '' };
    
    // 数字部分と単位部分を分離（例: "2個" -> quantity: "2", unit: "個"）
    const match = quantityString.match(/^(\d*\.?\d*)\s*(.*)$/);
    if (match) {
      return {
        quantity: match[1] || '',
        unit: match[2] || ''
      };
    }
    
    return { quantity: quantityString, unit: '' };
  };

  // レシート読み取り結果のアイテムを編集する関数
  const handleEditReceiptItem = (index: number, field: 'name' | 'quantity' | 'unit', value: string) => {
    setEditingReceiptItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // 編集したレシート結果を未完了アイテムに追加する関数
  const handleAddReceiptItemsToList = async () => {
    if (editingReceiptItems.length === 0) return;

    try {
      for (const item of editingReceiptItems) {
        if (item.name.trim()) {
          const combinedQuantity = item.unit ? `${item.quantity}${item.unit}` : item.quantity;
          await addShoppingItem({
            name: item.name.trim(),
            quantity: combinedQuantity || undefined,
            checked: false,
            added_from: 'auto'
          });
        }
      }

      // レシート読み取り結果をクリア
      setReceiptResult(null);
      setEditingReceiptItems([]);
      
      showSuccess(`${editingReceiptItems.length}件のアイテムを買い物リストに追加しました！`);
    } catch (err) {
      console.error('アイテムの追加に失敗しました:', err);
      showError('アイテムの追加に失敗しました');
    }
  };

  // レシート読み取り結果をキャンセルする関数
  const handleCancelReceiptResult = () => {
    setReceiptResult(null);
    setEditingReceiptItems([]);
  };

  // 個別アイテムをingredientsテーブルに登録する関数
  const handleRegisterToIngredients = async (item: {
    name: string;
    quantity: string;
    unit: string;
    price?: number;
    normalizationResult?: any;
  }) => {
    try {
      // 基本的な推測でカテゴリを決定（後で改良可能）
      let category: 'vegetables' | 'meat' | 'seasoning' | 'others' = 'others';
      const itemName = item.name.toLowerCase();
      if (itemName.includes('野菜') || itemName.includes('レタス') || itemName.includes('人参') || 
          itemName.includes('玉ねぎ') || itemName.includes('じゃがいも') || itemName.includes('トマト')) {
        category = 'vegetables';
      } else if (itemName.includes('肉') || itemName.includes('魚') || itemName.includes('鶏') || 
                 itemName.includes('豚') || itemName.includes('牛') || itemName.includes('まぐろ')) {
        category = 'meat';
      } else if (itemName.includes('塩') || itemName.includes('砂糖') || itemName.includes('醤油') || 
                 itemName.includes('味噌') || itemName.includes('酢') || itemName.includes('油')) {
        category = 'seasoning';
      }

      // ingredientsテーブルに登録
      await addIngredient({
        name: item.name,
        category,
        default_unit: item.unit || '個',
        typical_price: item.price,
        original_name: item.normalizationResult?.originalName || item.name
      });

      showSuccess(`「${item.name}」を食材マスタに登録しました！`);
    } catch (err) {
      console.error('食材マスタへの登録に失敗しました:', err);
      showError('食材マスタへの登録に失敗しました');
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
                  全体: {generationResult.totalRequired}件 / 
                  追加: {generationResult.itemsAdded}件 / 
                  スキップ: {generationResult.itemsSkipped}件
                </div>
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
          
          {/* レシートからの追加 */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={handleReceiptButtonClick}
                disabled={isReadingReceipt}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span className="mr-2">📄</span>
                {isReadingReceipt ? '読み取り中...' : 'レシートから追加'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="hidden"
              />
            </div>
            
            {/* レシート読み取り結果表示 */}
            {receiptResult && editingReceiptItems.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">
                    読み取り結果（{editingReceiptItems.length}件）
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddReceiptItemsToList}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      すべて追加
                    </button>
                    <button
                      onClick={handleCancelReceiptResult}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {editingReceiptItems.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-gray-200">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">名前</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleEditReceiptItem(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">数量</label>
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleEditReceiptItem(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">単位</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleEditReceiptItem(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {item.normalizationResult?.isNormalized && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              「{item.normalizationResult.originalName}」から正規化
                            </span>
                          )}
                          {item.price && (
                            <span className="ml-2">価格: ¥{item.price}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRegisterToIngredients(item)}
                          className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700"
                        >
                          登録
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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