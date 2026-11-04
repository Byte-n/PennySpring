import { useRequest } from 'ahooks';
import {
  localApi,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';

interface UseCategoryItemsResult {
  categories: TypeRow[];
  error?: Error;
  loading: boolean;
  refresh: () => void;
}

/**
 * 读取类型清单。传 booksId 时固定查询该本地账本（草稿模式），
 * 不传时沿用当前账本与当前 API（普通新增/编辑/模板流程）。
 */
export function useCategoryItems(
  typeCategory: RecordTypeCategoryValue,
  booksId?: number,
): UseCategoryItemsResult {
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();
  const targetBooksId = booksId ?? currentBook?.id;
  const api = booksId === undefined ? globalApi : localApi;

  const {
    data = [],
    error,
    loading,
    refresh,
  } = useRequest(
    () =>
      targetBooksId !== undefined
        ? api.type.getByCategory(typeCategory, targetBooksId)
        : Promise.resolve([]),
    { refreshDeps: [typeCategory, targetBooksId, api] },
  );

  return { categories: data, error, loading, refresh };
}
