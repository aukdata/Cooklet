# Cooklet コーディングルール

## 1. 基本方針

### 品質重視
- **厳格な型安全性**: `any`型の使用を完全禁止
- **必須型注釈**: すべての変数定義時に型を明記
- **日本語コメント**: 可読性向上のため詳細な日本語説明を記載
- **oxlint抑制コメント禁止**: 根本的な問題解決を重視

### コード品質保証
- **lint必須実行**: `pnpm run lint && pnpm run build:netlify`でチェック
- **Git hooks**: pre-commit/pre-push時の自動品質チェック
- **モジュール文書化**: 各ディレクトリに`CLAUDE.md`でモジュール仕様を文書化

## 2. ファイル・ディレクトリ構造

```
src/
├── components/        # コンポーネント（機能別・層別分類）
│   ├── common/       # 汎用共通コンポーネント
│   ├── dialogs/      # ダイアログ系コンポーネント
│   ├── layout/       # レイアウト系コンポーネント
│   ├── ui/          # 基本UIコンポーネント
│   └── [機能名]/     # 機能固有コンポーネント
├── pages/           # ページコンポーネント（機能別）
├── hooks/           # カスタムフック
├── contexts/        # React Context
├── types/           # TypeScript型定義
├── lib/             # 外部ライブラリ連携
├── utils/           # ユーティリティ関数
├── services/        # ビジネスロジック・サービス層
└── constants/       # 定数定義
```

### ディレクトリルール
- **機能別分離**: meal-plans, shopping, stock, cost等の明確な分離
- **共通性重視**: 再利用可能なコンポーネントは`common/`に配置
- **文書化必須**: 各ディレクトリに`CLAUDE.md`で仕様を記載

## 3. TypeScript型定義

### 型安全性ルール
```typescript
// ✅ 正しい例 - 厳格な型定義
export interface StockItem {
  id: string; // 在庫ID（UUID）
  user_id: string; // 所有ユーザーID（DB形式）
  name: string; // 食材名
  quantity: string; // 数量（文字列形式）
  best_before?: string; // 賞味期限（任意、DB形式）
  is_homemade: boolean; // 作り置きフラグ（DB形式）
  created_at: string; // 作成日時（DB形式）
  updated_at: string; // 更新日時（DB形式）
}

// ✅ リテラル型の活用
export type MealType = '朝' | '昼' | '夜' | '間食';

// ✅ unknown型の適切な使用例（他の型で表現できない場合のみ）
export interface APIResponse {
  status: string;
  data: unknown; // 外部APIからの予測不可能なデータ構造の場合のみ
}

// ✅ 型アサーション（as）の適切な使用例（必要な場合のみ）
const processAPIData = (response: unknown) => {
  // 型ガードで安全性を確保してからアサーション
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as { data: string }).data;
  }
  throw new Error('Invalid response format');
};

// ❌ 禁止例
export interface BadExample {
  data: any; // any型は完全禁止
  config: unknown; // 他の型で表現可能な場合のunknown使用は禁止
  // コメントなしは禁止
}

// ❌ 型アサーション（as）の不適切な使用例
const badExample = (data: unknown) => {
  return data as string; // 型ガードなしでのアサーションは禁止
};
```

### unknown型の適切な使用ガイドライン

#### unknown型を使用すべき場面
```typescript
// ✅ 外部APIからの予測不可能なレスポンス
interface APIResponse {
  status: string;
  data: unknown; // 構造が事前に分からない外部データ
}

// ✅ ジェネリックな処理で型が確定できない場合
function processData<T>(data: unknown): T {
  // 型ガードで安全性を確保
  if (typeof data === 'object' && data !== null) {
    return data as T;
  }
  throw new Error('Invalid data format');
}

// ✅ 動的コンテンツや設定値
interface Configuration {
  settings: Record<string, unknown>; // 動的な設定値
}
```

#### unknown型を避けるべき場面
```typescript
// ❌ 他の型で表現可能な場合
interface BadExample {
  name: unknown; // string で十分
  count: unknown; // number で十分
  options: unknown; // 具体的な型定義が可能
}

// ✅ 適切な型定義
interface GoodExample {
  name: string;
  count: number;
  options: { [key: string]: string | number | boolean };
}
```

### 型アサーション（as）の安全な使用法

