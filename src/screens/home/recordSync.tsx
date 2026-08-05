import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface RecordSyncValue {
  /** 记录变更版本号，每次 bump 自增；消费方放入 refreshDeps 触发重取 */
  version: number;
  /** 通知记录已变更（如快捷记账成功后调用） */
  bump: () => void;
}

const RecordSyncContext = createContext<RecordSyncValue | null>(null);

/**
 * HomeScreen 子树内的「记录已变更」信号。
 * 放在 HomeScreen 根，使 HomeScreen 层的写操作（快捷记账）
 * 能通知到 HomeTabsNavigator 内 DetailTab 的读操作，避免跨组件回调。
 * children 作 prop 透传，version 变化时仅重渲染 useContext 消费方。
 */
export function RecordSyncProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion(value => value + 1), []);
  const value = useMemo(() => ({ version, bump }), [version, bump]);

  return (
    <RecordSyncContext.Provider value={value}>
      {children}
    </RecordSyncContext.Provider>
  );
}

export function useRecordSync(): RecordSyncValue {
  const ctx = useContext(RecordSyncContext);
  if (!ctx) {
    throw new Error('useRecordSync 必须在 RecordSyncProvider 内使用');
  }
  return ctx;
}
