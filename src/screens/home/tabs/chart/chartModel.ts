import {
  RECORD_TYPE_CATEGORY,
  type AssetRow,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';

const CENTS_PER_YUAN = 100;
const DAY_MS = 24 * 60 * 60 * 1000;
const PERCENT_BASE = 100;
const DEFAULT_MOVER_LIMIT = 4;
const DEFAULT_STRUCTURE_LIMIT = 3;
const TEN_THOUSAND_YUAN = 10000;
const THOUSAND_YUAN = 1000;
const OTHER_KEY = 'other';

export interface ChartPeriod {
  start: number;
  end: number;
  label: string;
  compareLabel: string;
  isCurrent: boolean;
  isFuture: boolean;
  elapsedDays: number;
  totalDays: number;
}

export interface CashflowSummary {
  expense: number;
  income: number;
  balance: number;
  expenseCount: number;
  dailyAverage: number;
  savingsRate: number;
}

export interface PeriodComparison {
  current: CashflowSummary;
  previous: CashflowSummary;
  expenseDelta: number | null;
  incomeDelta: number | null;
  balanceDelta: number;
  savingsRateDelta: number;
}

export interface DailyExpensePoint {
  day: number;
  date: number;
  amount: number;
  cumulative: number;
}

export interface CalendarDay {
  day: number;
  date: number;
  amount: number;
  isFuture: boolean;
  isToday: boolean;
}

export interface CategoryMover {
  key: string;
  name: string;
  current: number;
  previous: number;
  delta: number;
  percent: number | null;
  count: number;
}

export type ExpenseInsight =
  | {
      kind: 'pace';
      expenseGrowth: number;
      incomeGrowth: number;
      balanceDelta: number;
    }
  | {
      kind: 'category';
      name: string;
      delta: number;
      percent: number | null;
      count: number;
    }
  | {
      kind: 'peak';
      day: number;
      amount: number;
    };

export interface StructureStat {
  key: string;
  name: string;
  amount: number;
  percent: number;
  isOther: boolean;
}

export interface IncomeStat {
  key: string;
  typeId: number;
  name: string;
  amount: number;
  count: number;
  percent: number;
}

export interface IncomeAnalysis {
  total: number;
  stats: IncomeStat[];
  refundGross: number;
  refundNet: number;
  refundAbsorbed: number;
}

export interface MonthlyCashflow {
  label: string;
  start: number;
  income: number;
  expense: number;
  savingsRate: number;
}

export interface AssetGroupStat {
  key: string;
  name: string;
  amount: number;
}

export interface AssetAccountView {
  asset: AssetRow;
  name: string;
  subtitle: string;
  amount: number;
  isLiability: boolean;
}

export interface AssetOverview {
  available: number;
  receivable: number;
  debt: number;
  netWorth: number;
  assetsTotal: number;
  liabilitiesTotal: number;
  debtRatio: number;
  assetGroups: AssetGroupStat[];
  liabilityGroups: AssetGroupStat[];
  accounts: AssetAccountView[];
}

export interface DueReminder {
  asset: AssetRow;
  dueDate: number;
  daysLeft: number;
  amount: number;
}

export interface ReimbursementSummary {
  total: number;
  reimbursed: number;
  pending: number;
  ratio: number;
}

export interface NetWorthPoint {
  label: string;
  value: number;
}

export interface DimensionStat {
  key: string;
  name: string;
  amount: number;
  count: number;
  percent: number;
}

export interface DonutStat {
  key: string;
  name: string;
  amount: number;
  percent: number;
}

export interface TopExpenseView {
  record: RecordRow;
  typeName: string;
  typeIcon: string | null;
  assetName: string;
  title: string;
  amount: number;
}

export interface CategoryAmount {
  key: string;
  name: string;
  amount: number;
  count: number;
}

interface IncomeInsightParams {
  current: CashflowSummary;
  previous: CashflowSummary;
  movers: readonly CategoryMover[];
  calendar: readonly CalendarDay[];
}

function addThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function toTypeMap(types: readonly TypeRow[]): Map<number, TypeRow> {
  return new Map(types.map(type => [type.id, type]));
}

export function categoryOf(
  typeMap: ReadonlyMap<number, TypeRow>,
  typeId: number,
): TypeRow['typeCategory'] {
  return typeMap.get(typeId)?.typeCategory ?? RECORD_TYPE_CATEGORY.expense;
}

export function percentOf(amount: number, total: number): number {
  return total === 0 ? 0 : amount / total;
}

function toSummary(
  expense: number,
  income: number,
  expenseCount: number,
  elapsedDays: number,
): CashflowSummary {
  const balance = income - expense;
  return {
    expense,
    income,
    balance,
    expenseCount,
    dailyAverage: elapsedDays === 0 ? 0 : expense / elapsedDays,
    savingsRate: income === 0 ? 0 : balance / income,
  };
}

export function summarizeRange(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  start: number,
  end: number,
): { expense: number; income: number; expenseCount: number } {
  const typeMap = toTypeMap(types);
  let expense = 0;
  let income = 0;
  let expenseCount = 0;

  for (const record of records) {
    if (record.recordTime < start || record.recordTime >= end) continue;
    if (record.finalAmount <= 0) continue;
    const category = categoryOf(typeMap, record.typeId);
    if (category === RECORD_TYPE_CATEGORY.expense) {
      expense += record.finalAmount;
      expenseCount += 1;
    } else if (category === RECORD_TYPE_CATEGORY.income) {
      income += record.finalAmount;
    }
  }

  return { expense, income, expenseCount };
}

export function formatMoney(cents: number): string {
  const [integer, decimal] = (Math.abs(cents) / CENTS_PER_YUAN)
    .toFixed(2)
    .split('.');
  return `${addThousands(integer)}.${decimal}`;
}

export function formatSignedMoney(cents: number): string {
  if (cents === 0) return formatMoney(cents);
  return `${cents > 0 ? '+' : '−'}${formatMoney(cents)}`;
}

export function formatBalance(cents: number): string {
  return `${cents < 0 ? '−' : ''}${formatMoney(cents)}`;
}

export function formatAxisMoney(cents: number): string {
  const yuan = Math.abs(cents) / CENTS_PER_YUAN;
  if (yuan >= TEN_THOUSAND_YUAN) {
    return `${(yuan / TEN_THOUSAND_YUAN).toFixed(1).replace(/\.0$/, '')}万`;
  }
  if (yuan >= THOUSAND_YUAN) {
    return `${Math.round(yuan / THOUSAND_YUAN)}k`;
  }
  return `${Math.round(yuan)}`;
}

export function formatPercent(
  ratio: number | null,
  fractionDigits = 1,
): string {
  if (ratio === null || !Number.isFinite(ratio)) return '—';
  return `${(ratio * PERCENT_BASE).toFixed(fractionDigits)}%`;
}

export function formatSignedPercent(
  ratio: number | null,
  fractionDigits = 1,
): string {
  if (ratio === null || !Number.isFinite(ratio)) return '—';
  const sign = ratio > 0 ? '+' : ratio < 0 ? '−' : '';
  return `${sign}${Math.abs(ratio * PERCENT_BASE).toFixed(fractionDigits)}%`;
}

export function shiftMonth(anchor: Date, offset: number): Date {
  return new Date(anchor.getFullYear(), anchor.getMonth() + offset, 1);
}

export function createMonthPeriod(anchor: Date, now: Date): ChartPeriod {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const isCurrent = start === currentStart;
  const isFuture = start > currentStart;
  const elapsedDays = isCurrent ? now.getDate() : isFuture ? 0 : totalDays;

  return {
    start,
    end,
    label: `${year}年${month + 1}月`,
    compareLabel: `${new Date(year, month - 1, 1).getMonth() + 1}月`,
    isCurrent,
    isFuture,
    elapsedDays,
    totalDays,
  };
}

export function getPeriodCutoff(period: ChartPeriod): number {
  if (!period.isCurrent) return period.end;
  const start = new Date(period.start);
  return new Date(
    start.getFullYear(),
    start.getMonth(),
    period.elapsedDays + 1,
  ).getTime();
}

export function getPreviousRange(period: ChartPeriod): {
  start: number;
  end: number;
} {
  const start = new Date(period.start);
  const previousStart = new Date(
    start.getFullYear(),
    start.getMonth() - 1,
    1,
  ).getTime();

  if (!period.isCurrent) {
    return { start: previousStart, end: period.start };
  }

  const previousMonthDays = new Date(
    start.getFullYear(),
    start.getMonth(),
    0,
  ).getDate();
  const elapsed = Math.min(period.elapsedDays, previousMonthDays);
  const previousEnd = new Date(
    start.getFullYear(),
    start.getMonth() - 1,
    elapsed + 1,
  ).getTime();
  return { start: previousStart, end: previousEnd };
}

export function summarizeMonth(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
): CashflowSummary {
  const cutoff = getPeriodCutoff(period);
  const sums = summarizeRange(records, types, period.start, cutoff);
  const days = period.isCurrent ? period.elapsedDays : period.totalDays;
  return toSummary(sums.expense, sums.income, sums.expenseCount, days);
}

export function comparePeriods(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
): PeriodComparison {
  const current = summarizeMonth(records, types, period);
  const previousRange = getPreviousRange(period);
  const previousSums = summarizeRange(
    records,
    types,
    previousRange.start,
    previousRange.end,
  );
  const previousStart = new Date(previousRange.start);
  const previousMonthDays = new Date(
    previousStart.getFullYear(),
    previousStart.getMonth() + 1,
    0,
  ).getDate();
  const previousDays = period.isCurrent
    ? Math.min(period.elapsedDays, previousMonthDays)
    : previousMonthDays;
  const previous = toSummary(
    previousSums.expense,
    previousSums.income,
    previousSums.expenseCount,
    previousDays,
  );

  return {
    current,
    previous,
    expenseDelta:
      previous.expense > 0 ? current.expense / previous.expense - 1 : null,
    incomeDelta:
      previous.income > 0 ? current.income / previous.income - 1 : null,
    balanceDelta: current.balance - previous.balance,
    savingsRateDelta: current.savingsRate - previous.savingsRate,
  };
}

function buildDailyPoints(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  start: number,
  dayCount: number,
): DailyExpensePoint[] {
  if (dayCount <= 0) return [];

  const typeMap = toTypeMap(types);
  const startDate = new Date(start);
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const buckets = new Map<number, number>();

  for (const record of records) {
    if (record.finalAmount <= 0) continue;
    if (record.recordTime < start) continue;
    if (categoryOf(typeMap, record.typeId) !== RECORD_TYPE_CATEGORY.expense) {
      continue;
    }
    const date = new Date(record.recordTime);
    if (date.getFullYear() !== year || date.getMonth() !== month) continue;
    const day = date.getDate();
    if (day > dayCount) continue;
    buckets.set(day, (buckets.get(day) ?? 0) + record.finalAmount);
  }

  const points: DailyExpensePoint[] = [];
  let cumulative = 0;
  for (let day = 1; day <= dayCount; day += 1) {
    const amount = buckets.get(day) ?? 0;
    cumulative += amount;
    points.push({
      day,
      date: new Date(year, month, day).getTime(),
      amount,
      cumulative,
    });
  }
  return points;
}

export function buildDailyExpense(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
): DailyExpensePoint[] {
  return buildDailyPoints(records, types, period.start, period.elapsedDays);
}

export function buildPreviousDailyExpense(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
): DailyExpensePoint[] {
  const range = getPreviousRange(period);
  const startDate = new Date(range.start);
  const previousMonthDays = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0,
  ).getDate();
  const rangeDays = Math.max(
    0,
    Math.round((range.end - range.start) / DAY_MS),
  );
  const dayCount = Math.min(period.totalDays, previousMonthDays, rangeDays);
  return buildDailyPoints(records, types, range.start, dayCount);
}

