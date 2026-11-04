import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { localApi, VISIBILITY } from '@pennyspring/api';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';

/**
 * 读取表单依赖的资产与标签。传 booksId 时固定查询该本地账本（草稿模式），
 * 不传时沿用当前账本与当前 API（普通新增/编辑/模板流程）。
 */
export function useAddRecordResources(booksId?: number) {
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const targetBooksId = booksId ?? currentBook?.id;
  const api = booksId === undefined ? globalApi : localApi;

  const {
    data: assets = [],
    loading: assetsLoading,
    refresh: refreshAssets,
  } = useRequest(
    () =>
      targetBooksId !== undefined
        ? api.asset.getByBook(targetBooksId)
        : Promise.resolve([]),
    { refreshDeps: [targetBooksId, api] },
  );
  const { data: tags = [], loading: tagsLoading } = useRequest(
    () =>
      targetBooksId !== undefined
        ? api.tag.getAll(targetBooksId)
        : Promise.resolve([]),
    { refreshDeps: [targetBooksId, api] },
  );

  const visibleAssets = useMemo(
    () => assets.filter(asset => asset.invisible !== VISIBILITY.hidden),
    [assets],
  );

  return {
    assets,
    assetsLoading,
    /** 表单实际写入与查询的账本；草稿模式为目标账本，其余为当前账本。 */
    booksId: targetBooksId,
    currentBook,
    refreshAssets,
    tags,
    tagsLoading,
    visibleAssets,
  };
}
