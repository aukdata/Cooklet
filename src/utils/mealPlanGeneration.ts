import type { StockItem, Ingredient } from '../types';
import type { SavedRecipe } from '../types/recipe';
import type { MealType } from '../types';
import { parseQuantity } from '../constants/units';

// 購入単位情報を表すインターフェース
export interface PurchaseUnit {
  ingredientName: string;
  quantity: number;
  unit: string;
}

// 在庫情報（アルゴリズム内部用）
export interface InventoryItem {
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
}

// レシピ情報（アルゴリズム内部用）
export interface RecipeData {
  name: string;
  servings: number;
  ingredients: { name: string; quantity: number; unit: string }[];
}

// 献立生成の設定を表すインターフェース
export interface MealGenerationSettings {
  stockItems: StockItem[]; // 在庫一覧
  recipes: SavedRecipe[]; // レシピ一覧
  ingredients: Ingredient[]; // 食材マスタ一覧
  days: number; // 何日分生成するか
  mealTypes: [boolean, boolean, boolean]; // [朝, 昼, 夜]のどれを生成するか
  // アルゴリズムパラメータ
  alpha?: number; // 購入コスト重み（デフォルト: 1.0）
  beta?: number; // 期限重み（デフォルト: 1.0）
  temperature?: number; // ランダム性パラメータ（デフォルト: 0.0）
}

// 購入リスト項目を表すインターフェース
export interface ShoppingItem {
  ingredient: string;
  quantity: number;
  unit: string;
}

// 献立アイテムを表すインターフェース
export interface MealPlanItem {
  mealNumber: number; // 食事番号
  recipe: string; // レシピ名
  ingredients?: string[]; // 使用する食材リスト
  estimatedCost?: number; // 推定コスト
}

// 献立生成結果を表すインターフェース（PLAN.md準拠）
export interface MealGenerationResult {
  mealPlan: MealPlanItem[]; // 生成された献立配列（詳細情報付き）
  shoppingList: ShoppingItem[]; // 購入リスト
  warnings: string[]; // 警告メッセージ（在庫不足など）
  usedIngredients: string[]; // 使用された食材名（後方互換性のため残す）
}

/**
 * 在庫活用献立自動生成アルゴリズム（PLAN.md準拠実装）
 * 期限の近い食材を優先的に使用し、購入が必要な食材の種類を最小化する
 * 
 * @param inventory 現在の在庫情報
 * @param recipes レシピ情報
 * @param purchaseUnits 購入単位情報
 * @param numMeals 生成する食事数
 * @param alpha 購入コスト重み（大きいほど購入を避ける）
 * @param beta 期限重み（大きいほど期限近い食材を優先）
 * @param temperature ランダム性パラメータ（0.0-1.0、0.0は常に同じ結果）
 * @returns 献立リストと購入リストのタプル
 */
