# Contexts ディレクトリ

## 概要
React Contextを使用したグローバル状態管理を行うディレクトリ。

## ファイル構成

### AuthContext.tsx
ユーザー認証状態の管理を行うContext。

### RepositoryContext.tsx
Repository層のDI（依存性注入）管理コンテキスト。

#### 機能
- Repository実装の抽象化とモック化対応
- 環境に応じたRepository実装の切り替え
- テスト時のモックRepository注入

#### 提供する値
- `stockRepository`: 在庫管理Repository
- `mealPlanRepository`: 献立管理Repository 
- `shoppingListRepository`: 買い物リスト管理Repository

#### 専用フック
- `useRepository()`: 全Repositoryコンテナを取得
- `useStockRepository()`: 在庫Repository専用フック
- `useMealPlanRepository()`: 献立Repository専用フック
- `useShoppingListRepository()`: 買い物リストRepository専用フック

#### 環境別実装
- **本番・開発環境**: Supabase実装を使用
- **テスト環境**: Mock実装を使用（メモリ内データ管理）

### DialogContext.tsx
ダイアログ表示状態の管理コンテキスト。

#### 機能
- ダイアログの表示・非表示状態管理
- タブナビゲーションとの連携

#### 提供する値
- `isDialogOpen`: ダイアログが開いているかのフラグ
- `setIsDialogOpen`: ダイアログ状態を変更する関数

### NavigationContext.tsx
アプリ内ナビゲーションの管理コンテキスト。

#### 機能
- タブベースの画面遷移管理
- アクティブタブの状態管理
- パス形式でのナビゲーション機能

#### 提供する値
- `activeTab`: 現在のアクティブタブID
- `setActiveTab`: タブを直接設定する関数
- `navigate`: パス形式でナビゲーションする関数

#### サポートするパス
- `summary`: サマリー画面
- `meal-plans`: 献立画面
- `shopping`: 買い物画面
- `recipes`: レシピ画面
- `stock`: 在庫画面
- `cost`: コスト画面
- `settings`: 設定画面
- `settings/ingredients`: 材料マスタ管理画面

#### 提供する機能

**状態管理**
- `user`: アプリケーション内のUser型ユーザー情報
- `supabaseUser`: Supabase認証ユーザー情報  
- `session`: Supabase認証セッション
- `loading`: 認証状態の読み込み中フラグ

**認証関数**
- `signIn(email, password)`: メール・パスワードでログイン
- `signUp(email, password)`: メール・パスワードでアカウント作成
- `signOut()`: ログアウト

#### 特徴

**ユーザープロフィール管理**
- `fetchUserProfile`: Supabaseユーザーからアプリ内ユーザー情報を取得
- usersテーブルが存在しない場合の対応
- プロフィール作成エラー時の簡易ユーザーオブジェクト作成
- タイムアウト対応（10秒）

**エラーハンドリング**
- データベース接続エラー時の簡易ユーザー作成
- コンソールログによる詳細なデバッグ情報出力
- 認証状態変更の監視

**セキュリティ機能**
- 認証状態変更の自動検知
- セッション管理
- ユーザープロフィールの自動作成・同期

#### 使用方法
```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, loading, signIn, signOut } = useAuth();
```

## 注意点
- マウント/アンマウント状態を適切に管理してメモリリークを防止
- 開発中はコンソールログが詳細に出力される
- 本番環境ではログレベルの調整が必要
- NavigationContextは独自のタブベースルーティングシステム
- React Routerは使用せず、カスタムナビゲーションシステムを採用