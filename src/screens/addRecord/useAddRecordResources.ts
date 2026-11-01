import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { VISIBILITY } from '@pennyspring/api';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';

export function useAddRecordResources() {
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();

  const {
    data: assets = [],
    loading: assetsLoading,
    refresh: refreshAssets,
  } = useRequest(
    () =>
      currentBook
        ? globalApi.asset.getByBook(currentBook.id)
        : Promise.resolve([]),
    { refreshDeps: [currentBook?.id] },
  );
  const { data: tags = [], loading: tagsLoading } = useRequest(
    () =>
      currentBook ? globalApi.tag.getAll(currentBook.id) : Promise.resolve([]),
    { refreshDeps: [currentBook?.id] },
  );

  const visibleAssets = useMemo(
    () => assets.filter(asset => asset.invisible !== VISIBILITY.hidden),
    [assets],
  );

  return {
    assets,
    assetsLoading,
    currentBook,
    refreshAssets,
    tags,
    tagsLoading,
    visibleAssets,
  };
}
