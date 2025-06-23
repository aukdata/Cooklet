# Cooklet 開発ログ

## 2025-06-22

### 【最新】食材マスタと在庫管理システムの大幅改善完了

#### 実装内容
- **材料編集ダイアログの単位入力をコンボボックスに変更**
  - 手動入力からFOOD_UNITS（23種類）からの選択式に変更
  - UI/UXの統一性向上と入力エラー防止

- **在庫管理関連の型統一とプロパティ名camelCase化**
  - 全ての型定義をcamelCaseに一貫して変更
  - original_name → originalName
  - conversion_quantity → conversionQuantity  
  - conversion_unit → conversionUnit
  - データベーススキーマとアプリケーション層の分離明確化

- **食材マスタ機能拡張**
  - originalNameプロパティ: レシート読み取り時の商品名正規化用
  - conversionQuantityプロパティ: 1個当たりの数量管理
  - conversionUnitプロパティ: 1個当たりの単位管理
  - 商品名の自動正規化精度向上

- **新規アイテム追加ダイアログ実装**
  - 買い物リストへの手動アイテム追加機能
  - 名前・数量・単位の統合入力UI

#### 技術改善
- **バリデーション強化**: nameとdefaultUnitのnullチェック追加
- **型安全性向上**: MealType型定義の一貫性確保（'朝' | '昼' | '夜' | '間食'）
- **データ整合性**: RawReceiptItem型削除、ReceiptItem型のoriginalNameプロパティ追加
- **コンポーネント統一**: NameQuantityUnitInputとQuantityInputコンポーネント追加

#### 新規作成コンポーネント・ファイル
- `src/components/common/NameQuantityUnitInput.tsx`: 名前・数量・単位統合入力コンポーネント
- `src/components/common/QuantityInput.tsx`: 数値・単位分離入力コンポーネント  
- `src/components/common/CLAUDE.md`: 共通コンポーネントドキュメント
- `src/constants/CLAUDE.md`: 定数・単位管理ドキュメント
- `src/services/CLAUDE.md`: サービス層ドキュメント

#### データベース更新影響
```sql
-- 食材マスタテーブル構造（最新）
ingredients (
  id: SERIAL PRIMARY KEY,
  user_id: UUID REFERENCES auth.users(id),
  name: TEXT NOT NULL,
  category: TEXT CHECK (category IN ('vegetables', 'meat', 'seasoning', 'others')),
  default_unit: TEXT NOT NULL,
  typical_price: DECIMAL(10,2),
  original_name: TEXT NOT NULL,           -- 新規追加
  conversion_quantity: TEXT,              -- 新規追加  
  conversion_unit: TEXT,                  -- 新規追加
  created_at: TIMESTAMP DEFAULT NOW()
)
```

#### 引き継ぎ事項
1. **型定義完全統一**: TypeScript側は全てcamelCase、DB側はsnake_case
2. **単位管理システム完成**: FOOD_UNITS（23種類）による厳密な単位管理
3. **商品名正規化高精度化**: originalNameプロパティでマッチング精度向上
4. **共通コンポーネント利用推進**: NameQuantityUnitInput, QuantityInputの活用
5. **ドキュメント体系整備**: 各ディレクトリのCLAUDE.md完備

## 2025-06-21

### 【最新】レシートOCR機能のNetlify Functions TypeScript化完了

#### 実装内容
- **Netlify Functions をJavaScriptからTypeScriptに移行**
  - `receiptOCR.js` → `receiptOCR.ts`: Google Vision API レシートOCR処理
  - `proxy.js` → `proxy.ts`: レシピサイトプロキシ処理
  - 厳密な型定義による型安全性の大幅向上

#### 新規作成ファイル
- `netlify/functions/types/shared.ts`: 共通型定義システム
  - OCR・プロキシAPI用統一インターフェース
  - エラーハンドリング・バリデーション用型
  - Netlify Functions共通レスポンス型
