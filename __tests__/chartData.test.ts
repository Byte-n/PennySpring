import { RECORD_TYPE_CATEGORY, type RecordRow, type TypeRow } from '@pennyspring/data';
import {
  aggregateExpenseStats,
  toBarStats,
  toPieStats,
  type ExpenseCategoryStat,
} from '../src/screens/home/tabs/chart/chartData';

const TZ_OFFSET = '+08:00';
const NOW = new Date(`2026-05-15T10:00:00${TZ_OFFSET}`);

function ts(iso: string): number {
  return new Date(`${iso}${TZ_OFFSET}`).getTime();
}

function record(typeId: number, finalAmount: number, recordTime: number): RecordRow {
  return {
    id: typeId * 1000 + Math.floor(Math.random() * 1000),
    typeId,
    assetId: 0,
    intoAssetId: 0,
    booksId: 1,
    amount: finalAmount,
    finalAmount,
    charge: 0,
    remark: '',
    reimbursable: 'no',
    recordTime,
    createdTime: recordTime,
    updatedTime: recordTime,
  } as unknown as RecordRow;
}

function type(
  id: number,
  parentId: number,
  name: string,
  typeCategory: TypeRow['typeCategory'] = RECORD_TYPE_CATEGORY.expense,
): TypeRow {
  return {
    id,
    parentId,
    name,
    typeCategory,
  } as unknown as TypeRow;
}

const MONTH = ts('2026-05-10T08:00:00');

function byKey(stats: readonly ExpenseCategoryStat[], key: string) {
  return stats.find(item => item.key === key);
}

describe('aggregateExpenseStats level 1', () => {
  const types = [
    type(1, 0, '餐饮'),
    type(11, 1, '早餐'),
    type(12, 1, '午餐'),
    type(2, 0, '交通'),
  ];

  test('folds second-level amount into its parent category', () => {
    const result = aggregateExpenseStats(
      [record(11, 300, MONTH), record(12, 700, MONTH), record(2, 500, MONTH)],
      types,
      null,
      NOW,
    );

    expect(result.totalExpense).toBe(1500);
    expect(byKey(result.stats, '1')?.amount).toBe(1000);
    expect(byKey(result.stats, '1')?.name).toBe('餐饮');
    expect(byKey(result.stats, '1')?.count).toBe(2);
    expect(byKey(result.stats, '2')?.amount).toBe(500);
  });

  test('records on a top-level type group under that type id', () => {
    const result = aggregateExpenseStats([record(1, 800, MONTH)], types, null, NOW);

    expect(byKey(result.stats, '1')?.amount).toBe(800);
    expect(byKey(result.stats, '1')?.typeId).toBe(1);
  });

  test('records with missing type fall into 未分类', () => {
    const result = aggregateExpenseStats([record(999, 400, MONTH)], types, null, NOW);

    const uncategorized = byKey(result.stats, 'uncategorized');
    expect(uncategorized?.name).toBe('未分类');
    expect(uncategorized?.virtual).toBe('uncategorized');
    expect(uncategorized?.typeId).toBeNull();
  });

  test('excludes non-expense, non-positive, and out-of-month records', () => {
    const allTypes = [...types, type(3, 0, '工资', RECORD_TYPE_CATEGORY.income)];
    const result = aggregateExpenseStats(
      [
        record(1, 1000, MONTH),
        record(3, 5000, MONTH),
        record(1, 0, MONTH),
        record(1, -100, MONTH),
        record(1, 900, ts('2026-04-10T08:00:00')),
      ],
      allTypes,
      null,
      NOW,
    );

    expect(result.totalExpense).toBe(1000);
    expect(result.stats).toHaveLength(1);
  });

  test('orders by amount, then count, then name', () => {
    const result = aggregateExpenseStats(
      [
        record(2, 500, MONTH),
        record(1, 500, MONTH),
        record(1, 0 + 1, MONTH),
      ],
      types,
      null,
      NOW,
    );

    expect(result.stats[0].key).toBe('1');
    expect(result.stats[1].key).toBe('2');
  });

  test('percent denominator is total month expense', () => {
    const result = aggregateExpenseStats(
      [record(1, 250, MONTH), record(2, 750, MONTH)],
      types,
      null,
      NOW,
    );

    expect(byKey(result.stats, '1')?.percent).toBeCloseTo(0.25);
    expect(byKey(result.stats, '2')?.percent).toBeCloseTo(0.75);
  });

  test('yields zero percent without dividing by zero when no expense', () => {
    const result = aggregateExpenseStats([], types, null, NOW);

    expect(result.totalExpense).toBe(0);
    expect(result.stats).toEqual([]);
  });
});

