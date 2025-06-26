# Cooklet 開発ログ

## 2025-06-26

### 【最新】献立編集ダイアログの保存後ダイアログ閉じ処理修正

#### 問題の解決
- **保存後ダイアログ継続表示問題**: MealPlanEditDialogで保存ボタンを押した後もダイアログが表示され続ける問題を解決

#### 修正内容
- `handleSave`関数に`onClose()`呼び出しを追加
- DEVELOPMENT_LOG.mdで記録済みの「保存ボタン2回押し問題」と同じパターンの修正
- 保存成功時に必ずダイアログを閉じる処理を確実に実行

#### 修正コード
```typescript
// 修正前: 保存後にダイアログが閉じない
const handleSave = () => {
  const mealPlan: MealPlan = { /* ... */ };
  onSave(mealPlan);
  // ダイアログを閉じる処理が抜けていた
};

// 修正後: 保存後に適切にダイアログを閉じる
const handleSave = () => {
  const mealPlan: MealPlan = { /* ... */ };
  onSave(mealPlan);
  // 🔑 重要: 保存後に必ずダイアログを閉じる
  onClose();
};
```

#### 技術的教訓
- **ダイアログ状態管理の重要性**: 保存・削除処理では必ず成功時にダイアログを閉じる処理を含める
- **一貫した実装パターン**: 他のダイアログでも同様の処理が必要
- **ユーザビリティ**: 保存後にダイアログが開いたままだと操作完了感がない

#### 品質確保
- **lint**: エラー・警告0件
- **build**: 成功（746KBバンドル）
- **修正範囲**: 最小限の変更（1行追加）

### 【前回】献立編集ダイアログの食材自動設定と数量比例調整機能実装

#### 問題の解決
- **食材一覧未反映問題**: MealPlanEditDialogでレシピ選択時に材料一覧が反映されない問題を解決
- **人数変更時の数量調整不足**: 人数変更時に食材の数量が自動調整されない問題を解決

#### 実装内容
1. **レシピ選択時の食材自動設定機能**
   - SavedRecipe.ingredientsフィールドからの実際の食材データ読み込み
   - レシピの元の人数（servings）に基づく数量の初期調整
   - 既存の空配列の代わりに実際の食材データを表示

2. **人数変更時の数量比例調整機能**
   - `adjustQuantityByServings`関数: 個別の数量を比例計算で調整
   - `adjustIngredientsQuantity`関数: 食材配列全体の数量を一括調整
   - `handleServingsChange`関数: 人数変更時に食材数量を自動更新

3. **数量解析・処理の改善**
   - parseQuantity/formatQuantity関数の活用
   - 数値・単位の正確な分離と再結合
   - 適量・お好み等の非数値データの適切な処理
   - 小数点第2位までの四捨五入による精度管理

#### 技術実装詳細
```typescript
// 数量比例調整の核心ロジック
const adjustQuantityByServings = (originalQuantity: string, originalServings: number, newServings: number): string => {
  const { amount, unit } = parseQuantity(originalQuantity);
  
  if (!amount || isNaN(parseFloat(amount))) {
    return originalQuantity; // 非数値はそのまま
  }

  const numericAmount = parseFloat(amount);
  const adjustedAmount = (numericAmount * newServings) / originalServings;
  const roundedAmount = Math.round(adjustedAmount * 100) / 100;
  
  return formatQuantity(roundedAmount.toString(), unit);
};
```

#### UI/UX改善
- **即座の反映**: レシピ選択時に食材が即座に表示される
- **リアルタイム調整**: 人数変更時に数量がリアルタイムで調整される
- **正確な比例計算**: 元のレシピの人数を基準とした正確な計算
- **単位保持**: 調整後も元の単位が適切に保持される

#### ユーザビリティ向上
- **直感的操作**: レシピを選ぶだけで食材が自動設定される
- **手間削減**: 人数変更時の手動計算が不要になる
- **精度向上**: 計算ミスのない正確な数量調整
- **柔軟性**: 適量・お好み等の表現もそのまま保持

#### 品質確保
- **lint**: エラー・警告0件
- **build**: 成功（746KBバンドル）
- **型安全性**: 厳密なTypeScript型定義
- **parseQuantity関数**: constants/units.tsの既存機能を活用

