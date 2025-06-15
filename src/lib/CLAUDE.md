# Lib ディレクトリ

## 概要
外部ライブラリやAPIクライアントの設定を管理するディレクトリ。

## ファイル構成

### supabase.ts
Supabaseクライアントの初期化と設定を行う。

#### 機能
- `createClient`を使用してSupabaseクライアントを作成
- 環境変数から`VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`を取得
- 環境変数が設定されていない場合はエラーを投げる
- exportされた`supabase`オブジェクトがアプリケーション全体で使用される

#### 使用方法
```typescript
import { supabase } from '../lib/supabase';

// データベースクエリ例
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

#### 設定方法
プロジェクトルートの`.env`ファイルに以下を設定：
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 注意点
- 環境変数はViteの命名規則に従い`VITE_`プレフィックスが必要
- anonキーのみでRow Level Securityにより適切なアクセス制御を実現