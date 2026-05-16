import { useRequest } from 'ahooks'
import { api, buildCategoryTree, type CategoryItem, type RecordTypeCategoryValue } from '@pennyspring/data'

interface UseCategoryItemsResult {
  categories: CategoryItem[];
  loading: boolean;
}

export function useCategoryItems(typeCategory: RecordTypeCategoryValue): UseCategoryItemsResult {
  const { data = [], loading } = useRequest(
    () => api.type.getByCategory(typeCategory).then(buildCategoryTree),
    { refreshDeps: [typeCategory] },
  )

  return { categories: data, loading }
}
