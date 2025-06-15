-- Cookletアプリのデータベーススキーマ（修正版）
-- エラーを避けるため段階的に実行可能な形式に分割

-- ========================================
-- Phase 1: 基本テーブル作成
-- ========================================

-- 1. users テーブル (Supabase auth.usersと連携)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ingredients テーブル (食材マスタ)
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('vegetables', 'meat', 'seasoning', 'others')),
  default_unit TEXT NOT NULL,
  typical_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- 4. recipes テーブル (レシピ)
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  external_url TEXT,
  cooking_time INTEGER,
  servings INTEGER DEFAULT 1,
  estimated_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. recipe_ingredients テーブル (レシピ-食材関連)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE
);

-- 6. meal_plans テーブル (献立計画) - CLAUDE.md仕様書に準拠
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

-- 7. shopping_list テーブル (買い物リスト) - CLAUDE.md仕様書に準拠
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  checked BOOLEAN DEFAULT FALSE,
  added_from TEXT CHECK (added_from IN ('manual', 'auto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. cost_records テーブル (コスト記録) - CLAUDE.md仕様書に追加
CREATE TABLE IF NOT EXISTS cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  is_eating_out BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. saved_recipes テーブル (レシピ保存) - CLAUDE.md仕様書に追加
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  servings INTEGER DEFAULT 1,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Phase 2: インデックス作成
-- ========================================

-- パフォーマンス向上のためのインデックス（テーブル存在チェック付き）
DO $$
BEGIN
  -- stock_itemsテーブルのインデックス
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_items') THEN
    CREATE INDEX IF NOT EXISTS idx_stock_items_user_best_before ON stock_items(user_id, best_before);
  END IF;
  
  -- meal_plansテーブルのインデックス
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plans') THEN
    CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
  END IF;
  
  -- shopping_listテーブルのインデックス
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopping_list') THEN
    CREATE INDEX IF NOT EXISTS idx_shopping_list_user_checked ON shopping_list(user_id, checked);
  END IF;
  
  -- cost_recordsテーブルのインデックス
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_records') THEN
    CREATE INDEX IF NOT EXISTS idx_cost_records_user_date ON cost_records(user_id, date);
  END IF;
END $$;

-- ========================================
-- Phase 3: Row Level Security (RLS) 設定
-- ========================================

-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Phase 4: RLSポリシー作成
-- ========================================

-- 既存ポリシーが存在する場合は削除してから作成
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- usersテーブルのポリシー
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- その他のテーブルのポリシー（一括管理）
DROP POLICY IF EXISTS "Users can manage own stock items" ON stock_items;
DROP POLICY IF EXISTS "Users can manage own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can manage own shopping list" ON shopping_list;
DROP POLICY IF EXISTS "Users can manage own cost records" ON cost_records;
DROP POLICY IF EXISTS "Users can manage own saved recipes" ON saved_recipes;

CREATE POLICY "Users can manage own stock items" ON stock_items 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recipes" ON recipes 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meal plans" ON meal_plans 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own shopping list" ON shopping_list 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cost records" ON cost_records 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved recipes" ON saved_recipes 
  FOR ALL USING (auth.uid() = user_id);

-- ingredientsテーブルは全ユーザーが参照可能
DROP POLICY IF EXISTS "Everyone can view ingredients" ON ingredients;
CREATE POLICY "Everyone can view ingredients" ON ingredients 
  FOR SELECT USING (true);

-- recipe_ingredientsは対応するrecipeの所有者がアクセス可能
DROP POLICY IF EXISTS "Users can manage recipe ingredients" ON recipe_ingredients;
CREATE POLICY "Users can manage recipe ingredients" ON recipe_ingredients 
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id
    )
  );

-- ========================================
-- Phase 5: 基本データ挿入
-- ========================================

-- 基本的な食材データの挿入（重複を避ける）
INSERT INTO ingredients (name, category, default_unit, typical_price) VALUES
-- 野菜
('玉ねぎ', 'vegetables', '個', 100),
('人参', 'vegetables', '本', 80),
('じゃがいも', 'vegetables', '個', 60),
('キャベツ', 'vegetables', '個', 200),
('白菜', 'vegetables', '個', 300),
('大根', 'vegetables', '本', 150),
('トマト', 'vegetables', '個', 120),
('きゅうり', 'vegetables', '本', 80),
('ほうれん草', 'vegetables', '束', 150),
('小松菜', 'vegetables', '束', 120),

-- 肉類
('豚肉（バラ）', 'meat', 'g', 2.5),
('豚肉（こま切れ）', 'meat', 'g', 2.0),
('鶏肉（もも）', 'meat', 'g', 1.8),
('鶏肉（むね）', 'meat', 'g', 1.2),
('牛肉（切り落とし）', 'meat', 'g', 3.0),
('ひき肉（豚）', 'meat', 'g', 1.8),
('ひき肉（鶏）', 'meat', 'g', 1.5),

-- 調味料
('醤油', 'seasoning', 'ml', 0.3),
('味噌', 'seasoning', 'g', 0.8),
('塩', 'seasoning', 'g', 0.1),
('砂糖', 'seasoning', 'g', 0.2),
('酒', 'seasoning', 'ml', 0.5),
('みりん', 'seasoning', 'ml', 0.8),
('酢', 'seasoning', 'ml', 0.6),
('油', 'seasoning', 'ml', 0.4),

-- その他
('米', 'others', 'g', 0.6),
('卵', 'others', '個', 30),
('牛乳', 'others', 'ml', 0.2),
('パン', 'others', '枚', 40)

ON CONFLICT (name) DO NOTHING;

-- ========================================
-- Phase 6: トリガー設定
-- ========================================

-- 更新日時の自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 既存トリガーを削除してから作成
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_stock_items_updated_at ON stock_items;
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;

-- トリガー設定 - CLAUDE.md仕様書に準拠
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_items_updated_at 
  BEFORE UPDATE ON stock_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
  BEFORE UPDATE ON meal_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- セットアップ完了の確認
SELECT 'Cooklet データベーススキーマのセットアップが完了しました。' AS message;