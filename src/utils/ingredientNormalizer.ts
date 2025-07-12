/**
 * 食材名正規化ユーティリティ
 * 
 * 食材名のマッチング処理で使用する正規化関数を提供
 * Martin Fowler Extract Function パターンによる重複排除
 */

/**
 * 食材名をマッチング用に正規化する
 * 
 * 在庫チェックや買い物リスト生成で類似食材をマッチングするため、
 * 食材名から不要な文字（括弧、数量、句読点等）を除去して統一形式にする
 * 
 * @param ingredientName 正規化対象の食材名
 * @returns マッチング用に正規化された食材名
 * 
 * @example
 * normalizeForMatching('トマト（大）2個') → 'トマト'
 * normalizeForMatching('玉ねぎ、中サイズ') → '玉ねぎ中サイズ'
 */
export const normalizeForMatching = (ingredientName: string): string => {
  return ingredientName
    .toLowerCase()
    .replace(/[、，\s]+/g, '') // 句読点・空白除去
    .replace(/[(（][^)）]*[)）]/g, '') // 括弧内除去
    .replace(/[0-9]+[gkgml個本枚枚切れパック]/g, '') // 数量単位除去
    .trim();
};