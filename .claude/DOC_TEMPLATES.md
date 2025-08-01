# ドキュメントテンプレート

Cookletプロジェクトで使用する標準的なドキュメントテンプレートです。Martin Fowlerリファクタリング手法を統合したテンプレートを提供します。

## Martin Fowlerリファクタリング記録テンプレート

### リファクタリング実行記録
```markdown
# リファクタリング記録: [対象ファイル/機能名]

## 基本情報
- **実行日**: YYYY-MM-DD
- **対象**: [ファイルパスまたは機能名]
- **実行者**: [実行者名]
- **所要時間**: [実際の作業時間]

## コードの匂いの特定
- **匂いの種類**: [Long Component/Complex useEffect/Duplicate Code等]
- **具体的な問題**: [詳細な問題の説明]
- **影響範囲**: [問題が及ぼす影響の説明]
- **重要度**: [High/Medium/Low]

## 適用したリファクタリング技法
- **主要技法**: [Extract Component/Replace useEffect等]
- **副次技法**: [併用した他の技法]
- **適用理由**: [なぜその技法を選択したか]

## 実行手順
1. **事前確認**
   - [ ] 既存テスト実行（lint & build）
   - [ ] 動作確認完了
   - [ ] バックアップ作成

2. **段階的実行**
   ```
   Step 1: [具体的な作業内容]
   → 確認: [動作確認結果]
   
   Step 2: [具体的な作業内容]  
   → 確認: [動作確認結果]
   
   ...
   ```

3. **事後確認**
   - [ ] lint & build成功
   - [ ] 動作確認完了
   - [ ] CLAUDE.md更新

## リファクタリング結果

### 定量的効果
- **コード行数**: [変更前] → [変更後] ([削減率]%削減)
- **ファイル数**: [分割前] → [分割後]
- **複雑度**: [主観的評価の改善]

### 定性的効果
- **可読性**: [改善内容]
- **保守性**: [改善内容]  
- **テスタビリティ**: [改善内容]
- **再利用性**: [改善内容]

### 技術的詳細
- **変更されたファイル**: [ファイル一覧]
- **新規作成ファイル**: [ファイル一覧]
- **削除されたファイル**: [ファイル一覧]
- **型定義変更**: [型の変更内容]

## 学んだ教訓
- **うまくいった点**: [成功要因]
- **改善点**: [次回への改善提案]
- **発見した問題**: [新たに発見された技術的課題]

## 今後のアクション
- [ ] [関連する他のリファクタリング候補]
- [ ] [追加の改善提案]
- [ ] [ドキュメント更新]
```

### リファクタリング計画テンプレート
```markdown
# リファクタリング計画: [プロジェクト/機能名]

## 現状分析

### コードの匂い一覧
| ファイル | 匂いの種類 | 重要度 | 推定工数 | 備考 |
|---------|-----------|--------|---------|------|
| [ファイル名] | [Long Component] | High | [2h] | [詳細] |
| [ファイル名] | [Complex useEffect] | Medium | [1h] | [詳細] |

### 技術的負債評価
- **高優先度**: [即座に対応すべき項目]
- **中優先度**: [計画的に対応する項目]  
- **低優先度**: [必要に応じて対応する項目]

## リファクタリング戦略

### 実行順序
1. **Phase 1 (Week 1)**: [高優先度項目]
2. **Phase 2 (Week 2)**: [中優先度項目]
3. **Phase 3 (Week 3)**: [低優先度項目]

### リスク評価
- **高リスク**: [影響範囲が大きい変更]
- **中リスク**: [一部機能への影響]
- **低リスク**: [局所的な改善]

### 成功指標
- **定量的指標**: [コード行数削減、複雑度改善等]
- **定性的指標**: [可読性、保守性の向上]

## 実行計画
- **開始日**: YYYY-MM-DD
- **完了予定日**: YYYY-MM-DD
- **チェックポイント**: [中間確認日]
```

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