# Cooklet

## プロジェクト概要

Cookletは家庭向けの献立管理PWA（Progressive Web App）です。
食事計画、レシピ管理、在庫管理、食費管理を一元化し、日々の料理を効率化します。

### 主な特徴
- 週/月単位での献立計画とカレンダー表示
- 写真付きレシピの作成・管理・検索
- バーコード対応の食材在庫管理
- レシート読み取り機能による食費管理
- 自動買い物リスト生成
- PWA対応（オフライン機能、インストール可能）

## ドキュメント構成

### 要求仕様
- [要求仕様書](./spec/requirements/requirements.md) - 機能要件・非機能要件・制約条件

### 設計仕様
- [システム設計書](./spec/design/design.md) - 技術選定・アーキテクチャ・データベース設計
- [UI仕様書](./spec/design/ui/) - 各画面の詳細なUI設計
  - [献立画面](./spec/design/ui/meal-plan-screen.md) - 週/月単位での食事計画管理
  - [レシピ画面](./spec/design/ui/recipe-screen.md) - レシピの作成・編集・検索
  - [在庫画面](./spec/design/ui/inventory-screen.md) - 食材の在庫・期限管理
  - [コスト画面](./spec/design/ui/cost-screen.md) - 食費の記録・分析
  - [材料画面](./spec/design/ui/ingredients-screen.md) - 食材マスタ・買い物リスト
  - [設定画面](./spec/design/ui/settings-screen.md) - ユーザ設定・通知・データ管理
  - [共通UIデザイン戦略](./spec/design/ui/design-system.md) - デザインシステム・コンポーネント設計

### 実装計画
- [開発計画書](./spec/implementation/development-plan.md) - 開発フェーズ・実装順序・スケジュール
