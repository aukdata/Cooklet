export interface User {
  id: string;
  email: string;
  name?: string;
  google_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category: 'vegetables' | 'meat' | 'seasoning' | 'others';
  default_unit: string;
  typical_price?: number;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  user_id: string;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
  purchase_price?: number;
  purchase_date?: string;
  expiry_date?: string;
  location: 'refrigerator' | 'freezer' | 'pantry';
  is_leftover: boolean;
  leftover_recipe_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: number;
  user_id: string;
  name: string;
  external_url?: string;
  cooking_time?: number;
  servings: number;
  estimated_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  recipe_ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
  is_optional: boolean;
}

export interface MealPlan {
  id: number;
  user_id: string;
  planned_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id: number;
  recipe?: Recipe;
  servings: number;
  actual_cost?: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ShoppingListItem {
  id: number;
  user_id: string;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
  estimated_price?: number;
  source_meal_plan_id?: number;
  is_purchased: boolean;
  purchased_at?: string;
  actual_price?: number;
  created_at: string;
}