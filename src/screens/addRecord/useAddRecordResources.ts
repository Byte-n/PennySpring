import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { localApi, VISIBILITY } from '@pennyspring/api';

import { useCurrentBookId, useGlobalApi } from '../../stores/bookStore';

/**
 * 读取表单依赖的资产与标签。传 booksId 时固定查询该本地账本（草稿模式），
 * 不传时沿用当前账本与当前 API（普通新增/编辑/模板流程）。
 */
export function useAddRecordResources(booksId?: number) {
  const currentBookId = useCurrentBookId();
  const globalApi = useGlobalApi();
  const targetBooksId = booksId ?? currentBookId ?? undefined;
  const api = booksId === undefined ? globalApi : localApi;

  const {
    data: assets = [],
    error: assetsError,
    loading: assetsLoading,
    refresh: refreshAssets,
  } = useRequest(
    () =>
      targetBooksId !== undefined
        ? api.asset.getByBook(targetBooksId)
        : Promise.resolve([]),
    { refreshDeps: [targetBooksId, api] },
  );
  const {
    data: tags = [],
    error: tagsError,
    loading: tagsLoading,
    refresh: refreshTags,
  } = useRequest(
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
    assetsError,
    assetsLoading,
    /** 表单实际写入与查询的账本；草稿模式为目标账本，其余为当前账本。 */
    booksId: targetBooksId,
    refreshAssets,
    refreshTags,
    tags,
    tagsError,
    tagsLoading,
    visibleAssets,
  };
}