#### 推奨パターン：型ガード + アサーション
```typescript
// ✅ 型ガードで安全性を確保してからアサーション
function processUser(data: unknown): User {
  // 型ガード関数の使用
  if (isUser(data)) {
    return data; // 型ガードが成功すればアサーション不要
  }
  throw new Error('Invalid user data');
}

// 型ガード関数の実装
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string'
  );
}

// ✅ オブジェクトの形状チェック後のアサーション
function safeParseJSON(json: string): unknown {
  try {
    const parsed = JSON.parse(json);
    // 基本的な形状チェック
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    throw new Error('Parsed data is not an object');
  } catch {
    throw new Error('Invalid JSON format');
  }
}
```

#### 禁止パターン：直接アサーション
```typescript
// ❌ 型チェックなしの直接アサーション（危険）
function badProcess(data: unknown): User {
  return data as User; // 実行時エラーの可能性
}

// ❌ 複雑な型への直接アサーション
const userData = response.data as { user: { profile: { settings: any } } };
```

### オプショナルプロパティの使用ルール

```typescript
// ✅ 正しい例 - オプショナルプロパティを使用
interface StockItem {
  id: string; // 在庫ID（UUID）
  name: string; // 食材名
  quantity: string; // 数量（文字列形式で保存）
  best_before?: string; // 賞味期限（任意、ISO文字列形式）
  storage_location?: string; // 保存場所（任意）
}

// ✅ APIレスポンス型でのオプショナルプロパティ
interface UserProfile {
  id: string; // ユーザーID
  name: string; // ユーザー名
  email: string; // メールアドレス
  avatar_url?: string; // アバターURL（任意）
  bio?: string; // 自己紹介（任意）
}

// ❌ 避けるべき例 - null/undefined union型
interface BadStockItem {
  id: string;
  name: string;
  quantity: string;
  best_before: string | null; // オプショナルプロパティの方が適切
  storage_location: string | undefined; // オプショナルプロパティの方が適切
}
```

#### オプショナルプロパティ使用ガイドライン

1. **基本ルール**: `| null`や`| undefined`ではなく、可能な限り`?:`（オプショナルプロパティ）を使用
2. **適用場面**: フィールドが存在しない可能性がある場合（未入力、任意項目など）
3. **型ガードとの組み合わせ**: オプショナルプロパティへのアクセス時は適切なチェックを実施

```typescript
// ✅ オプショナルプロパティの安全な使用
const formatBestBefore = (item: StockItem): string => {
  // オプショナルプロパティのチェック
  if (item.best_before) {
    return new Date(item.best_before).toLocaleDateString('ja-JP');
  }
  return '期限なし';
};

// ✅ オプショナルプロパティでのデフォルト値
const displayStorageLocation = (item: StockItem): string => {
  return item.storage_location ?? '未指定';
};
```

#### 例外的にnull/undefined unionを使用する場面

```typescript
// ✅ 例外 - 明示的に「値なし」状態を区別する必要がある場合
interface SearchFilters {
  category: string;
  price_min: number | null; // null = フィルタ未設定、0 = 0円以上
  price_max: number | null; // null = フィルタ未設定、0 = 0円以下
}

// ✅ 例外 - APIの仕様上null値が返される場合
interface APIResponse {
  data: UserData[];
  next_cursor: string | null; // API仕様でnullが返される
}
```

### 型定義ベストプラクティス

#### 1. Union型の活用
```typescript
// ✅ 明確な状態管理
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ タグ付きUnion型でより安全に
type ApiState = 
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string };
```

#### 2. 厳密なオブジェクト型定義
```typescript
// ✅ 明確なプロパティ定義
interface StrictConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
  features: {
    logging: boolean;
    analytics: boolean;
  };
}

// ❌ 曖昧な定義
interface LooseConfig {
  [key: string]: unknown; // 何でも許可してしまう
}
```

#### 3. 型ガード関数の活用
```typescript
// ✅ 再利用可能な型ガード関数
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNonEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function hasProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && prop in obj;
}
```

### Cookletプロジェクトでの実装例

#### 外部API連携での型安全な処理
```typescript
// ✅ Google Vision API レスポンスの安全な処理
interface VisionAPIResponse {
  status: string;
  textAnnotations: unknown; // APIの仕様変更に対応
}

function processOCRResult(response: unknown): string[] {
  // 型ガードでAPIレスポンスの妥当性を確認
  if (
    typeof response === 'object' &&
    response !== null &&
    'textAnnotations' in response
  ) {
    const annotations = (response as VisionAPIResponse).textAnnotations;
    if (Array.isArray(annotations)) {
      return annotations
        .filter((item): item is { description: string } => 
          typeof item === 'object' && 
          item !== null && 
          'description' in item &&
          typeof (item as any).description === 'string'
        )
        .map(item => item.description);
    }
  }
  throw new Error('Invalid OCR response format');
}
```

