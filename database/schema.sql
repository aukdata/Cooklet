-- Cookletアプリのデータベーススキーマ
-- Supabase SQL Editorで実行してください

-- 1. users テーブル (Supabase auth.usersと連携)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  google_id VARCHAR UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ingredients テーブル (食材マスタ)
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  category VARCHAR NOT NULL CHECK (category IN ('vegetables', 'meat', 'seasoning', 'others')),
  default_unit VARCHAR NOT NULL,
  typical_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. inventory テーブル (在庫)
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR NOT NULL,
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  expiry_date DATE,
  location VARCHAR NOT NULL CHECK (location IN ('refrigerator', 'freezer', 'pantry')),
  is_leftover BOOLEAN DEFAULT FALSE,
  leftover_recipe_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. recipes テーブル (レシピ)
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
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
  unit VARCHAR NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE
);

-- 6. meal_plans テーブル (献立計画)
CREATE TABLE IF NOT EXISTS meal_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  meal_type VARCHAR NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id INTEGER REFERENCES recipes(id),
  servings INTEGER DEFAULT 1,
  actual_cost DECIMAL(10,2),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. shopping_lists テーブル (買い物リスト)
CREATE TABLE IF NOT EXISTS shopping_lists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR NOT NULL,
  estimated_price DECIMAL(10,2),
  source_meal_plan_id INTEGER REFERENCES meal_plans(id),
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP WITH TIME ZONE,
  actual_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_inventory_user_expiry ON inventory(user_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_purchased ON shopping_lists(user_id, is_purchased);

-- Row Level Security (RLS) 設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成 (ユーザーは自分のデータのみアクセス可能)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own inventory" ON inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own recipes" ON recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own meal plans" ON meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own shopping lists" ON shopping_lists FOR ALL USING (auth.uid() = user_id);

-- ingredients テーブルは全ユーザーが参照可能
CREATE POLICY "Everyone can view ingredients" ON ingredients FOR SELECT USING (true);

-- 基本的な食材データの挿入
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

-- 更新日時の自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();