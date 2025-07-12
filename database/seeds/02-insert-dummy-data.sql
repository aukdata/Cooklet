-- Phase 6: ダミーデータ挿入（認証ユーザー作成後に実行）
-- 注意: このファイルは認証ユーザーが作成された後に、user_idを実際のIDに変更してから実行してください

-- ========================================
-- 使用方法：
-- 1. Supabaseで認証ユーザーを作成（サインアップ）
-- 2. 以下のクエリでユーザーIDを取得：
--    SELECT auth.uid() AS user_id;
-- 3. このファイル内の'YOUR_USER_ID_HERE'を実際のIDに置換
-- 4. このファイルを実行
-- ========================================

-- テスト用ユーザー（実際の認証ユーザーIDに置き換えてください）
INSERT INTO users (id, email, name) VALUES
('YOUR_USER_ID_HERE', 'test@cooklet.com', 'テストユーザー')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 在庫データ（stock_items）
-- ========================================

INSERT INTO stock_items (user_id, name, quantity, best_before, storage_location, is_homemade) VALUES
-- 冷蔵庫の在庫
('YOUR_USER_ID_HERE', '玉ねぎ', '3個', '2025-01-20', '冷蔵庫', false),
('YOUR_USER_ID_HERE', '人参', '2本', '2025-01-15', '冷蔵庫', false),
('YOUR_USER_ID_HERE', 'じゃがいも', '5個', '2025-01-25', '冷蔵庫', false),
('YOUR_USER_ID_HERE', '卵', '10個', '2025-01-18', '冷蔵庫', false),
('YOUR_USER_ID_HERE', '牛乳', '1本', '2025-01-16', '冷蔵庫', false),
('YOUR_USER_ID_HERE', '豆腐', '1丁', '2025-01-14', '冷蔵庫', false),
('YOUR_USER_ID_HERE', 'トマト', '3個', '2025-01-17', '冷蔵庫', false),
('YOUR_USER_ID_HERE', 'きゅうり', '2本', '2025-01-19', '冷蔵庫', false),

-- 冷凍庫の在庫
('YOUR_USER_ID_HERE', '鶏肉（もも）', '300g', '2025-02-15', '冷凍庫', false),
('YOUR_USER_ID_HERE', 'ひき肉（豚）', '250g', '2025-02-20', '冷凍庫', false),
('YOUR_USER_ID_HERE', 'ソーセージ', '5本', '2025-02-10', '冷凍庫', false),

-- 常温の在庫
('YOUR_USER_ID_HERE', '米', '5kg', '2025-06-30', '常温', false),
('YOUR_USER_ID_HERE', 'パスタ', '500g', '2025-12-31', '常温', false),
('YOUR_USER_ID_HERE', 'パン', '1斤', '2025-01-18', '常温', false),

-- 作り置き
('YOUR_USER_ID_HERE', 'カレー', '4人分', '2025-01-17', '冷蔵庫', true),
('YOUR_USER_ID_HERE', 'ハンバーグ', '6個', '2025-01-20', '冷凍庫', true),
('YOUR_USER_ID_HERE', '煮物', '3人分', '2025-01-16', '冷蔵庫', true)

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 献立データ（meal_plans）
-- ========================================

INSERT INTO meal_plans (user_id, date, meal_type, recipe_url, ingredients, memo) VALUES
-- 今日の献立
('YOUR_USER_ID_HERE', CURRENT_DATE, '朝', 'https://cookpad.com/recipe/toast', '[{"name":"パン","quantity":"2枚"},{"name":"バター","quantity":"10g"}]', 'バタートースト'),
('YOUR_USER_ID_HERE', CURRENT_DATE, '昼', null, '[{"name":"米","quantity":"150g"},{"name":"卵","quantity":"2個"},{"name":"醤油","quantity":"大さじ1"}]', '卵かけご飯'),
('YOUR_USER_ID_HERE', CURRENT_DATE, '夜', 'https://cookpad.com/recipe/hamburger', '[{"name":"ひき肉（豚）","quantity":"200g"},{"name":"玉ねぎ","quantity":"1個"},{"name":"卵","quantity":"1個"}]', 'ハンバーグ定食'),