#### データベース連携での型変換
```typescript
// ✅ Supabaseからのデータの安全な変換
function transformStockItem(dbData: unknown): StockItem {
  // データベースからの生データをチェック
  if (!isValidStockItemData(dbData)) {
    throw new Error('Invalid stock item data from database');
  }
  
  // 型ガード成功後は安全にアクセス可能
  return {
    id: dbData.id,
    user_id: dbData.user_id,
    name: dbData.name,
    quantity: dbData.quantity,
    best_before: dbData.best_before,
    storage_location: dbData.storage_location,
    is_homemade: dbData.is_homemade,
    created_at: dbData.created_at,
    updated_at: dbData.updated_at
  };
}

function isValidStockItemData(data: unknown): data is {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  best_before?: string;
  storage_location?: string;
  is_homemade: boolean;
  created_at: string;
  updated_at: string;
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'user_id' in data &&
    'name' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).user_id === 'string' &&
    typeof (data as any).name === 'string'
    // 他の必須フィールドもチェック
  );
}
```

#### 汎用データフックでの型安全性
```typescript
// ✅ useDataHookでの安全な型処理
export const useDataHook = <T extends Record<string, unknown> & { id?: string }>(
  config: TableConfig,
  errorMessages: ErrorMessages
) => {
  const setData = (fetchedData: unknown) => {
    // データベースからの応答を安全に変換
    if (Array.isArray(fetchedData)) {
      const validatedData = fetchedData.filter((item): item is T => 
        typeof item === 'object' && 
        item !== null && 
        'id' in item
      );
      setData(validatedData);
    } else {
      setData([]);
    }
  };
};
```

### 型定義コメント規則
- **日本語コメント**: 各フィールドに日本語の説明を必須記載
- **DB形式明記**: データベースフィールドは`（DB形式）`を付記
- **任意フィールド**: オプショナルフィールドは`（任意、...）`で説明
- **unknown型制限**: 他の型やその組み合わせで表現できない場合のみ使用可
- **型アサーション制限**: `as`は必要な場合のみ使用、型ガードで安全性を確保
- **型ガード推奨**: 複雑な型チェックは専用の型ガード関数を作成
- **外部API対応**: APIレスポンスは必ず型ガードで検証してから使用
- **データベース連携**: DBからのデータも型ガードで安全性を確保

## 4. React コンポーネント

### コンポーネント構造
```typescript
// Props インターフェース定義
interface NameQuantityUnitInputProps {
  /** 名前の値 */
  name: string;
  /** 数量の値 */
  quantity: string;
  /** 単位の値 */
  unit: FoodUnit;
  /** 名前変更時のコールバック */
  onNameChange: (name: string) => void;
  /** 数量変更時のコールバック */
  onQuantityChange: (quantity: string) => void;
  /** 単位変更時のコールバック */
  onUnitChange: (unit: FoodUnit) => void;
}

/**
 * 名前・数量・単位の入力コンポーネント
 * 
 * レシート読み取り結果の編集などで使用する共通コンポーネント：
 * - 名前入力フィールド
 * - 数量入力フィールド  
 * - 単位選択ドロップダウン（FOOD_UNITSから選択）
 */
export const NameQuantityUnitInput = ({
  name,
  quantity,
  unit,
  onNameChange,
  onQuantityChange,
  onUnitChange,
}: NameQuantityUnitInputProps) => {
  // 実装
};
```

### コンポーネントルール
- **関数コンポーネント**: `React.FC`よりも関数宣言を優先
- **Props型定義**: 専用インターフェースで明確に定義
- **JSDocコメント**: 機能説明を日本語で詳細に記載
- **分割代入**: Propsの分割代入を使用

## 5. import/export 規則

### import パターン
```typescript
// ✅ 正しい例 - 名前付きインポート
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { type MealType, type MealPlan } from '../types';

// ❌ 禁止例
import React from 'react'; // デフォルトインポートは避ける
import * as React from 'react'; // 名前空間インポートは避ける
```

### export パターン
```typescript
// ✅ 推奨 - 名前付きエクスポート
export const useMealPlans = () => {
  // 実装
};

export const NameQuantityUnitInput = ({...}) => {
  // 実装
};

// ❌ 避ける - デフォルトエクスポート
export default MyComponent;
```

