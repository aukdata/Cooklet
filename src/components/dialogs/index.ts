// 共通ダイアログコンポーネントのエクスポート - CLAUDE.md仕様書に準拠

// 献立編集ダイアログ（5.6.2）
// MealPlanDialog は削除されました（ダイアログ重複問題解決のため）
export { MealPlanEditDialog } from './MealPlanEditDialog';

// 手動献立入力ダイアログ（5.6.3）
export { ManualMealDialog } from './ManualMealDialog';

// レシピ編集ダイアログ（5.6.4）
export { RecipeDialog } from './RecipeDialog';

// 在庫編集ダイアログ（5.6.5）
export { StockDialog } from './StockDialog';

// コスト記録ダイアログ（5.6.6）
export { CostDialog } from './CostDialog';

// 削除確認ダイアログ（5.6.7）
export { ConfirmDialog } from './ConfirmDialog';

// 各ダイアログの型定義は個別ファイルで定義されています
// 使用時は個別にインポートしてください
// 例: import type { MealPlanDialogProps } from './MealPlanDialog';