-- 明日の献立
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '1 day', '朝', null, '[{"name":"米","quantity":"150g"},{"name":"味噌","quantity":"大さじ1"}]', '味噌汁とご飯'),
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '1 day', '昼', 'https://cookpad.com/recipe/oyakodon', '[{"name":"鶏肉（もも）","quantity":"100g"},{"name":"卵","quantity":"2個"},{"name":"米","quantity":"150g"}]', '親子丼'),
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '1 day', '夜', 'https://cookpad.com/recipe/pasta', '[{"name":"パスタ","quantity":"100g"},{"name":"トマト","quantity":"2個"}]', 'トマトパスタ'),

-- 明後日の献立
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '2 days', '朝', null, '[{"name":"パン","quantity":"2枚"},{"name":"卵","quantity":"1個"}]', 'スクランブルエッグトースト'),
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '2 days', '昼', null, '[{"name":"うどん","quantity":"1玉"},{"name":"卵","quantity":"1個"}]', '月見うどん'),
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '2 days', '夜', null, '[{"name":"鶏肉（もも）","quantity":"200g"},{"name":"人参","quantity":"1本"},{"name":"じゃがいも","quantity":"2個"}]', '肉じゃが'),

-- 3日後の献立
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '3 days', '朝', null, '[{"name":"米","quantity":"150g"},{"name":"卵","quantity":"1個"}]', '卵かけご飯'),
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '3 days', '夜', 'https://cookpad.com/recipe/curry', '[{"name":"鶏肉（もも）","quantity":"150g"},{"name":"玉ねぎ","quantity":"1個"},{"name":"人参","quantity":"1本"},{"name":"じゃがいも","quantity":"2個"}]', 'チキンカレー'),

-- 4日後の献立
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '4 days', '朝', null, '[{"name":"パン","quantity":"2枚"},{"name":"バター","quantity":"10g"}]', 'トースト'),
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '4 days', '昼', null, '[{"name":"パスタ","quantity":"100g"},{"name":"ベーコン","quantity":"50g"}]', 'ベーコンパスタ'),
('YOUR_USER_ID_HERE', CURRENT_DATE + INTERVAL '4 days', '夜', null, '[{"name":"豆腐","quantity":"1丁"},{"name":"味噌","quantity":"大さじ2"}]', '湯豆腐')

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 買い物リストデータ（shopping_list）
-- ========================================

INSERT INTO shopping_list (user_id, name, quantity, checked, added_from) VALUES
-- 自動追加された不足食材
('YOUR_USER_ID_HERE', 'トマト缶', '2缶', false, 'auto'),
('YOUR_USER_ID_HERE', 'にんにく', '1片', false, 'auto'),
('YOUR_USER_ID_HERE', 'オリーブオイル', '1本', false, 'auto'),
('YOUR_USER_ID_HERE', 'カレールー', '1箱', false, 'auto'),
('YOUR_USER_ID_HERE', '醤油', '1本', false, 'auto'),

-- 手動追加されたアイテム
('YOUR_USER_ID_HERE', 'ティッシュ', '1箱', false, 'manual'),
('YOUR_USER_ID_HERE', '洗剤', '1本', false, 'manual'),
('YOUR_USER_ID_HERE', 'ヨーグルト', '3個パック', false, 'manual'),
('YOUR_USER_ID_HERE', 'りんご', '5個', false, 'manual'),
('YOUR_USER_ID_HERE', 'みかん', '1袋', false, 'manual'),

-- 完了済みアイテム
('YOUR_USER_ID_HERE', 'パン', '1斤', true, 'manual'),
('YOUR_USER_ID_HERE', '牛乳', '1本', true, 'auto'),
('YOUR_USER_ID_HERE', 'バナナ', '1房', true, 'manual'),
('YOUR_USER_ID_HERE', '卵', '1パック', true, 'auto'),
('YOUR_USER_ID_HERE', 'もやし', '1袋', true, 'manual')

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- コスト記録データ（cost_records）
-- ========================================

