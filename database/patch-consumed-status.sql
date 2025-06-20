-- 献立テーブルに消費状態フィールドを追加
-- CLAUDE.md仕様書に従って、消費状態管理機能を追加

-- meal_plansテーブルにconsumed_statusカラムを追加
ALTER TABLE meal_plans 
ADD COLUMN IF NOT EXISTS consumed_status TEXT DEFAULT 'pending' 
CHECK (consumed_status IN ('pending', 'completed', 'stored'));

-- 既存データのconsumed_statusを'pending'に設定
UPDATE meal_plans 
SET consumed_status = 'pending' 
WHERE consumed_status IS NULL;

-- コメント追加
COMMENT ON COLUMN meal_plans.consumed_status IS '消費状態: pending(未完了), completed(完食), stored(作り置き)';

SELECT 'consumed_statusフィールドがmeal_plansテーブルに追加されました。' AS message;