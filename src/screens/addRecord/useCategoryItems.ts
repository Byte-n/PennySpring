import { useRequest } from 'ahooks'
import {
  api,
  type RecordTypeCategoryValue,
  TypeRow,
} from '@pennyspring/data';

interface UseCategoryItemsResult {
  categories: TypeRow[];
  loading: boolean;
}

export function useCategoryItems(typeCategory: RecordTypeCategoryValue): UseCategoryItemsResult {
  const { data = [], loading } = useRequest(
    () => api.type.getByCategory(typeCategory),
    { refreshDeps: [typeCategory] },
  )

  return { categories: data, loading }
}