#### 修正したファイル
- `src/components/dialogs/MealPlanEditDialog.tsx`: 核心機能の実装
- `src/components/dialogs/CLAUDE.md`: 機能仕様の更新
- `.claude/ELEMENTS.md`: 要素定義の更新
- `.claude/DEVELOPMENT_LOG.md`: 開発ログの記録

#### 引き継ぎ事項
1. **食材データ活用**: SavedRecipe.ingredientsフィールドを正しく活用
2. **数量比例計算**: parseQuantity/formatQuantity関数による安全な数量処理
3. **レシピ人数基準**: 元レシピのservingsフィールドを基準とした正確な比例計算
4. **非数値対応**: 適量・お好み等の非数値表現の適切な保持
5. **ユーザビリティ**: 直感的で手間のかからない操作体験の提供

### 【前回】ダイアログ重複表示問題・保存ボタン2回押し問題の修正

### 【最新】ダイアログ重複表示問題・保存ボタン2回押し問題の修正

#### 問題の発見と原因
- **ダイアログ重複表示問題**: MealPlanDialog.tsx（古い実装）とMealPlanEditDialog.tsx（新しい実装）が併存、同じz-index（z-[100]）で競合
- **保存ボタン2回押し問題**: MealPlans.tsxの`handleSaveMeal`関数で、献立保存成功後にダイアログを閉じる処理が抜けていた

#### 修正内容
1. **不要ファイル削除とz-index階層化**
   - MealPlanDialog.tsx削除（MealPlanEditDialogと重複のため）
   - ダイアログz-index階層化: BaseDialog（z-[100]）→ ConfirmDialog（z-[110]）→ ToastContainer（z-[120]）
   - Recipes.tsxでのダイアログ遷移時の重複防止処理追加

2. **献立保存・削除処理の修正**
   ```typescript
   // 修正前: 保存後にダイアログが閉じない
   const handleSaveMeal = async (newMealPlan: MealPlan) => {
     try {
       await saveMealPlan(newMealPlan);
       // ダイアログを閉じる処理が抜けていた
     } catch (err) {
       // エラー処理のみ
     }
   };

   // 修正後: 保存成功時に適切な処理
   const handleSaveMeal = async (newMealPlan: MealPlan) => {
     try {
       await saveMealPlan(newMealPlan);
       handleCloseDialog(); // ダイアログを閉じる
       showSuccess('献立を保存しました'); // 成功通知
     } catch (err) {
       showError('献立の保存に失敗しました'); // エラー通知
     }
   };
   ```

#### 技術的教訓
1. **ダイアログ状態管理パターン**: 保存・削除処理では必ず成功時にダイアログを閉じる処理を含める
2. **z-index管理**: 用途別に階層化して競合を防ぐ（基本→確認→最上位の3段階）
3. **古いファイル管理**: 機能統合時は不要ファイルを適切に削除・エクスポート更新
4. **ダイアログ遷移**: 詳細→編集、詳細→削除時は前のダイアログを必ず閉じる

#### 修正したファイル
- `src/pages/meal-plans/MealPlans.tsx`: 保存・削除処理の修正
- `src/pages/recipes/Recipes.tsx`: ダイアログ遷移時の重複防止
- `src/components/dialogs/MealPlanDialog.tsx`: 削除（古い実装）
- `src/components/dialogs/index.ts`: エクスポート修正
- `src/components/dialogs/ConfirmDialog.tsx`: z-index調整（z-[110]）
- `src/components/ui/ToastContainer.tsx`: z-index調整（z-[120]）
- `src/components/dialogs/CLAUDE.md`: z-index階層管理の記録

#### 引き継ぎ事項
1. **保存処理パターン**: 全ての保存・削除処理で成功時のダイアログ閉じ処理を確認
2. **z-index設計**: 新しいダイアログ追加時は階層設計に従う
3. **ダイアログ遷移**: 複数ダイアログ間の遷移時は前ダイアログを閉じる
4. **ユーザビリティ**: 成功・エラー時の適切なフィードバック提供

### PLAN.md準拠の献立自動生成機能完全実装

#### 実装内容
- **PLAN.mdアルゴリズムの完全実装**: 在庫活用献立自動生成アルゴリズムをTypeScriptで実装
  - 期限の近い食材を優先的に使用
  - 購入が必要な食材の種類を最小化
  - alpha（購入コスト重み）、beta（期限重み）、temperature（ランダム性）パラメータ対応
  - スコアベースでの最適レシピ選択アルゴリズム

