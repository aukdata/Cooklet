import { supabase } from '../lib/supabase';
import { 
  type IStockRepository, 
  type IMealPlanRepository, 
  type IShoppingListRepository 
} from './interfaces';
import { 
  SupabaseStockRepository,
  SupabaseMealPlanRepository,
  SupabaseShoppingListRepository,
  MockStockRepository,
  MockMealPlanRepository,
  MockShoppingListRepository
} from './implementations';

/**
 * Repository コンテナインターフェース
 * 
 * アプリケーションで使用する全てのRepositoryを管理します。
 * 環境に応じてSupabase実装またはMock実装を提供します。
 */
export interface RepositoryContainer {
  /** 在庫管理Repository */
  stockRepository: IStockRepository;
  /** 献立管理Repository */
  mealPlanRepository: IMealPlanRepository;
  /** 買い物リスト管理Repository */
  shoppingListRepository: IShoppingListRepository;
}

/**
 * テスト環境判定
 * 
 * 現在の実行環境がテスト環境かどうかを判定します。
 * @returns テスト環境の場合true
 */
const isTestEnvironment = (): boolean => {
  // Vite環境変数でのテスト判定
  if (import.meta.env.MODE === 'test') {
    return true;
  }
  
  // Node.js環境変数でのテスト判定
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return true;
  }
  
  // Vitest環境判定
  if (typeof globalThis !== 'undefined' && 'vi' in globalThis) {
    return true;
  }
  
  // Jest環境判定
  if (typeof globalThis !== 'undefined' && 'jest' in globalThis) {
    return true;
  }
  
  return false;
};

/**
 * Repository コンテナの作成
 * 
 * 実行環境に応じて適切なRepository実装を提供するコンテナを作成します。
 * テスト環境ではMock実装、本番環境ではSupabase実装を使用します。
 * 
 * @returns Repository コンテナ
 */
export const createRepositoryContainer = (): RepositoryContainer => {
  const isTest = isTestEnvironment();
  
  if (isTest) {
    // テスト環境: Mock実装を使用
    return {
      stockRepository: new MockStockRepository(),
      mealPlanRepository: new MockMealPlanRepository(),
      shoppingListRepository: new MockShoppingListRepository(),
    };
  }
  
  // 本番・開発環境: Supabase実装を使用
  return {
    stockRepository: new SupabaseStockRepository(supabase),
    mealPlanRepository: new SupabaseMealPlanRepository(supabase),
    shoppingListRepository: new SupabaseShoppingListRepository(supabase),
  };
};

/**
 * シングルトンRepository コンテナ
 * 
 * アプリケーション全体で共有されるRepositoryコンテナのインスタンス。
 * アプリケーション起動時に一度だけ作成され、以降は同じインスタンスが使用されます。
 */
let repositoryContainer: RepositoryContainer | null = null;

/**
 * Repository コンテナの取得
 * 
 * シングルトンパターンでRepositoryコンテナを取得します。
 * 初回呼び出し時にコンテナを作成し、以降は同じインスタンスを返します。
 * 
 * @returns Repository コンテナ
 */
export const getRepositoryContainer = (): RepositoryContainer => {
  if (repositoryContainer === null) {
    repositoryContainer = createRepositoryContainer();
  }
  return repositoryContainer;
};

/**
 * Repository コンテナのリセット
 * 
 * 主にテスト時にコンテナをリセットするために使用します。
 * 次回getRepositoryContainer呼び出し時に新しいコンテナが作成されます。
 */
export const resetRepositoryContainer = (): void => {
  repositoryContainer = null;
};

/**
 * テスト用Repository コンテナの作成
 * 
 * テスト専用のMock実装コンテナを強制的に作成します。
 * 本番コードでの使用は避けてください。
 * 
 * @returns テスト用Repository コンテナ
 */
export const createTestRepositoryContainer = (): RepositoryContainer => {
  return {
    stockRepository: new MockStockRepository(),
    mealPlanRepository: new MockMealPlanRepository(),
    shoppingListRepository: new MockShoppingListRepository(),
  };
};