- `netlify/functions/tsconfig.json`: TypeScript設定（Netlify Functions用）
- `netlify/functions/package.json`: 依存関係更新（`@netlify/functions`等）
- `.claude/TYPESCRIPT_MIGRATION.md`: 移行詳細ドキュメント

#### 型安全性の向上
```typescript
// Before (JavaScript) - 実行時エラーリスク
const validation = validateImageData(image);

// After (TypeScript) - コンパイル時型チェック
const validation: ValidationResult = validateImageData(image);
const response: OCRSuccessResponse = { success: true, data: {...} };
```

#### 技術仕様
- **TypeScript設定**: ES2022 target, CommonJS module, strict mode
- **型定義共有**: フロントエンドとバックエンド間での型統一
- **エラーハンドリング**: 分類された型安全なエラーレスポンス
- **IDEサポート**: 自動補完・リファクタリング・エラー検出

#### セキュリティ・パフォーマンス向上
- APIキーのサーバーサイド管理（GOOGLE_CLOUD_API_KEY）
- CORS制限とOrigin検証
- 詳細なログ出力とエラー分類
- レスポンス形式の統一

#### 引き継ぎ事項
1. **手動削除必要**: 古いJSファイル（`receiptOCR.js`, `proxy.js`）
2. **環境変数設定**: `GOOGLE_CLOUD_API_KEY`, `ALLOWED_ORIGINS`
3. **第二段階準備完了**: 構造化データ抽出（`{items: [{name, count, price}], total_price, store_name}`）
4. **型定義拡張**: 必要に応じて `types/shared.ts` を拡張

### 毎朝の通知機能を実装

#### 実装内容
- **毎朝の通知機能を実装**
  - 設定画面で通知時間を設定可能（デフォルト08:00）
  - 毎日指定した時間に期限の近い食材を通知
  - 通知の有効/無効切り替え機能

#### データベース変更
- `users`テーブルに朝の通知関連カラムを追加
  - `notification_enabled: BOOLEAN DEFAULT FALSE`
  - `notification_time: TIME DEFAULT '08:00'`
  - パッチファイル: `database/patch-morning-notification.sql`

#### 新規ファイル
- `src/services/notificationService.ts`: 朝の通知スケジュール管理
- `src/components/MorningNotificationManager.tsx`: 朝の通知管理コンポーネント

#### 既存ファイル変更
- `src/pages/settings/Settings.tsx`: 朝の通知設定UIを追加
- `src/App.tsx`: MorningNotificationManagerを追加
- `CLAUDE.md`: 通知機能の仕様を更新

#### 技術仕様
- **スケジュール管理**: setTimeout を使用した毎日の通知スケジュール
- **権限管理**: ブラウザの通知権限を要求・確認
- **データ永続化**: Supabaseの users テーブルで設定を保存
- **自動再スケジュール**: アプリ起動時に設定を読み込み、有効な場合は自動でスケジュール

#### 引き継ぎ事項
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

# Cooklet 開発ログ

## 概要
Cookletプロジェクトの開発過程で発生した変更の経緯と、解決に1 kToken以上要したバグ修正を記録するファイル。

## 開発履歴

### 2025-06-20

#### レシピ追加後のダイアログ内容クリア機能実装
**変更内容：**
- レシピ追加成功後にフォームデータを初期値にリセットする機能を追加
- `AddRecipeModal.tsx`の`handleSubmit`内で、`onSuccess()`実行前にフォームデータをクリア

**実装詳細：**
```typescript
// フォームデータをリセット
setFormData({
  name: '',
  external_url: '',
  cooking_time: '',
  servings: 1,
  estimated_cost: '',
  notes: '',
});
setRecipeIngredients([]);
setShowIngredientForm(false);
setIngredientForm({
  ingredient_id: '',
  quantity: '',
  unit: '',
  is_optional: false,
});
```

**解決した問題：**
- レシピ追加後にダイアログを再度開いた際、前回入力した内容が残る問題

**コミット：** `a041ead - fix: レシピ追加後にダイアログの内容をクリアする機能を実装`

