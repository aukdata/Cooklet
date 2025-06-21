# AI ディレクトリ

## 概要
レシピURLからの食材自動抽出機能を実現するAIプロバイダー抽象化レイヤー。
複数のAI APIを統一インターフェースで利用できるよう設計されています。

## ファイル構成

### types.ts
AI関連の型定義とインターフェースを定義。

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

**AIProviderConfig型**
- AI Provider設定情報
- provider: 'gemini' | 'claude' | 'openai' | 'groq'
- apiKey: API Key
- model: 使用モデル名（任意）
- maxTokens: 最大トークン数（任意）
- temperature: 生成温度（任意）

**AIProvider型**
- AI Provider抽象化インターフェース
- extractRecipeFromHtml(): HTML→レシピ情報抽出
- getProviderName(): プロバイダー名取得
- getConfig(): 設定情報取得

**RecipeExtractionError型**
- レシピ抽出専用エラークラス
- provider: エラー発生プロバイダー
- url: 抽出対象URL（任意）
- originalError: 元エラー（任意）

### base-provider.ts
AI Provider基底クラスの実装。

#### 機能
- 各プロバイダーの共通処理を定義
- エラーハンドリングの統一
- 設定管理の基盤
- レスポンス正規化

### provider-factory.ts
AI Providerのファクトリークラス。

#### 機能
- プロバイダー選択ロジック
- 設定に基づく動的プロバイダー生成
- プロバイダー切り替え機能
- 環境変数からの設定読み込み

### providers/gemini-provider.ts
Google Gemini AIプロバイダーの実装。

#### 機能
- Gemini API連携
- HTMLから食材抽出
- 日本語レシピサイト対応
- 構造化レスポンス生成

#### 特徴
- CLAUDE.md仕様書のRecipeExtraction型に準拠
- エラーハンドリングの詳細実装
- 日本語コメント完備
- レシピサイト判定ロジック

## 設計原則

### プロバイダー抽象化
- 複数のAI APIを統一インターフェースで管理
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

```typescript
import { ProviderFactory } from './provider-factory';
import type { AIProviderConfig } from './types';

const config: AIProviderConfig = {
  provider: 'gemini',
  apiKey: process.env.VITE_GOOGLE_API_KEY!,
  model: 'gemini-pro',
  temperature: 0.1
};

const provider = ProviderFactory.createProvider(config);
const result = await provider.extractRecipeFromHtml(html, url);
```

## 環境変数

```env
# Gemini AI
VITE_GOOGLE_API_KEY=your_gemini_api_key

# 将来対応予定
# VITE_OPENAI_API_KEY=your_openai_api_key
# VITE_CLAUDE_API_KEY=your_claude_api_key
```

## 注意点
- APIキーの適切な管理が必要
- プロバイダーごとの利用制限を考慮
- レスポンス時間の監視が推奨
- HTTPS URLのみサポート