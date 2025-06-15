-- Phase 3: Row Level Security (RLS) 設定
-- 02-create-indexes.sqlの実行後に実行してください

-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

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

-- その他のテーブルのポリシー
DROP POLICY IF EXISTS "Users can manage own stock items" ON stock_items;
DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can manage own shopping list" ON shopping_list;
DROP POLICY IF EXISTS "Users can manage own cost records" ON cost_records;
DROP POLICY IF EXISTS "Users can manage own saved recipes" ON saved_recipes;

CREATE POLICY "Users can manage own stock items" ON stock_items 
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

SELECT 'RLS設定が完了しました。次に04-insert-data.sqlを実行してください。' AS message;