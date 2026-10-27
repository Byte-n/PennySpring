import type { RecordTypeCategoryValue } from '@pennyspring/api';

export const CATEGORY_LABELS: Record<RecordTypeCategoryValue, string> = {
  expense: '支出',
  income: '收入',
  transfer: '转账',
};

export function categoryLabel(value: string | undefined): string {
  if (value === 'expense' || value === 'income' || value === 'transfer') {
    return CATEGORY_LABELS[value];
  }
  return '未知分类';
}