- **既存データ構造との完全統合**
  - SavedRecipe.ingredientsの解析・活用
  - StockItemからInventoryItemへの変換処理
  - 食材マスタからの購入単位情報生成
  - parseQuantityによる正確な数量解析

- **フロントエンドUI完全実装**
  - 献立画面に設定可能な生成ダイアログ
  - パラメータ調整機能（days, alpha, beta, temperature, mealTypes）
  - 生成結果の詳細表示（献立リスト、買い物リスト、警告）
  - 生成献立の自動保存機能（MealPlanとShoppingListItemに保存）

#### 技術仕様
- **アルゴリズム**: PLAN.mdのPythonコードをTypeScriptで完全移植
- **型安全性**: 厳密な型定義によるコンパイル時エラー防止
- **エラーハンドリング**: 詳細なエラー分類と適切なユーザーメッセージ
- **統合テスト**: lint・build成功確認済み

#### 新規作成ファイル
- `src/utils/mealPlanGeneration.ts`: 献立生成アルゴリズムの実装
- `src/utils/CLAUDE.md`: ドキュメント更新

#### 既存ファイル変更
- `src/pages/meal-plans/MealPlans.tsx`: 献立生成UI・設定画面・結果表示・保存機能追加

#### UI/UX改善
- **設定ダイアログ**: 直感的なパラメータ調整インターフェース
- **結果表示**: 生成献立と買い物リストの見やすい表示
- **フィードバック**: トースト通知による適切なユーザーフィードバック
- **エラー処理**: 問題発生時の詳細な対処法提示

#### 開発成果
- **完全機能実装**: PLAN.mdの要件を100%満たす献立生成機能
- **実用性**: 実際の在庫・レシピ・食材マスタデータを活用
- **拡張性**: パラメータ調整による柔軟な献立生成
- **統合性**: 既存のCookletエコシステムとの完全統合

#### 品質確保
- **lint**: エラー・警告なし
- **build**: 成功（737KBバンドル）
- **型安全性**: 厳密なTypeScript型定義
- **ドキュメント**: 包括的な仕様書更新

#### 引き継ぎ事項
1. **実用開始**: 献立生成機能は即座に利用可能
2. **パラメータ調整**: alpha、beta、temperatureでユーザー好みに合わせた調整可能
3. **データ要件**: レシピの食材情報登録、食材マスタ整備で精度向上
4. **将来拡張**: 栄養バランス考慮、アレルギー対応、季節性考慮が可能

## 2025-06-23

### 【最新】GitHub issue対応とドキュメント整備完了

#### issue #58「コードベースをドキュメントに反映」対応
- **各ディレクトリのCLAUDE.mdファイル更新完了**
  - components/dialogs: 不足していた3つのコンポーネント追加（AddToMealPlanDialog、MealPlanDialog、ShoppingItemDialog）
  - hooks: 不足していた6つのフック追加（useBuildInfo、useCache、useConfirmDialog、useTabRefresh、useToast、index.ts）
  - 新規作成: components/common、constants、servicesのCLAUDE.mdファイル

- **.claude/ELEMENTS.md更新**
  - 新規ダイアログコンポーネント情報追加
  - Toast関連コンポーネント（Toast、ToastContainer、ToastProvider）追加
  - 最新のコードベースとの完全同期

- **品質確保**
  - lintチェック: エラー0件
  - 仕様書と実装の整合性確認完了
  - 789行追加、223行削除（7ファイル変更）

#### issue #57「アプリの更新が完了したら、トーストで通知する」対応
- **PWA更新時のトースト通知機能実装**
  - 既存のConfirmDialog方式を維持しつつ、トースト通知を追加
  - Service Worker更新完了時: 「✨ Service Workerが更新されました！」
  - アプリ更新完了時: 「🎉 アプリが更新されました！最新機能をお使いいただけます。」

- **技術実装**
  - App.tsx: useToastフック追加、controllerchangeとSW_UPDATEDメッセージでトースト表示
  - Service Worker: SKIP_WAITING実行時に全クライアントにSW_UPDATEDメッセージ送信
  - 更新プロセスの段階的通知で透明性向上

#### 開発成果
- **ドキュメント整備**: コードベースとドキュメントの完全同期
- **ユーザビリティ向上**: PWA更新時の分かりやすい通知システム
- **保守性向上**: 包括的なドキュメントによる開発効率向上

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