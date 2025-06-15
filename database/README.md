# Cooklet データベースセットアップガイド

## エラー解決について

`ERROR: 42703: column "date" does not exist` エラーが発生した場合、以下の段階的実行方法を使用してください。

## 段階的セットアップ手順

エラーを避けるため、以下の順序でSQLファイルを実行してください：

### 1. テーブル作成
```sql
-- ファイル: 01-create-tables.sql
-- Supabase SQL Editorで実行
```
基本的なテーブル構造を作成します。

### 2. インデックス作成
```sql
-- ファイル: 02-create-indexes.sql
-- テーブル作成後に実行
```
パフォーマンス向上のためのインデックスを作成します。

### 3. Row Level Security設定
```sql
-- ファイル: 03-setup-rls.sql
-- インデックス作成後に実行
```
セキュリティポリシーを設定します。

### 4. 基本データ挿入
```sql
-- ファイル: 04-insert-data.sql
-- RLS設定後に実行
```
食材マスタデータを挿入します。

### 5. トリガー設定
```sql
-- ファイル: 05-create-triggers.sql
-- データ挿入後に実行
```
更新日時の自動更新トリガーを設定します。

## 一括実行方法（推奨）

エラーが発生しなければ、以下のファイルで一括実行可能です：

```sql
-- ファイル: schema-fixed.sql
-- 修正版 - エラーハンドリング付き
```

## 実行方法

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. 左メニューから "SQL Editor" を選択
4. "New query" をクリック
5. 上記SQLファイルの内容をコピー&ペースト
6. "Run" ボタンで実行

## エラーが発生した場合

### "column 'date' does not exist"
- テーブル作成が完了していません
- `01-create-tables.sql`から順番に実行してください

### "relation 'users' does not exist"
- usersテーブルが作成されていません
- `01-create-tables.sql`を先に実行してください

### "policy already exists"
- 既存のポリシーが残っています
- `DROP POLICY`文が実行されているか確認してください

## テーブル構造確認

セットアップ完了後、以下のクエリでテーブル作成を確認できます：

```sql
-- 作成されたテーブル一覧
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 各テーブルの列情報
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

## 対象テーブル

CLAUDE.md仕様書に準拠した以下のテーブルが作成されます：

- `users` - ユーザー情報
- `ingredients` - 食材マスタ
- `stock_items` - 在庫情報
- `meal_plans` - 献立計画
- `shopping_list` - 買い物リスト
- `cost_records` - コスト記録
- `saved_recipes` - 保存レシピ

## ダミーデータの追加

基本セットアップ完了後、テスト用ダミーデータを追加できます：

### 6. ダミーデータ挿入（オプション）
```sql
-- ファイル: 06-insert-dummy-data.sql
-- 認証ユーザー作成後に実行
```

**手順:**
1. Supabaseでユーザー登録（サインアップ）
2. 以下のクエリでユーザーIDを取得：
   ```sql
   SELECT auth.uid() AS user_id;
   ```
3. `06-insert-dummy-data.sql`内の`YOUR_USER_ID_HERE`を実際のIDに置換
4. SQLを実行

**含まれるダミーデータ:**
- **在庫データ**: 16件（冷蔵庫・冷凍庫・常温・作り置き）
- **献立データ**: 12件（5日分の朝昼夜の献立）
- **買い物リスト**: 15件（未完了・完了アイテム）
- **コスト記録**: 20件（今月・先月の支出履歴）
- **保存レシピ**: 15件（様々なジャンルのレシピ）

## 次のステップ

データベースセットアップ完了後：
1. `.env`ファイルの環境変数を確認
2. アプリケーションの再起動
3. ログイン機能のテスト
4. （オプション）ダミーデータの追加でデモ体験