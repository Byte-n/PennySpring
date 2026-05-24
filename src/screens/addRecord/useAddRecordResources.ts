import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { api, VISIBILITY } from '@pennyspring/data';

import { useBookStore } from '../../stores/bookStore';

export function useAddRecordResources() {
  const currentBook = useBookStore(state => state.currentBook);

  const {
    data: assets = [],
    loading: assetsLoading,
    refresh: refreshAssets,
  } = useRequest(
    () => currentBook
      ? api.asset.getByBook(currentBook.id)
      : Promise.resolve([]),
    { refreshDeps: [currentBook?.id] },
  );
  const {
    data: tags = [],
    loading: tagsLoading,
  } = useRequest(() => api.tag.getAll());

  const visibleAssets = useMemo(
    () => assets.filter(asset => asset.invisible !== VISIBILITY.hidden),
    [assets],
  );
  const visibleTags = useMemo(
    () => tags.filter(tag => tag.invisible !== VISIBILITY.hidden),
    [tags],
  );

  return {
    assets,
    assetsLoading,
    currentBook,
    refreshAssets,
    tags,
    tagsLoading,
    visibleAssets,
    visibleTags,
  };
}