export const generateMealPlanAlgorithm = (
  inventory: { [key: string]: InventoryItem },
  recipes: { [key: string]: RecipeData },
  purchaseUnits: { [key: string]: PurchaseUnit },
  numMeals: number,
  alpha: number = 1.0,
  beta: number = 1.0,
  temperature: number = 0.0
): [MealPlanItem[], ShoppingItem[]] => {
  // 暫定在庫を現在の在庫でディープコピー
  const tempInventory: { [key: string]: InventoryItem } = {};
  for (const [key, value] of Object.entries(inventory)) {
    tempInventory[key] = { ...value };
  }

  const purchaseList: ShoppingItem[] = [];
  const mealPlan: MealPlanItem[] = [];

  // 各食事の処理ループ
  for (let mealNum = 1; mealNum <= numMeals; mealNum++) {
    let bestRecipe: string | null = null;
    let bestScore = Infinity;

    // レシピ評価
    for (const [recipeName, recipeData] of Object.entries(recipes)) {
      let purchaseCost = 0;
      let expiryPenalty = 0;
      let canMakeRecipe = true;

      for (const ingredient of recipeData.ingredients) {
        // 1人前に換算
        const neededAmount = ingredient.quantity / recipeData.servings;
        const currentStock = tempInventory[ingredient.name]?.quantity || 0;

        // 購入必要コスト計算
        if (currentStock < neededAmount) {
          const shortage = neededAmount - currentStock;
          const purchaseUnit = purchaseUnits[ingredient.name];
          if (!purchaseUnit) {
            // 購入単位情報がない場合はレシピを作れない
            canMakeRecipe = false;
            break;
          }
          const purchaseUnitsNeeded = Math.ceil(shortage / purchaseUnit.quantity);
          purchaseCost += purchaseUnitsNeeded;
        }

        // 期限ペナルティ計算
        if (currentStock >= neededAmount && tempInventory[ingredient.name]?.expiryDate) {
          const expiryDate = new Date(tempInventory[ingredient.name].expiryDate!);
          const today = new Date();
          const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysToExpiry > 0) {
            expiryPenalty += neededAmount * (1 / daysToExpiry);
          }
        }
      }

      if (!canMakeRecipe) continue;

      // 総合スコア = α×購入コスト - β×期限ペナルティ（小さいほど良い）
      let totalScore = alpha * purchaseCost - beta * expiryPenalty;

      // 温度パラメータによるランダム性追加
      if (temperature > 0) {
        const randomFactor = (Math.random() - 0.5) * 2 * temperature;
        totalScore += randomFactor;
      }

      if (totalScore < bestScore) {
        bestScore = totalScore;
        bestRecipe = recipeName;
      }
    }

    if (!bestRecipe) {
      console.warn(`食事${mealNum}: 作れるレシピが見つかりませんでした`);
      continue;
    }

    // 最適レシピ選択と在庫更新・購入処理
    const selectedRecipe = recipes[bestRecipe];
    
    // 食材リストを作成
    const ingredients = selectedRecipe.ingredients.map(ing => ing.name);
    
    // 推定コストを計算（購入コスト）
    let estimatedCost = 0;
    for (const ingredient of selectedRecipe.ingredients) {
      const neededAmount = ingredient.quantity / selectedRecipe.servings;
      const currentStock = tempInventory[ingredient.name]?.quantity || 0;
      if (currentStock < neededAmount) {
        const shortage = neededAmount - currentStock;
        const purchaseUnit = purchaseUnits[ingredient.name];
        if (purchaseUnit) {
          const unitsToBuy = Math.ceil(shortage / purchaseUnit.quantity);
          estimatedCost += unitsToBuy * 100; // 仮の価格（1単位100円）
        }
      }
    }
    
    mealPlan.push({ 
      mealNumber: mealNum, 
      recipe: bestRecipe,
      ingredients,
      estimatedCost 
    });

    for (const ingredient of selectedRecipe.ingredients) {
      const neededAmount = ingredient.quantity / selectedRecipe.servings;
      const currentStock = tempInventory[ingredient.name]?.quantity || 0;

      // 不足分の購入処理
      if (currentStock < neededAmount) {
        const shortage = neededAmount - currentStock;
        const purchaseUnit = purchaseUnits[ingredient.name];
        const unitsToBuy = Math.ceil(shortage / purchaseUnit.quantity);
        const purchaseAmount = unitsToBuy * purchaseUnit.quantity;

        // 購入リストに追加
        purchaseList.push({
          ingredient: ingredient.name,
          quantity: purchaseAmount,
          unit: purchaseUnit.unit
        });

        // 暫定在庫に追加
        if (!tempInventory[ingredient.name]) {
          tempInventory[ingredient.name] = {
            name: ingredient.name,
            quantity: 0,
            unit: purchaseUnit.unit
          };
        }
        tempInventory[ingredient.name].quantity += purchaseAmount;
      }

      // 使用分を在庫から減算
      tempInventory[ingredient.name].quantity -= neededAmount;
    }
  }

  return [mealPlan, purchaseList];
};

/**
 * 献立を自動生成する関数（メイン API）
 * PLAN.mdのアルゴリズムを適用し、既存のデータ構造と統合
 * 
 * @param settings 献立生成の設定
 * @returns 生成された献立情報
 */
