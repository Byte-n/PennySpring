import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  VISIBILITY,
  type AssetRow,
  type RecordRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';
import {
  buildAssetOverview,
  buildAssetStats,
  buildCalendarDays,
  buildDailyExpense,
  buildDueReminders,
  buildExpenseInsights,
  buildIncomeAnalysis,
  buildIncomeTrend,
  buildMovers,
  buildNetWorthHistory,
  buildReimbursementSummary,
  buildStructure,
  buildTagStats,
  comparePeriods,
  createMonthPeriod,
  foldForDonut,
  formatAxisMoney,
  formatMoney,
  formatSignedMoney,
  summarizeMonth,
} from '../src/screens/home/tabs/chart/analysisData';
import type { ExpenseCategoryStat } from '../src/screens/home/tabs/chart/chartData';

const TZ_OFFSET = '+08:00';
const NOW = new Date(`2026-05-15T10:00:00${TZ_OFFSET}`);

function ts(iso: string): number {
  return new Date(`${iso}${TZ_OFFSET}`).getTime();
}

function record(
  typeId: number,
  finalAmount: number,
  recordTime: number,
  extra: Partial<RecordRow> = {},
): RecordRow {
  return {
    id: typeId * 100000 + recordTime,
    typeId,
    assetId: 0,
    intoAssetId: 0,
    booksId: 1,
    amount: finalAmount,
    finalAmount,
    charge: 0,
    remark: '',
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime,
    createdTime: recordTime,
    updatedTime: recordTime,
    ...extra,
  } as RecordRow;
}

function type(
  id: number,
  parentId: number,
  name: string,
  typeCategory: TypeRow['typeCategory'] = RECORD_TYPE_CATEGORY.expense,
  specialBehavior: TypeRow['specialBehavior'] = RECORD_TYPE_SPECIAL_BEHAVIOR.none,
): TypeRow {
  return { id, parentId, name, typeCategory, specialBehavior } as TypeRow;
}

function asset(
  id: number,
  name: string,
  assetType: AssetRow['type'],
  balance: number,
  extra: Partial<AssetRow> = {},
): AssetRow {
  return {
    id,
    booksId: 1,
    name,
    balance,
    totalAmount: 0,
    billingDate: 0,
    repaymentDate: 0,
    type: assetType,
    classification:
      assetType === ASSET_TYPE.debt
        ? ASSET_CLASSIFICATION.borrow
        : ASSET_CLASSIFICATION.cash,
    invisible: VISIBILITY.visible,
    openBank: '',
    cardNo: '',
    remark: '',
    sort: id,
    createdTime: 0,
    updatedTime: 0,
    ...extra,
  } as AssetRow;
}

function tag(id: number, name: string): TagRow {
  return {
    id,
    booksId: 1,
    name,
    icon: '',
    invisible: VISIBILITY.visible,
  } as TagRow;
}

function stat(
  key: string,
  name: string,
  amount: number,
  count: number,
): ExpenseCategoryStat {
  return {
    key,
    typeId: Number(key),
    parentTypeId: null,
    name,
    amount,
    count,
    percent: 0,
    level: 1,
  };
}

const types = [
  type(1, 0, '餐饮'),
  type(11, 1, '午餐'),
  type(2, 0, '交通'),
  type(3, 0, '工资', RECORD_TYPE_CATEGORY.income),
  type(4, 0, '转账', RECORD_TYPE_CATEGORY.transfer),
  type(
    5,
    0,
    '退款',
    RECORD_TYPE_CATEGORY.income,
    RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
  ),
  type(
    6,
    0,
    '报销',
    RECORD_TYPE_CATEGORY.income,
    RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
  ),
];

describe('createMonthPeriod', () => {
  test('builds the current month with elapsed and total days', () => {
    const period = createMonthPeriod(NOW, NOW);

    expect(period.start).toBe(ts('2026-05-01T00:00:00'));
    expect(period.end).toBe(ts('2026-06-01T00:00:00'));
    expect(period.totalDays).toBe(31);
    expect(period.elapsedDays).toBe(15);
    expect(period.isCurrent).toBe(true);
    expect(period.label).toBe('2026年5月');
    expect(period.compareLabel).toBe('4月');
  });

  test('treats a past month as fully elapsed', () => {
    const period = createMonthPeriod(
      new Date(`2026-04-10T12:00:00${TZ_OFFSET}`),
      NOW,
    );

    expect(period.totalDays).toBe(30);
    expect(period.elapsedDays).toBe(30);
    expect(period.isCurrent).toBe(false);
    expect(period.label).toBe('2026年4月');
  });
});

