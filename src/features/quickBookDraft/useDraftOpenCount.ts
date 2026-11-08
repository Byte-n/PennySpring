import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getBookKey, useBookStore } from '../../stores/bookStore';
import { useDraftVersion } from '../../stores/draftVersionStore';
import { draftTargetFromBookRef } from './bookApi';
import { quickBookDraftCache } from './draftCacheStorage';

/**
 * 草稿 Tab 角标计数：分析中 + 待确认 + 待重试，均为未完结草稿。
 * 在挂载、Tab 聚焦、draftVersion 变化、账本切换与 App 回到前台时刷新。
 */
export function useDraftOpenCount(isFocused: boolean): number {
  const draftVersion = useDraftVersion();
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const currentBook = useBookStore(state => state.currentBook);
  const [count, setCount] = useState(0);

  const bookKey = getBookKey(currentBookRef) ?? '';

  const refresh = useCallback(async (): Promise<void> => {
    if (currentBookRef === null || currentBook === null) {
      setCount(0);
      return;
    }
    try {
      const target = draftTargetFromBookRef(currentBookRef, currentBook.name);
      setCount(await quickBookDraftCache.countOpen({ target }));
    } catch {
      // 角标失败不影响主流程，保留上一次计数。
    }
  }, [currentBook, currentBookRef]);

  useEffect(() => {
    refresh();
  }, [refresh, draftVersion, isFocused, bookKey]);

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
