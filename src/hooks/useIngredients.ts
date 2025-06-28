import { useCallback } from 'react';
import { useDataHook } from './useDataHook';
import { type Ingredient } from '../types';

// 食材マスタ管理機能を提供するカスタムフック（ユーザー認証対応）
export const useIngredients = () => {
  // useDataHookによる基本CRUD操作
  const {
    data: ingredients,
    loading,
    error,
    addData,
    updateData,
    deleteData,
    refetch: fetchIngredients
  } = useDataHook<Ingredient>({
    tableName: 'ingredients',
    orderBy: [
      { column: 'category', ascending: true }, // カテゴリ順で並び替え
      { column: 'name', ascending: true } // 同一カテゴリ内では名前順
    ]
  }, {
    fetch: '食材データの取得に失敗しました',
    add: '食材の追加に失敗しました',
    update: '食材の更新に失敗しました',
    delete: '食材の削除に失敗しました'
  });

  // 新しい食材をマスタに追加する関数
  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'userId' | 'createdAt'>) => {
    // camelCaseをsnake_caseに変換してuseDataHookに渡す
    const dbIngredient: Omit<Ingredient, 'id' | 'userId' | 'createdAt'> = {
      name: ingredient.name,
      category: ingredient.category,
      defaultUnit: ingredient.defaultUnit,
      typicalPrice: ingredient.typicalPrice,
      originalName: ingredient.originalName,
      conversionQuantity: ingredient.conversionQuantity,
      conversionUnit: ingredient.conversionUnit
    };

    return await addData(dbIngredient);
  };

  // 食材マスタを更新する関数
  const updateIngredient = async (id: string, updates: Partial<Omit<Ingredient, 'id' | 'userId' | 'createdAt'>>) => {
    // camelCaseをsnake_caseに変換
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.defaultUnit !== undefined) dbUpdates.default_unit = updates.defaultUnit;
    if (updates.typicalPrice !== undefined) dbUpdates.typical_price = updates.typicalPrice;
    if (updates.originalName !== undefined) dbUpdates.original_name = updates.originalName;
    if (updates.conversionQuantity !== undefined) dbUpdates.conversion_quantity = updates.conversionQuantity;
    if (updates.conversionUnit !== undefined) dbUpdates.conversion_unit = updates.conversionUnit;
    
    return await updateData(id, dbUpdates);
  };

  // 食材マスタを削除する関数
  const deleteIngredient = async (id: string) => {
    return await deleteData(id);
  };

  // originalNameで食材を検索する関数（商品名を一般名に変換）
  const findIngredientByOriginalName = useCallback((originalName: string): Ingredient | null => {
    if (!originalName) return null;
    
    // 完全一致で検索
    const exactMatch = ingredients.find(ingredient => 
      ingredient.originalName === originalName
    );
    
    if (exactMatch) return exactMatch;
    
    // 部分一致で検索（大文字小文字を無視）
    const partialMatch = ingredients.find(ingredient => 
      ingredient.originalName && 
      ingredient.originalName.toLowerCase().includes(originalName.toLowerCase())
    );
    
    return partialMatch || null;
  }, [ingredients]);

  // フックが提供する機能を返す
  return {
    ingredients, // 食材マスタ配列
    loading, // 読み込み状態
    error, // エラーメッセージ
    addIngredient, // 食材追加関数
    updateIngredient, // 食材更新関数
    deleteIngredient, // 食材削除関数
    findIngredientByOriginalName, // original_nameで食材検索関数
    refetch: fetchIngredients, // 再取得関数
  };
};