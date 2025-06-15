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
export const supabase = createClient(supabaseUrl, supabaseKey)