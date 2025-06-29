# Utils ディレクトリ

## 概要
アプリケーション全体で使用するユーティリティ関数を管理するディレクトリ。

## ファイル構成

### quantityUtils.ts
**PLAN.md準拠のQuantity型演算ユーティリティ実装ファイル**

#### 概要
Quantity型（`{amount: string, unit: string}`）同士の加算・減算を可能にする演算機能。在庫管理や買い物リスト自動生成での数量計算に使用。

#### 実装内容

**主要関数**
- `addQuantities(q1, q2)`: Quantity型同士の加算
- `subtractQuantities(q1, q2)`: Quantity型同士の減算
- `areQuantitiesEqual(q1, q2)`: Quantity型の等価比較
- `compareQuantities(q1, q2)`: Quantity型の大小比較
- `normalizeAmount(amount)`: 文字列から数値への正規化
- `convertToBaseUnit(amount, unit)`: 基本単位への変換
- `areUnitsCompatible(unit1, unit2)`: 単位互換性チェック

**特徴**
- **PLAN.md完全準拠**: 要求仕様をすべて満たす実装
- **単位変換対応**: 重量系（g, kg）、体積系（mL, L, 大さじ, 小さじ, カップ）の相互変換
- **非数値表現対応**: 「適量」「少々」は0として処理
- **エラーハンドリング**: 互換性のない単位同士はnullを返す
- **高精度計算**: 浮動小数点誤差を考慮した比較処理

**単位変換テーブル（UNIT_CONVERSIONS）**
- **重量系**: g（基本）← kg（×1000）
- **体積系**: mL（基本）← L（×1000）、大さじ（×15）、小さじ（×5）、カップ（×200）、合（×180）
- **個数系**: 個、本、枚等（変換なし、単位ごとに独立）

**型定義**
- `Quantity`: `{amount: string, unit: string}`
- `UnitConversion`: `{baseUnit: FoodUnit, factor: number}`

#### 使用例
```typescript
// 加算例
const q1: Quantity = { amount: '500', unit: 'g' };
const q2: Quantity = { amount: '1', unit: 'kg' };
const result = addQuantities(q1, q2); // { amount: '1500', unit: 'g' }

// 減算例  
const q3: Quantity = { amount: '1', unit: 'カップ' };
const q4: Quantity = { amount: '2', unit: '大さじ' };
const result2 = subtractQuantities(q3, q4); // { amount: '170', unit: 'mL' }

// 互換性のない単位
const q5: Quantity = { amount: '100', unit: 'g' };
const q6: Quantity = { amount: '1', unit: '個' };
const result3 = addQuantities(q5, q6); // null（エラー）
```

#### テスト仕様
- **包括的テストケース**: 59テスト（すべて成功）
- **エッジケーステスト**: 非数値表現、単位不一致、極端な値、浮動小数点精度
- **PLAN.md要求対応**: 仕様書のすべての要件をテストで検証

### mealPlanGeneration.ts
**PLAN.md準拠の在庫活用献立自動生成アルゴリズム実装ファイル**

#### 概要
在庫から自動で献立を生成するアルゴリズム。期限の近い食材を優先的に使用し、購入が必要な食材の種類を最小化する。

#### 実装内容

**主要関数**
- `generateMealPlanAlgorithm()`: PLAN.mdアルゴリズムの完全実装
- `generateMealPlan()`: メインAPI（Cookletデータ構造との統合）

**アルゴリズム特徴**
- **期限優先**: 賞味期限の近い食材を優先的に使用
- **購入コスト最小化**: 必要な購入食材の種類を最小化
- **スコアベース選択**: alpha（購入コスト重み）、beta（期限重み）による最適化
- **ランダム性対応**: temperature パラメータによるバラエティ

**型定義**
- `MealGenerationSettings`: 献立生成設定
- `MealGenerationResult`: 生成結果（献立+買い物リスト）
- `PurchaseUnit`: 購入単位情報
- `InventoryItem`: アルゴリズム内部用在庫
- `RecipeData`: アルゴリズム内部用レシピ
- `ShoppingItem`: 買い物リスト項目

