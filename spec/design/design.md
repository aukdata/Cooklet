# Cooklet 設計書

## 1. 技術アーキテクチャ概要

CookletはReact PWAとして開発され、Supabaseをバックエンドとして使用する。
シンプルなアーキテクチャでありながら、スケーラブルで保守性の高い構造を目指す。

## 2. 技術スタック

### 2.1 フロントエンド

#### 2.1.1 コア技術
- **React** - PWA（Progressive Web App）による高度なWebアプリケーション
  - 理由：コンポーネントベースの開発、豊富なエコシステム、PWA対応
  - バージョン：React 18+
- **TypeScript** - 型安全性によるバグ削減と開発効率向上
  - 理由：大規模開発での型安全性、開発体験の向上
- **React Router** - SPA（Single Page Application）の画面遷移
  - 理由：宣言的ルーティング、コード分割対応

#### 2.1.2 ビルドツール
- **Vite** - 高速なビルドとHMR
  - 理由：開発時の高速ビルド、PWA プラグイン対応
- **PWA Plugin** - Service Worker生成、オフライン対応

#### 2.1.3 状態管理
- **React Hooks** - useState、useEffect等のビルトイン機能で状態管理
  - 理由：シンプルなアプリケーション構造、学習コストの低さ
  - useContext：グローバル状態（ユーザ情報、設定）
  - useState/useReducer：ローカル状態管理

### 2.2 データベース・バックエンド

#### 2.2.1 BaaS（Backend as a Service）
- **Supabase** - PostgreSQLベースのBaaS（Backend as a Service）
  - 理由：リアルタイム機能、認証機能、REST API自動生成
  - PostgreSQL：堅牢なリレーショナルデータベース
  - 自動生成API：CRUD操作の簡素化

#### 2.2.2 認証・セキュリティ
- **Supabase Auth** - ユーザ認証とセキュリティ管理
  - 理由：OAuth対応、JWTトークン管理、RLS（Row Level Security）
  - 対応プロバイダ：Email/Password、Google、GitHub等
  - セキュリティ：RLSによるデータアクセス制御

### 2.3 UI・デザイン

#### 2.3.1 UIコンポーネント
- **Material-UI（MUI）** - Material Designコンポーネントライブラリ
  - 理由：豊富なコンポーネント、テーマシステム、アクセシビリティ対応
  - カスタマイゼーション：食材管理アプリ向けの色調整
  - レスポンシブ：ブレークポイントシステム

#### 2.3.2 PWA機能
- **PWA機能** - オフライン対応、プッシュ通知、インストール可能
  - Service Worker：キャッシュ戦略、オフライン対応
  - Web App Manifest：インストール可能なアプリ体験
  - Push Notifications：期限切れアラート等

## 3. システム設計

### 3.1 アーキテクチャパターン

#### 3.1.1 フロントエンドアーキテクチャ
```
├── src/
│   ├── components/          # 再利用可能なUIコンポーネント
│   │   ├── common/         # 共通コンポーネント
│   │   └── domain/         # ドメイン固有コンポーネント
│   ├── pages/              # 画面コンポーネント
│   │   ├── MealPlan/
│   │   ├── Recipe/
│   │   ├── Inventory/
│   │   ├── Cost/
│   │   └── Ingredients/
│   ├── hooks/              # カスタムフック
│   ├── services/           # API通信・外部サービス
│   ├── types/              # TypeScript型定義
│   ├── utils/              # ユーティリティ関数
│   └── constants/          # 定数定義
```

#### 3.1.2 コンポーネント設計方針
- **Atomic Design**：Atoms → Molecules → Organisms → Templates → Pages
- **関心の分離**：UI・ロジック・データアクセスの分離
- **再利用性**：共通コンポーネントの積極活用

### 3.2 データベース設計

本アプリケーションは、Supabaseの認証システム（auth.users）を基盤とした堅牢なデータベース設計を採用しています。

