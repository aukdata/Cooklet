# Types ディレクトリ

## 概要
アプリケーション全体で使用するTypeScript型定義を集約したディレクトリ。

## ファイル構成

### index.ts
Cookletアプリケーションの主要なデータ型を定義。

#### 主要な型定義

**User型**
- ユーザー情報（id, email, name, google_id, 作成日時等）

**Ingredient型**  
- 食材マスタ情報（id, name, category, default_unit, typical_price等）
- category: 'vegetables' | 'meat' | 'seasoning' | 'others'

**InventoryItem型**
- 在庫情報（id, user_id, ingredient_id, quantity, unit, 賞味期限等）
- location: 'refrigerator' | 'freezer' | 'pantry'
- 作り置きフラグ（is_leftover）

**Recipe型**
- レシピ情報（id, user_id, name, external_url, cooking_time, servings等）
- recipe_ingredients配列を含む

**RecipeIngredient型**
- レシピで使用する食材情報（recipe_id, ingredient_id, quantity, unit, is_optional）

**MealPlan型**
- 献立計画（id, user_id, planned_date, meal_type, recipe_id, servings等）
- meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'

**ShoppingListItem型**
- 買い物リスト項目（id, user_id, ingredient_id, quantity, unit, 購入状況等）

## 注意点
- 現在の型定義は既存のデータベース構造に基づいているが、CLAUDE.md仕様書とは一部異なる
- 仕様書では日本語の食事タイプ（朝/昼/夜/間食）を使用
- 今後、仕様書に合わせて統一する必要がある