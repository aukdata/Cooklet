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
  public readonly code?: string;
  public readonly details?: string;
  
  constructor(
    message: string,
    code?: string,
    details?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
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
  public readonly field?: string;
  
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
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
 * Supabaseエラー型定義
 */
interface SupabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

/**
 * エラーがSupabaseエラーかどうかを判定する型ガード
 */
const isSupabaseError = (error: unknown): error is SupabaseError => {
  if (error === null || typeof error !== 'object') {
    return false;
  }
  
  const errorObj = error as Record<string, unknown>;
  return 'code' in errorObj &&
    'message' in errorObj &&
    typeof errorObj.code === 'string' && 
    typeof errorObj.message === 'string';
};

/**
 * Supabaseエラーを適切なRepositoryエラーに変換する関数
 * @param error Supabaseから返されたエラー
 * @param operation 実行していた操作名
 * @returns 適切なRepositoryエラー
 */
export const transformSupabaseError = (error: unknown, operation: string): DatabaseError => {
  if (isSupabaseError(error)) {
    switch (error.code) {
      case 'PGRST116': // 見つからない
        return new NotFoundError('Record', 'record_id');
      case '23505': // 一意制約違反
        return new DuplicateError('Record', 'field', 'value');
      case '23503': // 外部キー制約違反
        return new ValidationError('Foreign key constraint violation');
      case '42501': // 権限不足
        return new UnauthorizedError(operation);
      default:
        return new DatabaseError(
          error.message || `Database error during ${operation}`,
          error.code,
          error.details
        );
    }
  }
  
  if (error instanceof Error) {
    return new DatabaseError(error.message);
  }
  
  return new DatabaseError(`Unknown error during ${operation}`);
};