# Contexts ディレクトリ

## 概要
React Contextを使用したグローバル状態管理を行うディレクトリ。

## ファイル構成

### AuthContext.tsx
ユーザー認証状態の管理を行うContext。

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