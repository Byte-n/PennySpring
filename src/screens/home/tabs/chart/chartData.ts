import {
  RECORD_TYPE_CATEGORY,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';

export interface ExpenseCategoryStat {
  key: string;
  typeId: number | null;
  parentTypeId: number | null;
  name: string;
  amount: number;
  count: number;
  percent: number;
  level: 1 | 2;
  virtual?: 'uncategorized' | 'unclassified';
}

export interface ExpenseAnalysis {
  totalExpense: number;
  stats: ExpenseCategoryStat[];
  selectedName: string | null;
  selectedAmount: number;
}

const PIE_VISIBLE_LIMIT = 6;
const PIE_KEEP_COUNT = 5;
const BAR_LIMIT = 10;
const UNCATEGORIZED_NAME = '未分类';
const UNCLASSIFIED_NAME = '未细分';
const OTHER_NAME = '其他';
const OTHER_KEY = 'other';

interface Bucket {
  key: string;
  typeId: number | null;
  parentTypeId: number | null;
  name: string;
  amount: number;
  count: number;
  level: 1 | 2;
  virtual?: 'uncategorized' | 'unclassified';
}

function toTypeMap(types: readonly TypeRow[]): Map<number, TypeRow> {
  return new Map(types.map(type => [type.id, type]));
}

function isInMonth(recordTime: number, month: Date): boolean {
  const date = new Date(recordTime);
  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}

function isExpenseRecord(
  record: RecordRow,
  type: TypeRow | undefined,
): boolean {
  if (record.finalAmount <= 0) return false;
  if (!type) return true;
  return type.typeCategory === RECORD_TYPE_CATEGORY.expense;
}

function compareStat(a: Bucket, b: Bucket): number {
  if (b.amount !== a.amount) return b.amount - a.amount;
  if (b.count !== a.count) return b.count - a.count;
  return a.name.localeCompare(b.name);
}

function accumulate(
  buckets: Map<string, Bucket>,
  seed: Omit<Bucket, 'amount' | 'count'>,
  amount: number,
): void {
  const existing = buckets.get(seed.key);
  if (existing) {
    existing.amount += amount;
    existing.count += 1;
    return;
  }
  buckets.set(seed.key, { ...seed, amount, count: 1 });
}

function aggregateLevel1(
  records: readonly RecordRow[],
  typeMap: ReadonlyMap<number, TypeRow>,
): Map<string, Bucket> {
  const buckets = new Map<string, Bucket>();
  for (const record of records) {
    const type = typeMap.get(record.typeId);
    if (type) {
      const groupId = type.parentId > 0 ? type.parentId : type.id;
      const group = typeMap.get(groupId);
      accumulate(
        buckets,
        {
          key: String(groupId),
          typeId: groupId,
          parentTypeId: null,
          name: group?.name ?? UNCATEGORIZED_NAME,
          level: 1,
        },
        record.finalAmount,
      );
    } else {
      accumulate(
        buckets,
        {
          key: 'uncategorized',
          typeId: null,
          parentTypeId: null,
          name: UNCATEGORIZED_NAME,
          level: 1,
          virtual: 'uncategorized',
        },
        record.finalAmount,
      );
    }
  }
  return buckets;
}

function aggregateLevel2(
  records: readonly RecordRow[],
  typeMap: ReadonlyMap<number, TypeRow>,
  selectedParentTypeId: number,
): Map<string, Bucket> {
  const buckets = new Map<string, Bucket>();
  for (const record of records) {
    const type = typeMap.get(record.typeId);
    if (!type) continue;
    const isChild = type.parentId === selectedParentTypeId;
    const isParent = type.id === selectedParentTypeId;
    if (!isChild && !isParent) continue;
    if (isChild) {
      accumulate(
        buckets,
        {
          key: String(type.id),
          typeId: type.id,
          parentTypeId: selectedParentTypeId,
          name: type.name,
          level: 2,
        },
        record.finalAmount,
      );
    } else {
      accumulate(
        buckets,
        {
          key: 'unclassified',
          typeId: null,
          parentTypeId: selectedParentTypeId,
          name: UNCLASSIFIED_NAME,
          level: 2,
          virtual: 'unclassified',
        },
        record.finalAmount,
      );
    }
  }
  return buckets;
}

export function aggregateExpenseStats(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  selectedParentTypeId: number | null,
  now: Date,
): ExpenseAnalysis {
  const typeMap = toTypeMap(types);
  const expenseRecords = records.filter(
    record =>
      isInMonth(record.recordTime, now) &&
      isExpenseRecord(record, typeMap.get(record.typeId)),
  );
  const totalExpense = expenseRecords.reduce(
    (sum, record) => sum + record.finalAmount,
    0,
  );

  const buckets =
    selectedParentTypeId === null
      ? aggregateLevel1(expenseRecords, typeMap)
      : aggregateLevel2(expenseRecords, typeMap, selectedParentTypeId);

  const stats: ExpenseCategoryStat[] = [...buckets.values()]
    .sort(compareStat)
    .map(bucket => ({
      ...bucket,
      percent: totalExpense === 0 ? 0 : bucket.amount / totalExpense,
    }));

  const selectedType =
    selectedParentTypeId === null ? null : typeMap.get(selectedParentTypeId);
  const selectedAmount =
    selectedParentTypeId === null
      ? 0
      : stats.reduce((sum, stat) => sum + stat.amount, 0);

  return {
    totalExpense,
    stats,
    selectedName: selectedType?.name ?? null,
    selectedAmount,
  };
}

export function toPieStats(
  stats: readonly ExpenseCategoryStat[],
): ExpenseCategoryStat[] {
  if (stats.length <= PIE_VISIBLE_LIMIT) return [...stats];
  const kept = stats.slice(0, PIE_KEEP_COUNT);
  const rest = stats.slice(PIE_KEEP_COUNT);
  const other = rest.reduce(
    (acc, stat) => ({
      ...acc,
      amount: acc.amount + stat.amount,
      count: acc.count + stat.count,
      percent: acc.percent + stat.percent,
    }),
    {
      key: OTHER_KEY,
      typeId: null,
      parentTypeId: rest[0]?.parentTypeId ?? null,
      name: OTHER_NAME,
      amount: 0,
      count: 0,
      percent: 0,
      level: rest[0]?.level ?? 1,
    } as ExpenseCategoryStat,
  );
  return [...kept, other];
}

export function toBarStats(
  stats: readonly ExpenseCategoryStat[],
): ExpenseCategoryStat[] {
  return stats.slice(0, BAR_LIMIT);
}
