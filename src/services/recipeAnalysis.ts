// 旧レシピ解析サービス（廃止予定）
// LLM抽出機能（/lib/ai/）に移管済み

// URLの妥当性をチェックする関数（互換性のため残存）
export const isValidRecipeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};