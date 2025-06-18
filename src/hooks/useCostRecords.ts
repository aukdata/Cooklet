import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// コスト記録データの型定義（CLAUDE.md仕様書準拠）
export interface CostRecord {
  id?: string;
  user_id?: string;
  date: string;
  description?: string;
  amount: number;
  is_eating_out: boolean;
  created_at?: string;
}

// useCostRecordsフック - Supabase cost_recordsテーブルとの連携
export const useCostRecords = () => {
  const [costRecords, setCostRecords] = useState<CostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // コスト記録データを取得
  const fetchCostRecords = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('cost_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setCostRecords(data || []);
    } catch (err) {
      console.error('コスト記録データの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'コスト記録データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // コスト記録を追加
  const addCostRecord = async (costRecord: Omit<CostRecord, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('cost_records')
        .insert([
          {
            user_id: user.id,
            date: costRecord.date,
            description: costRecord.description,
            amount: costRecord.amount,
            is_eating_out: costRecord.is_eating_out
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // ローカル状態を更新
      setCostRecords(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('コスト記録の追加に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'コスト記録の追加に失敗しました');
      throw err;
    }
  };

  // コスト記録を更新
  const updateCostRecord = async (id: string, updates: Partial<Omit<CostRecord, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('cost_records')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // ローカル状態を更新
      setCostRecords(prev => 
        prev.map(record => record.id === id ? data : record)
      );
      return data;
    } catch (err) {
      console.error('コスト記録の更新に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'コスト記録の更新に失敗しました');
      throw err;
    }
  };

  // コスト記録を削除
  const deleteCostRecord = async (id: string) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('cost_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // ローカル状態を更新
      setCostRecords(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      console.error('コスト記録の削除に失敗しました:', err);
      setError(err instanceof Error ? err.message : 'コスト記録の削除に失敗しました');
      throw err;
    }
  };

  // コスト記録を保存（追加または更新）
  const saveCostRecord = async (costRecord: CostRecord) => {
    if (costRecord.id) {
      return await updateCostRecord(costRecord.id, costRecord);
    } else {
      return await addCostRecord(costRecord);
    }
  };

  // 指定期間のコスト記録を取得
  const getCostRecordsForPeriod = (startDate: string, endDate: string) => {
    return costRecords.filter(record => 
      record.date >= startDate && record.date <= endDate
    );
  };

  // 月別のコスト統計を取得
  const getMonthlyStats = (year: number, month: number) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 月末日
    
    const monthlyRecords = getCostRecordsForPeriod(startDate, endDate);
    
    const homeCooking = monthlyRecords.filter(record => !record.is_eating_out);
    const eatingOut = monthlyRecords.filter(record => record.is_eating_out);
    
    const homeCookingTotal = homeCooking.reduce((sum, record) => sum + record.amount, 0);
    const eatingOutTotal = eatingOut.reduce((sum, record) => sum + record.amount, 0);
    const total = homeCookingTotal + eatingOutTotal;
    
    return {
      total,
      homeCooking: {
        total: homeCookingTotal,
        count: homeCooking.length,
        average: homeCooking.length > 0 ? Math.round(homeCookingTotal / homeCooking.length) : 0
      },
      eatingOut: {
        total: eatingOutTotal,
        count: eatingOut.length,
        average: eatingOut.length > 0 ? Math.round(eatingOutTotal / eatingOut.length) : 0
      },
      dailyAverage: Math.round(total / new Date(year, month, 0).getDate()),
      mealAverage: (homeCooking.length + eatingOut.length) > 0 ? 
        Math.round(total / (homeCooking.length + eatingOut.length)) : 0
    };
  };

  // 今月の統計を取得
  const getCurrentMonthStats = () => {
    const now = new Date();
    return getMonthlyStats(now.getFullYear(), now.getMonth() + 1);
  };

  // 指定日のコスト記録を取得
  const getCostRecordsForDate = (date: string) => {
    return costRecords.filter(record => record.date === date);
  };

  // コスト記録を検索
  const searchCostRecords = (query: string) => {
    return costRecords.filter(record => 
      record.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // 初回データ取得
  useEffect(() => {
    fetchCostRecords();
  }, [fetchCostRecords]);

  // リアルタイム更新の設定
  useEffect(() => {
    if (!user?.id) return;

    let subscriptionRef: any = null;
    let isSubscribed = false;

    const setupSubscription = async () => {
      try {
        // ユニークなチャンネル名を生成（タイムスタンプ付き）
        const channelName = `cost_records_${user.id}_${Date.now()}`;
        
        subscriptionRef = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cost_records',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              // データが変更された場合は再取得
              console.log('コスト記録データが変更されました:', payload);
              
              // リアルタイム更新の際はローディングを表示しない
              try {
                setError(null);

                const { data, error: fetchError } = await supabase
                  .from('cost_records')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('date', { ascending: false })
                  .order('created_at', { ascending: false });

                if (fetchError) {
                  throw fetchError;
                }

                setCostRecords(data || []);
              } catch (err) {
                console.error('コスト記録データの取得に失敗しました:', err);
                setError(err instanceof Error ? err.message : 'コスト記録データの取得に失敗しました');
              }
            }
          )
          .subscribe((status: string) => {
            console.log('コスト記録データのサブスクリプション状態:', status);
            
            if (status === 'SUBSCRIBED') {
              isSubscribed = true;
              console.log('コスト記録データのリアルタイム更新が開始されました');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('コスト記録データのサブスクリプションエラー');
              setError('リアルタイム更新に失敗しました');
            } else if (status === 'TIMED_OUT') {
              console.warn('コスト記録データのサブスクリプションタイムアウト');
              // タイムアウトした場合は再試行
              setTimeout(() => {
                if (!isSubscribed) {
                  setupSubscription();
                }
              }, 5000);
            } else if (status === 'CLOSED') {
              console.log('コスト記録データのサブスクリプションが閉じられました');
              isSubscribed = false;
            }
          });

      } catch (error) {
        console.error('コスト記録データのサブスクリプション設定に失敗しました:', error);
        setError('リアルタイム更新の設定に失敗しました');
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (subscriptionRef) {
        try {
          supabase.removeChannel(subscriptionRef);
          console.log('コスト記録データのサブスクリプションをクリーンアップしました');
        } catch (error) {
          console.error('コスト記録データのサブスクリプションクリーンアップに失敗しました:', error);
        }
      }
    };
  }, [user?.id]);

  return {
    costRecords,
    loading,
    error,
    addCostRecord,
    updateCostRecord,
    deleteCostRecord,
    saveCostRecord,
    getCostRecordsForPeriod,
    getMonthlyStats,
    getCurrentMonthStats,
    getCostRecordsForDate,
    searchCostRecords,
    refetch: fetchCostRecords
  };
};