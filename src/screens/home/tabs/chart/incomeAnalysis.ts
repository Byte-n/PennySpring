import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  createMonthPeriod,
  getPeriodCutoff,
  percentOf,
  shiftMonth,
  summarizeRange,
  toTypeMap,
  type ChartPeriod,
  type IncomeAnalysis,
  type IncomeStat,
  type MonthlyCashflow,
} from './chartModel';

const DEFAULT_TREND_MONTHS = 6;

function isAbsorptionIncome(type: TypeRow): boolean {
  return (
    type.specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption ||
    type.specialBehavior ===
      RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption
  );
}

export function buildIncomeAnalysis(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
): IncomeAnalysis {
  const typeMap = toTypeMap(types);
  const cutoff = getPeriodCutoff(period);
  const groups = new Map<string, IncomeStat>();
  let refundGross = 0;
  let refundNet = 0;

  for (const record of records) {
    if (record.recordTime < period.start || record.recordTime >= cutoff) {
      continue;
    }
    if (record.finalAmount < 0) continue;
    const type = typeMap.get(record.typeId);
    if (!type || type.typeCategory !== RECORD_TYPE_CATEGORY.income) {
      continue;
    }

    const groupId = type.parentId > 0 ? type.parentId : type.id;
    const groupType = typeMap.get(groupId);
    const key = String(groupId);
    const existing = groups.get(key);
    if (existing) {
      existing.amount += record.finalAmount;
      existing.count += 1;
    } else {
      groups.set(key, {
        key,
        typeId: groupId,
        name: groupType?.name ?? type.name,
        amount: record.finalAmount,
        count: 1,
        percent: 0,
      });
    }

    if (isAbsorptionIncome(type)) {
      refundGross += Math.max(0, record.amount - record.charge);
      refundNet += record.finalAmount;
    }
  }

  const total = [...groups.values()].reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const stats = [...groups.values()]
    .filter(item => item.amount > 0)
    .map(item => ({ ...item, percent: percentOf(item.amount, total) }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));

  return {
    total,
    stats,
    refundGross,
    refundNet,
    refundAbsorbed: Math.max(0, refundGross - refundNet),
  };
}

export function buildIncomeTrend(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  anchor: Date,
  now: Date,
  months = DEFAULT_TREND_MONTHS,
): MonthlyCashflow[] {
  const anchorStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const isAnchorCurrent =
    anchorStart.getFullYear() === now.getFullYear() &&
    anchorStart.getMonth() === now.getMonth();

  return Array.from({ length: months }, (_, index) => {
    const offset = index - (months - 1);
    const monthDate = shiftMonth(anchorStart, offset);
    const period = createMonthPeriod(monthDate, now);
    const cutoff = getPeriodCutoff(period);
    const sums = summarizeRange(records, types, period.start, cutoff);
    const balance = sums.income - sums.expense;
    return {
      label: `${monthDate.getMonth() + 1}月${
        isAnchorCurrent && offset === 0 ? '*' : ''
      }`,
      start: period.start,
      income: sums.income,
      expense: sums.expense,
      savingsRate: sums.income === 0 ? 0 : balance / sums.income,
    };
  });
}
