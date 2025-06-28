import { useState, useCallback } from 'react';

// ダイアログ状態管理フックの戻り値
interface UseDialogStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// シンプルなダイアログ状態管理フック
export const useDialogState = (initialState = false): UseDialogStateReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

// データ付きダイアログ状態管理フックの戻り値
interface UseDialogWithDataReturn<T> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  updateData: (data: T | null) => void;
}

// データ付きダイアログ状態管理フック
export const useDialogWithData = <T>(
  initialData: T | null = null
): UseDialogWithDataReturn<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(initialData);

  const open = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // データは保持したまま（必要に応じてupdateDataでクリア）
  }, []);

  const updateData = useCallback((newData: T | null) => {
    setData(newData);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    updateData
  };
};

// 複数ダイアログ管理フックの型定義
type DialogStates<T extends string> = Record<T, boolean>;

interface UseMultipleDialogsReturn<T extends string> {
  states: DialogStates<T>;
  open: (dialogName: T) => void;
  close: (dialogName: T) => void;
  closeAll: () => void;
  toggle: (dialogName: T) => void;
  isAnyOpen: boolean;
}

// 複数ダイアログ状態管理フック
export const useMultipleDialogs = <T extends string>(
  dialogNames: readonly T[]
): UseMultipleDialogsReturn<T> => {
  // 初期状態: 全てのダイアログをfalseに設定
  const initialStates = dialogNames.reduce((acc, name) => {
    acc[name] = false;
    return acc;
  }, {} as DialogStates<T>);

  const [states, setStates] = useState<DialogStates<T>>(initialStates);

  const open = useCallback((dialogName: T) => {
    setStates(prev => ({ ...prev, [dialogName]: true }));
  }, []);

  const close = useCallback((dialogName: T) => {
    setStates(prev => ({ ...prev, [dialogName]: false }));
  }, []);

  const closeAll = useCallback(() => {
    setStates(initialStates);
  }, [initialStates]);

  const toggle = useCallback((dialogName: T) => {
    setStates(prev => ({ ...prev, [dialogName]: !prev[dialogName] }));
  }, []);

  // いずれかのダイアログが開いているか
  const isAnyOpen = Object.values(states).some(Boolean);

  return {
    states,
    open,
    close,
    closeAll,
    toggle,
    isAnyOpen
  };
};

// よく使用されるダイアログ組み合わせを定義
export const COMMON_DIALOG_TYPES = [
  'add',
  'edit', 
  'delete',
  'confirm',
  'details'
] as const;

export type CommonDialogType = typeof COMMON_DIALOG_TYPES[number];

// 一般的なCRUDダイアログ管理フック
export const useCrudDialogs = () => {
  return useMultipleDialogs(COMMON_DIALOG_TYPES);
};
