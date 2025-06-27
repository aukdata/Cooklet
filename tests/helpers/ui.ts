import { Page, Locator, expect } from '@playwright/test';

/**
 * UI操作関連のテストヘルパー関数
 */

/**
 * ローディングスピナーが表示されなくなるまで待機
 * @param page Playwrightページオブジェクト
 * @param timeout タイムアウト時間（ミリ秒）
 */
export async function waitForLoadingToComplete(
  page: Page,
  timeout: number = 10000
): Promise<void> {
  try {
    await page.waitForSelector('[data-testid="loading"]', { 
      state: 'hidden', 
      timeout 
    });
  } catch {
    // ローディングスピナーが存在しない場合は何もしない
  }
}

/**
 * ダイアログが開くまで待機
 * @param page Playwrightページオブジェクト
 * @param dialogTitle ダイアログのタイトル（オプション）
 */
export async function waitForDialogToOpen(
  page: Page,
  dialogTitle?: string
): Promise<void> {
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  
  if (dialogTitle) {
    await expect(page.getByText(dialogTitle)).toBeVisible();
  }
}

/**
 * ダイアログが閉じるまで待機
 * @param page Playwrightページオブジェクト
 */
export async function waitForDialogToClose(page: Page): Promise<void> {
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}

/**
 * トースト通知が表示されることを確認
 * @param page Playwrightページオブジェクト
 * @param message 期待するメッセージ
 */
export async function expectToastMessage(
  page: Page,
  message: string
): Promise<void> {
  const toast = page.getByRole('alert').filter({ hasText: message });
  await expect(toast).toBeVisible();
  
  // トーストが自動で消えることを確認
  await expect(toast).toBeHidden({ timeout: 5000 });
}

/**
 * エラーメッセージが表示されることを確認
 * @param page Playwrightページオブジェクト
 * @param message エラーメッセージ
 */
export async function expectErrorMessage(
  page: Page,
  message: string
): Promise<void> {
  const errorElement = page.locator('.text-red-500, [data-testid="error"]').filter({ hasText: message });
  await expect(errorElement).toBeVisible();
}

/**
 * フォームの必須フィールドエラーを確認
 * @param page Playwrightページオブジェクト
 * @param fieldName フィールド名
 */
export async function expectRequiredFieldError(
  page: Page,
  fieldName: string
): Promise<void> {
  const field = page.getByLabel(fieldName);
  const errorMessage = page.locator(`[aria-describedby="${await field.getAttribute('aria-describedby')}"]`);
  await expect(errorMessage).toBeVisible();
}

/**
 * 選択リストからオプションを選択
 * @param page Playwrightページオブジェクト
 * @param selectLabel セレクトボックスのラベル
 * @param optionText 選択するオプションのテキスト
 */
export async function selectOption(
  page: Page,
  selectLabel: string,
  optionText: string
): Promise<void> {
  const select = page.getByLabel(selectLabel);
  await select.click();
  await page.getByRole('option', { name: optionText }).click();
}

/**
 * 日付入力フィールドに値を設定
 * @param page Playwrightページオブジェクト
 * @param fieldName フィールド名
 * @param date 日付文字列（YYYY-MM-DD）
 */
export async function fillDateField(
  page: Page,
  fieldName: string,
  date: string
): Promise<void> {
  const dateField = page.getByLabel(fieldName);
  await dateField.click();
  await dateField.fill(date);
  await dateField.blur(); // フィールドからフォーカスを外す
}

/**
 * ファイルアップロード操作
 * @param page Playwrightページオブジェクト
 * @param inputSelector ファイル入力要素のセレクタ
 * @param filePath アップロードするファイルのパス
 */
export async function uploadFile(
  page: Page,
  inputSelector: string,
  filePath: string
): Promise<void> {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * テーブルの行数を確認
 * @param page Playwrightページオブジェクト
 * @param tableSelector テーブルのセレクタ
 * @param expectedRowCount 期待する行数
 */
export async function expectTableRowCount(
  page: Page,
  tableSelector: string,
  expectedRowCount: number
): Promise<void> {
  const rows = page.locator(`${tableSelector} tbody tr`);
  await expect(rows).toHaveCount(expectedRowCount);
}

/**
 * リストアイテムの数を確認
 * @param page Playwrightページオブジェクト
 * @param listSelector リストのセレクタ
 * @param expectedItemCount 期待するアイテム数
 */
export async function expectListItemCount(
  page: Page,
  listSelector: string,
  expectedItemCount: number
): Promise<void> {
  const items = page.locator(`${listSelector} > *`);
  await expect(items).toHaveCount(expectedItemCount);
}

/**
 * スクロールして要素を表示エリアに移動
 * @param page Playwrightページオブジェクト
 * @param selector 要素のセレクタ
 */
export async function scrollToElement(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
}

/**
 * チェックボックスの状態を確認・変更
 * @param page Playwrightページオブジェクト
 * @param checkboxLabel チェックボックスのラベル
 * @param shouldBeChecked チェックされるべきかどうか
 */
export async function toggleCheckbox(
  page: Page,
  checkboxLabel: string,
  shouldBeChecked: boolean
): Promise<void> {
  const checkbox = page.getByLabel(checkboxLabel);
  
  if (shouldBeChecked) {
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  } else {
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  }
}

/**
 * ドラッグアンドドロップ操作
 * @param page Playwrightページオブジェクト
 * @param sourceSelector ドラッグ元の要素
 * @param targetSelector ドロップ先の要素
 */
export async function dragAndDrop(
  page: Page,
  sourceSelector: string,
  targetSelector: string
): Promise<void> {
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);
  
  await source.dragTo(target);
}

/**
 * カスタム確認ダイアログを処理
 * @param page Playwrightページオブジェクト
 * @param action 実行するアクション（'accept' または 'dismiss'）
 * @param trigger ダイアログをトリガーする操作
 */
export async function handleConfirmDialog(
  page: Page,
  action: 'accept' | 'dismiss',
  trigger: () => Promise<void>
): Promise<void> {
  // ブラウザネイティブのダイアログを処理
  page.on('dialog', dialog => {
    if (action === 'accept') {
      dialog.accept();
    } else {
      dialog.dismiss();
    }
  });
  
  await trigger();
}

/**
 * レスポンシブデザインのテスト
 * @param page Playwrightページオブジェクト
 * @param viewport ビューポートサイズ
 * @param testCallback テスト実行コールバック
 */
export async function testResponsiveDesign(
  page: Page,
  viewport: { width: number; height: number },
  testCallback: (page: Page) => Promise<void>
): Promise<void> {
  await page.setViewportSize(viewport);
  await testCallback(page);
  
  // デスクトップサイズに戻す
  await page.setViewportSize({ width: 1280, height: 720 });
}

/**
 * フォームの送信とレスポンス待機
 * @param page Playwrightページオブジェクト
 * @param formSelector フォームのセレクタ
 * @param expectedUrl 送信後の期待するURL（オプション）
 */
export async function submitFormAndWait(
  page: Page,
  formSelector: string,
  expectedUrl?: string
): Promise<void> {
  const form = page.locator(formSelector);
  const submitButton = form.locator('button[type="submit"], input[type="submit"]');
  
  await submitButton.click();
  
  if (expectedUrl) {
    await page.waitForURL(expectedUrl);
  } else {
    await waitForLoadingToComplete(page);
  }
}