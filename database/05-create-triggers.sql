-- Phase 5: トリガー設定
-- 04-insert-data.sqlの実行後に実行してください

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
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;

-- トリガー設定 - CLAUDE.md仕様書に準拠
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_items_updated_at 
  BEFORE UPDATE ON stock_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
  BEFORE UPDATE ON meal_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Cooklet データベーススキーマのセットアップが完了しました！' AS message;