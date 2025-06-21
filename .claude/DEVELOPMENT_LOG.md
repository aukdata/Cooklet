# Cooklet 開発ログ

## 2025-06-21

### 実装内容
- **毎朝の通知機能を実装**
  - 設定画面で通知時間を設定可能（デフォルト08:00）
  - 毎日指定した時間に期限の近い食材を通知
  - 通知の有効/無効切り替え機能

### データベース変更
- `users`テーブルに朝の通知関連カラムを追加
  - `notification_enabled: BOOLEAN DEFAULT FALSE`
  - `notification_time: TIME DEFAULT '08:00'`
  - パッチファイル: `database/patch-morning-notification.sql`

### 新規ファイル
- `src/services/notificationService.ts`: 朝の通知スケジュール管理
- `src/components/MorningNotificationManager.tsx`: 朝の通知管理コンポーネント

### 既存ファイル変更
- `src/pages/settings/Settings.tsx`: 朝の通知設定UIを追加
- `src/App.tsx`: MorningNotificationManagerを追加
- `CLAUDE.md`: 通知機能の仕様を更新

### 技術仕様
- **スケジュール管理**: setTimeout を使用した毎日の通知スケジュール
- **権限管理**: ブラウザの通知権限を要求・確認
- **データ永続化**: Supabaseの users テーブルで設定を保存
- **自動再スケジュール**: アプリ起動時に設定を読み込み、有効な場合は自動でスケジュール

### 引き継ぎ事項
1. **データベースパッチ適用**: `database/patch-morning-notification.sql` を実行
2. **通知権限**: 初回利用時にブラウザの通知権限許可が必要
3. **タイムゾーン**: 現在はユーザーのローカル時間で動作
4. **バックグラウンド動作**: PWAでのバックグラウンド通知はService Workerでの実装が理想的

## 2025-06-20

### 実装内容
- **CLAUDE.md仕様書の内容をコードベースに反映**
  - データベース設計の修正（consumed_statusフィールド追加）
  - TypeScript型定義の修正（MealPlan型、SavedRecipe型の追加）
  - 各ディレクトリのCLAUDE.mdファイル更新

### データベース変更
- `meal_plans`テーブルに`consumed_status`フィールドを追加
  - 値: 'pending'（未完了）, 'completed'（完食）, 'stored'（作り置き）
  - パッチファイル: `database/patch-consumed-status.sql`

### 型定義変更
- `MealPlan`インターフェースに`consumed_status`フィールド追加
- `SavedRecipe`インターフェース追加（CLAUDE.md仕様書準拠）
- 日本語での食事タイプ（朝・昼・夜・間食）使用を統一

### UI/UX仕様統一
- `.claude/UI.md`を CLAUDE.md仕様書に合わせて更新
- 既存のダイアログ統一デザインルールを維持
- グローバルタブ構成の明確化（6タブ構成）

### 引き継ぎ事項
1. **データベースパッチの適用**: `database/patch-consumed-status.sql` をSupabaseで実行が必要
2. **型安全性の徹底**: `any`型は絶対使用禁止、必ず型定義を記述
3. **日本語コメント**: すべてのソースコードに日本語コメントを追加
4. **CLAUDE.mdとの整合性**: コード変更時は必ずCLAUDE.mdの仕様書も更新

### 注意事項
- oxlint抑制コメント（`// oxlint-disable`）は使用禁止
- pre-commit/pre-push hookによる品質管理が自動化済み
- 変更保存時は適宜 `git add . && git commit -m "wip" && git push` を実行

### 最新実装内容（ELEMENTS.md作成）
- **ELEMENTS.md作成**: 既存要素の完全リファレンス文書作成
  - 全TypeScript型定義の一覧化
  - 全UIコンポーネントの機能・プロパティ整理
  - 全カスタムフックの機能説明
  - 全ユーティリティ関数の用途明記
  - 新要素追加時のガイドライン策定

### CLAUDE.md新ルール追加への対応
- 新しい制約ルールに対応：「要素追加時は.claude/ELEMENTS.mdの既存要素を活用」
- 開発効率向上とコード重複防止の仕組み構築
- 既存要素再利用の促進体制整備

### 次セッションでの作業予定
- 各コンポーネントのCLAUDE.md仕様書準拠チェック
- 消費状態管理機能の実装
- レシピ保存機能の完全実装
- UI一貫性の全画面チェック
- ELEMENTS.md活用による新機能開発効率化