describe('summarizeMonth', () => {
  const records = [
    record(1, 12000, ts('2026-05-01T08:00:00')),
    record(1, 8000, ts('2026-05-14T08:00:00')),
    record(3, 30000, ts('2026-05-10T08:00:00')),
    record(4, 500, ts('2026-05-11T08:00:00')),
    record(1, 9900, ts('2026-05-20T08:00:00')),
    record(1, 7700, ts('2026-04-30T08:00:00')),
  ];

  test('sums expense and income up to today and ignores transfers', () => {
    const summary = summarizeMonth(records, types, createMonthPeriod(NOW, NOW));

    expect(summary.expense).toBe(20000);
    expect(summary.income).toBe(30000);
    expect(summary.balance).toBe(10000);
    expect(summary.expenseCount).toBe(2);
    expect(summary.dailyAverage).toBeCloseTo(20000 / 15);
    expect(summary.savingsRate).toBeCloseTo(1 / 3);
  });

  test('compares against the same elapsed days of the previous month', () => {
    const comparison = comparePeriods(
      [
        ...records,
        record(1, 10000, ts('2026-04-02T08:00:00')),
        record(3, 20000, ts('2026-04-05T08:00:00')),
        record(1, 8888, ts('2026-04-20T08:00:00')),
      ],
      types,
      createMonthPeriod(NOW, NOW),
    );

    expect(comparison.previous.expense).toBe(10000);
    expect(comparison.previous.income).toBe(20000);
    expect(comparison.expenseDelta).toBeCloseTo(1);
    expect(comparison.incomeDelta).toBeCloseTo(0.5);
    expect(comparison.balanceDelta).toBe(0);
    expect(comparison.savingsRateDelta).toBeCloseTo(1 / 3 - 0.5);
  });

  test('returns null growth when the previous period has no data', () => {
    const comparison = comparePeriods(
      [record(1, 1000, ts('2026-05-01T08:00:00'))],
      types,
      createMonthPeriod(NOW, NOW),
    );

    expect(comparison.expenseDelta).toBeNull();
    expect(comparison.incomeDelta).toBeNull();
  });
});

describe('buildDailyExpense', () => {
  test('returns one cumulative point per elapsed day and stops at today', () => {
    const points = buildDailyExpense(
      [
        record(1, 12000, ts('2026-05-01T08:00:00')),
        record(1, 8000, ts('2026-05-14T08:00:00')),
        record(1, 9900, ts('2026-05-20T08:00:00')),
      ],
      types,
      createMonthPeriod(NOW, NOW),
    );

    expect(points).toHaveLength(15);
    expect(points[0]).toMatchObject({
      day: 1,
      amount: 12000,
      cumulative: 12000,
    });
    expect(points[13]).toMatchObject({
      day: 14,
      amount: 8000,
      cumulative: 20000,
    });
    expect(points[14]).toMatchObject({ day: 15, amount: 0, cumulative: 20000 });
  });
});

describe('buildCalendarDays', () => {
  test('marks days after today as future and hides their amounts', () => {
    const days = buildCalendarDays(
      [
        record(1, 12000, ts('2026-05-01T08:00:00')),
        record(1, 9900, ts('2026-05-20T08:00:00')),
      ],
      types,
      createMonthPeriod(NOW, NOW),
    );

    expect(days).toHaveLength(31);
    expect(days[0]).toMatchObject({ day: 1, amount: 12000, isFuture: false });
    expect(days[15]).toMatchObject({ day: 16, amount: 0, isFuture: true });
    expect(days[19]).toMatchObject({ day: 20, amount: 0, isFuture: true });
    expect(days[30]).toMatchObject({ day: 31, amount: 0, isFuture: true });
  });
});

describe('buildMovers', () => {
  test('merges categories and sorts by absolute change', () => {
    const movers = buildMovers(
      [stat('1', '餐饮', 10000, 2), stat('2', '交通', 5000, 1)],
      [
        stat('1', '餐饮', 8000, 2),
        stat('2', '交通', 5000, 1),
        stat('3', '娱乐', 3000, 1),
      ],
      3,
    );

    expect(movers.map(item => item.name)).toEqual(['娱乐', '餐饮', '交通']);
    expect(movers[0]).toMatchObject({
      current: 0,
      previous: 3000,
      delta: -3000,
      percent: -1,
    });
    expect(movers[1]).toMatchObject({
      current: 10000,
      previous: 8000,
      delta: 2000,
      count: 2,
    });
    expect(movers[1].percent).toBeCloseTo(0.25);
  });

  test('returns null percent when the previous amount is zero', () => {
    const movers = buildMovers([stat('1', '餐饮', 10000, 2)], [], 4);

    expect(movers[0].percent).toBeNull();
  });
});

