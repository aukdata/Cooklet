-- Phase 1: 基本テーブル作成のみ
-- エラーが発生した場合は、このファイルから段階的に実行してください

-- 1. users テーブル (Supabase auth.usersと連携)
create table users (
  id uuid not null,
  email text not null,
  name text null,
  google_id text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  notification_enabled boolean not null default false,
  expiry_notification_days integer not null default 3,
  notification_time time without time zone null default '08:00:00'::time without time zone,
);


-- 2. ingredients テーブル (食材マスタ) - ユーザー認証対応
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vegetables', 'meat', 'seasoning', 'others')),
  default_unit TEXT NOT NULL,
  typical_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name) -- ユーザーごとに食材名がユニーク
);

-- 3. stock_items テーブル (食材在庫) - CLAUDE.md仕様書に準拠
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  best_before DATE,
  storage_location TEXT,
  is_homemade BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. meal_plans テーブル (献立計画) - CLAUDE.md仕様書に準拠
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('朝', '昼', '夜', '間食')),
  recipe_url TEXT,
  ingredients JSONB,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. shopping_list テーブル (買い物リスト) - CLAUDE.md仕様書に準拠
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  checked BOOLEAN DEFAULT FALSE,
  added_from TEXT CHECK (added_from IN ('manual', 'auto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. cost_records テーブル (コスト記録) - CLAUDE.md仕様書に追加
CREATE TABLE IF NOT EXISTS cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  is_eating_out BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. saved_recipes テーブル (レシピ保存) - CLAUDE.md仕様書に追加
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  servings INTEGER DEFAULT 1,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'テーブル作成が完了しました。次に02-create-indexes.sqlを実行してください。' AS message;