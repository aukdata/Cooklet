import React from 'react';
import { useAutoShoppingList } from '../../hooks';
import { useToast } from '../../hooks/useToast.tsx';

interface ShoppingAutoGenerationProps {
  isGenerating: boolean;
  generationResult: {
    totalRequired: number;
    itemsAdded: number;
    itemsSkipped: number;
  } | null;
}

/**
 * 買い物リスト自動生成セクションコンポーネント
 * 献立データから必要な食材を自動的に買い物リストに追加する機能を提供
 */
export const ShoppingAutoGeneration: React.FC<ShoppingAutoGenerationProps> = ({
  isGenerating,
  generationResult
}) => {
  const { showError, showSuccess, showInfo } = useToast();
  const { generateShoppingList } = useAutoShoppingList();

  // 今週の買い物リストを自動作成
  const handleGenerateWeeklyList = async () => {
    try {
      console.log('🔍 [Debug] 今週分自動生成開始');
      
      const result = await generateShoppingList(7);
      
      console.log('🔍 [Debug] 生成結果:', result);
      
      if (result.itemsAdded > 0) {
        showSuccess(`買い物リストを作成しました！`);
      } else {
        showInfo('追加する必要のある食材はありませんでした');
      }
    } catch (err) {
      console.error('❌ [Debug] 買い物リスト作成エラー:', err);
      showError('作成に失敗しました');
    }
  };

  // 次の3日分の買い物リストを自動作成
  const handleGenerateNext3Days = async () => {
    try {
      console.log('🔍 [Debug] 3日分自動生成開始');
      
      const result = await generateShoppingList(3);
      
      console.log('🔍 [Debug] 生成結果:', result);
      
      if (result.itemsAdded > 0) {
        showSuccess(`買い物リストを作成しました！`);
      } else {
        showInfo('追加する必要のある食材はありませんでした');
      }
    } catch (err) {
      console.error('❌ [Debug] 買い物リスト作成エラー:', err);
      showError('作成に失敗しました');
    }
  };

  return (
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
  );
};