describe('buildExpenseInsights', () => {
  test('returns pace, category and peak insights in that order', () => {
    const insights = buildExpenseInsights({
      current: {
        expense: 20000,
        income: 30000,
        balance: 10000,
        expenseCount: 2,
        dailyAverage: 0,
        savingsRate: 0,
      },
      previous: {
        expense: 10000,
        income: 20000,
        balance: 10000,
        expenseCount: 1,
        dailyAverage: 0,
        savingsRate: 0,
      },
      movers: [
        {
          key: '1',
          name: '餐饮',
          current: 10000,
          previous: 8000,
          delta: 2000,
          percent: 0.25,
          count: 2,
        },
        {
          key: '3',
          name: '娱乐',
          current: 0,
          previous: 3000,
          delta: -3000,
          percent: -1,
          count: 1,
        },
      ],
      calendar: [
        { day: 1, date: 0, amount: 12000, isFuture: false, isToday: false },
        { day: 14, date: 0, amount: 8000, isFuture: false, isToday: false },
      ],
    });

    expect(insights.map(item => item.kind)).toEqual([
      'pace',
      'category',
      'peak',
    ]);
    expect(insights[0]).toMatchObject({
      kind: 'pace',
      expenseGrowth: 1,
      incomeGrowth: 0.5,
      balanceDelta: 0,
    });
    expect(insights[1]).toMatchObject({
      kind: 'category',
      name: '餐饮',
      delta: 2000,
      count: 2,
    });
    expect(insights[2]).toMatchObject({ kind: 'peak', day: 1, amount: 12000 });
  });

  test('skips pace insight when expense growth does not exceed income growth', () => {
    const insights = buildExpenseInsights({
      current: {
        expense: 12000,
        income: 30000,
        balance: 18000,
        expenseCount: 2,
        dailyAverage: 0,
        savingsRate: 0,
      },
      previous: {
        expense: 10000,
        income: 20000,
        balance: 10000,
        expenseCount: 1,
        dailyAverage: 0,
        savingsRate: 0,
      },
      movers: [],
      calendar: [],
    });

    expect(insights).toEqual([]);
  });
});

describe('buildStructure', () => {
  test('keeps the top three and aggregates the rest into other', () => {
    const structure = buildStructure(
      [
        stat('1', '餐饮', 10000, 1),
        stat('2', '居住', 8000, 1),
        stat('3', '购物', 6000, 1),
        stat('4', '交通', 4000, 1),
        stat('5', '娱乐', 2000, 1),
      ],
      3,
    );

    expect(structure).toHaveLength(4);
    expect(structure[3]).toMatchObject({
      key: 'other',
      name: '其他 2 类',
      amount: 6000,
    });
    expect(structure[3].percent).toBeCloseTo(0.2);
  });
});

describe('buildIncomeAnalysis', () => {
  test('groups income and reports refund absorption', () => {
    const analysis = buildIncomeAnalysis(
      [
        record(3, 30000, ts('2026-05-10T08:00:00')),
        record(5, 4000, ts('2026-05-12T08:00:00'), {
          amount: 10000,
          charge: 100,
          finalAmount: 4000,
        }),
        record(6, 0, ts('2026-05-13T08:00:00'), {
          amount: 5000,
          charge: 0,
          finalAmount: 0,
        }),
      ],
      types,
      createMonthPeriod(NOW, NOW),
    );

    expect(analysis.total).toBe(34000);
    expect(analysis.stats.map(item => item.name)).toEqual(['工资', '退款']);
    expect(analysis.stats[0].percent).toBeCloseTo(30000 / 34000);
    expect(analysis.refundGross).toBe(14900);
    expect(analysis.refundNet).toBe(4000);
    expect(analysis.refundAbsorbed).toBe(10900);
  });
});

