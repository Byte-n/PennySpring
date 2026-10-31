import { useRequest } from 'ahooks';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';
import type { QuickTemplate } from './types';

const EMPTY_TEMPLATES: QuickTemplate[] = [];

export function useQuickTemplates() {
  const api = useGlobalApi();
  const booksId = useBookStore(state => state.currentBook?.id);
  const version = useSyncVersionStore(state => state.templateVersion);
  const request = useRequest(
    () =>
      booksId === undefined
        ? Promise.resolve(EMPTY_TEMPLATES)
        : api.quickTemplate.list(booksId),
    { refreshDeps: [api, booksId, version] },
  );

  return {
    templates: request.data ?? EMPTY_TEMPLATES,
    loading: request.loading,
    refresh: request.refresh,
    booksId,
  };
}
