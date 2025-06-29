import { describe, it, expect, vi } from 'vitest';
import {
  classifyError,
  handleAsyncOperation,
  createAsyncHandler,
  getJapaneseErrorMessage
} from './errorHandlers';

describe('errorHandlers', () => {
  
  describe('classifyError', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network connection failed');
      const result = classifyError(networkError);
      
      expect(result.type).toBe('network');
      expect(result.message).toContain('ネットワークエラー');
      expect(result.originalError).toBe(networkError);
    });

    it('should classify auth errors correctly', () => {
      const authError = new Error('Unauthorized access token');
      const result = classifyError(authError);
      
      expect(result.type).toBe('auth');
      expect(result.message).toContain('ログインセッション');
      expect(result.originalError).toBe(authError);
    });

    it('should classify validation errors correctly', () => {
      const validationError = new Error('Validation failed for input');
      const result = classifyError(validationError);
      
      expect(result.type).toBe('validation');
      expect(result.message).toContain('入力内容');
      expect(result.originalError).toBe(validationError);
    });

    it('should classify server errors correctly', () => {
      const serverError = new Error('Internal server error occurred');
      const result = classifyError(serverError);
      
      expect(result.type).toBe('server');
      expect(result.message).toContain('サーバーでエラーが発生しました');
      expect(result.originalError).toBe(serverError);
    });

    it('should classify unknown errors as fallback', () => {
      const unknownError = new Error('Something weird happened');
      const result = classifyError(unknownError);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toBe('Something weird happened');
      expect(result.originalError).toBe(unknownError);
    });

    it('should handle non-Error objects', () => {
      const stringError = 'Simple string error';
      const result = classifyError(stringError);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toContain('予期しないエラー');
      expect(result.originalError).toBeInstanceOf(Error);
    });

    it('should handle null and undefined', () => {
      const nullResult = classifyError(null);
      const undefinedResult = classifyError(undefined);
      
      expect(nullResult.type).toBe('unknown');
      expect(undefinedResult.type).toBe('unknown');
    });
  });

  describe('handleAsyncOperation', () => {
    it('should handle successful operation', async () => {
      const successOperation = async () => 'success result';
      const onSuccess = vi.fn();
      const onError = vi.fn();
      
      const result = await handleAsyncOperation(successOperation, onError, onSuccess);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success result');
      expect(onSuccess).toHaveBeenCalledWith('success result');
      expect(onError).not.toHaveBeenCalled();
    });

    it('should handle failed operation', async () => {
      const failOperation = async () => {
        throw new Error('Operation failed');
      };
      const onSuccess = vi.fn();
      const onError = vi.fn();
      
      const result = await handleAsyncOperation(failOperation, onError, onSuccess);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        type: 'unknown',
        message: 'Operation failed'
      }));
    });

    it('should handle operation without callbacks', async () => {
      const successOperation = async () => 'success';
      
      const result = await handleAsyncOperation(successOperation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
    });
  });

  describe('createAsyncHandler', () => {
    it('should create a handler with toast integration', () => {
      const mockShowToast = vi.fn();
      const handler = createAsyncHandler(mockShowToast);
      
      expect(typeof handler).toBe('function');
    });

    it('should call showToast on error in created handler', async () => {
      const mockShowToast = {
        showError: vi.fn(),
        showSuccess: vi.fn(),
        showInfo: vi.fn()
      };
      const handler = createAsyncHandler(mockShowToast);
      
      const failOperation = async () => {
        throw new Error('Test error');
      };
      
      await handler(failOperation);
      
      expect(mockShowToast.showError).toHaveBeenCalledWith(
        'Test error'
      );
    });
  });

  describe('getJapaneseErrorMessage', () => {
    it('should return Japanese message for Error objects', () => {
      const error = new Error('Network connection failed');
      const result = getJapaneseErrorMessage(error);
      
      expect(result).toContain('ネットワークエラー');
    });

    it('should handle string errors', () => {
      const error = 'Simple error message';
      const result = getJapaneseErrorMessage(error);
      
      expect(result).toContain('予期しないエラー');
    });

    it('should handle null/undefined errors', () => {
      const nullResult = getJapaneseErrorMessage(null);
      const undefinedResult = getJapaneseErrorMessage(undefined);
      
      expect(nullResult).toContain('予期しないエラー');
      expect(undefinedResult).toContain('予期しないエラー');
    });
  });

  // エッジケースのテスト
  describe('Edge cases', () => {
    it('should handle errors with empty messages', () => {
      const emptyError = new Error('');
      const result = classifyError(emptyError);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toContain('予期しないエラー');
    });

    it('should handle case-insensitive error classification', () => {
      const upperCaseError = new Error('NETWORK ERROR OCCURRED');
      const result = classifyError(upperCaseError);
      
      expect(result.type).toBe('network');
    });

    it('should handle complex error objects', () => {
      const complexError = {
        name: 'CustomError',
        message: 'validation error',
        code: 400,
        details: { field: 'email' }
      };
      
      const result = classifyError(complexError);
      
      expect(result.type).toBe('unknown');
    });

    it('should handle async operation with immediate rejection', async () => {
      const immediateReject = async () => Promise.reject(new Error('Immediate fail'));
      const onError = vi.fn();
      
      await handleAsyncOperation(immediateReject, onError);
      
      expect(onError).toHaveBeenCalled();
    });
  });

  // パフォーマンステスト
  describe('Performance', () => {
    it('should handle large number of error classifications quickly', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        classifyError(new Error(`Test error ${i}`));
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // 1000回の分類が100ms以内で完了することを確認
      expect(duration).toBeLessThan(100);
    });
  });
});