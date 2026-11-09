import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getBookKey, useBookStore } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';
import { publishQuickTemplateWidgetCatalog } from './catalog';
import { hasQuickTemplateWidgetNativeModule } from './native';

/**
 * 把当前账本与模板名称同步给桌面小组件。
 * 失败只记录日志，不阻塞首屏，也不打断用户操作。
 */
export function useQuickTemplateWidgetSync(): void {
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const bookKey = getBookKey(currentBookRef) ?? 'none';
  const bookName = useBookStore(state => state.currentBook?.name ?? '');
  const initStatus = useBookStore(state => state.initStatus);
  const templateVersion = useSyncVersionStore(state => state.templateVersion);

  useEffect(() => {
    if (!hasQuickTemplateWidgetNativeModule()) {
      return;
    }
    if (initStatus === 'idle' || initStatus === 'loading') {
      return;
    }
    publishQuickTemplateWidgetCatalog().catch(error => {
      console.error('Quick template widget snapshot failed:', error);
    });
  }, [bookKey, bookName, initStatus, templateVersion]);

  useEffect(() => {
    if (!hasQuickTemplateWidgetNativeModule()) {
      return;
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        return;
      }
      if (initStatus === 'idle' || initStatus === 'loading') {
        return;
      }
      publishQuickTemplateWidgetCatalog().catch(error => {
        console.error('Quick template widget refresh failed:', error);
      });
    });
    return () => subscription.remove();
  }, [initStatus]);
}
