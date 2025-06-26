# 献立管理アプリ: 在庫活用自動献立生成アルゴリズム実装要件

## 概要

在庫から自動で献立を生成するアルゴリズムを実装してください。期限の近い食材を優先的に使用し、購入が必要な食材の種類を最小化することを目指します。

## 入力データ構造

### 1. 在庫情報 (Inventory)

```python
inventory = {
    "食材名": {
        "quantity": 数量,
        "unit": "単位(g, 個, etc)",
        "expiry_date": "消費期限(YYYY-MM-DD)"
    }
}

# 例
inventory = {
    "鶏胸肉": {"quantity": 300, "unit": "g", "expiry_date": "2025-06-28"},
    "玉ねぎ": {"quantity": 2, "unit": "個", "expiry_date": "2025-07-05"},
    "人参": {"quantity": 150, "unit": "g", "expiry_date": "2025-07-03"}
}
```

### 2. レシピ情報 (Recipes)

```python
recipes = {
    "レシピ名": {
        "servings": 何人前,
        "ingredients": {
            "食材名": {"quantity": 必要量, "unit": "単位"}
        }
    }
}

# 例
recipes = {
    "鶏肉野菜炒め": {
        "servings": 2,
        "ingredients": {
            "鶏胸肉": {"quantity": 200, "unit": "g"},
            "玉ねぎ": {"quantity": 1, "unit": "個"},
            "人参": {"quantity": 100, "unit": "g"}
        }
    }
}
```

### 3. 購入単位情報 (Purchase Units)

```python
purchase_units = {
    "食材名": {"quantity": 購入単位量, "unit": "単位"}
}

# 例
purchase_units = {
    "鶏胸肉": {"quantity": 300, "unit": "g"},
    "玉ねぎ": {"quantity": 3, "unit": "個"},
    "人参": {"quantity": 200, "unit": "g"}
}
```

## アルゴリズム仕様

### メイン関数

```python
def generate_meal_plan(inventory, recipes, purchase_units, num_meals, alpha=1.0, beta=1.0, temperature=0.0):
    """
    在庫活用献立生成
    
    Args:
        inventory: 現在の在庫情報
        recipes: レシピ情報
        purchase_units: 購入単位情報
        num_meals: 生成する食事数
        alpha: 購入コスト重み（大きいほど購入を避ける）
        beta: 期限重み（大きいほど期限近い食材を優先）
        temperature: ランダム性パラメータ（0.0-1.0、0.0は常に同じ結果）
    
    Returns:
        tuple: (献立リスト, 購入リスト)
    """
```

### アルゴリズム手順

1. **初期設定**
- 暫定在庫 = 現在の在庫をディープコピー
- 購入リスト = 空のリスト
- 献立リスト = 空のリスト
1. **各食事の処理ループ**
   
   **2-1. レシピ評価**
   
   ```python
   for recipe_name, recipe_data in recipes.items():
       purchase_cost = 0
       expiry_penalty = 0
       
       for ingredient, needed in recipe_data["ingredients"].items():
           # 1人前に換算
           needed_amount = needed["quantity"] / recipe_data["servings"]
           current_stock = temp_inventory.get(ingredient, {}).get("quantity", 0)
           
           # 購入必要コスト計算
           if current_stock < needed_amount:
               shortage = needed_amount - current_stock
               purchase_units_needed = math.ceil(shortage / purchase_units[ingredient]["quantity"])
               purchase_cost += purchase_units_needed
           
           # 期限ペナルティ計算
           if current_stock >= needed_amount:
               days_to_expiry = (datetime.strptime(temp_inventory[ingredient]["expiry_date"], "%Y-%m-%d") - datetime.now()).days
               if days_to_expiry > 0:
                   expiry_penalty += needed_amount * (1 / days_to_expiry)
       
       # 総合スコア = α×購入コスト - β×期限ペナルティ（小さいほど良い）
       total_score = alpha * purchase_cost - beta * expiry_penalty
       
       # 温度パラメータによるランダム性追加
       if temperature > 0:
           import random
           random_factor = random.uniform(-temperature, temperature)
           total_score += random_factor
   ```
   
   **2-2. 最適レシピ選択**
- 総合スコアが最小のレシピを選択
   
   **2-3. 在庫更新と購入処理**
   
   ```python
   for ingredient, needed in selected_recipe["ingredients"].items():
       needed_amount = needed["quantity"] / selected_recipe["servings"]
       
       # 不足分の購入処理
       if temp_inventory[ingredient]["quantity"] < needed_amount:
           shortage = needed_amount - temp_inventory[ingredient]["quantity"]
           units_to_buy = math.ceil(shortage / purchase_units[ingredient]["quantity"])
           purchase_amount = units_to_buy * purchase_units[ingredient]["quantity"]
           
           # 購入リストに追加
           purchase_list.append({
               "ingredient": ingredient,
               "quantity": purchase_amount,
               "unit": purchase_units[ingredient]["unit"]
           })
           
           # 暫定在庫に追加
           temp_inventory[ingredient]["quantity"] += purchase_amount
       
       # 使用分を在庫から減算
       temp_inventory[ingredient]["quantity"] -= needed_amount
   ```
1. **結果返却**
- (献立リスト, 購入リスト) のタプルを返す

## 出力形式

### 献立リスト

```python
meal_plan = [
    {"meal_number": 1, "recipe": "鶏肉野菜炒め"},
    {"meal_number": 2, "recipe": "カレー"},
    # ...
]
```

### 購入リスト

```python
shopping_list = [
    {"ingredient": "鶏胸肉", "quantity": 300, "unit": "g"},
    {"ingredient": "玉ねぎ", "quantity": 3, "unit": "個"},
    # ...
]
```

完全に動作するコードを実装してください。
