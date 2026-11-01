import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import {
  filterByMonth,
  formatCurrency,
  formatDayTitle,
  formatRecordDateParts,
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

describe('formatDayTitle', () => {
  const TZ = '+08:00';
  function dayTs(iso: string) {
    return new Date(`${iso}T00:00:00${TZ}`).getTime();
  }

  test('appends （今天） for today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(formatDayTitle(today.getTime(), new Date())).toContain('（今天）');
  });

  test('appends （昨天） for yesterday', () => {
    const d = new Date(dayTs('2026-05-29'));
    const now = new Date(dayTs('2026-05-30'));
    expect(formatDayTitle(d.getTime(), now)).toContain('（昨天）');
  });

  test('appends （前天） for two days ago', () => {
    const d = new Date(dayTs('2026-05-28'));
    const now = new Date(dayTs('2026-05-30'));
    expect(formatDayTitle(d.getTime(), now)).toContain('（前天）');
  });

  test('formats date as MM-DD', () => {
    const d = new Date(dayTs('2026-05-07'));
    const now = new Date(dayTs('2026-05-30'));
    expect(formatDayTitle(d.getTime(), now)).toMatch(/^05-07/);
  });

  test('no suffix for other dates', () => {
    const d = new Date(dayTs('2026-05-27'));
    const now = new Date(dayTs('2026-05-30'));
    const result = formatDayTitle(d.getTime(), now);
    expect(result).not.toContain('（今天）');
    expect(result).not.toContain('（昨天）');
    expect(result).not.toContain('（前天）');
  });
});

describe('filterByMonth', () => {
  test('keeps only records whose recordTime falls in the given month', () => {
    const inMonth = rec(
      ts('2026-05-01T00:00:00'),
      100,
      RECORD_TYPE_CATEGORY.expense,
    );
    const lateInMonth = rec(
      ts('2026-05-31T23:59:59'),
      200,
      RECORD_TYPE_CATEGORY.income,
    );
    const prevMonth = rec(
      ts('2026-04-30T23:59:59'),
      300,
      RECORD_TYPE_CATEGORY.expense,
    );
    const nextMonth = rec(
      ts('2026-06-01T00:00:00'),
      400,
      RECORD_TYPE_CATEGORY.expense,
    );

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
    const day28a = rec(
      ts('2026-05-28T20:00:00'),
      100,
      RECORD_TYPE_CATEGORY.expense,
    );
    const day28b = rec(
      ts('2026-05-28T08:00:00'),
      200,
      RECORD_TYPE_CATEGORY.expense,
    );
    const day27 = rec(
      ts('2026-05-27T12:00:00'),
      800000,
      RECORD_TYPE_CATEGORY.income,
    );

    const groups = groupByDay([day28b, day27, day28a]);

    expect(groups).toHaveLength(2);
    expect(groups[0].dayStart).toBe(
      new Date(ts('2026-05-28T00:00:00')).getTime(),
    );
    expect(groups[0].records).toEqual([day28a, day28b]);
    expect(groups[1].dayStart).toBe(
      new Date(ts('2026-05-27T00:00:00')).getTime(),
    );
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

describe('formatCurrency', () => {
  test('adds the yuan symbol and locale thousands separators', () => {
    expect(formatCurrency(120000)).toBe('¥1,200.00');
    expect(formatCurrency(36800)).toBe('¥368.00');
  });

  test('keeps two decimal places', () => {
    expect(formatCurrency(48650)).toBe('¥486.50');
  });
});

describe('formatRecordDateParts', () => {
  test('splits a timestamp into date, time, and Chinese weekday', () => {
    const time = new Date(2026, 9, 31, 19, 24).getTime();

    expect(formatRecordDateParts(time)).toEqual({
      date: '2026-10-31',
      time: '19:24',
      weekday: '周六',
    });
  });
});
