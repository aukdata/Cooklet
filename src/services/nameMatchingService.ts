/**
 * 商品名・食材名のマッチングと正規化を行う統一サービス
 * Martin Fowler Extract Service パターンによる重複ロジック統合
 */

/**
 * 商品名の正規化処理（統一実装）
 * 既存の normalizeForMatching と isNameMatch の機能を統合
 * 
 * @param name - 正規化する名前
 * @returns 正規化された名前
 */
export const normalizeProductName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    // 全角数字を半角に変換
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xFEE0))
    // 括弧や記号を除去
    .replace(/[（）()【】「」〈〉]/g, '')
    // 連続する空白を単一の空白に
    .replace(/\s+/g, ' ');
};

/**
 * 2つの商品名がマッチするかチェック
 * 
 * @param name1 - 比較する名前1
 * @param name2 - 比較する名前2
 * @returns マッチする場合true
 */
export const isNameMatch = (name1: string, name2: string): boolean => {
  const normalized1 = normalizeProductName(name1);
  const normalized2 = normalizeProductName(name2);

  // 完全一致
  if (normalized1 === normalized2) {
    return true;
  }

  // 部分一致（より短い名前が長い名前に含まれる）
  const shorter = normalized1.length <= normalized2.length 
    ? normalized1 
    : normalized2;
  const longer = normalized1.length > normalized2.length 
    ? normalized1 
    : normalized2;

  // 2文字以上で部分一致する場合はマッチとする
  return longer.includes(shorter) && shorter.length >= 2;
};

/**
 * 候補リストから最も適合する名前を検索
 * 
 * @param targetName - 検索対象の名前
 * @param candidates - 候補名前のリスト
 * @returns 最適なマッチ（見つからない場合はnull）
 */
export const findBestMatch = (
  targetName: string,
  candidates: string[]
): string | null => {
  const normalizedTarget = normalizeProductName(targetName);
  
  // 完全一致を最優先
  const exactMatch = candidates.find(candidate => 
    normalizeProductName(candidate) === normalizedTarget
  );
  if (exactMatch) {
    return exactMatch;
  }
  
  // 部分一致（より長い文字列に含まれる）
  const partialMatches = candidates.filter(candidate => 
    isNameMatch(targetName, candidate)
  );
  
  if (partialMatches.length === 0) {
    return null;
  }
  
  // 複数の部分一致がある場合は、最も類似度の高いものを選択
  // （文字列長の差が最も小さいもの）
  return partialMatches.reduce((best, current) => {
    const bestDiff = Math.abs(best.length - targetName.length);
    const currentDiff = Math.abs(current.length - targetName.length);
    return currentDiff < bestDiff ? current : best;
  });
};

/**
 * 商品名リストから重複を除去
 * 
 * @param names - 商品名のリスト
 * @returns 重複を除去した商品名のリスト
 */
export const deduplicateNames = (names: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const name of names) {
    const normalized = normalizeProductName(name);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(name);
    }
  }
  
  return result;
};

/**
 * マッチング統計情報の型定義
 */
export interface MatchingStats {
  /** 検索対象の総数 */
  totalTargets: number;
  /** 完全一致した数 */
  exactMatches: number;
  /** 部分一致した数 */
  partialMatches: number;
  /** マッチしなかった数 */
  noMatches: number;
  /** マッチング精度（0-1） */
  accuracy: number;
}

/**
 * 在庫チェック用の型定義
 */
export interface StockCheckItem {
  name: string;
  quantity: { amount: string; unit: string };
}

/**
 * 数量の正規化処理（統一実装）
 * 食材の数量を正規化して数値と単位を分離
 * 
 * @param quantity - 正規化する数量
 * @returns 正規化された数量オブジェクト
 */
export const normalizeQuantity = (quantity: { amount: string; unit: string }): { value: number; unit: string } => {
  // Quantity型から数値と単位を分離
  const match = quantity.amount.match(/^(\d+(?:\.\d+)?)(.*)$/);
  
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: quantity.unit || match[2].trim() || '個'
    };
  }
  
  // 数値が見つからない場合は適量として扱う
  return {
    value: 1,
    unit: quantity.unit || '適量'
  };
};

/**
 * 在庫が必要量を満たしているかチェック（統一実装）
 * checkIngredientStock と isStockSufficient の機能を統合
 * 
 * @param ingredientName - チェックする食材名
 * @param requiredQuantity - 必要な数量（undefined可、その場合は存在チェックのみ）
 * @param stockItems - 在庫アイテムリスト
 * @returns 在庫が十分な場合true
 */
export const checkStockAvailability = (
  ingredientName: string,
  requiredQuantity: { amount: string; unit: string } | undefined,
  stockItems: StockCheckItem[]
): boolean => {
  // 在庫アイテムを名前でマッチング
  const matchingStock = stockItems.find(stock => 
    isNameMatch(ingredientName, stock.name)
  );

  if (!matchingStock) {
    return false; // 在庫なし
  }

  // 必要量が指定されていない場合は存在チェックのみ
  if (!requiredQuantity) {
    return true;
  }

  const required = normalizeQuantity(requiredQuantity);
  const stock = normalizeQuantity(matchingStock.quantity);
  
  // 単位が異なる場合は不十分とする（簡易実装）
  if (required.unit !== stock.unit && 
      !(required.unit === '個' && stock.unit === '本') &&
      !(required.unit === '本' && stock.unit === '個')) {
    return false;
  }
  
  return stock.value >= required.value;
};

/**
 * 複数の名前について一括マッチングを実行し、統計情報を返す
 * 
 * @param targets - 検索対象の名前リスト
 * @param candidates - 候補名前のリスト
 * @returns マッチング結果と統計情報
 */
export const batchMatching = (
  targets: string[],
  candidates: string[]
): {
  matches: Array<{ target: string; match: string | null; isExact: boolean }>;
  stats: MatchingStats;
} => {
  const matches: Array<{ target: string; match: string | null; isExact: boolean }> = [];
  let exactMatches = 0;
  let partialMatches = 0;
  let noMatches = 0;
  
  for (const target of targets) {
    const normalizedTarget = normalizeProductName(target);
    
    // 完全一致チェック
    const exactMatch = candidates.find(candidate => 
      normalizeProductName(candidate) === normalizedTarget
    );
    
    if (exactMatch) {
      matches.push({ target, match: exactMatch, isExact: true });
      exactMatches++;
    } else {
      // 部分一致チェック
      const partialMatch = findBestMatch(target, candidates);
      if (partialMatch) {
        matches.push({ target, match: partialMatch, isExact: false });
        partialMatches++;
      } else {
        matches.push({ target, match: null, isExact: false });
        noMatches++;
      }
    }
  }
  
  const accuracy = targets.length > 0 ? (exactMatches + partialMatches) / targets.length : 0;
  
  return {
    matches,
    stats: {
      totalTargets: targets.length,
      exactMatches,
      partialMatches,
      noMatches,
      accuracy
    }
  };
};