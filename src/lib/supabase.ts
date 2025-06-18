import { createClient } from '@supabase/supabase-js'

// Vite環境変数からSupabaseの設定を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 必要な環境変数が設定されているかチェック
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Supabaseクライアントを作成してエクスポート
// このクライアントがアプリケーション全体でデータベースアクセスに使用される
export const supabase = createClient(supabaseUrl, supabaseKey, {
  // リアルタイム設定の最適化
  realtime: {
    // WebSocketパラメータの設定
    params: {
      eventsPerSecond: 10,
    },
    // リアルタイム接続のタイムアウト設定
    timeout: 20000,
    // ハートビート間隔の設定
    heartbeatIntervalMs: 30000,
    // リコネクト設定
    reconnectAfterMs: function (tries: number) {
      // 指数バックオフで再接続（最大15秒）
      return Math.min(Math.pow(2, tries) * 1000, 15000);
    },
  },
  // データベース接続の設定
  db: {
    schema: 'public',
  },
  // 認証設定
  auth: {
    // 自動リフレッシュの設定
    autoRefreshToken: true,
    // セッション検出の設定
    detectSessionInUrl: true,
    // 永続化の設定
    persistSession: true,
    // ストレージの設定
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  // グローバル設定
  global: {
    // ヘッダー設定
    headers: {
      'X-Client-Info': 'cooklet-app',
    },
  },
})