#### パラメータ説明
- **days**: 生成日数（1-14日）
- **mealTypes**: [朝, 昼, 夜]の生成フラグ
- **alpha**: 購入コスト重み（大きいほど購入を避ける）
- **beta**: 期限重み（大きいほど期限近い食材を優先）
- **temperature**: ランダム性（0.0=常に同じ結果、1.0=バラエティ豊か）

#### データ統合
- **在庫情報**: StockItemからInventoryItemに変換
- **レシピ情報**: SavedRecipe.ingredientsを解析・活用
- **食材マスタ**: 購入単位情報として活用
- **結果保存**: 生成献立をMealPlanとして保存、買い物リストをShoppingListItemとして追加

## ファイル構成

### stockMergeUtils.ts
**購入品を既存在庫とマージする機能**

#### 概要
購入品を既存在庫と統合する際に、同名のアイテムを検索して数量を自動加算し、商品名正規化機能も統合したスマートマージシステム。

#### 主要機能
- **mergeStockWithPurchases()**: 購入品と既存在庫のマージ処理
- **convertReceiptItemsToPurchaseItems()**: レシートアイテムから購入品への変換
- **createMergeReport()**: マージ結果の日本語レポート生成

#### マージロジック
1. **商品名正規化**: nameNormalizer.tsを使用した商品名正規化
2. **類似度チェック**: 商品名の完全一致・部分一致による既存在庫の検索
3. **数量加算**: quantityUtils.tsのaddQuantities関数による型安全な数量加算
4. **属性マージ**: 賞味期限は新しい方を優先、その他の属性は適切にマージ

#### 型定義
- `PurchaseItem`: 購入品アイテム（name, quantity: Quantity, best_before等）
- `StockMergeResult`: マージ結果（mergedItems, newItems, stats）

#### マージ統計機能
- 処理した購入品総数
- 既存在庫にマージされた数
- 新規追加された数
- 正規化された商品名の数

#### 使用例
```typescript
const mergeResult = mergeStockWithPurchases(
  purchaseItems,   // 購入品リスト
  existingStock,   // 既存在庫リスト
  ingredients,     // 食材マスタ（正規化用）
  userId          // ユーザーID
);

// マージされた在庫を更新
for (const mergedItem of mergeResult.mergedItems) {
  await updateStockItem(mergedItem.id, mergedItem);
}

// 新規在庫を追加
for (const newItem of mergeResult.newItems) {
  await addStockItem(newItem);
}

// 結果レポート表示
const report = createMergeReport(mergeResult);
showSuccess(report);
```

#### 統合している既存関数
- `addQuantities()` - quantityUtils.tsから数量の加算
- `isValidQuantity()` - quantityUtils.tsから数量の妥当性チェック
- `normalizeProductName()` - nameNormalizer.tsから商品名の正規化

#### 特徴
- **型安全性**: TypeScript厳密型定義による安全な演算
- **商品名正規化**: 食材マスタとの照合による商品名統一
- **単位変換対応**: 重量・体積系の自動単位変換
- **エラーハンドリング**: 計算失敗時の適切な処理
- **統計情報**: 詳細なマージ結果統計

### receiptReader.ts
レシート読み取り機能の実装ファイル。Google Vision APIとGemini 自動抽出を組み合わせた高精度レシート解析。
ingredientsテーブルのoriginal_nameと照らし合わせて商品名を一般名に自動変換。

### nameNormalizer.ts
商品名正規化ユーティリティ。レシートの商品名をingredientsテーブルの一般名に変換。

#### 型定義

**ReceiptItem**
```typescript
interface ReceiptItem {
  originalName: string;                    // 元の商品名（OCR結果、任意）
  name: string;                            // 正規化された商品名
  quantity: string;                        // 数量
  price?: number;                          // 価格（任意）
  normalizationResult?: NameNormalizationResult; // 正規化結果（任意）
}
```

**ReceiptResult**
```typescript
interface ReceiptResult {
  items: ReceiptItem[];    // 読み取った商品リスト
  totalPrice?: number;     // 計算された合計金額（任意）
  storeName?: string;      // 店舗名（任意）
  date?: string;          // 購入日（任意）
  confidence?: number;     // 自動構造化の信頼度（任意）
}
```

#### 実装済み機能

