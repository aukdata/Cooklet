// 自動買い物リスト生成フック（CLAUDE.md仕様書準拠）

import { useState } from 'react';
import { useMealPlans } from './useMealPlans';
import { useStockItems } from './useStockItems';
import { useShoppingList } from './useShoppingList';
import { useIngredients } from './useIngredients';
import { generateShoppingListForNextDays } from '../services/shoppingListGeneration';

// 自動生成の結果型
export interface AutoGenerationResult {
  itemsAdded: number;
  itemsSkipped: number;
  totalRequired: number;
  details: Array<{
    name: string;
    quantity: string;
    source: string;
    action: 'added' | 'skipped' | 'existing';
  }>;
}

// 自動買い物リスト生成フック
export const useAutoShoppingList = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<AutoGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mealPlans } = useMealPlans();
  const { stockItems } = useStockItems();
  const { shoppingList, addShoppingItem } = useShoppingList();
  const { ingredients } = useIngredients();

  // 自動生成実行
  const generateShoppingList = async (daysAhead: number = 7): Promise<AutoGenerationResult> => {
    try {
      setIsGenerating(true);
      setError(null);

      // 買い物リストアイテムを生成（新しいAPI使用）
      const result = await generateShoppingListForNextDays(
        daysAhead,
        mealPlans,
        stockItems,
        shoppingList,
        ingredients
      );

      if (!result.success) {
        throw new Error(result.error || '自動生成に失敗しました');
      }

      let itemsAdded = 0;
      let itemsSkipped = 0;
      const details: AutoGenerationResult['details'] = [];

      console.log('🔍 [Debug] 生成されたアイテム:', result.generatedItems);
      console.log('🔍 [Debug] 生成されたアイテム数:', result.generatedItems.length);

      // 各アイテムを買い物リストに追加
      for (const item of result.generatedItems) {
        console.log('🔍 [Debug] アイテム追加試行:', item);
        
        // 型安全性チェック
        if (typeof item !== 'object' || item === null || !('name' in item)) {
          console.warn('❌ [Debug] 無効なアイテム形式:', item);
          continue;
        }
        
        const shoppingItem = item as { name: string; quantity?: string; checked: boolean; added_from: 'manual' | 'auto' };
        
        try {
          await addShoppingItem(shoppingItem);
          itemsAdded++;
          console.log(`✅ [Debug] アイテム追加成功: ${shoppingItem.name}`);
          details.push({
            name: shoppingItem.name,
            quantity: shoppingItem.quantity || '適量',
            source: '献立より自動生成',
            action: 'added'
          });
        } catch (err) {
          console.warn(`❌ [Debug] アイテムの追加に失敗: ${shoppingItem.name}`, err);
          itemsSkipped++;
          details.push({
            name: shoppingItem.name,
            quantity: shoppingItem.quantity || '適量',
            source: '献立より自動生成',
            action: 'skipped'
          });
        }
      }
      
      console.log('🔍 [Debug] 最終結果 - 追加成功:', itemsAdded, '失敗:', itemsSkipped);

      const autoResult: AutoGenerationResult = {
        itemsAdded,
        itemsSkipped,
        totalRequired: result.generatedItems.length,
        details
      };

      setLastResult(autoResult);
      return autoResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '自動生成に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  // 指定期間の献立プレビュー（実際に生成する前の確認用）
  const previewShoppingList = async (daysAhead: number = 7) => {
    try {
      const result = await generateShoppingListForNextDays(
        daysAhead,
        mealPlans,
        stockItems,
        shoppingList,
        ingredients
      );

      if (result.success) {
        return {
          items: result.generatedItems,
          count: result.generatedItems.length,
          period: `今日から${daysAhead}日間`,
          summary: result.summary
        };
      } else {
        console.error('プレビューの生成に失敗:', result.error);
        return {
          items: [],
          count: 0,
          period: `今日から${daysAhead}日間`,
          summary: { totalIngredients: 0, inStock: 0, needToBuy: 0 }
        };
      }
    } catch (err) {
      console.error('プレビューの生成に失敗:', err);
      return {
        items: [],
        count: 0,
        period: `今日から${daysAhead}日間`,
        summary: { totalIngredients: 0, inStock: 0, needToBuy: 0 }
      };
    }
  };

  // 統計情報を取得
  const getGenerationStats = () => {
    return {
      totalMealPlans: mealPlans.length,
      totalStockItems: stockItems.length,
      totalShoppingItems: shoppingList.length,
      lastGeneration: lastResult
    };
  };

  // 前回の生成結果をクリア
  const clearLastResult = () => {
    setLastResult(null);
    setError(null);
  };

  return {
    // 実行関数
    generateShoppingList,
    previewShoppingList,

    // 状態
    isGenerating,
    lastResult,
    error,

    // 統計・ユーティリティ
    getGenerationStats,
    clearLastResult,

    // データ状態（参照用）
    dataStatus: {
      mealPlansLoaded: mealPlans.length > 0,
      stockItemsLoaded: stockItems.length > 0,
      shoppingListLoaded: shoppingList.length >= 0,
      ingredientsLoaded: ingredients.length > 0
    }
  };
};