INSERT INTO cost_records (user_id, date, description, amount, is_eating_out) VALUES
-- 今月の支出記録
('YOUR_USER_ID_HERE', CURRENT_DATE, '朝食 - トースト', 120, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '1 day', '夕食 - 居酒屋', 1500, true),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '1 day', '昼食 - 自作弁当', 200, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', '夕食 - ハンバーグ', 350, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', '昼食 - パスタ', 180, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', '朝食 - パン', 100, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', '昼食 - ラーメン店', 800, true),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', '夕食 - 肉じゃが', 300, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', '朝食 - おにぎり', 150, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', '昼食 - カフェ', 1200, true),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', '夕食 - カレー', 250, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '7 days', '朝食 - ヨーグルト', 80, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '8 days', '夕食 - 焼き魚', 400, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '9 days', '昼食 - うどん', 350, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '10 days', '朝食 - サンドイッチ', 300, false),

-- 先月の支出記録（サンプル）
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '30 days', '夕食 - 寿司', 2000, true),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '31 days', '昼食 - 弁当', 400, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '32 days', '朝食 - サンドイッチ', 300, false),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '33 days', '夕食 - 焼肉', 1800, true),
('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '34 days', '昼食 - パスタ', 250, false)

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 保存レシピデータ（saved_recipes）
-- ========================================

INSERT INTO saved_recipes (user_id, title, url, servings, tags) VALUES
-- 保存済みレシピ
('YOUR_USER_ID_HERE', 'ハンバーグ定食', 'https://cookpad.com/recipe/hamburger-set', 2, ARRAY['肉料理', 'メイン', '定食']),
('YOUR_USER_ID_HERE', '親子丼', 'https://cookpad.com/recipe/oyakodon', 1, ARRAY['丼物', '和食', '卵料理']),
('YOUR_USER_ID_HERE', 'トマトパスタ', 'https://recipe.rakuten.co.jp/tomato-pasta', 1, ARRAY['パスタ', 'イタリアン', 'トマト']),
('YOUR_USER_ID_HERE', 'チキンカレー', 'https://cookpad.com/recipe/chicken-curry', 4, ARRAY['カレー', '肉料理', 'スパイス']),
('YOUR_USER_ID_HERE', '野菜炒め', 'https://cookpad.com/recipe/yasai-itame', 2, ARRAY['野菜料理', '中華', '簡単']),
('YOUR_USER_ID_HERE', '味噌汁', 'https://cookpad.com/recipe/miso-soup', 4, ARRAY['汁物', '和食', '簡単']),
('YOUR_USER_ID_HERE', 'オムライス', 'https://recipe.rakuten.co.jp/omrice', 1, ARRAY['洋食', '卵料理', 'ライス']),
('YOUR_USER_ID_HERE', '唐揚げ', 'https://cookpad.com/recipe/karaage', 3, ARRAY['肉料理', '揚げ物', 'お弁当']),
('YOUR_USER_ID_HERE', 'サラダ', 'https://cookpad.com/recipe/fresh-salad', 2, ARRAY['野菜料理', 'サラダ', 'ヘルシー']),
('YOUR_USER_ID_HERE', 'チャーハン', 'https://cookpad.com/recipe/fried-rice', 1, ARRAY['中華', 'ライス', '簡単']),
('YOUR_USER_ID_HERE', 'グラタン', 'https://recipe.rakuten.co.jp/gratin', 4, ARRAY['洋食', 'オーブン', 'チーズ']),
('YOUR_USER_ID_HERE', '焼き魚定食', 'https://cookpad.com/recipe/grilled-fish', 1, ARRAY['魚料理', '和食', '定食']),
('YOUR_USER_ID_HERE', '麻婆豆腐', 'https://cookpad.com/recipe/mapo-tofu', 2, ARRAY['中華', '豆腐', '辛い']),
('YOUR_USER_ID_HERE', 'エビフライ', 'https://cookpad.com/recipe/ebi-fry', 2, ARRAY['海鮮', '揚げ物', '洋食']),
('YOUR_USER_ID_HERE', '鶏の照り焼き', 'https://cookpad.com/recipe/teriyaki', 2, ARRAY['鶏肉', '和食', 'メイン'])

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- データ挿入完了メッセージ
-- ========================================

SELECT 'ダミーデータの挿入が完了しました！

挿入されたデータ:
- 在庫: 16件（冷蔵庫8件、冷凍庫3件、常温3件、作り置き3件）
- 献立: 12件（5日分の朝昼夜）
- 買い物リスト: 15件（未完了10件、完了5件）
- コスト記録: 20件（今月15件、先月5件）
- 保存レシピ: 15件（様々なジャンル）

これで実際のアプリケーションでデータを確認できます。' AS message;