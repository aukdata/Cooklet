import React, { useState } from 'react';
import { useShoppingList, useMealPlans, useStockItems, useAutoShoppingList, useIngredients } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { type Quantity } from '../../types/index';
import { type ShoppingListItem } from '../../types';
import { ShoppingItemDialog } from '../../components/dialogs/ShoppingItemDialog';
import { ReceiptReader } from '../../components/shopping/ReceiptReader';
import { ShoppingHeader } from '../../components/shopping/ShoppingHeader';
import { ShoppingAutoGeneration } from '../../components/shopping/ShoppingAutoGeneration';
import { ShoppingManualAdd } from '../../components/shopping/ShoppingManualAdd';
import { ShoppingItemsList } from '../../components/shopping/ShoppingItemsList';
import { useToast } from '../../hooks/useToast.tsx';
import { ShoppingStockMergeService } from '../../services/shoppingStockMerge';

// 買い物リスト画面コンポーネント - CLAUDE.md仕様書5.3に準拠
export const Shopping: React.FC = () => {
  const { user } = useAuth();
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
  const { stockItems: _stockItems, addStockItem, updateStockItem } = useStockItems();

  // 自動生成フック
  const {
    previewShoppingList: _previewShoppingList,
    isGenerating,
    lastResult: generationResult,
    error: _autoGenerationError
  } = useAutoShoppingList();

  // 食材マスタフック（商品名正規化用）
  const { ingredients, addIngredient } = useIngredients();

  // ダイアログ状態管理
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // 完了アイテムの量編集状態
  const [editingQuantities, setEditingQuantities] = useState<Record<string, Quantity>>({});

  // 統計情報を取得
  const stats = getStats();
  
  // 未完了・完了アイテムの分離
  const pendingItems = getUncompletedItems();
  const completedItems = getCompletedItems();


  // 新規アイテム追加処理（ダイアログから）
  const handleAddItem = async (item: Omit<ShoppingListItem, 'id' | 'user_id' | 'created_at'>) => {
    try {
      await addShoppingItem({
        name: item.name,
        quantity: item.quantity,
        checked: false,
        added_from: 'manual'
      });
      showSuccess('アイテムを追加しました');
    } catch (err) {
      console.error('買い物リストアイテムの追加に失敗しました:', err);
      showError('追加に失敗しました');
      throw err;
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


  // 完了済みアイテムの量編集処理
  const handleQuantityEdit = (itemId: string, newQuantity: Quantity) => {
    setEditingQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  // 完了済みアイテムを在庫に追加（スマートマージ機能付き）
  const handleAddToStock = async () => {
    const completedItems = getCompletedItems();
    if (completedItems.length === 0) {
      showInfo('完了したアイテムがありません');
      return;
    }
    
    if (!user?.id) {
      showError('ユーザー情報が見つかりません');
      return;
    }
    
    try {
      const { report } = await ShoppingStockMergeService.mergeCompletedItemsToStock(
        completedItems,
        editingQuantities,
        _stockItems,
        ingredients,
        user.id,
        {
          updateStockItem,
          addStockItem,
          deleteCompletedItems
        }
      );
      
      // 編集中の量をクリア
      setEditingQuantities({});
      
      // マージ結果のレポートを表示
      showSuccess(report);
    } catch (err) {
      console.error('在庫追加に失敗しました:', err);
      showError('在庫追加に失敗しました');
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
      <ShoppingHeader stats={stats} />

      {/* 自動作成セクション */}
      <ShoppingAutoGeneration
        isGenerating={isGenerating}
        generationResult={generationResult}
      />

      {/* レシート読み取り機能 */}
      <ReceiptReader
        ingredients={ingredients}
        addIngredient={addIngredient}
        addShoppingItem={addShoppingItem}
        stockItems={_stockItems}
        addStockItem={addStockItem}
        updateStockItem={updateStockItem}
      />

      {/* 手動追加セクション */}
      <ShoppingManualAdd onAddClick={() => setIsAddDialogOpen(true)} />

      {/* アイテムリスト */}
      <ShoppingItemsList
        pendingItems={pendingItems}
        completedItems={completedItems}
        onToggleItem={handleToggleItem}
        onDeleteCompleted={deleteCompletedItems}
        onQuantityEdit={handleQuantityEdit}
        editingQuantities={editingQuantities}
      />

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

      {/* 新規追加ダイアログ */}
      <ShoppingItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddItem}
      />

    </div>
  );
};