/**
 * 日付フォーマット用ユーティリティ関数
 * 重複していた日付処理ロジックを統一管理
 */

/**
 * 日付を「MM月DD日」形式でフォーマット
 * @param date - フォーマットする日付
 * @returns フォーマット済み文字列（例: "6月15日"）
 */
export const formatDateToJapanese = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

/**
 * 日付を「MM/DD」形式でフォーマット
 * @param date - フォーマットする日付
 * @returns フォーマット済み文字列（例: "6/15"）
 */
export const formatDateToSlash = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 日付を「YYYY-MM-DD」形式でフォーマット
 * @param date - フォーマットする日付
 * @returns フォーマット済み文字列（例: "2025-06-15"）
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 2つの日付の範囲を「MM/DD - MM/DD」形式でフォーマット
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns フォーマット済み文字列（例: "6/1 - 6/7"）
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${formatDateToSlash(startDate)} - ${formatDateToSlash(endDate)}`;
};

/**
 * 日付が今日かどうかを判定
 * @param date - 判定する日付
 * @returns 今日の場合true
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * 日付が昨日かどうかを判定
 * @param date - 判定する日付
 * @returns 昨日の場合true
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * 日付が明日かどうかを判定
 * @param date - 判定する日付
 * @returns 明日の場合true
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

/**
 * 日付に日数を加算
 * @param date - 基準日
 * @param days - 加算する日数（負の値で過去日）
 * @returns 加算後の日付
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 2つの日付の差分（日数）を計算
 * @param date1 - 比較日1
 * @param date2 - 比較日2
 * @returns 日数差分（date2 - date1）
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDiff = date2.getTime() - date1.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

/**
 * 相対的な日付表示を生成
 * @param date - 表示する日付
 * @returns 相対的な表示文字列（例: "今日", "昨日", "明日", "6月15日"）
 */
export const formatRelativeDate = (date: Date): string => {
  if (isToday(date)) return '今日';
  if (isYesterday(date)) return '昨日';
  if (isTomorrow(date)) return '明日';
  return formatDateToJapanese(date);
};