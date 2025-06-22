# Types ディレクトリ

## 概要
アプリケーション全体で使用するTypeScript型定義を集約したディレクトリ。
CLAUDE.md仕様書に準拠したデータ型を定義しています。

## ファイル構成

### index.ts
Cookletアプリケーションの主要なデータ型を定義。

#### 主要な型定義

**User型**
- ユーザー情報（id, email, name, google_id, 作成日時等）

**Ingredient型**  
- 食材マスタ情報（id, user_id, name, category, default_unit, typical_price, original_name等）
- ユーザー認証対応：各ユーザーが独自の食材マスタを管理
- category: 'vegetables' | 'meat' | 'seasoning' | 'others'
- original_name: 商品名を一般名に変換するときに使用する元の商品名（任意）

**StockItem型** （CLAUDE.md仕様書準拠）
- 食材在庫情報（id, user_id, name, quantity, best_before, storage_location, is_homemade等）
- 作り置きフラグ（is_homemade）による管理

**Recipe型**
- レシピ情報（id, user_id, name, external_url, cooking_time, servings等）
- recipe_ingredients配列を含む

**DatabaseRecipeIngredient型**
- レシピで使用する食材情報（recipe_id, ingredient_id, quantity, unit, is_optional）

**MealPlan型** （CLAUDE.md仕様書準拠）
- 献立計画（id, user_id, date, meal_type, recipe_url, ingredients, memo等）
- meal_type: '朝' | '昼' | '夜' | '間食' （日本語）
- consumed_status: 'pending' | 'completed' | 'stored' （消費状態管理）

**ShoppingListItem型** （CLAUDE.md仕様書準拠）
- 買い物リスト項目（id, user_id, name, quantity, checked, added_from等）
- added_from: 'manual' | 'auto' （追加方法）

**CostRecord型** （CLAUDE.md仕様書準拠）
- コスト記録（id, user_id, date, description, amount, is_eating_out等）
- 自炊・外食の区別管理

**SavedRecipe型** （CLAUDE.md仕様書準拠）
- レシピ保存（id, user_id, title, url, servings, tags等）
- レシピURL管理と食材抽出の基盤

## 設計原則
- CLAUDE.md仕様書に完全準拠
- 型安全性を重視し、anyの使用は禁止
- 日本語でのコメント記載
- データベース設計との一致性を維持