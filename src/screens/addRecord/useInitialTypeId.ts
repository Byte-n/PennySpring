import { useEffect, useRef } from 'react';
import type { CategoryItem } from '../../component/CategoryGrid';

export function useInitialTypeId(
  initialTypeId: number | undefined,
  categories: CategoryItem[],
  setTypeId: (id: number) => void,
): void {
  const appliedRef = useRef(false);
  useEffect(() => {
    if (appliedRef.current) return;
    if (categories.length === 0) return;

    const initialCategory = categories.find(
      category => category.id === initialTypeId,
    );
    const nextTypeId = initialCategory?.id ?? categories[0].id;

    appliedRef.current = true;
    setTypeId(nextTypeId);
  }, [categories, initialTypeId, setTypeId]);
}
