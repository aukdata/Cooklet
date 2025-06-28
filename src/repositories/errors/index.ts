/**
 * Repository層のエラークラス定義
 * 
 * データベース操作でのエラーを型安全に処理するための
 * 専用エラークラスを提供します。
 */

/**
 * データベース操作の基本エラークラス
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * レコードが見つからない場合のエラー
 */
export class NotFoundError extends DatabaseError {
  constructor(resourceType: string, id: string) {
    super(`${resourceType} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends DatabaseError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 重複データエラー
 */
export class DuplicateError extends DatabaseError {
  constructor(resourceType: string, field: string, value: string) {
    super(`Duplicate ${resourceType}: ${field} = ${value}`);
    this.name = 'DuplicateError';
  }
}

/**
 * 権限エラー
 */
export class UnauthorizedError extends DatabaseError {
  constructor(operation: string) {
    super(`Unauthorized operation: ${operation}`);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 接続エラー
 */
export class ConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed') {
    super(message);
    this.name = 'ConnectionError';
  }
}

/**
 * Supabaseエラーを適切なRepositoryエラーに変換する関数
 * @param error Supabaseから返されたエラー
 * @param operation 実行していた操作名
 * @returns 適切なRepositoryエラー
 */
export const transformSupabaseError = (error: unknown, operation: string): DatabaseError => {
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string; details?: string };
    
    switch (supabaseError.code) {
      case 'PGRST116': // 見つからない
        return new NotFoundError('Record', 'unknown');
      case '23505': // 一意制約違反
        return new DuplicateError('Record', 'unknown', 'unknown');
      case '23503': // 外部キー制約違反
        return new ValidationError('Foreign key constraint violation');
      case '42501': // 権限不足
        return new UnauthorizedError(operation);
      default:
        return new DatabaseError(
          supabaseError.message || `Database error during ${operation}`,
          supabaseError.code,
          supabaseError.details
        );
    }
  }
  
  if (error instanceof Error) {
    return new DatabaseError(error.message);
  }
  
  return new DatabaseError(`Unknown error during ${operation}`);
};