# 設計仕様

このディレクトリには、Cookletプロジェクトの設計仕様に関連する文書を格納します。

## 文書一覧

### システム設計
- [design.md](./design.md) - メイン設計書
  - 技術アーキテクチャ・技術スタック
  - システム設計・データベース設計
  - API設計・セキュリティ設計・PWA設計

### UI設計
- [ui/](./ui/) - UI仕様書ディレクトリ
  - [meal-plan-screen.md](./ui/meal-plan-screen.md) - 献立画面仕様
  - [recipe-screen.md](./ui/recipe-screen.md) - レシピ画面仕様
  - [inventory-screen.md](./ui/inventory-screen.md) - 在庫画面仕様
  - [cost-screen.md](./ui/cost-screen.md) - コスト画面仕様
  - [ingredients-screen.md](./ui/ingredients-screen.md) - 材料画面仕様
  - [settings-screen.md](./ui/settings-screen.md) - 設定画面仕様
  - [design-system.md](./ui/design-system.md) - 共通UIデザイン戦略

## 設計仕様の位置づけ

設計仕様書は、要求仕様を「どのように実現するか」を定義します：

- **技術選定**: 使用技術とその選定理由
- **アーキテクチャ**: システム全体の構造
- **データベース設計**: データモデルとテーブル設計
- **API設計**: インターフェース仕様
- **UI設計**: 画面レイアウトと操作フロー
- **セキュリティ設計**: 認証・認可・データ保護

## 関連文書

- [要求仕様](../requirements/) - 設計の基となる要求仕様
- [実装計画](../implementation/) - 設計を実際に開発する計画