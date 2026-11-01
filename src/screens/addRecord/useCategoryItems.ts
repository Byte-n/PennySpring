import { useRequest } from 'ahooks';
import { type RecordTypeCategoryValue, TypeRow } from '@pennyspring/api';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';

interface UseCategoryItemsResult {
  categories: TypeRow[];
  error?: Error;
  loading: boolean;
  refresh: () => void;
}

export function useCategoryItems(
  typeCategory: RecordTypeCategoryValue,
): UseCategoryItemsResult {
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();

  const {
    data = [],
    error,
    loading,
    refresh,
  } = useRequest(
    () =>
      currentBook
        ? globalApi.type.getByCategory(typeCategory, currentBook.id)
        : Promise.resolve([]),
    { refreshDeps: [typeCategory, currentBook?.id] },
  );

  return { categories: data, error, loading, refresh };
}
