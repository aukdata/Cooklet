# Cooklet データベースセットアップガイド

## 概要

このディレクトリには、Supabaseデータベースのセットアップに必要なSQLファイルが含まれています。
`schema`ディレクトリにはテーブル定義やポリシーなどのスキーマ関連のファイルが、`seeds`ディレクトリには初期データやダミーデータが含まれています。

## セットアップ手順

以下の順序でSQLファイルを実行してください。

### 1. スキーマのセットアップ

`schema`ディレクトリ内のファイルを番号順に実行します。

1.  **テーブル作成:** `schema/01-create-tables.sql`
2.  **インデックス作成:** `schema/02-create-indexes.sql`
3.  **Row Level Security設定:** `schema/03-setup-rls.sql`
4.  **トリガー設定:** `schema/04-create-triggers.sql`

### 2. 初期データの投入

`seeds`ディレクトリ内のファイルを実行します。

1.  **基本データ挿入:** `seeds/01-insert-data.sql`
    *   食材マスタデータなどを挿入します。

### 3. ダミーデータの追加（オプション）

テストや開発用にダミーデータを追加できます。

1.  **ダミーデータ挿入:** `seeds/02-insert-dummy-data.sql`
    *   **注意:** 実行前にファイル内の`YOUR_USER_ID_HERE`を、Supabaseでサインアップしたご自身のユーザーIDに置き換える必要があります。
    *   ユーザーIDは `SELECT auth.uid();` で取得できます。

## 実行方法

1.  [Supabase Dashboard](https://app.supabase.com) にログイン
2.  プロジェクトを選択
3.  左メニューから "SQL Editor" を選択
4.  "New query" をクリック
5.  上記SQLファイルの内容をコピー&ペースト
6.  "Run" ボタンで実行

## エラーが発生した場合

-   **"column 'date' does not exist"**: テーブル作成が完了していません。`schema/01-create-tables.sql`から順番に実行してください。
-   **"relation 'users' does not exist"**: usersテーブルが作成されていません。`schema/01-create-tables.sql`を先に実行してください。
-   **"policy already exists"**: 既存のポリシーが残っています。各ファイルの`DROP POLICY`文が実行されているか確認してください。