#### 3.2.1 設計概要

- **PostgreSQL + Supabase**: リレーショナルデータベースとしての信頼性
- **Row Level Security（RLS）**: ユーザー別データアクセス制御
- **制約による品質保証**: CHECK制約・UNIQUE制約による厳格なデータ整合性
- **最適化されたインデックス**: 高速クエリのための戦略的インデックス設計

#### 3.2.2 主要エンティティ

- **user_profiles**: ユーザー設定・タイムゾーン・アラート設定
- **ingredients**: 食材マスターデータ・単位変換・調味料フラグ
- **recipes**: レシピ・材料・調理手順・タグ管理
- **stock_items**: 在庫管理・期限・保存場所・価格情報
- **meal_plans**: 献立計画・日別食事管理・完了状態
- **leftovers**: 作り置き管理・残量追跡

**詳細な設計仕様**: [scheme.md](./scheme.md) を参照

### 3.3 データアクセス設計

#### 3.3.1 Supabase統合
本アプリケーションはSupabaseの自動生成APIを活用し、カスタムAPIサーバーを持たない構成とします。

**データアクセス方法：**
- **Supabase JavaScript Client**: フロントエンドから直接データベースアクセス
- **自動生成REST API**: 全テーブルに対するCRUD操作
- **PostgreSQL関数（RPC）**: 複雑なビジネスロジック処理
- **Row Level Security**: ユーザー別データアクセス制御

#### 3.3.2 リアルタイム機能
- **Supabase Realtime**: データベース変更の即座反映
- **在庫更新**: リアルタイムでの在庫状況同期
- **献立共有**: 家族間でのリアルタイムデータ共有

### 3.4 セキュリティ設計

#### 3.4.1 認証・認可
- **Supabase Auth**: Google OAuth、Email/Password認証
- **Row Level Security (RLS)**: 全テーブルでユーザー別アクセス制御
- **JWT Token**: 自動トークン管理・リフレッシュ

RLS設定例：
```sql
-- レシピへのアクセス制御
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes_policy" ON recipes 
  FOR ALL USING (user_id = auth.uid());
```

#### 3.4.2 データ保護
- **HTTPS通信**: 全通信の暗号化
- **機密データ暗号化**: 環境変数でのAPI キー管理
- **クライアント認証**: Supabaseクライアント認証

**詳細なRLS設定**: [scheme.md](./scheme.md) のセキュリティ設計を参照

### 3.5 PWA設計

#### 3.5.1 Service Worker戦略
```javascript
// キャッシュ戦略
- レシピ画像：Cache First
- API データ：Network First with Cache Fallback
- 静的アセット：Stale While Revalidate
```

#### 3.5.2 オフライン対応
- 重要データのローカルキャッシュ
- オフライン時の操作キュー
- 接続復帰時の自動同期

## 4. パフォーマンス設計

### 4.1 フロントエンド最適化
- **コード分割**：React.lazy、動的import
- **画像最適化**：WebP形式、遅延ローディング
- **バンドル最適化**：Tree shaking、圧縮

### 4.2 データベース最適化
- **適切なインデックス**：クエリパフォーマンス向上
- **データ正規化**：冗長性の排除
- **クエリ最適化**：N+1問題の回避

### 4.3 キャッシュ戦略
- **ブラウザキャッシュ**：静的アセットの長期キャッシュ
- **API キャッシュ**：React Query によるキャッシュ管理
- **Service Worker**：オフライン対応とパフォーマンス向上

## 5. 開発・デプロイ設計

### 5.1 開発環境
- **開発サーバ**：Vite Dev Server
- **型チェック**：TypeScript strict mode
- **リンター**：ESLint + Prettier
- **テスト**：Vitest + Testing Library

### 5.2 デプロイメント
- **ホスティング**：Netlify
- **CI/CD**：GitHub Actions
- **環境管理**：Development / Production
