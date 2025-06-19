-- Cooklet データベース初期スキーマ作成パッチ
-- 作成日: 2025-06-18
-- 目的: CLAUDE.md仕様書に基づくテーブル構造の作成

-- 1. 献立テーブル（meal_plans）
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('朝', '昼', '夜', '間食')),
  recipe_url TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  memo TEXT,
  consumed_status TEXT DEFAULT 'pending' CHECK (consumed_status IN ('pending', 'completed', 'stored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 食材在庫テーブル（stock_items）
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  best_before DATE,
  storage_location TEXT,
  is_homemade BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 買い物リストテーブル（shopping_list）
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  checked BOOLEAN DEFAULT FALSE,
  added_from TEXT DEFAULT 'manual' CHECK (added_from IN ('manual', 'auto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. コスト記録テーブル（cost_records）
CREATE TABLE IF NOT EXISTS cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  is_eating_out BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. レシピ保存テーブル（saved_recipes）
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  servings INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_stock_items_user_best_before ON stock_items(user_id, best_before);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_checked ON shopping_list(user_id, checked);
CREATE INDEX IF NOT EXISTS idx_cost_records_user_date ON cost_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user ON saved_recipes(user_id);

-- RLS（Row Level Security）ポリシーの設定
-- 1. meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "meal_plans_user_policy" ON meal_plans;
CREATE POLICY "meal_plans_user_policy" ON meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- 2. stock_items
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stock_items_user_policy" ON stock_items;
CREATE POLICY "stock_items_user_policy" ON stock_items
  FOR ALL USING (auth.uid() = user_id);

-- 3. shopping_list
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shopping_list_user_policy" ON shopping_list;
CREATE POLICY "shopping_list_user_policy" ON shopping_list
  FOR ALL USING (auth.uid() = user_id);

-- 4. cost_records
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cost_records_user_policy" ON cost_records;
CREATE POLICY "cost_records_user_policy" ON cost_records
  FOR ALL USING (auth.uid() = user_id);

-- 5. saved_recipes
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_recipes_user_policy" ON saved_recipes;
CREATE POLICY "saved_recipes_user_policy" ON saved_recipes
  FOR ALL USING (auth.uid() = user_id);

-- トリガー関数（updated_at自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー作成
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_items_updated_at ON stock_items;
CREATE TRIGGER update_stock_items_updated_at
    BEFORE UPDATE ON stock_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE meal_plans IS '献立計画テーブル - 日別・食事タイプ別の献立管理';
COMMENT ON TABLE stock_items IS '食材在庫テーブル - 食材の在庫管理・賞味期限管理';
COMMENT ON TABLE shopping_list IS '買い物リストテーブル - 購入予定食材の管理';
COMMENT ON TABLE cost_records IS 'コスト記録テーブル - 自炊・外食の支出管理';
COMMENT ON TABLE saved_recipes IS 'レシピ保存テーブル - レシピURLとメタデータの管理';

COMMENT ON COLUMN meal_plans.consumed_status IS '消費状態 - pending: 未完了, completed: 完了, stored: 作り置き';
COMMENT ON COLUMN stock_items.is_homemade IS '作り置きフラグ - true: 作り置き, false: 購入品';
COMMENT ON COLUMN shopping_list.added_from IS '追加元 - manual: 手動追加, auto: 自動追加';
COMMENT ON COLUMN cost_records.is_eating_out IS '外食フラグ - true: 外食, false: 自炊';