### インポート/エクスポートルール
- **名前付きimport**: `import { ... }`形式を必須使用
- **型インポート**: `import { type ... }`で型のみインポート
- **名前付きexport**: デフォルトエクスポートより名前付きを優先
- **相対パス**: 適切な相対パス使用

## 6. 命名規則

### 変数・関数命名
```typescript
// ✅ 変数・関数: lowerCamelCase
const mealPlans = useCallback(async (): Promise<MealPlan[]> => {
  // 実装
}, [user]);

// ✅ カスタムフック: use + PascalCase
export const useMealPlans = () => {
  // 実装
};

// ✅ コンポーネント: PascalCase
export const NameQuantityUnitInput = ({...}) => {
  // 実装
};

// ✅ 定数: UPPER_SNAKE_CASE
const FOOD_UNITS = ['g', 'kg', 'mL', 'L'] as const;
```

### データベース連携命名
```typescript
// ✅ データベースフィールド: snake_case
interface StockItem {
  user_id: string; // DB形式
  created_at: string; // DB形式
  best_before?: string; // DB形式
}

// ✅ フロントエンド変数: camelCase
const userId = user.id;
const createdAt = stockItem.created_at;
```

### 命名規則一覧
- **変数・関数**: `lowerCamelCase`
- **コンポーネント**: `PascalCase`
- **カスタムフック**: `use` + `PascalCase`
- **定数**: `UPPER_SNAKE_CASE`
- **型・インターフェース**: `PascalCase`
- **DBカラム**: `snake_case`（CLAUDE.mdの基本情報に従う）

## 7. コメント記載規則

### JSDocコメント
```typescript
/**
 * 献立計画管理機能
 * 
 * 主要機能:
 * - 献立の追加・更新・削除
 * - キャッシュ機能付きデータ取得
 * - タブ切り替え時の自動更新
 * 
 * @returns 献立管理用の状態と操作関数
 */
export const useMealPlans = () => {
  // 実装
};
```

### インラインコメント
```typescript
// キャッシュを更新（新しいアイテムを追加）
const updatedPlans = [...currentPlans, data];

// 賞味期限が近い食材をフィルタリング（3日以内）
const soonExpiring = stockItems.filter(item => {
  // 実装
});
```

### 型定義コメント
```typescript
export interface StockItem extends Record<string, unknown> {
  id: string; // 在庫ID（UUID）
  name: string; // 食材名
  quantity: string; // 数量（文字列形式で保存）
  best_before?: string; // 賞味期限（任意、ISO文字列形式）
}
```

### コメントルール
- **日本語記載**: すべてのコメントは日本語で記載
- **JSDoc推奨**: 関数・コンポーネントはJSDocで詳細説明
- **インライン説明**: 複雑なロジックには適切な説明を追加
- **型コメント**: インターフェースの各フィールドに説明を記載

## 8. データ管理パターン

### カスタムフック統一パターン
```typescript
export const useStockItems = () => {
  const {
    data: stockItems,
    isLoading: loading,
    error,
    setCache,
    invalidateCache
  } = useCache<StockItem[]>(/* ... */);

  // CRUD操作関数
  const addStockItem = useCallback(async (item: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>) => {
    // 実装
  }, [setCache]);

  const updateStockItem = useCallback(async (id: string, updates: Partial<StockItem>) => {
    // 実装
  }, [setCache]);

  const deleteStockItem = useCallback(async (id: string) => {
    // 実装
  }, [setCache]);

  return {
    stockItems: stockItems || [],
    loading,
    error,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    refetch: invalidateCache
  };
};
```

### UI/UXパターン
```typescript
// 統一されたボタンコンポーネント使用
<EditButton onClick={handleEdit} disabled={loading} />
<DeleteButton onClick={handleDelete} />

// 統一されたダイアログ構造
<BaseDialog
  isOpen={isOpen}
  onClose={onClose}
  title="🎯 在庫編集"
  size="md"
  showDelete={isEditing}
  onSave={handleSave}
  onDelete={handleDelete}
>
  {/* コンテンツ */}
</BaseDialog>
```

