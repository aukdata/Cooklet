-- ingredientsテーブルにuser_id列を追加し、ユーザー認証対応に変更するパッチ
-- 既存データをバックアップしてから実行することを推奨

-- Phase 1: ingredientsテーブルにuser_id列を追加
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Phase 2: 既存のRLSポリシーを削除
DROP POLICY IF EXISTS "Everyone can view ingredients" ON ingredients;

-- Phase 3: 新しいRLSポリシーを作成（ユーザー認証必須）
CREATE POLICY "Users can manage own ingredients" ON ingredients 
  FOR ALL USING (auth.uid() = user_id);

-- Phase 4: 既存のingredients データにuser_idを設定（オプション）
-- 注意: 既存データがある場合、特定のユーザーIDに割り当てるか、削除する必要があります
-- 例: 管理者ユーザーのIDに割り当てる場合
-- UPDATE ingredients SET user_id = 'ADMIN_USER_UUID_HERE' WHERE user_id IS NULL;

-- または、既存データを削除する場合
-- DELETE FROM ingredients WHERE user_id IS NULL;

SELECT 'ingredientsテーブルのユーザー認証対応パッチが完了しました。' AS message;
SELECT 'IMPORTANT: 既存のingredientsデータにuser_idを設定するか削除してください。' AS warning;