**readReceiptFromImage(file: File, ingredients?: Ingredient[]): Promise<ReceiptResult>**
- レシート画像を読み取って商品リストを返す関数
- Step 1: Google Vision APIでOCR処理（プレーンテキスト抽出）
- Step 2: Gemini でテキスト自動構造化（商品・店舗・日付抽出）
- Step 3: 商品名正規化処理（ingredientsテーブルのoriginal_nameと照らし合わせ）
- Step 4: 商品価格から合計金額を自動計算
- デバッグ用のコンソール出力機能付き（正規化統計を含む）

**calculateTotalPrice(items: ReceiptItem[]): number**
- 商品リストから合計金額を計算する関数
- 価格が設定されている商品のみを対象
- 数値型の価格のみを集計

**validateImageFile(file: File): boolean**
- 画像ファイルの妥当性チェック
- 対応形式: JPEG, JPG, PNG, WebP
- 最大ファイルサイズ: 10MB
- ファイルタイプとサイズの両方をチェック

#### nameNormalizer.ts の機能

**normalizeProductName(originalName: string, ingredients: Ingredient[]): NameNormalizationResult**
- 商品名をingredientsテーブルと照らし合わせて一般名に変換
- 完全一致 → 部分一致 → 逆向き部分一致の順で検索
- 正規化結果と詳細情報を返す

**normalizeReceiptItems<T>(items: T[], ingredients: Ingredient[]): Array<T & { normalizationResult: NameNormalizationResult }>**
- レシートアイテムリストの商品名を一括正規化
- 元のアイテムデータに正規化情報を追加して返す

**getNormalizationStats(results: NameNormalizationResult[]): Stats**
- 正規化統計情報（総数・成功数・未変更数・成功率）を計算

#### 使用方法

```typescript
import { readReceiptFromImage, validateImageFile } from '../utils/receiptReader';
import { useIngredients } from '../hooks';

// 食材マスタデータを取得
const { ingredients } = useIngredients();

// ファイル妥当性チェック
if (!validateImageFile(file)) {
  console.error('無効なファイル形式またはサイズです');
  return;
}

// レシート読み取り実行（商品名正規化付き）
try {
  const result = await readReceiptFromImage(file, ingredients);
  console.log(`${result.items.length}件のアイテムを読み取りました`);
  console.log('店舗名:', result.storeName);
  console.log('購入日:', result.date);
  console.log('合計金額:', result.totalPrice);
  console.log('自動抽出信頼度:', result.confidence);
  
  // 個別の商品詳細（正規化情報付き）
  result.items.forEach((item, index) => {
    console.log(`${index + 1}: ${item.name} - ${item.quantity} - ¥${item.price || '価格不明'}`);
    if (item.normalizationResult?.isNormalized) {
      console.log(`  正規化: "${item.normalizationResult.originalName}" → "${item.name}"`);
    }
  });
} catch (error) {
  console.error('読み取りに失敗しました:', error);
}
```

#### 実装済み技術

**OCR処理**
- Google Vision API（DOCUMENT_TEXT_DETECTION）
- Netlify Functions経由でセキュアなAPI利用
- 高精度なテキスト抽出

**自動構造化**
- Google Gemini 自動抽出（gemini-2.5-flash）
- JSON Schema指定による構造化レスポンス
- 商品名、数量、価格の正確な抽出
- 店舗名、日付の自動識別

**エラーハンドリング**
- OCR処理エラー対応
- 自動構造化エラー対応
- ネットワークエラー対応
- 詳細なエラーメッセージ

#### 今後の改良予定

**精度向上**
- プロンプトエンジニアリングの最適化
- レシート形式別の対応強化
- 商品名正規化ロジック

**機能拡張**
- カテゴリ自動分類
- 栄養成分情報の関連付け
- 買い物履歴との連携

## 注意点

### API利用制限
- Google Vision API: 月間制限と課金に注意
- Google Gemini 自動抽出: リクエスト頻度制限あり
- 環境変数による適切な設定管理が必要

### セキュリティ
- APIキーの適切な管理（環境変数での設定）
- 画像データの一時的な処理（永続化なし）
- プライバシー保護のための適切なデータ取り扱い

### 精度について
- レシート画質により結果が変動
- 手書き文字や特殊フォントの認識精度に限界
- 自動構造化の信頼度を参考に結果を判断