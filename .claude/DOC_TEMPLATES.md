# ドキュメントテンプレート

Cookletプロジェクトで使用する標準的なドキュメントテンプレートです。

## コンポーネントディレクトリ用テンプレート

```markdown
# src/[directory] - [日本語説明]

[ディレクトリの概要説明]

## ファイル構成

### [ファイル名.tsx]
**用途**: [コンポーネントの目的]

**主要機能**:
- [機能1の説明]
- [機能2の説明]
- [機能3の説明]

**Props**:
- `prop1: type` - [プロパティの説明]
- `prop2?: type` - [オプションプロパティの説明]
- `onAction: (param: type) => void` - [イベントハンドラーの説明]

**使用場面**:
- [具体的な使用シーン1]
- [具体的な使用シーン2]

## 依存関係

- [依存するコンポーネント・フック・型の列挙]

## 設計方針

- **[設計原則1]**: [説明]
- **[設計原則2]**: [説明]
```

## ユーティリティディレクトリ用テンプレート

```markdown
# src/[directory] - [日本語説明]

[ディレクトリの概要説明]

## ファイル構成

### [ファイル名.ts]
**用途**: [ユーティリティの目的]

#### 主要関数

**functionName(params): ReturnType**
- **用途**: [関数の目的]
- **引数**: [パラメータの説明]
- **戻り値**: [返り値の説明]
- **使用例**: 
```typescript
const result = functionName(param1, param2);
```

#### 型定義

**TypeName**
```typescript
interface TypeName {
  property1: type; // [説明]
  property2?: type; // [オプション、説明]
}
```

## 使用方法

```typescript
import { functionName, TypeName } from './[filename]';

// [具体的な使用例]
```

## 注意点

- [重要な制約や注意事項]
- [パフォーマンスに関する注意]
```

## フックディレクトリ用テンプレート

```markdown
# src/hooks - カスタムフック

[ディレクトリの概要説明]

## ファイル構成

### use[HookName].ts
**用途**: [フックの目的]

#### 提供する機能
- `data`: [データの説明]
- `loading`: [ローディング状態]
- `error`: [エラー状態]
- `actionName`: [アクション関数の説明]

#### 特徴
- [特徴1の説明]
- [特徴2の説明]
- [データ更新戦略の説明]

#### データ構造
```typescript
interface DataType {
  property1: type; // [説明]
  property2: type; // [説明]
}
```

## 共通パターン

- [共通の実装パターンの説明]
- [エラーハンドリングの方針]
- [認証との連携方法]
```

## 設定ファイル用テンプレート

```markdown
# [ファイル名] - [日本語説明]

[ファイルの目的と概要]

## 設定内容

### [セクション名]
- **[設定項目1]**: [値] - [説明]
- **[設定項目2]**: [値] - [説明]

## カスタマイズ方法

[設定変更の手順]

## 注意点

- [重要な制約や注意事項]
```

## 使用ガイドライン

### 必須項目
1. **日本語見出し**: すべてのディレクトリに日本語説明を併記
2. **用途明記**: 各ファイル・関数の具体的な用途を明記
3. **型情報**: TypeScript型を含めた詳細な情報
4. **使用例**: 実際のコード例を提供

### 推奨項目
1. **設計方針**: 重要な設計判断の説明
2. **依存関係**: 他のファイルとの関係性
3. **注意点**: 使用時の制約や注意事項
4. **将来の拡張**: 今後の改善予定

### 禁止事項
1. **曖昧な表現**: 「など」「その他」の多用を避ける
2. **実装詳細の欠如**: 実際のコードと乖離した説明
3. **古い情報**: 実装と一致しない過去の情報