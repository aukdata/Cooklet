-- Phase 2: インデックス作成
-- 01-create-tables.sqlの実行後に実行してください

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_stock_items_user_best_before ON stock_items(user_id, best_before);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_checked ON shopping_list(user_id, checked);
CREATE INDEX IF NOT EXISTS idx_cost_records_user_date ON cost_records(user_id, date);

SELECT 'インデックス作成が完了しました。次に03-setup-rls.sqlを実行してください。' AS message;