describe('aggregateExpenseStats level 2', () => {
  const types = [
    type(1, 0, '餐饮'),
    type(11, 1, '早餐'),
    type(12, 1, '午餐'),
    type(2, 0, '交通'),
  ];

  test('groups real children by their own type id', () => {
    const result = aggregateExpenseStats(
      [record(11, 300, MONTH), record(12, 700, MONTH), record(2, 999, MONTH)],
      types,
      1,
      NOW,
    );

    expect(result.selectedName).toBe('餐饮');
    expect(result.selectedAmount).toBe(1000);
    expect(byKey(result.stats, '11')?.name).toBe('早餐');
    expect(byKey(result.stats, '12')?.amount).toBe(700);
    expect(byKey(result.stats, '2')).toBeUndefined();
  });

  test('records directly on the parent become 未细分', () => {
    const result = aggregateExpenseStats(
      [record(1, 400, MONTH), record(11, 600, MONTH)],
      types,
      1,
      NOW,
    );

    const unclassified = byKey(result.stats, 'unclassified');
    expect(unclassified?.name).toBe('未细分');
    expect(unclassified?.virtual).toBe('unclassified');
    expect(unclassified?.amount).toBe(400);
  });

  test('a parent with only direct records shows only 未细分', () => {
    const result = aggregateExpenseStats([record(2, 500, MONTH)], types, 2, NOW);

    expect(result.stats).toHaveLength(1);
    expect(result.stats[0].key).toBe('unclassified');
  });

  test('a parent with no expense yields empty stats but keeps the name', () => {
    const result = aggregateExpenseStats([], types, 1, NOW);

    expect(result.stats).toEqual([]);
    expect(result.selectedName).toBe('餐饮');
  });

  test('percent denominator stays the full month expense', () => {
    const result = aggregateExpenseStats(
      [record(11, 200, MONTH), record(2, 600, MONTH)],
      types,
      1,
      NOW,
    );

    expect(result.totalExpense).toBe(800);
    expect(byKey(result.stats, '11')?.percent).toBeCloseTo(0.25);
  });
});

function stat(key: string, amount: number, percent: number): ExpenseCategoryStat {
  return {
    key,
    typeId: Number(key),
    parentTypeId: null,
    name: key,
    amount,
    count: 1,
    percent,
    level: 1,
  };
}

describe('toPieStats', () => {
  test('keeps all items when six or fewer', () => {
    const stats = Array.from({ length: 6 }, (_, i) => stat(String(i), 60 - i, 0.1));
    expect(toPieStats(stats)).toHaveLength(6);
    expect(byKey(toPieStats(stats), 'other')).toBeUndefined();
  });

  test('keeps top five and merges the rest into 其他 when over six', () => {
    const stats = Array.from({ length: 7 }, (_, i) => stat(String(i), 70 - i, 0.1));
    const pie = toPieStats(stats);

    expect(pie).toHaveLength(6);
    const other = byKey(pie, 'other');
    expect(other?.name).toBe('其他');
    expect(other?.amount).toBe(65 + 64);
    expect(other?.percent).toBeCloseTo(0.2);
  });
});

describe('toBarStats', () => {
  test('caps at the first ten items', () => {
    const stats = Array.from({ length: 12 }, (_, i) => stat(String(i), 100 - i, 0.05));
    expect(toBarStats(stats)).toHaveLength(10);
  });
});
