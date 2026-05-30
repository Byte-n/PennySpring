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
    if (initialTypeId === undefined) return;
    if (!categories.some(category => category.id === initialTypeId)) return;
    appliedRef.current = true;
    setTypeId(initialTypeId);
  }, [categories, initialTypeId, setTypeId]);
}