export const generateMealPlan = async (settings: MealGenerationSettings): Promise<MealGenerationResult> => {
  console.log('献立生成機能が呼び出されました:', {
    在庫数: settings.stockItems.length,
    レシピ数: settings.recipes.length,
    食材マスタ数: settings.ingredients.length,
    生成日数: settings.days,
    食事タイプ: {
      朝食: settings.mealTypes[0],
      昼食: settings.mealTypes[1],
      夕食: settings.mealTypes[2]
    },
    パラメータ: {
      alpha: settings.alpha || 1.0,
      beta: settings.beta || 1.0,
      temperature: settings.temperature || 0.0
    }
  });

  try {
    // 1. データ変換: CookletのデータをPLAN.mdのアルゴリズム用形式に変換
    const inventory: { [key: string]: InventoryItem } = {};
    settings.stockItems.forEach(stock => {
      const parsed = parseQuantity(stock.quantity);
      inventory[stock.name] = {
        name: stock.name,
        quantity: parseFloat(parsed.amount) || 0,
        unit: parsed.unit,
        expiryDate: stock.best_before
      };
    });

    // 2. レシピ情報を変換（実際のSavedRecipe.ingredientsを使用）
    const recipes: { [key: string]: RecipeData } = {};
    settings.recipes.forEach(recipe => {
      // 実際のレシピの食材情報を解析してアルゴリズム用形式に変換
      const processedIngredients: { name: string; quantity: number; unit: string }[] = [];
      
      recipe.ingredients.forEach(ingredient => {
        const parsed = parseQuantity(ingredient.quantity);
        const amount = parseFloat(parsed.amount);
        
        // 数値として解析できた場合のみアルゴリズムで使用
        if (!isNaN(amount) && amount > 0) {
          processedIngredients.push({
            name: ingredient.name.trim(),
            quantity: amount,
            unit: parsed.unit
          });
        } else {
          // 適量、少々などの場合はデフォルト値を設定
          processedIngredients.push({
            name: ingredient.name.trim(),
            quantity: 1, // デフォルト数量
            unit: "適量" // 特殊単位
          });
        }
      });
      
      // 食材が存在するレシピのみを登録
      if (processedIngredients.length > 0) {
        recipes[recipe.title] = {
          name: recipe.title,
          servings: recipe.servings,
          ingredients: processedIngredients
        };
      }
    });

    // 3. 購入単位情報を食材マスタから生成
    const purchaseUnits: { [key: string]: PurchaseUnit } = {};
    settings.ingredients.forEach(ingredient => {
      purchaseUnits[ingredient.name] = {
        ingredientName: ingredient.name,
        quantity: parseFloat(ingredient.conversion_quantity || "1") || 1,
        unit: ingredient.conversion_unit || ingredient.default_unit
      };
    });
    
    // レシピに含まれているが食材マスタにない食材用のデフォルト購入単位を生成
    const recipeIngredientNames = new Set<string>();
    Object.values(recipes).forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        recipeIngredientNames.add(ingredient.name);
      });
    });
    
    recipeIngredientNames.forEach(ingredientName => {
      if (!purchaseUnits[ingredientName]) {
        // デフォルト購入単位を設定
        purchaseUnits[ingredientName] = {
          ingredientName,
          quantity: 1,
          unit: "個" // デフォルト単位
        };
      }
    });

    // 4. 食事数計算と初期チェック
    const enabledMealTypes = settings.mealTypes.filter(enabled => enabled).length;
    const numMeals = settings.days * enabledMealTypes;

    if (numMeals === 0) {
      return {
        mealPlan: [],
        shoppingList: [],
        warnings: ['生成する食事タイプが選択されていません'],
        usedIngredients: []
      };
    }
    
    if (Object.keys(recipes).length === 0) {
      return {
        mealPlan: [],
        shoppingList: [],
        warnings: ['利用可能なレシピがありません。レシピを追加してから献立生成を実行してください。'],
        usedIngredients: []
      };
    }

    // 5. アルゴリズム実行
    const [mealPlan, shoppingList] = generateMealPlanAlgorithm(
      inventory,
      recipes,
      purchaseUnits,
      numMeals,
      settings.alpha || 1.0,
      settings.beta || 1.0,
      settings.temperature || 0.0
    );

    // 6. 結果の分析と警告生成
    const usedIngredients = Array.from(new Set(shoppingList.map(item => item.ingredient)));
    const warnings: string[] = [];
    
    if (mealPlan.length === 0) {
      warnings.push('適切なレシピが見つかりませんでした。以下をご確認ください：');
      warnings.push('・レシピに食材情報が登録されているか');
      warnings.push('・食材マスタに必要な食材が登録されているか');
      warnings.push('・在庫が極端に不足していないか');
    }
    
    if (mealPlan.length < numMeals) {
      warnings.push(`要求された${numMeals}食分のうち、${mealPlan.length}食分のみ生成されました。`);
      if (shoppingList.length > 0) {
        warnings.push('購入リストの食材を買い物して在庫を補充すると、より多くの献立を生成できる可能性があります。');
      }
    }
    
    // 購入必要食材数の情報
    if (shoppingList.length > 0) {
      const totalPurchaseItems = shoppingList.length;
      const totalPurchaseCost = shoppingList.reduce((sum, item) => sum + item.quantity, 0);
      warnings.push(`${totalPurchaseItems}種類の食材（合計${totalPurchaseCost}単位）の購入が必要です。`);
    }

    return {
      mealPlan,
      shoppingList,
      warnings,
      usedIngredients
    };
  } catch (error) {
    console.error('献立生成中にエラーが発生しました:', error);
    
    // エラーの詳細に応じた適切なメッセージを生成
    let errorMessage = '献立生成中にエラーが発生しました';
    if (error instanceof Error) {
      if (error.message.includes('parseQuantity')) {
        errorMessage = '食材の数量解析でエラーが発生しました。レシピの食材情報を確認してください。';
      } else if (error.message.includes('inventory') || error.message.includes('stock')) {
        errorMessage = '在庫情報の処理でエラーが発生しました。在庫データを確認してください。';
      } else if (error.message.includes('recipe')) {
        errorMessage = 'レシピ情報の処理でエラーが発生しました。レシピデータを確認してください。';
      } else {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
    }
    
    return {
      mealPlan: [],
      shoppingList: [],
      warnings: [errorMessage],
      usedIngredients: []
    };
  }
};

/**
 * 食事タイプのインデックスから日本語表記に変換
 */
export const getMealTypeFromIndex = (index: number): MealType => {
  const mealTypes: MealType[] = ['朝', '昼', '夜'];
  return mealTypes[index] || '夜';
};

/**
 * 生成する期間の日付配列を取得
 */
export const getGenerationDates = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};