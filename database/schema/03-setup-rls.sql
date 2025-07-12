-- Phase 3: Row Level Security (RLS) 設定（修正版）
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
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- usersテーブルのポリシー（修正版）
-- ユーザー自身のプロファイルの閲覧・更新を許可
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- ユーザー挿入ポリシー（認証ユーザーまたはサービスロールが挿入可能）
CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- サービスロール（Supabase内部）がユーザーを挿入できるようにする
CREATE POLICY "Service role can insert users" ON users 
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = id);

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

-- ingredientsテーブルはユーザー認証必須
DROP POLICY IF EXISTS "Everyone can view ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can manage own ingredients" ON ingredients;
CREATE POLICY "Users can manage own ingredients" ON ingredients 
  FOR ALL USING (auth.uid() = user_id);

-- Database Function: 認証ユーザー作成時に自動的にusersテーブルにプロファイルを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- 既存トリガーを削除してから作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Auth.usersに新しいユーザーが作成された時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'RLS設定（修正版）が完了しました。これでユーザー作成エラーが解決されます。' AS message;