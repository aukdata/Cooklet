/**
 * エラーハンドリング用ユーティリティ関数
 * 重複していたエラー処理ロジックを統一管理
 */

// エラー種別の定義
export type ErrorType = 'network' | 'validation' | 'auth' | 'server' | 'unknown';

// エラー情報の型定義
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError?: unknown;
}

/**
 * エラーを分類し、ユーザーフレンドリーなメッセージを生成
 * @param error - 捕捉されたエラー
 * @returns エラー情報
 */
export const classifyError = (error: unknown): ErrorInfo => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // ネットワークエラー
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network',
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        originalError: error
      };
    }
    
    // 認証エラー
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return {
        type: 'auth',
        message: 'ログインセッションが無効です。再度ログインしてください。',
        originalError: error
      };
    }
    
    // バリデーションエラー
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        type: 'validation',
        message: '入力内容に誤りがあります。内容を確認してください。',
        originalError: error
      };
    }
    
    // サーバーエラー
    if (message.includes('server') || message.includes('500') || message.includes('503')) {
      return {
        type: 'server',
        message: 'サーバーでエラーが発生しました。しばらく待ってから再試行してください。',
        originalError: error
      };
    }
    
    // その他のError
    return {
      type: 'unknown',
      message: error.message || '予期しないエラーが発生しました。',
      originalError: error
    };
  }
  
  // Error以外のオブジェクト
  return {
    type: 'unknown',
    message: '予期しないエラーが発生しました。',
    originalError: error
  };
};

/**
 * 非同期操作を実行し、統一されたエラーハンドリングを提供
 * @param operation - 実行する非同期操作
 * @param onError - エラー時のハンドラー（オプション）
 * @param onSuccess - 成功時のハンドラー（オプション）
 * @returns 操作結果
 */
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  onError?: (errorInfo: ErrorInfo) => void,
  onSuccess?: (result: T) => void
): Promise<{ success: boolean; data?: T; error?: ErrorInfo }> => {
  try {
    const result = await operation();
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return { success: true, data: result };
  } catch (error) {
    const errorInfo = classifyError(error);
    
    // コンソールにエラーログを出力
    console.error(`[${errorInfo.type}] ${errorInfo.message}`, errorInfo.originalError);
    
    if (onError) {
      onError(errorInfo);
    }
    
    return { success: false, error: errorInfo };
  }
};

/**
 * React向けの非同期操作フック
 * @param showToast - トースト表示関数
 * @returns エラーハンドリング付きの非同期操作実行関数
 */
export const createAsyncHandler = (
  showToast: {
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
  }
) => {
  return async <T>(
    operation: () => Promise<T>,
    successMessage?: string,
    customErrorHandler?: (errorInfo: ErrorInfo) => void
  ): Promise<{ success: boolean; data?: T }> => {
    const result = await handleAsyncOperation(
      operation,
      (errorInfo) => {
        if (customErrorHandler) {
          customErrorHandler(errorInfo);
        } else {
          showToast.showError(errorInfo.message);
        }
      },
      (data) => {
        if (successMessage) {
          showToast.showSuccess(successMessage);
        }
      }
    );
    
    return { success: result.success, data: result.data };
  };
};

/**
 * エラーメッセージを日本語に変換
 * @param error - エラーオブジェクト
 * @returns 日本語エラーメッセージ
 */
export const getJapaneseErrorMessage = (error: unknown): string => {
  const errorInfo = classifyError(error);
  return errorInfo.message;
};