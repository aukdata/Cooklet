/**
 * Repository 層のエントリーポイント
 * 
 * Repository層の全ての要素をエクスポートして、
 * 他のファイルからの簡単なインポートを可能にします。
 */

// インターフェース
export { 
  type IStockRepository, 
  type IMealPlanRepository, 
  type IShoppingListRepository 
} from './interfaces';

// 実装クラス
export { 
  SupabaseStockRepository,
  SupabaseMealPlanRepository,
  SupabaseShoppingListRepository,
  MockStockRepository,
  MockMealPlanRepository,
  MockShoppingListRepository
} from './implementations';

// エラークラス
export { 
  DatabaseError,
  NotFoundError,
  ValidationError,
  DuplicateError,
  UnauthorizedError,
  ConnectionError,
  transformSupabaseError
} from './errors';

// DIコンテナ
export { 
  type RepositoryContainer,
  createRepositoryContainer,
  getRepositoryContainer,
  resetRepositoryContainer,
  createTestRepositoryContainer
} from './container';