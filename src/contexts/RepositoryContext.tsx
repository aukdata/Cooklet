import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { type RepositoryContainer, getRepositoryContainer } from '../repositories/container';

/**
 * Repository Context
 * 
 * アプリケーション全体でRepositoryコンテナを共有するためのReact Context。
 * DI（依存性注入）パターンを実現し、テスト時のモック化を容易にします。
 */
const RepositoryContext = createContext<RepositoryContainer | null>(null);

/**
 * Repository Provider Props
 */
interface RepositoryProviderProps {
  children: ReactNode;
  /** テスト用に外部からRepositoryコンテナを注入する場合に使用 */
  container?: RepositoryContainer;
}

/**
 * Repository Provider コンポーネント
 * 
 * アプリケーション全体にRepositoryコンテナを提供します。
 * 本番環境では自動的にSupabase実装、テスト環境ではMock実装を使用します。
 * 
 * @param children 子コンポーネント
 * @param container テスト用のRepositoryコンテナ（任意）
 */
export const RepositoryProvider = ({ children, container }: RepositoryProviderProps) => {
  // containerが外部から提供されている場合はそれを使用、
  // そうでなければgetRepositoryContainer()でシングルトンコンテナを取得
  const repositoryContainer = useMemo(() => {
    return container || getRepositoryContainer();
  }, [container]);

  return (
    <RepositoryContext.Provider value={repositoryContainer}>
      {children}
    </RepositoryContext.Provider>
  );
};

/**
 * Repository フック
 * 
 * コンポーネント内でRepositoryコンテナにアクセスするためのカスタムフック。
 * RepositoryProvider内で使用する必要があります。
 * 
 * @returns Repository コンテナ
 * @throws Error RepositoryProvider外で使用された場合
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { stockRepository, mealPlanRepository } = useRepository();
 *   
 *   const handleAddStock = async () => {
 *     await stockRepository.create({
 *       user_id: 'user-1',
 *       name: '玉ねぎ',
 *       quantity: '2個',
 *       is_homemade: false
 *     });
 *   };
 *   
 *   return <button onClick={handleAddStock}>在庫追加</button>;
 * };
 * ```
 */
export const useRepository = (): RepositoryContainer => {
  const context = useContext(RepositoryContext);
  
  if (context === null) {
    throw new Error(
      'useRepository must be used within a RepositoryProvider. ' +
      'Make sure to wrap your component with <RepositoryProvider>.'
    );
  }
  
  return context;
};

/**
 * 特定のRepository取得フック
 * 
 * よく使用されるRepositoryに対する専用フックを提供します。
 * コード内での可読性向上とインポートの簡素化を目的としています。
 */

/**
 * 在庫Repository取得フック
 * @returns 在庫Repository
 */
export const useStockRepository = () => {
  const { stockRepository } = useRepository();
  return stockRepository;
};

/**
 * 献立Repository取得フック
 * @returns 献立Repository
 */
export const useMealPlanRepository = () => {
  const { mealPlanRepository } = useRepository();
  return mealPlanRepository;
};

/**
 * 買い物リストRepository取得フック
 * @returns 買い物リストRepository
 */
export const useShoppingListRepository = () => {
  const { shoppingListRepository } = useRepository();
  return shoppingListRepository;
};