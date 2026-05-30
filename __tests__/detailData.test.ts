import { RECORD_TYPE_CATEGORY } from '@pennyspring/data';
import {
  filterByMonth,
  groupByDay,
  summarizeCashflow,
  type CashflowCategory,
} from '../src/screens/home/tabs/detail/detailData';

const TZ_OFFSET = '+08:00';

function ts(iso: string): number {
  return new Date(`${iso}${TZ_OFFSET}`).getTime();
}

interface RecordLike {
  recordTime: number;
  finalAmount: number;
  category: CashflowCategory;
}

function rec(
  recordTime: number,
  finalAmount: number,
  category: CashflowCategory,
): RecordLike {
  return { recordTime, finalAmount, category };
}

describe('filterByMonth', () => {
  test('keeps only records whose recordTime falls in the given month', () => {
    const inMonth = rec(ts('2026-05-01T00:00:00'), 100, RECORD_TYPE_CATEGORY.expense);
    const lateInMonth = rec(ts('2026-05-31T23:59:59'), 200, RECORD_TYPE_CATEGORY.income);
    const prevMonth = rec(ts('2026-04-30T23:59:59'), 300, RECORD_TYPE_CATEGORY.expense);
    const nextMonth = rec(ts('2026-06-01T00:00:00'), 400, RECORD_TYPE_CATEGORY.expense);

    const result = filterByMonth(
      [inMonth, lateInMonth, prevMonth, nextMonth],
      new Date(ts('2026-05-15T10:00:00')),
    );

    expect(result).toEqual([inMonth, lateInMonth]);
  });

  test('returns empty array when no record matches the month', () => {
    const result = filterByMonth(
      [rec(ts('2026-04-10T00:00:00'), 100, RECORD_TYPE_CATEGORY.expense)],
      new Date(ts('2026-05-15T10:00:00')),
    );

    expect(result).toEqual([]);
  });
});

describe('summarizeCashflow', () => {
  test('sums expense and income separately and computes balance', () => {
    const records = [
      rec(ts('2026-05-02T08:00:00'), 3000, RECORD_TYPE_CATEGORY.expense),
      rec(ts('2026-05-02T09:00:00'), 1280, RECORD_TYPE_CATEGORY.expense),
      rec(ts('2026-05-03T10:00:00'), 800000, RECORD_TYPE_CATEGORY.income),
    ];

    const summary = summarizeCashflow(records);

    expect(summary.expense).toBe(4280);
    expect(summary.income).toBe(800000);
    expect(summary.balance).toBe(795720);
  });

  test('ignores transfer records in expense and income totals', () => {
    const records = [
      rec(ts('2026-05-02T08:00:00'), 5000, RECORD_TYPE_CATEGORY.transfer),
      rec(ts('2026-05-02T09:00:00'), 1000, RECORD_TYPE_CATEGORY.expense),
    ];

    const summary = summarizeCashflow(records);

    expect(summary.expense).toBe(1000);
    expect(summary.income).toBe(0);
    expect(summary.balance).toBe(-1000);
  });

  test('returns zeroed totals for an empty record list', () => {
    const summary = summarizeCashflow([]);

    expect(summary).toEqual({ expense: 0, income: 0, balance: 0 });
  });
});

describe('groupByDay', () => {
  test('groups records by calendar day in descending day order', () => {
    const day28a = rec(ts('2026-05-28T20:00:00'), 100, RECORD_TYPE_CATEGORY.expense);
    const day28b = rec(ts('2026-05-28T08:00:00'), 200, RECORD_TYPE_CATEGORY.expense);
    const day27 = rec(ts('2026-05-27T12:00:00'), 800000, RECORD_TYPE_CATEGORY.income);

    const groups = groupByDay([day28b, day27, day28a]);

    expect(groups).toHaveLength(2);
    expect(groups[0].dayStart).toBe(new Date(ts('2026-05-28T00:00:00')).getTime());
    expect(groups[0].records).toEqual([day28a, day28b]);
    expect(groups[1].dayStart).toBe(new Date(ts('2026-05-27T00:00:00')).getTime());
    expect(groups[1].records).toEqual([day27]);
  });

  test('attaches a per-day cashflow summary to each group', () => {
    const groups = groupByDay([
      rec(ts('2026-05-28T20:00:00'), 100, RECORD_TYPE_CATEGORY.expense),
      rec(ts('2026-05-28T08:00:00'), 800000, RECORD_TYPE_CATEGORY.income),
    ]);

    expect(groups[0].summary).toEqual({
      expense: 100,
      income: 800000,
      balance: 799900,
    });
  });

  test('returns empty array for empty input', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