export function buildCalendarDays(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
): CalendarDay[] {
  const typeMap = toTypeMap(types);
  const startDate = new Date(period.start);
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const buckets = new Map<number, number>();

  for (const record of records) {
    if (record.finalAmount <= 0) continue;
    if (record.recordTime < period.start || record.recordTime >= period.end) {
      continue;
    }
    if (categoryOf(typeMap, record.typeId) !== RECORD_TYPE_CATEGORY.expense) {
      continue;
    }
    const date = new Date(record.recordTime);
    const day = date.getDate();
    buckets.set(day, (buckets.get(day) ?? 0) + record.finalAmount);
  }

  return Array.from({ length: period.totalDays }, (_, index) => {
    const day = index + 1;
    const isFuture =
      period.isFuture || (period.isCurrent && day > period.elapsedDays);
    return {
      day,
      date: new Date(year, month, day).getTime(),
      amount: isFuture ? 0 : buckets.get(day) ?? 0,
      isFuture,
      isToday: period.isCurrent && day === period.elapsedDays,
    };
  });
}

export function buildMovers(
  currentStats: readonly CategoryAmount[],
  previousStats: readonly CategoryAmount[],
  limit = DEFAULT_MOVER_LIMIT,
): CategoryMover[] {
  const currentMap = new Map(currentStats.map(item => [item.key, item]));
  const previousMap = new Map(previousStats.map(item => [item.key, item]));
  const keys = new Set([...currentMap.keys(), ...previousMap.keys()]);

  return [...keys]
    .map(key => {
      const current = currentMap.get(key);
      const previous = previousMap.get(key);
      const currentAmount = current?.amount ?? 0;
      const previousAmount = previous?.amount ?? 0;
      const delta = currentAmount - previousAmount;
      return {
        key,
        name: current?.name ?? previous?.name ?? '',
        current: currentAmount,
        previous: previousAmount,
        delta,
        percent: previousAmount > 0 ? delta / previousAmount : null,
        count: current?.count ?? 0,
      };
    })
    .sort(
      (a, b) =>
        Math.abs(b.delta) - Math.abs(a.delta) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

export function buildExpenseInsights({
  current,
  previous,
  movers,
  calendar,
}: IncomeInsightParams): ExpenseInsight[] {
  const insights: ExpenseInsight[] = [];

  if (
    previous.expense > 0 &&
    previous.income > 0 &&
    current.expense > 0 &&
    current.income > 0
  ) {
    const expenseGrowth = current.expense / previous.expense - 1;
    const incomeGrowth = current.income / previous.income - 1;
    if (expenseGrowth > incomeGrowth) {
      insights.push({
        kind: 'pace',
        expenseGrowth,
        incomeGrowth,
        balanceDelta: current.balance - previous.balance,
      });
    }
  }

  const topIncrease = movers.find(item => item.delta > 0);
  if (topIncrease) {
    insights.push({
      kind: 'category',
      name: topIncrease.name,
      delta: topIncrease.delta,
      percent: topIncrease.percent,
      count: topIncrease.count,
    });
  }

  let peakDay: CalendarDay | null = null;
  for (const day of calendar) {
    if (day.isFuture) continue;
    if (peakDay === null || day.amount > peakDay.amount) {
      peakDay = day;
    }
  }
  if (peakDay && peakDay.amount > 0) {
    insights.push({ kind: 'peak', day: peakDay.day, amount: peakDay.amount });
  }

  return insights.slice(0, 3);
}

export function buildStructure(
  stats: readonly CategoryAmount[],
  limit = DEFAULT_STRUCTURE_LIMIT,
): StructureStat[] {
  const total = stats.reduce((sum, item) => sum + item.amount, 0);
  const toStructure = (item: CategoryAmount, isOther: boolean): StructureStat => ({
    key: item.key,
    name: item.name,
    amount: item.amount,
    percent: percentOf(item.amount, total),
    isOther,
  });

  if (stats.length <= limit) {
    return stats.map(item => toStructure(item, false));
  }

  const kept = stats.slice(0, limit).map(item => toStructure(item, false));
  const rest = stats.slice(limit);
  const otherAmount = rest.reduce((sum, item) => sum + item.amount, 0);
  return [
    ...kept,
    {
      key: OTHER_KEY,
      name: `其他 ${rest.length} 类`,
      amount: otherAmount,
      percent: percentOf(otherAmount, total),
      isOther: true,
    },
  ];
}

