import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localApi } from '@pennyspring/api';

import { useDraftVersion } from '../../stores/draftVersionStore';

/**
 * 草稿 Tab 角标计数：设备级 pending + failed，不含 generating。
 * 在挂载、Tab 聚焦、draftVersion 变化与 App 回到前台时刷新。
 */
export function useDraftPendingCount(isFocused: boolean): number {
  const draftVersion = useDraftVersion();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const next = await localApi.quickBookDraft.countPending();
      setCount(next);
    } catch {
      // 角标失败不影响主流程，保留上一次计数。
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, draftVersion, isFocused]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  return count;
}