#### 新しい支出記録のダイアログ化
**変更内容：**
- コスト管理画面の「新しい支出を記録」を折りたたみフォームからダイアログ形式に変更
- 既存の`CostDialog`コンポーネントを流用して新規追加・編集両対応

**実装詳細：**
- `Cost.tsx`から折りたたみフォーム部分を削除
- `showAddForm`状態を`showAddDialog`に変更
- 新規追加用と編集用で別々のダイアログインスタンスを作成
- `handleSaveCost`で両ダイアログの状態をクリア

**変更されたファイル：**
- `/src/pages/cost/Cost.tsx`: メイン実装
- `/src/pages/cost/CLAUDE.md`: 仕様書更新

**UI/UX改善：**
- CLAUDE.md仕様書 5.6.6 コスト記録ダイアログに準拠
- 統一されたダイアログデザイン
- モバイルファーストのレスポンシブ対応

**削除されたコード：**
- 101行の折りたたみフォーム実装
- `newRecord`状態管理
- `handleSaveRecord`関数

**追加されたコード：**
- `showAddDialog`状態管理
- `handleAddCost`関数
- 新規追加用CostDialogインスタンス

**解決した問題：**
- 折りたたみフォームによるUI/UX統一性の欠如
- CLAUDE.md仕様書との不整合

**影響範囲：**
- コスト管理画面のみ（他画面への影響なし）
- 既存の編集機能は変更なし

## 今後の課題

### UI/UXの統一
- [ ] 他画面でのダイアログ統一性確認
- [ ] 共通ボタンコンポーネントの活用推進

### 機能改善
- [ ] レシピ食材自動抽出（LLM連携）
- [ ] 在庫からの買い物リスト自動生成
- [ ] Web Push通知機能

### パフォーマンス最適化
- [ ] バンドルサイズ最適化（現在689KB）
- [ ] コード分割（dynamic import）

## 12. PWA・サービスワーカー機能

### 12.1 サービスワーカー更新機能

アプリの新しいバージョンが利用可能になった場合の自動更新システムを実装。

#### 12.1.1 更新検知フロー
1. **updatefound**イベントでサービスワーカーの更新を検知
2. 新しいサービスワーカーが**installed**状態になったらユーザーに通知
3. ユーザーが承認すると**skipWaiting()**で即座に更新
4. **controllerchange**イベントでページリロード

#### 12.1.2 実装ファイル
- `/public/sw.js`: サービスワーカー本体
- `/src/App.tsx`: 更新通知UI

### 12.2 デプロイ時の確実な更新システム

デプロイごとにService Workerが確実に更新されるよう、動的バージョン管理を実装。

#### 12.2.1 動的バージョン生成
- **ビルド時**: `scripts/generate-sw-version.js`で一意バージョンを生成
- **Netlify環境**: BUILD_ID、COMMIT_REF、CONTEXTを活用した一意バージョン
- **ローカル環境**: タイムスタンプベースの一意バージョン

#### 12.2.2 キャッシュ戦略
- **HTML/CSS/JS**: ネットワークファースト（確実な更新のため）
- **画像・アセット**: キャッシュファースト（パフォーマンス重視）
- **API**: ネットワークファースト + LRUキャッシュ

#### 12.2.3 実装ファイル
- `/scripts/generate-sw-version.js`: バージョン生成スクリプト
- `/vite.config.ts`: Viteビルドプラグイン
- `/netlify.toml`: Netlify設定（キャッシュヘッダー含む）
- `/package.json`: prebuildフック

#### 12.2.4 確実な更新を保証する仕組み
1. **prebuildフック**: ビルド前にバージョン更新
2. **Viteプラグイン**: ビルド開始時にもバージョン更新
3. **Netlifyヘッダー**: Service Workerファイルの完全キャッシュ無効化
4. **キャッシュクリア**: アクティベート時に旧バージョンキャッシュ削除

## バグ修正記録

### 大きなバグ修正（1 kToken以上の解決コスト）
現在のところ、1 kToken以上の大きなバグ修正は発生していません。

---

**記録開始日：** 2025-06-20  
**最終更新：** 2025-06-20