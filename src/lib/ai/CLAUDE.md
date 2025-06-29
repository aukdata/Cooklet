# 自動抽出 ディレクトリ

## 概要
レシピURLからの食材自動抽出とレシートOCRテキストからの構造化データ抽出機能を実現する自動抽出プロバイダー抽象化レイヤー。
複数の自動抽出 APIを統一インターフェースで利用できるよう設計されています。

## ファイル構成

### types.ts
自動抽出関連の型定義とインターフェースを定義。

#### 主要な型定義

**RecipeExtraction型**
- レシピ抽出結果のスキーマ定義
- title: レシピ名
- servings: 何人前
- ingredients: 食材配列（name, quantity, unit）
- extractedFrom: 抽出元URL
- confidence: 抽出結果の信頼度（0-1）
- isRecipeSite: レシピサイト判定フラグ
- suggestedTags: 提案タグ配列

**AutoExtractionProviderConfig型**
- 自動抽出 Provider設定情報
- provider: 'gemini' | 'claude' | 'openai' | 'groq'
- apiKey: API Key
- model: 使用モデル名（任意）
- maxTokens: 最大トークン数（任意）
- temperature: 生成温度（任意）

**ReceiptExtraction型**
- レシート抽出結果のスキーマ定義
- items: 商品配列（name, quantity, price）
- storeName: 店舗名
- date: 購入日
- confidence: 抽出結果の信頼度（0-1）

**AutoExtractionProvider型**
- 自動抽出 Provider抽象化インターフェース
- extractRecipeFromHtml(): HTML→レシピ情報抽出
- extractReceiptFromText(): OCRテキスト→レシート構造化データ抽出
- getProviderName(): プロバイダー名取得
- getConfig(): 設定情報取得

**RecipeExtractionError型**
- レシピ抽出専用エラークラス
- provider: エラー発生プロバイダー
- url: 抽出対象URL（任意）
- originalError: 元エラー（任意）

**ReceiptExtractionError型**
- レシート抽出専用エラークラス
- provider: エラー発生プロバイダー
- originalError: 元エラー（任意）

### base-provider.ts
自動抽出 Provider基底クラスの実装。

#### 機能
- 各プロバイダーの共通処理を定義
- エラーハンドリングの統一
- 設定管理の基盤
- レスポンス正規化

### provider-factory.ts
自動抽出 Providerのファクトリークラス。

#### 機能
- プロバイダー選択ロジック
- 設定に基づく動的プロバイダー生成
- プロバイダー切り替え機能
- 環境変数からの設定読み込み

### providers/gemini-provider.ts
Google Gemini 自動抽出プロバイダーの実装。

#### 機能
- Gemini 自動抽出 API連携
- HTMLから食材抽出（レシピサイト）
- OCRテキストからレシート構造化
- 日本語対応
- 構造化レスポンス生成

#### 特徴
- RecipeExtraction型とReceiptExtraction型に準拠
- エラーハンドリングの詳細実装
- 日本語コメント完備
- レシピサイト判定ロジック
- レシート商品・店舗・日付抽出

## 設計原則

### プロバイダー抽象化
- 複数の自動抽出 APIを統一インターフェースで管理
- プロバイダー切り替えの容易性
- 新規プロバイダー追加の簡便性

### エラーハンドリング
- RecipeExtractionErrorによる詳細エラー情報
- プロバイダー固有エラーの統一化
- 日本語エラーメッセージ

### 型安全性
- TypeScriptによる厳密な型定義
- `any`型の使用禁止
- インターフェース準拠の強制

## 使用方法

### レシピ抽出
```typescript
import { AutoExtractionProviderFactory } from './provider-factory';

const provider = AutoExtractionProviderFactory.createFromEnvironment();
const recipeResult = await provider.extractRecipeFromHtml(html, url);
```

### レシート構造化
```typescript
import { AutoExtractionProviderFactory } from './provider-factory';

const provider = AutoExtractionProviderFactory.createFromEnvironment();
const receiptResult = await provider.extractReceiptFromText(ocrText);
```

### 手動設定
```typescript
import { AutoExtractionProviderFactory } from './provider-factory';
import type { AutoExtractionProviderConfig } from './types';

const config: AutoExtractionProviderConfig = {
  provider: 'gemini',
  apiKey: process.env.VITE_GOOGLE_CLOUD_API_KEY!,
  model: 'gemini-2.5-flash',
  temperature: 0.05
};

const provider = AutoExtractionProviderFactory.createProvider(config);
const result = await provider.extractRecipeFromHtml(html, url);
```

## 環境変数

```env
# Gemini 自動抽出
VITE_GOOGLE_CLOUD_API_KEY=your_gemini_api_key

# 将来対応予定
# VITE_OPENAI_API_KEY=your_openai_api_key
# VITE_CLAUDE_API_KEY=your_claude_api_key
```

## 注意点
- APIキーの適切な管理が必要
- プロバイダーごとの利用制限を考慮
- レスポンス時間の監視が推奨
- HTTPS URLのみサポート