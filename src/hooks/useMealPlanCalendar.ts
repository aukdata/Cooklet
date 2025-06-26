import { useState } from 'react';

// 週間カレンダー状態管理フックの戻り値型定義
interface UseMealPlanCalendarReturn {
  // 選択された日付（今日がデフォルト）
  selectedDate: Date;
  // 現在表示している週の開始日（今日基準）
  currentWeekStart: Date;
  // 指定した週の開始日から7日分の日付を取得
  weekDates: Date[];
  // 週の範囲を表示用にフォーマット（例: "6/1 - 6/7"）
  weekRange: string;
  // 今日を基準とした週かどうかを判定
  isCurrentWeek: boolean;
  // 日付選択ハンドラ
  setSelectedDate: (date: Date) => void;
  // 先週に移動
  goToPreviousWeek: () => void;
  // 来週に移動
  goToNextWeek: () => void;
  // 今日を基準にした週に戻る
  goToThisWeek: () => void;
  // 指定した週の開始日から7日分の日付を取得するユーティリティ
  getWeekDates: (weekStart: Date) => Date[];
}

/**
 * 献立カレンダーの状態管理カスタムフック
 * 週間ナビゲーションと日付選択の状態を管理
 */
export const useMealPlanCalendar = (): UseMealPlanCalendarReturn => {
  // 選択された日付（今日がデフォルト）
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 現在表示している週の開始日（今日基準）
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    // 今日を開始日として設定
    return today;
  });

  // 指定した週の開始日から7日分の日付を取得
  const getWeekDates = (weekStart: Date): Date[] => {
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 先週に移動
  const goToPreviousWeek = (): void => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  // 来週に移動
  const goToNextWeek = (): void => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  // 今日を基準にした週に戻る
  const goToThisWeek = (): void => {
    const today = new Date();
    setCurrentWeekStart(today);
  };

  // 今日を基準とした週かどうかを判定
  const isCurrentWeek = (): boolean => {
    const today = new Date();
    return currentWeekStart.toDateString() === today.toDateString();
  };

  const weekDates = getWeekDates(currentWeekStart);

  // 週の範囲を表示用にフォーマット
  const weekRange = `${weekDates[0].getMonth() + 1}/${weekDates[0].getDate()} - ${weekDates[6].getMonth() + 1}/${weekDates[6].getDate()}`;

  return {
    selectedDate,
    currentWeekStart,
    weekDates,
    weekRange,
    isCurrentWeek: isCurrentWeek(),
    setSelectedDate,
    goToPreviousWeek,
    goToNextWeek,
    goToThisWeek,
    getWeekDates
  };
};