describe('buildIncomeTrend', () => {
  test('returns six months and truncates the current month at today', () => {
    const trend = buildIncomeTrend(
      [
        record(3, 20000, ts('2026-04-10T08:00:00')),
        record(1, 15000, ts('2026-04-12T08:00:00')),
        record(3, 30000, ts('2026-05-10T08:00:00')),
        record(1, 20000, ts('2026-05-12T08:00:00')),
        record(1, 9999, ts('2026-05-20T08:00:00')),
      ],
      types,
      new Date(`2026-05-01T00:00:00${TZ_OFFSET}`),
      NOW,
    );

    expect(trend).toHaveLength(6);
    expect(trend[0].label).toBe('12月');
    expect(trend[4]).toMatchObject({
      label: '4月',
      income: 20000,
      expense: 15000,
    });
    expect(trend[4].savingsRate).toBeCloseTo(0.25);
    expect(trend[5]).toMatchObject({
      label: '5月*',
      income: 30000,
      expense: 20000,
    });
    expect(trend[5].savingsRate).toBeCloseTo(1 / 3);
  });
});

describe('buildAssetOverview', () => {
  const assets = [
    asset(1, '招行储蓄卡', ASSET_TYPE.capitalAccount, 100000, {
      classification: ASSET_CLASSIFICATION.debitCard,
      sort: 1,
      cardNo: '62258821',
    }),
    asset(2, '招行信用卡', ASSET_TYPE.creditCard, 30000, {
      classification: ASSET_CLASSIFICATION.creditCard,
      totalAmount: 200000,
      repaymentDate: 28,
      sort: 2,
    }),
    asset(3, '借入-小李', ASSET_TYPE.debt, 5000, {
      classification: ASSET_CLASSIFICATION.borrow,
      repaymentDate: 5,
      sort: 3,
    }),
    asset(4, '借出-小王', ASSET_TYPE.debt, 4000, {
      classification: ASSET_CLASSIFICATION.lend,
      sort: 4,
    }),
    asset(5, '基金账户', ASSET_TYPE.investment, 20000, { sort: 5 }),
    asset(6, '星巴克卡', ASSET_TYPE.storedValueCard, 1000, { sort: 6 }),
    asset(7, '隐藏账户', ASSET_TYPE.capitalAccount, 99999, {
      invisible: VISIBILITY.hidden,
      sort: 7,
    }),
  ];

  test('computes net worth from available funds, receivables and debts', () => {
    const overview = buildAssetOverview(assets);

    expect(overview.available).toBe(121000);
    expect(overview.receivable).toBe(4000);
    expect(overview.debt).toBe(35000);
    expect(overview.netWorth).toBe(90000);
    expect(overview.assetsTotal).toBe(125000);
    expect(overview.debtRatio).toBeCloseTo(35000 / 125000);
    expect(overview.assetGroups.map(group => group.amount)).toEqual([
      100000, 1000, 20000, 4000,
    ]);
    expect(overview.liabilityGroups.map(group => group.amount)).toEqual([
      30000, 5000,
    ]);
  });

  test('excludes hidden assets and shows liabilities as negative amounts', () => {
    const overview = buildAssetOverview(assets);

    expect(overview.accounts).toHaveLength(6);
    expect(overview.accounts.find(item => item.asset.id === 7)).toBeUndefined();
    expect(overview.accounts.find(item => item.asset.id === 2)?.amount).toBe(
      -30000,
    );
    expect(overview.accounts[0].name).toBe('招行储蓄卡');
  });

  test('estimates historical net worth by removing later records', () => {
    const history = buildNetWorthHistory(
      assets,
      [
        record(1, 1000, ts('2026-05-10T08:00:00')),
        record(3, 500, ts('2026-04-15T08:00:00')),
      ],
      types,
      new Date(`2026-05-01T00:00:00${TZ_OFFSET}`),
    );

    expect(history).toHaveLength(6);
    expect(history[5]).toMatchObject({ label: '5月', value: 90000 });
    expect(history[4]).toMatchObject({ label: '4月', value: 91000 });
    expect(history[3]).toMatchObject({ label: '3月', value: 90500 });
  });
});

describe('buildDueReminders', () => {
  test('returns the next repayment dates sorted by urgency', () => {
    const reminders = buildDueReminders(
      [
        asset(2, '招行信用卡', ASSET_TYPE.creditCard, 30000, {
          classification: ASSET_CLASSIFICATION.creditCard,
          repaymentDate: 28,
        }),
        asset(3, '借入-小李', ASSET_TYPE.debt, 5000, {
          classification: ASSET_CLASSIFICATION.borrow,
          repaymentDate: 5,
        }),
        asset(4, '已还清', ASSET_TYPE.creditCard, 0, {
          classification: ASSET_CLASSIFICATION.creditCard,
          repaymentDate: 1,
        }),
      ],
      NOW,
    );

    expect(reminders).toHaveLength(2);
    expect(reminders[0]).toMatchObject({ daysLeft: 13, amount: 30000 });
    expect(reminders[0].dueDate).toBe(ts('2026-05-28T00:00:00'));
    expect(reminders[1]).toMatchObject({ daysLeft: 21, amount: 5000 });
    expect(reminders[1].dueDate).toBe(ts('2026-06-05T00:00:00'));
  });
});

