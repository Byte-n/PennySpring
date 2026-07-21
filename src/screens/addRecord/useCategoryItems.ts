import { useRequest } from 'ahooks'
import {
  api,
  type RecordTypeCategoryValue,
  TypeRow,
} from '@pennyspring/api';
import { useBookStore } from '../../stores/bookStore';

interface UseCategoryItemsResult {
  categories: TypeRow[];
  loading: boolean;
}

export function useCategoryItems(typeCategory: RecordTypeCategoryValue): UseCategoryItemsResult {
  const currentBook = useBookStore(state => state.currentBook);

  const { data = [], loading } = useRequest(
    () => currentBook
      ? api.type.getByCategory(typeCategory, currentBook.id)
      : Promise.resolve([]),
    { refreshDeps: [typeCategory, currentBook?.id] },
  )

  return { categories: data, loading }
}
