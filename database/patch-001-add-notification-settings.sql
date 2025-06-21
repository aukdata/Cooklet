-- パッチ001: usersテーブルに通知設定を追加
-- 期限通知機能の実装に必要な設定項目を追加

-- usersテーブルに通知設定カラムを追加
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expiry_notification_days INTEGER DEFAULT 3;

-- カラムにコメントを追加
COMMENT ON COLUMN users.notification_enabled IS '通知機能の有効/無効（デフォルト: false）';
COMMENT ON COLUMN users.expiry_notification_days IS '期限通知を行う日数（デフォルト: 3日前）';

-- 既存のレコードに対してデフォルト値を設定
UPDATE users 
SET notification_enabled = FALSE, 
    expiry_notification_days = 3 
WHERE notification_enabled IS NULL 
   OR expiry_notification_days IS NULL;

-- NOT NULL制約を追加（デフォルト値設定後）
ALTER TABLE users 
ALTER COLUMN notification_enabled SET NOT NULL,
ALTER COLUMN expiry_notification_days SET NOT NULL;

-- 期限通知日数の制約を追加（1-30日の範囲）
ALTER TABLE users 
ADD CONSTRAINT check_expiry_notification_days 
CHECK (expiry_notification_days >= 1 AND expiry_notification_days <= 30);

SELECT 'usersテーブルに通知設定カラムが正常に追加されました。' AS message;