describe('buildReimbursementSummary', () => {
  test('splits reimbursable expenses into reimbursed and pending', () => {
    const summary = buildReimbursementSummary(
      [
        record(1, 5000, ts('2026-05-02T08:00:00'), {
          amount: 10000,
          charge: 2000,
          finalAmount: 5000,
          reimbursable: REIMBURSABLE.reimbursable,
        }),
        record(1, 3000, ts('2026-05-03T08:00:00')),
      ],
      types,
      createMonthPeriod(NOW, NOW),
    );

    expect(summary).not.toBeNull();
    expect(summary?.total).toBe(12000);
    expect(summary?.reimbursed).toBe(7000);
    expect(summary?.pending).toBe(5000);
    expect(summary?.ratio).toBeCloseTo(7000 / 12000);
  });

  test('returns null when no expense is reimbursable', () => {
    const summary = buildReimbursementSummary(
      [record(1, 3000, ts('2026-05-03T08:00:00'))],
      types,
      createMonthPeriod(NOW, NOW),
    );

    expect(summary).toBeNull();
  });
});

describe('tag and asset dimensions', () => {
  const tags = new Map([
    [1, tag(1, '旅行')],
    [2, tag(2, '装修')],
  ]);

  test('groups expenses by their first tag and keeps untagged records', () => {
    const records = [
      record(1, 6000, ts('2026-05-02T08:00:00')),
      record(1, 4000, ts('2026-05-03T08:00:00')),
      record(1, 2000, ts('2026-05-04T08:00:00')),
      record(1, 1000, ts('2026-05-05T08:00:00')),
    ];
    const recordTags = new Map([
      [records[0].id, [1]],
      [records[1].id, [2]],
      [records[3].id, [2, 1]],
    ]);
    const stats = buildTagStats(
      records,
      types,
      createMonthPeriod(NOW, NOW),
      tags,
      recordTags,
    );

    expect(stats.map(item => item.name)).toEqual(['旅行', '装修', '未打标签']);
    expect(stats[0].amount).toBe(7000);
    expect(stats[1].amount).toBe(4000);
    expect(stats[2].amount).toBe(2000);
  });

  test('groups expenses by payment asset and keeps unknown assets', () => {
    const assetMap = new Map([
      [1, asset(1, '招行储蓄卡', ASSET_TYPE.capitalAccount, 0)],
      [2, asset(2, '招行信用卡', ASSET_TYPE.creditCard, 0)],
    ]);
    const stats = buildAssetStats(
      [
        record(1, 6000, ts('2026-05-02T08:00:00'), { assetId: 1 }),
        record(1, 4000, ts('2026-05-03T08:00:00'), { assetId: 2 }),
        record(1, 1000, ts('2026-05-04T08:00:00'), { assetId: 999 }),
      ],
      types,
      createMonthPeriod(NOW, NOW),
      assetMap,
    );

    expect(stats.map(item => item.name)).toEqual([
      '招行储蓄卡',
      '招行信用卡',
      '未关联资产',
    ]);
  });
});

describe('foldForDonut', () => {
  test('keeps the requested count and merges the rest', () => {
    const stats = Array.from({ length: 8 }, (_, index) => ({
      key: String(index),
      name: `分类${index}`,
      amount: 8000 - index * 1000,
    }));
    const folded = foldForDonut(stats, 6);

    expect(folded).toHaveLength(7);
    expect(folded[6]).toMatchObject({
      key: 'other',
      name: '其他 2 类',
      amount: 3000,
    });
    expect(folded[6].percent).toBeCloseTo(3000 / 36000);
  });
});

describe('money formatting', () => {
  test('formats amounts with thousands separators and two decimals', () => {
    expect(formatMoney(123456)).toBe('1,234.56');
    expect(formatSignedMoney(31200)).toBe('+312.00');
    expect(formatSignedMoney(-25530)).toBe('−255.30');
  });

  test('formats compact axis amounts', () => {
    expect(formatAxisMoney(800000)).toBe('8k');
    expect(formatAxisMoney(1234567)).toBe('1.2万');
    expect(formatAxisMoney(12345)).toBe('123');
  });
});
