import { useEffect, useState } from 'react'
import { api, buildCategoryTree, type CategoryItem, type RecordTypeCategoryValue } from '@pennyspring/data'

export function useCategoryItems(typeCategory: RecordTypeCategoryValue): CategoryItem[] {
  const [items, setItems] = useState<CategoryItem[]>([])

  useEffect(() => {
    api.type.getByCategory(typeCategory).then(rows => {
      setItems(buildCategoryTree(rows))
    })
  }, [typeCategory])

  return items
}
