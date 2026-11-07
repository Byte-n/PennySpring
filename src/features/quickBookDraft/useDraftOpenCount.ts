import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localApi } from '@pennyspring/api';

import { useDraftVersion } from '../../stores/draftVersionStore';

/**
 * 草稿 Tab 角标计数：分析中 + 待确认 + 待重试，均为未完结草稿。
 * 在挂载、Tab 聚焦、draftVersion 变化与 App 回到前台时刷新。
 */
export function useDraftOpenCount(isFocused: boolean): number {
  const draftVersion = useDraftVersion();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const next = await localApi.quickBookDraft.countOpen();
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
