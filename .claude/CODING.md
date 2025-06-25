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

### 型定義コメント規則
- **日本語コメント**: 各フィールドに日本語の説明を必須記載
- **DB形式明記**: データベースフィールドは`（DB形式）`を付記
- **任意フィールド**: オプショナルフィールドは`（任意、...）`で説明
- **unknown型制限**: 他の型やその組み合わせで表現できない場合のみ使用可
- **型アサーション制限**: `as`は必要な場合のみ使用、型ガードで安全性を確保

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
- **必須型注釈**: 変数定義時の型記載を必須化
- **自動品質チェック**: Git hooksによる品質管理の自動化

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

1. **型安全性最優先** - any型禁止、厳格な型チェック
2. **可読性重視** - 日本語コメント、明確な命名規則
3. **保守性確保** - モジュラー設計、統一されたパターン
4. **品質保証** - 自動化されたlint・build チェック
5. **開発効率** - 一貫したコーディングスタイル、再利用可能な設計

これらのルールに従うことで、高品質で保守しやすいコードベースを維持できます。