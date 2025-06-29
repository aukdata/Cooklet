# src/components/common - 共通コンポーネント

アプリ全体で汎用的に使用される共通UIコンポーネントを定義するディレクトリです。

## ファイル構成

### NameQuantityUnitInput.tsx
**用途**: レシート読み取り結果などで使用する名前・数量・単位の入力コンポーネント

**主要機能**:
- 名前入力フィールド（テキスト）
- 数量入力フィールド（テキスト） 
- 単位選択ドロップダウン（FOOD_UNITSから選択）
- 3列グリッドレイアウト
- プレースホルダーのカスタマイズ可能
- 無効化状態対応

**Props**:
- `name: string` - 名前の値
- `quantity: string` - 数量の値  
- `unit: FoodUnit` - 単位の値
- `onNameChange: (name: string) => void` - 名前変更時のコールバック
- `onQuantityChange: (quantity: string) => void` - 数量変更時のコールバック
- `onUnitChange: (unit: FoodUnit) => void` - 単位変更時のコールバック
- `disabled?: boolean` - 無効化状態
- `placeholders?: { name?: string; quantity?: string }` - プレースホルダー
- `className?: string` - カスタムクラス名

### QuantityInput.tsx  
**用途**: 数値と単位を分離して入力できるコンポーネント

**主要機能**:
- 数値入力フィールド（左側）
- 単位選択ドロップダウン（右側）
- parseQuantity/formatQuantity関数との連携
- 自動的な値の正規化・フォーマット

**Props**:
- `value: Quantity` - 現在の値（Quantity型）
- `onChange: (value: Quantity) => void` - 値変更時のコールバック
- `placeholder?: string` - プレースホルダー
- `className?: string` - カスタムクラス名
- `disabled?: boolean` - 無効化状態

**内部関数**:
- `handleAmountChange(newAmount: string): void` - 数値変更ハンドラー
- `handleUnitChange(newUnit: FoodUnit): void` - 単位変更ハンドラー

## 使用場面

### NameQuantityUnitInput
- レシート読み取り結果の編集画面
- 複数の食材を一括入力する場面
- 食材名・数量・単位を個別に編集したい場面

### QuantityInput
- 在庫ダイアログの数量・単位入力
- 買い物リストの数量編集
- レシピ材料の数量・単位指定

## 依存関係

- `FOOD_UNITS` - 単位一覧（constants/units.tsから）
- `FoodUnit` - 単位型（constants/units.tsから）
- `parseQuantity` - 数量パース関数（constants/units.tsから）
- `formatQuantity` - 数量フォーマット関数（constants/units.tsから）
- `Quantity` - 数量と単位型（types/index.tsから）

## 設計方針

- **汎用性**: 様々な画面で再利用可能
- **型安全性**: FoodUnit型による厳密な単位管理
- **一貫性**: 統一されたUI/UX（フォーカス色、ボーダー等）
- **柔軟性**: プロップスによるカスタマイズ対応