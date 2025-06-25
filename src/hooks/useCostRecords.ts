import { useDataHook } from './useDataHook';
import type { CostRecord } from '../types/index';

// useCostRecordsフック - 汎用データフックを使用したコスト記録管理
export const useCostRecords = () => {
  const {
    data: costRecords,
    loading,
    error,
    addData: addCostRecord,
    updateData: updateCostRecord,
    deleteData: deleteCostRecord,
    refetch
  } = useDataHook<CostRecord>({
    tableName: 'cost_records',
    orderBy: [
      { column: 'date', ascending: false },
      { column: 'created_at', ascending: false }
    ]
  }, {
    fetch: 'コスト記録データの取得に失敗しました',
    add: 'コスト記録の追加に失敗しました',
    update: 'コスト記録の更新に失敗しました',
    delete: 'コスト記録の削除に失敗しました'
  });

  // 月別統計データを取得
  const getMonthlyStats = (year: number, month: number) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${(month === 12 ? 1 : month + 1).toString().padStart(2, '0')}-01`;
    
    const monthlyRecords = costRecords.filter(record => 
      record.date >= startDate && record.date < endDate
    );

    const selfCooking = monthlyRecords.filter(record => !record.is_eating_out);
    const eatingOut = monthlyRecords.filter(record => record.is_eating_out);

    return {
      totalAmount: monthlyRecords.reduce((sum, record) => sum + record.amount, 0),
      selfCookingAmount: selfCooking.reduce((sum, record) => sum + record.amount, 0),
      eatingOutAmount: eatingOut.reduce((sum, record) => sum + record.amount, 0),
      selfCookingCount: selfCooking.length,
      eatingOutCount: eatingOut.length,
      totalCount: monthlyRecords.length,
      total: monthlyRecords.reduce((sum, record) => sum + record.amount, 0),
      homeCooking: {
        total: selfCooking.reduce((sum, record) => sum + record.amount, 0),
        count: selfCooking.length,
        average: selfCooking.length > 0 ? selfCooking.reduce((sum, record) => sum + record.amount, 0) / selfCooking.length : 0
      },
      eatingOut: {
        total: eatingOut.reduce((sum, record) => sum + record.amount, 0),
        count: eatingOut.length,
        average: eatingOut.length > 0 ? eatingOut.reduce((sum, record) => sum + record.amount, 0) / eatingOut.length : 0
      },
      dailyAverage: monthlyRecords.length > 0 ? monthlyRecords.reduce((sum, record) => sum + record.amount, 0) / 30 : 0,
      mealAverage: monthlyRecords.length > 0 ? monthlyRecords.reduce((sum, record) => sum + record.amount, 0) / monthlyRecords.length : 0
    };
  };

  // 現在の月の統計データを取得
  const getCurrentMonthStats = () => {
    const now = new Date();
    return getMonthlyStats(now.getFullYear(), now.getMonth() + 1);
  };

  // 指定期間の統計データを取得
  const getStatsForPeriod = (startDate: string, endDate: string) => {
    const periodRecords = costRecords.filter(record => 
      record.date >= startDate && record.date <= endDate
    );

    const selfCooking = periodRecords.filter(record => !record.is_eating_out);
    const eatingOut = periodRecords.filter(record => record.is_eating_out);

    return {
      totalAmount: periodRecords.reduce((sum, record) => sum + record.amount, 0),
      selfCookingAmount: selfCooking.reduce((sum, record) => sum + record.amount, 0),
      eatingOutAmount: eatingOut.reduce((sum, record) => sum + record.amount, 0),
      selfCookingCount: selfCooking.length,
      eatingOutCount: eatingOut.length,
      totalCount: periodRecords.length,
      records: periodRecords
    };
  };

  // コスト記録を保存（追加専用）
  const saveCostRecord = async (costRecord: Omit<CostRecord, 'id' | 'user_id' | 'created_at'>) => {
    return await addCostRecord(costRecord);
  };

  return {
    costRecords,
    loading,
    error,
    addCostRecord,
    updateCostRecord,
    deleteCostRecord,
    refetch,
    getMonthlyStats,
    getCurrentMonthStats,
    getStatsForPeriod,
    saveCostRecord
  };
};