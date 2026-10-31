import {
  RECORD_TYPE_CATEGORY,
  type AssetRow,
  type RecordRow,
  type RecordTypeCategoryValue,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';
import '../../../../utils/prototype';

export type CashflowCategory = RecordTypeCategoryValue;

const CENTS_PER_YUAN = 100;

export interface CashflowItem {
  recordTime: number;
  finalAmount: number;
  category: CashflowCategory;
}

export interface CashflowSummary {
  expense: number;
  income: number;
  balance: number;
}

export interface DayGroup<T extends CashflowItem> {
  dayStart: number;
  records: T[];
  summary: CashflowSummary;
}

export interface DailyExpenseBar {
  dayStart: number;
  expense: number;
  isPlaceholder: boolean;
}

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function filterByMonth<T extends CashflowItem>(
  records: readonly T[],
  month: Date,
): T[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  return records.filter(record => {
    const date = new Date(record.recordTime);
    return date.getFullYear() === year && date.getMonth() === monthIndex;
  });
}

export function summarizeCashflow(records: readonly CashflowItem[]): CashflowSummary {
  let expense = 0;
  let income = 0;
  for (const record of records) {
    if (record.category === RECORD_TYPE_CATEGORY.expense) {
      expense += record.finalAmount;
    } else if (record.category === RECORD_TYPE_CATEGORY.income) {
      income += record.finalAmount;
    }
  }
  return { expense, income, balance: income - expense };
}

export function groupByDay<T extends CashflowItem>(records: readonly T[]): DayGroup<T>[] {
  const buckets = new Map<number, T[]>();
  for (const record of records) {
    const dayStart = startOfDay(record.recordTime);
    const bucket = buckets.get(dayStart);
    if (bucket) {
      bucket.push(record);
    } else {
      buckets.set(dayStart, [record]);
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => b - a)
    .map(([dayStart, dayRecords]) => {
      const sorted = [...dayRecords].sort((a, b) => b.recordTime - a.recordTime);
      return { dayStart, records: sorted, summary: summarizeCashflow(sorted) };
    });
}

export interface DetailRecordView extends CashflowItem {
  record: RecordRow;
  typeName: string;
  iconValue: TypeRow['icon'] | null;
  assetName: string;
  parentTypeName: string;
  parentIconValue: TypeRow['icon'] | null;
  intoAssetName: string;
  imageCount: number;
  tags: Array<{ id: number; name: string; icon: string }>;
}

export function buildDetailViews(
  records: readonly RecordRow[],
  typeMap: ReadonlyMap<number, TypeRow>,
  assetMap: ReadonlyMap<number, AssetRow>,
  imageCountMap: ReadonlyMap<number, number>,
  tagMap: ReadonlyMap<number, TagRow>,
  recordTagsMap: ReadonlyMap<number, number[]>,
): DetailRecordView[] {
  return records.map(record => {
    const type = typeMap.get(record.typeId);
    const parentType = type?.parentId ? typeMap.get(type.parentId) : null;
    const tagIds = recordTagsMap.get(record.id) ?? [];
    const recordTags = tagIds
      .map(tagId => tagMap.get(tagId))
      .filter((tag): tag is TagRow => tag !== undefined)
      .map(tag => ({ id: tag.id, name: tag.name, icon: tag.icon }));

    return {
      record,
      recordTime: record.recordTime,
      finalAmount: record.finalAmount,
      category: type?.typeCategory ?? RECORD_TYPE_CATEGORY.expense,
      typeName: type?.name ?? '未分类',
      iconValue: type?.icon ?? null,
      assetName: assetMap.get(record.assetId)?.name ?? '',
      parentTypeName: parentType?.name ?? '',
      parentIconValue: parentType?.icon ?? null,
      intoAssetName: assetMap.get(record.intoAssetId)?.name ?? '',
      imageCount: imageCountMap.get(record.id) ?? 0,
      tags: recordTags,
    };
  });
}

export function formatAmount(cents: number): string {
  return (Math.abs(cents) / CENTS_PER_YUAN).toFixed(2);
}

export function formatAmountParts(cents: number): { integer: string; decimal: string } {
  const [integer, decimal] = formatAmount(cents).split('.');
  return { integer: Number(integer).toLocaleString('zh-CN'), decimal: decimal ?? '00' };
}

export function formatCurrency(cents: number): string {
  const parts = formatAmountParts(cents);
  return `¥${parts.integer}.${parts.decimal}`;
}

export function formatSignedAmount(cents: number, category: CashflowCategory): string {
  if (category === RECORD_TYPE_CATEGORY.income) return `+${formatAmount(cents)}`;
  if (category === RECORD_TYPE_CATEGORY.expense) return `-${formatAmount(cents)}`;
  return formatAmount(cents);
}

export function formatDayTitle(dayStart: number, now: Date = new Date()): string {
  const base = dayStart.formatDate(false);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - dayStart) / 86400000);
  const suffix = diffDays === 0 ? '（今天）' : diffDays === 1 ? '（昨天）' : diffDays === 2 ? '（前天）' : '';
  return suffix ? `${base}${suffix}` : base;
}

export function formatWeekday(dayStart: number): string {
  return dayStart.formatDateBy('ddd');
}

export function isSameDay(first: Date, second: Date): boolean {
  return first.toDateString() === second.toDateString();
}

export function getMonthDayCount(month: Date): number {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
}

export function getElapsedMonthDayCount(month: Date, now: Date = new Date()): number {
  if (month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth()) {
    return Math.max(1, now.getDate());
  }
  return getMonthDayCount(month);
}

export function buildDailyExpenseBars(
  records: readonly CashflowItem[],
  month: Date,
  minimumBars = 7,
  now: Date = new Date(),
): DailyExpenseBar[] {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const isCurrentMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const isFutureMonth = monthStart.getTime() > new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const visibleDayCount = isFutureMonth
    ? minimumBars
    : isCurrentMonth
      ? getElapsedMonthDayCount(month, now)
      : getMonthDayCount(month);
  const expenseByDay = new Map<number, number>();
  for (const record of records) {
    if (record.category !== RECORD_TYPE_CATEGORY.expense) continue;
    const dayStart = startOfDay(record.recordTime);
    expenseByDay.set(dayStart, (expenseByDay.get(dayStart) ?? 0) + record.finalAmount);
  }

  return Array.from({ length: visibleDayCount }, (_, index) => {
    const dayStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1).getTime();
    const expense = expenseByDay.get(dayStart) ?? 0;
    return { dayStart, expense, isPlaceholder: expense <= 0 };
  });
}

export function formatRecordTime(time: number): string {
  return time.formatDateTime();
}

export interface RecordDateParts {
  date: string;
  time: string;
  weekday: string;
}

export function formatRecordDateParts(time: number): RecordDateParts {
  return {
    date: time.formatDateBy('YYYY-MM-DD'),
    time: time.formatDateBy('HH:mm'),
    weekday: time.formatDateBy('ddd'),
  };
}

export type AmountColor = 'success' | 'error' | 'heading';

export function amountColor(category: CashflowCategory): AmountColor {
  if (category === RECORD_TYPE_CATEGORY.income) return 'success';
  if (category === RECORD_TYPE_CATEGORY.expense) return 'error';
  return 'heading';
}
