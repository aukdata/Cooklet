# 共通UIデザイン戦略 仕様書

## デザインシステム概要
Cookletアプリ全体で一貫性のあるユーザーエクスペリエンスを提供するための包括的なデザインシステム。Material Design 3の原則に基づきながら、料理・食材管理アプリに最適化されたデザインを構築する。

## デザイン原則

### 1. シンプリシティ
- **最小限の認知負荷**: 直感的で分かりやすいUI
- **クリーンなレイアウト**: 余白を活用した見やすいデザイン
- **情報の階層化**: 重要度に応じた情報の優先順位付け

### 2. アクセシビリティ
- **カラーコントラスト**: WCAG 2.1 AA基準準拠
- **フォントサイズ**: 最小14px以上のテキスト
- **タッチターゲット**: 最小48dp以上のタップエリア

### 3. 一貫性
- **統一されたコンポーネント**: 全画面共通のUI部品
- **予測可能な動作**: 同じ操作は同じ結果をもたらす
- **視覚的統一感**: 一貫したカラー・フォント・アイコン使用

## カラーパレット

### プライマリカラー
- **Primary**: `#4CAF50` (Green 500) - メインブランドカラー、アクション要素
- **Primary Variant**: `#388E3C` (Green 600) - ホバー・アクティブ状態
- **On Primary**: `#FFFFFF` - プライマリカラー上のテキスト

### セカンダリカラー
- **Secondary**: `#FF9800` (Orange 500) - アクセント、重要な情報
- **Secondary Variant**: `#F57C00` (Orange 600) - セカンダリのバリエーション
- **On Secondary**: `#FFFFFF` - セカンダリカラー上のテキスト

### サーフェスカラー
- **Background**: `#FAFAFA` (Grey 50) - アプリ背景
- **Surface**: `#FFFFFF` - カード・ダイアログ背景
- **Surface Variant**: `#F5F5F5` (Grey 100) - 副次的サーフェス

### フィードバックカラー
- **Error**: `#F44336` (Red 500) - エラー・警告
- **Warning**: `#FF9800` (Orange 500) - 注意喚起
- **Success**: `#4CAF50` (Green 500) - 成功・完了
- **Info**: `#2196F3` (Blue 500) - 情報・ヒント

### テキストカラー
- **On Surface**: `#212121` (Grey 900) - プライマリテキスト
- **On Surface Variant**: `#757575` (Grey 600) - セカンダリテキスト
- **On Surface Disabled**: `#BDBDBD` (Grey 400) - 無効状態テキスト

## タイポグラフィ

### フォントファミリー
- **Primary**: システムフォント (San Francisco / Roboto / Noto Sans)
- **Fallback**: sans-serif

### フォントスケール
- **Display Large**: 32px / Bold - 画面タイトル
- **Display Medium**: 28px / Bold - セクションタイトル
- **Display Small**: 24px / Bold - カード・パネルタイトル
- **Headline Large**: 20px / SemiBold - 見出し
- **Headline Medium**: 18px / SemiBold - 小見出し
- **Body Large**: 16px / Regular - 本文テキスト
- **Body Medium**: 14px / Regular - 説明テキスト
- **Body Small**: 12px / Regular - キャプション・補足
- **Label Large**: 14px / Medium - ボタンラベル
- **Label Medium**: 12px / Medium - チップ・タグ
- **Label Small**: 10px / Medium - 極小ラベル

## コンポーネント設計

### ボタン
```
Primary Button:
背景: Primary (#4CAF50)
テキスト: On Primary (#FFFFFF)
高さ: 48dp
角丸: 8dp
影: Elevation 2

Secondary Button:
背景: Surface (#FFFFFF)
テキスト: Primary (#4CAF50)
境界線: 1dp Primary
高さ: 48dp
角丸: 8dp

Text Button:
背景: Transparent
テキスト: Primary (#4CAF50)
高さ: 48dp
パディング: 16dp horizontal
```

### カード
```
Standard Card:
背景: Surface (#FFFFFF)
角丸: 12dp
影: Elevation 1
パディング: 16dp
マージン: 16dp horizontal, 8dp vertical

Elevated Card:
背景: Surface (#FFFFFF)
角丸: 12dp
影: Elevation 3
パディング: 20dp
```

### 入力フィールド
```
Text Field:
背景: Surface Variant (#F5F5F5)
角丸: 8dp
高さ: 56dp
パディング: 16dp horizontal
ラベル: Body Medium
フォーカス境界線: 2dp Primary
エラー境界線: 2dp Error
```

### ナビゲーション
```
Bottom Navigation:
背景: Surface (#FFFFFF)
高さ: 80dp
アイコン: 24dp
ラベル: Label Medium
アクティブ色: Primary
非アクティブ色: On Surface Variant

Tab Navigation:
背景: Surface (#FFFFFF)
高さ: 48dp
インジケーター: 2dp Primary
テキスト: Label Large
```

## アイコン戦略

### アイコンライブラリ
- **Primary**: Material Design Icons
- **Fallback**: Lucide React / Heroicons

### アイコンサイズ
- **Small**: 16dp - インライン、装飾
- **Medium**: 24dp - 標準、ボタン内
- **Large**: 32dp - ヘッダー、アクション
- **XLarge**: 48dp - 空状態、イラストレーション

### トランジション
- **Duration**: 200-300ms - 短い遷移
- **Duration**: 400-500ms - 画面遷移
- **Easing**: Cubic Bezier (0.4, 0.0, 0.2, 1) - Material標準

### マイクロインタラクション
- **Button Press**: 100ms scale down
- **Card Hover**: 200ms elevation up
- **Toggle**: 150ms color transition
- **Loading**: Continuous rotation/pulse

### オフライン対応
- **Offline Indicator**: 接続状況の明確な表示
- **Cached Content**: オフライン時でも基本機能利用可能
- **Sync Status**: データ同期状況の表示

### パフォーマンス
- **Loading States**: スケルトンUI、プログレシブローディング
- **Image Optimization**: WebP使用、遅延ローディング
- **Bundle Size**: 重要でない機能のコード分割