# UI共通コンポーネント

## 概要
アプリ全体で使用する共通UIコンポーネントライブラリ。統一されたデザインシステムと再利用性を提供。

## BaseDialog.tsx

### 概要
全ダイアログで共通のUI構造を提供する基盤コンポーネント。

### 主要機能
- モーダルオーバーレイ
- 統一されたヘッダー（タイトル + 閉じるボタン）
- 3段階ボタン配置（削除・キャンセル・保存）
- サイズバリエーション（sm/md/lg）
- カスタムアクションエリア対応

### Props
- `isOpen: boolean` - ダイアログの表示状態
- `onClose: () => void` - ダイアログを閉じるコールバック
- `title: string` - ダイアログのタイトル
- `icon: string` - タイトル前の絵文字アイコン
- `children: ReactNode` - ダイアログ内のコンテンツ
- `size?: 'sm' | 'md' | 'lg'` - ダイアログのサイズ
- `showDelete?: boolean` - 削除ボタンの表示フラグ
- `onSave?: () => void` - 保存処理
- `onDelete?: () => void` - 削除処理

## FormField.tsx

### 概要
統一されたラベル付きフィールドコンポーネント。

### 主要機能
- ラベル（絵文字 + テキスト + 必須マーク）
- エラーメッセージ表示
- アクセシビリティ対応

### 付属コンポーネント
- `TextInput` - テキスト入力フィールド
- `TextArea` - テキストエリアフィールド
- `NumberInput` - 数値入力フィールド

### Props
- `label: string` - フィールドのラベル
- `icon?: string` - ラベル前の絵文字アイコン
- `children: ReactNode` - フィールドのコンテンツ
- `required?: boolean` - 必須項目フラグ
- `error?: string` - エラーメッセージ

## DateInput.tsx

### 概要
クイック設定ボタン付きの統一日付入力コンポーネント。

### 主要機能
- 日付入力フィールド
- クイック設定ボタン（今日・1週間・1ヶ月）
- 日本語日付表示
- キーボードアクセシビリティ対応

### ユーティリティ関数
- `getTodayString()` - 今日の日付取得
- `getDateAfterDays(days)` - 指定日数後の日付取得
- `getDaysDifference(date1, date2)` - 日付差分計算

### Props
- `value: string` - 日付の値（YYYY-MM-DD形式）
- `onChange: (value: string) => void` - 日付変更時のコールバック
- `showQuickButtons?: boolean` - クイック設定ボタンの表示
- `disabled?: boolean` - 無効化状態

## IngredientsEditor.tsx

### 概要
食材リストの追加・編集・削除機能を統一したコンポーネント。

### 主要機能
- 食材の追加・削除・編集
- QuantityInputコンポーネントとの統合
- キーボードナビゲーション（Enterキーでの項目移動）
- バリデーション機能
- 最大項目数制限

### ユーティリティ関数
- `validateIngredients(ingredients)` - 食材リストのバリデーション
- `cleanIngredients(ingredients)` - 空の項目を除去
- `normalizeIngredients(ingredients)` - 食材リストの正規化

### Props
- `ingredients: Ingredient[]` - 食材リスト
- `onChange: (ingredients: Ingredient[]) => void` - 食材リスト変更コールバック
- `disabled?: boolean` - 無効化状態
- `maxItems?: number` - 最大食材数
- `addButtonText?: string` - 食材追加ボタンのテキスト

## Button.tsx

### 概要
アプリ全体で使用する共通ボタンコンポーネント。issue #16で作成。

### 主要コンポーネント

#### Button
基本的なボタンコンポーネント。

**Props:**
- `onClick: () => void` - クリック時の処理
- `children: React.ReactNode` - ボタン内のコンテンツ
- `variant?: 'primary' | 'secondary' | 'edit' | 'delete' | 'add'` - ボタンの種類
- `size?: 'sm' | 'md' | 'lg'` - ボタンのサイズ
- `disabled?: boolean` - 無効化フラグ
- `className?: string` - 追加のCSSクラス

**バリアント:**
- `primary`: 主要アクション（indigo系）
- `secondary`: 副次アクション（gray系）
- `edit`: 編集ボタン（gray系、在庫画面ベース）
- `delete`: 削除ボタン（red系）
- `add`: 追加ボタン（indigo系）

#### EditButton
編集用の専用ボタン。在庫画面のデザインを基準とした統一スタイル。

**Props:**
- `onClick: () => void` - クリック時の処理
- `disabled?: boolean` - 無効化フラグ

**使用場所:**
- 在庫画面のアクションボタン
- コスト画面の支出履歴編集ボタン（issue #15対応）
- レシピ画面の編集ボタン（issue #12対応）

#### AddButton
追加用の専用ボタン。

**Props:**
- `onClick: () => void` - クリック時の処理
- `children: React.ReactNode` - ボタン内のコンテンツ
- `disabled?: boolean` - 無効化フラグ

**使用場所:**
- 在庫画面の「+ 在庫追加」ボタン

#### DeleteButton
削除用の専用ボタン。ダイアログ内での使用を想定。

**Props:**
- `onClick: () => void` - クリック時の処理
- `disabled?: boolean` - 無効化フラグ

**使用場所:**
- 各種編集ダイアログ内の削除ボタン

### 設計方針

1. **統一性の確保**
   - 在庫画面の編集ボタンを基準とした統一デザイン
   - CLAUDE.md 8.2で定義されたUI/UXデザインルールに準拠

2. **削除ボタンの配置制限**
   - リスト画面での削除ボタン表示を禁止
   - 削除操作はダイアログ内でのみ実行（誤操作防止）

3. **再利用性の向上**
   - 複数画面で共通利用可能
   - プロパティによる柔軟なカスタマイズ

### 今後の使用指示

1. **新規画面・機能追加時**
   - 編集・追加・削除ボタンは必ずこの共通コンポーネントを使用
   - 独自のボタンスタイルは作成禁止

2. **既存画面の修正時**
   - 既存のボタンを共通コンポーネントに順次置き換え
   - デザインの一貫性を維持

3. **拡張時の注意**
   - 新しいバリアントが必要な場合はButton.tsxに追加
   - 専用コンポーネントが必要な場合も同ファイル内に定義