### ダイアログ状態管理パターン
```typescript
// ✅ 正しい保存・削除処理パターン（必須実装）
const handleSave = async (data: FormData) => {
  try {
    if (editingItem?.id) {
      await updateItem(editingItem.id, data);
    } else {
      await addItem(data);
    }
    
    // 🔑 重要: 保存成功時に必ずダイアログを閉じる
    setIsDialogOpen(false);
    setEditingItem(null);
    
    // ユーザーフィードバック
    showSuccess(editingItem ? '更新しました' : '追加しました');
  } catch (err) {
    console.error('保存に失敗:', err);
    showError('保存に失敗しました');
    // エラー時はダイアログを開いたまま（ユーザーが修正できるように）
  }
};

const handleDelete = async () => {
  if (!editingItem?.id) return;
  
  try {
    await deleteItem(editingItem.id);
    
    // 🔑 重要: 削除成功時に必ずダイアログを閉じる
    setIsDialogOpen(false);
    setEditingItem(null);
    
    showSuccess('削除しました');
  } catch (err) {
    console.error('削除に失敗:', err);
    showError('削除に失敗しました');
  }
};

// ❌ 禁止パターン: 保存後にダイアログを閉じない
const badHandleSave = async (data: FormData) => {
  try {
    await saveItem(data);
    // ダイアログを閉じる処理が抜けている（2回押し問題の原因）
  } catch (err) {
    // エラー処理のみ
  }
};
```

### ダイアログ遷移時の重複防止パターン
```typescript
// ✅ 詳細ダイアログから編集ダイアログへの遷移
const handleEdit = (item: Item) => {
  // 🔑 重要: 前のダイアログを必ず閉じる
  setIsDetailDialogOpen(false);
  setSelectedItem(undefined);
  
  // 編集ダイアログを開く
  setEditingItem(item);
  setIsEditDialogOpen(true);
};

// ✅ 詳細ダイアログから削除確認ダイアログへの遷移
const handleDelete = (item: Item) => {
  // 🔑 重要: 前のダイアログを必ず閉じる
  setIsDetailDialogOpen(false);
  setSelectedItem(undefined);
  
  // 削除確認ダイアログを開く
  setDeletingItem(item);
  setIsConfirmDialogOpen(true);
};

// ❌ 禁止パターン: 前のダイアログを閉じない
const badHandleEdit = (item: Item) => {
  // 詳細ダイアログが開いたまま編集ダイアログも開く（重複表示）
  setEditingItem(item);
  setIsEditDialogOpen(true);
};
```

### z-index階層管理パターン
```typescript
// ✅ 統一されたz-index階層（2025-06-26確立）
// TabNavigation: z-[90]   （最下位）
// BaseDialog系:   z-[100]  （基本レベル）
// ConfirmDialog: z-[110]  （確認ダイアログ）
// ToastContainer: z-[120] （最上位）

// 新しいダイアログ作成時は基本レベルを使用
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">

// 確認ダイアログのみ上位レベル
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[110]">

// ❌ 禁止: カスタムz-indexの勝手な設定
<div className="fixed inset-0 z-[999]"> // 独自の値は使わない
```

## 9. 品質保証

### Lint設定（oxlint）
```json
{
  "rules": {
    "typescript/no-explicit-any": "error",  // any型禁止
    "eslint/no-var": "error",              // var禁止
    "eslint/no-empty": "error"             // 空ブロック禁止
  }
}
```

### 品質チェックコマンド
```bash
# 開発時の品質チェック
pnpm run lint && pnpm run build:netlify

# Git hooks（自動実行）
# pre-commit: lint実行（エラー時はコミット阻止）
# pre-push: lint & build実行（エラー時はプッシュ阻止）
```

### 品質保証ルール
- **oxlint抑制コメント禁止**: 根本的な問題解決を重視
- **any型完全禁止**: 型安全性を最優先
- **unknown型適切使用**: 外部APIや予測不可能なデータのみに限定
- **型アサーション安全化**: 必ず型ガードと組み合わせて使用
- **型ガード関数推奨**: 複雑な型チェックは再利用可能な関数として実装
- **必須型注釈**: 変数定義時の型記載を必須化
- **自動品質チェック**: Git hooksによる品質管理の自動化
- **未使用変数は削除**: 変数名に`_`をつけて警告を抑制するのは推奨されない

### TypeScript型安全性チェックリスト
- ✅ `any`型を使用していない
- ✅ `unknown`型は外部データまたは動的データのみに使用
- ✅ 型アサーション（`as`）の前に型ガードを実装
- ✅ 外部APIレスポンスに対して適切な型ガードを実装
- ✅ データベースからのデータに対して型検証を実装
- ✅ すべての関数パラメータと戻り値に型注釈を記載
- ✅ インターフェースの各プロパティに日本語コメントを記載

## 10. パッケージ管理

### 使用ツール
- **パッケージマネージャー**: `pnpm`
- **リンター**: `oxlint`（高速TypeScriptリンター）
- **ビルドツール**: Vite + React
- **型チェック**: TypeScript strict モード

