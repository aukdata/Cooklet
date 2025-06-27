/**
 * テストヘルパー関数のエクスポート
 * 各テストファイルから簡単にインポートできるようにする
 */

// 認証関連ヘルパー
export {
  mockLogin,
  mockLogout,
  checkAuthRequired,
  mockGoogleAuth,
  mockExpiredToken,
  mockUserWithRole,
} from './auth';

// データ関連ヘルパー
export {
  mockMealPlans,
  mockStockItems,
  mockShoppingList,
  mockSavedRecipes,
  mockNotificationSettings,
  mockSupabaseResponse,
  mockAllData,
  mockEmptyData,
  mockSupabaseError,
  generateTestDataForDateRange,
} from './data';

// UI操作関連ヘルパー
export {
  waitForLoadingToComplete,
  waitForDialogToOpen,
  waitForDialogToClose,
  expectToastMessage,
  expectErrorMessage,
  expectRequiredFieldError,
  selectOption,
  fillDateField,
  uploadFile,
  expectTableRowCount,
  expectListItemCount,
  scrollToElement,
  toggleCheckbox,
  dragAndDrop,
  handleConfirmDialog,
  testResponsiveDesign,
  submitFormAndWait,
} from './ui';