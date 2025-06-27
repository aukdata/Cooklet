import React from 'react';
import type { StockItem } from '../../types';
import { groupExpiredItemsByPeriod } from '../../utils/expiryUtils';
import { formatDateToSlash } from '../../utils/dateFormatters';

interface StockAlertSectionProps {
  /** 期限切れアイテム配列 */
  expiredItems: StockItem[];
  /** 期限間近アイテム配列 */
  expiringItems: StockItem[];
  /** 在庫データのローディング状態 */
  loading: boolean;
}

/**
 * 在庫アラートセクションコンポーネント
 * 
 * サマリー画面で賞味期限切れ・期限間近の食材を表示する専用コンポーネント：
 * - 期限切れアイテムの赤色表示（期間別グループ化）
 * - 期限間近アイテムの黄色表示
 * - 視覚的なアイコンによる区別
 * - アイテムがない場合のメッセージ表示
 */
export const StockAlertSection: React.FC<StockAlertSectionProps> = ({
  expiredItems,
  expiringItems,
  loading
}) => {
  // 期限切れアイテムを期間別にグループ化
  const groupedExpiredItems = groupExpiredItemsByPeriod(expiredItems);

  // アラートがない場合
  const hasAlerts = expiredItems.length > 0 || expiringItems.length > 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">⚠️</span>
        在庫アラート
        {loading && <span className="ml-2 text-sm text-gray-500">読み込み中...</span>}
      </h3>

      {!hasAlerts && !loading ? (
        <div className="text-gray-500 text-sm py-2">
          📋 アラートはありません
        </div>
      ) : (
        <div className="space-y-3">
          {/* 期限切れアイテム */}
          {groupedExpiredItems.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <span className="mr-2">🔴</span>
                <span className="font-medium text-red-700">賞味期限切れ</span>
              </div>
              <div className="ml-6 space-y-1">
                {groupedExpiredItems.map(([period, items]) => (
                  <div key={period}>
                    <div className="text-sm font-medium text-red-600 mb-1">{period}</div>
                    {items.map(item => (
                      <div key={item.id} className="text-sm text-gray-700 ml-2">
                        • {item.name} ({formatDateToSlash(new Date(item.best_before!))})
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 期限間近アイテム */}
          {expiringItems.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <span className="mr-2">🟡</span>
                <span className="font-medium text-yellow-700">明日まで</span>
              </div>
              <div className="ml-6 space-y-1">
                {expiringItems.map(item => (
                  <div key={item.id} className="text-sm text-gray-700">
                    • {item.name} ({formatDateToSlash(new Date(item.best_before!))})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};