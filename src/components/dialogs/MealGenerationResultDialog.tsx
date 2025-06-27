import { BaseDialog } from '../ui/BaseDialog';
import { type MealGenerationResult } from '../../utils/mealPlanGeneration';

interface MealGenerationResultDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じる処理 */
  onClose: () => void;
  /** 生成結果データ */
  result: MealGenerationResult | null;
  /** 決定ボタンクリック時の処理（生成結果を献立に適用） */
  onConfirm: () => void;
  /** やり直しボタンクリック時の処理（temperatureを上げて再生成） */
  onRetry: () => void;
  /** 生成処理中かどうかのフラグ */
  isGenerating?: boolean;
}

/**
 * 献立生成結果確認ダイアログ
 * 
 * 献立生成ボタンを押した後に結果を表示し、ユーザーが決定・やり直しを選択できるダイアログ：
 * - 生成された献立リストの表示
 * - 必要な買い物リストの表示
 * - 警告メッセージの表示
 * - 決定ボタン：生成結果を献立に反映
 * - やり直しボタン：temperatureを上げて再生成
 * - キャンセルボタン：生成を取り消し
 */
export const MealGenerationResultDialog = ({
  isOpen,
  onClose,
  result,
  onConfirm,
  onRetry,
  isGenerating = false,
}: MealGenerationResultDialogProps) => {
  // 生成結果がない場合は何も表示しない
  if (!result) {
    return null;
  }

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="🤖 献立生成結果"
      icon="🤖"
      size="lg"
    >
      <div className="space-y-6">
        {/* 生成された献立一覧 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            📅 生成された献立
          </h4>
          
          {result.mealPlan.length > 0 ? (
            <div className="space-y-3">
              {result.mealPlan.map((meal, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {getMealTypeFromIndex(meal.mealNumber)}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {meal.recipe}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {meal.estimatedCost && meal.estimatedCost > 0 && `¥${meal.estimatedCost}`}
                    </div>
                  </div>
                  
                  {/* 使用食材表示 */}
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">食材：</span>
                      {meal.ingredients.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              生成された献立がありません
            </div>
          )}
        </div>

        {/* 必要な買い物リスト */}
        {result.shoppingList && result.shoppingList.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              🛒 必要な買い物
            </h4>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="space-y-1">
                {result.shoppingList.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span className="text-gray-800">
                      {item.ingredient} {item.quantity && `(${item.quantity}${item.unit})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 警告メッセージ */}
        {result.warnings && result.warnings.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-orange-700 mb-3 flex items-center">
              ⚠️ 注意事項
            </h4>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="space-y-1">
                {result.warnings.map((warning, index) => (
                  <div key={index} className="text-orange-800">
                    • {warning}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col space-y-3 pt-4 border-t">
          {/* 決定ボタン */}
          <button
            onClick={onConfirm}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? '適用中...' : '✅ 決定（献立に反映）'}
          </button>

          {/* やり直しボタン */}
          <button
            onClick={onRetry}
            disabled={isGenerating}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? '生成中...' : '🔄 やり直し（別のレシピで再生成）'}
          </button>

          {/* キャンセルボタン */}
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

/**
 * 食事番号から日本語の食事タイプと日付を取得
 * @param mealNumber 食事番号（1から開始）
 * @returns 食事タイプの日本語表記
 */
const getMealTypeFromIndex = (mealNumber: number): string => {
  const dayIndex = Math.floor((mealNumber - 1) / 3); // 0-6日目
  const mealTypeIndex = (mealNumber - 1) % 3; // 0, 1, 2
  
  const mealTypes = ['朝食', '昼食', '夕食'];
  const mealType = mealTypes[mealTypeIndex];
  
  if (dayIndex === 0) {
    return `今日の${mealType}`;
  } else {
    return `${dayIndex + 1}日目の${mealType}`;
  }
};