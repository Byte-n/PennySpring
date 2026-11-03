import { useRequest } from 'ahooks';

import { useBookKey, useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';
import type { QuickTemplate } from './types';

const EMPTY_TEMPLATES: QuickTemplate[] = [];

export function useQuickTemplates() {
  const api = useGlobalApi();
  const bookKey = useBookKey();
  const booksId = useBookStore(state => state.currentBook?.id);
  const version = useSyncVersionStore(state => state.templateVersion);
  const request = useRequest(
    () =>
      booksId === undefined
        ? Promise.resolve(EMPTY_TEMPLATES)
        : api.quickTemplate.list(booksId),
    { refreshDeps: [api, bookKey, version] },
  );

  return {
    templates: request.data ?? EMPTY_TEMPLATES,
    loading: request.loading,
    refresh: request.refresh,
    booksId,
  };
}