### パッケージ管理ルール
- **不要パッケージ削除**: `pnpm uninstall`で積極的に削除
- **明示的依存**: 必要な依存関係を明確に定義
- **セキュリティ重視**: 信頼できるパッケージのみ使用

## まとめ

Cookletのコーディングルールは以下の価値観に基づいています：

1. **型安全性最優先** - any型禁止、unknown型の適切な使用、型ガードによる安全性確保
2. **可読性重視** - 日本語コメント、明確な命名規則、型の意図を明示
3. **保守性確保** - モジュラー設計、統一されたパターン、型による自己文書化
4. **品質保証** - 自動化されたlint・build チェック、型安全性チェックリスト
5. **開発効率** - 一貫したコーディングスタイル、再利用可能な設計、型による開発支援
6. **実行時安全性** - 外部データの型ガード、エラーハンドリングの徹底

## 型安全性の重要性

Cookletでは、外部API（Google Vision API、Supabase等）やユーザー入力データを多く扱うため、特に型安全性を重視しています。`unknown`型と型ガードの適切な組み合わせにより、実行時エラーを防止し、信頼性の高いアプリケーションを実現しています。

これらのルールに従うことで、高品質で保守しやすく、実行時にも安全なコードベースを維持できます。

## 9. レイアウト・デザインルール

### 9.1 ページレベルレイアウト統一

**統一スタイル**：
```tsx
// ✅ 全ページ共通レイアウト
export const PageComponent: React.FC = () => {
  return (
    <div className="p-4">
      {/* ページコンテンツ */}
    </div>
  );
};
```

**適用必須ページ**：
- サマリー（Summary.tsx）
- 献立管理（MealPlans.tsx）  
- 買い物リスト（Shopping.tsx）
- レシピ管理（Recipes.tsx）
- 在庫管理（Stock.tsx）
- コスト管理（Cost.tsx）
- 設定（Settings.tsx）
- 材料マスタ管理（IngredientManagement.tsx）

### 9.2 カードコンポーネント統一

**標準カードスタイル**：
```tsx
// ✅ 統一されたカードデザイン
<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
  {/* カードコンテンツ */}
</div>
```

**スペーシングルール**：
- **ページpadding**: `p-4`（1rem）
- **カード間margin**: `mb-4`（1rem）
- **カード内padding**: `p-4`（1rem）
- **セクション間space**: `space-y-6`（1.5rem）

### 9.3 ヘッダーセクション統一

**標準ヘッダー構造**：
```tsx
// ✅ 統一されたヘッダーデザイン
<div className="flex justify-between items-center mb-4">
  <h2 className="text-lg font-semibold flex items-center">
    <span className="mr-2">{/* 絵文字アイコン */}</span>
    {/* ページタイトル */}
  </h2>
</div>
```

### 9.4 禁止パターン

```tsx
// ❌ 禁止 - 不統一なpadding
export const BadPage: React.FC = () => {
  return (
    <div className="p-2"> {/* 他のページと異なるpadding */}
      {/* コンテンツ */}
    </div>
  );
};

// ❌ 禁止 - 不統一なmargin
<div className="bg-white rounded-lg p-3 shadow-sm mb-6"> {/* 異なるpadding/margin */}
  {/* カードコンテンツ */}
</div>

// ❌ 禁止 - 独自のレイアウトシステム
<div className="custom-container"> {/* 独自クラス使用禁止 */}
  {/* コンテンツ */}
</div>
```

### 9.5 レスポンシブ対応

**モバイルファースト原則**：
- 基本デザインはモバイル最適化
- デスクトップは必要に応じて拡張
- タッチ操作を前提とした要素サイズ

**メディアクエリ使用ガイドライン**：
```tsx
// ✅ レスポンシブデザイン例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* グリッドアイテム */}
</div>
```

### 9.6 コンポーネント設計原則

**再利用可能性**：
- 共通パターンは`src/components/common/`に配置
- プロパティによる柔軟な制御
- 一貫したprops命名規則

**型安全なスタイリング**：
```tsx
// ✅ 型安全なスタイルprops
interface CardProps {
  className?: string; // 追加スタイルの許可
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = "", children }) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4 ${className}`}>
      {children}
    </div>
  );
};
```

### 9.7 デザインシステム準拠

**UI/UXとの統一**：
- `.claude/UI.md`の「3.6 レイアウト・スペーシング統一ルール」に準拠
- デザインシステムとコーディングルールの一致
- 継続的な一貫性の維持