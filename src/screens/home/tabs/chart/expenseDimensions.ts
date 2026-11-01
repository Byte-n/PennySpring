import {
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type AssetRow,
  type RecordRow,
  type RecordRelationRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import { aggregateExpenseStatsForRange } from './chartData';
import {
  categoryOf,
  getPeriodCutoff,
  percentOf,
  toTypeMap,
  type ChartPeriod,
  type DimensionStat,
  type DonutStat,
  type ReimbursementSummary,
  type TopExpenseView,
} from './chartModel';

const DEFAULT_DONUT_LIMIT = 6;
const DEFAULT_TOP_LIMIT = 3;
const OTHER_KEY = 'other';
const UNTAGGED_KEY = 'untagged';
const UNTAGGED_NAME = '未打标签';
const UNKNOWN_TAG_NAME = '未知标签';
const UNASSIGNED_KEY = 'unassigned';
const UNASSIGNED_NAME = '未关联资产';

export function buildReimbursementSummary(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
  relations: readonly Pick<
    RecordRelationRow,
    'recordId' | 'relatedRecordId'
  >[] = [],
): ReimbursementSummary | null {
  const typeMap = toTypeMap(types);
  const cutoff = getPeriodCutoff(period);
  let total = 0;
  const reimbursableExpenses = new Map<
    number,
    { total: number; pending: number }
  >();

  for (const record of records) {
    if (record.recordTime < period.start || record.recordTime >= cutoff) {
      continue;
    }
    if (record.reimbursable !== REIMBURSABLE.reimbursable) continue;
    if (categoryOf(typeMap, record.typeId) !== RECORD_TYPE_CATEGORY.expense) {
      continue;
    }
    const expenseTotal = record.amount + record.charge;
    total += expenseTotal;
    reimbursableExpenses.set(record.id, {
      total: expenseTotal,
      pending: record.finalAmount,
    });
  }

  if (total <= 0) return null;

  if (relations.length === 0) {
    const pending = [...reimbursableExpenses.values()].reduce(
      (sum, expense) => sum + expense.pending,
      0,
    );
    const reimbursed = Math.max(0, total - pending);
    return {
      total,
      reimbursed,
      pending: Math.max(0, total - reimbursed),
      ratio: percentOf(reimbursed, total),
    };
  }

  const typeMapById = typeMap;
  const recordsById = new Map(records.map(record => [record.id, record]));
  const relationsByExpense = new Map<number, typeof relations>();
  for (const relation of relations) {
    const links = [...(relationsByExpense.get(relation.relatedRecordId) ?? [])];
    links.push(relation);
    relationsByExpense.set(relation.relatedRecordId, links);
  }
  let reimbursed = 0;
  for (const [expenseId, expense] of reimbursableExpenses) {
    let absorbed = 0;
    for (const relation of relationsByExpense.get(expenseId) ?? []) {
      const income = recordsById.get(relation.recordId);
      const incomeType = income ? typeMapById.get(income.typeId) : undefined;
      if (!income || !incomeType) continue;
      const arrival = Math.max(0, income.amount - income.charge);
      const actual = Math.min(arrival, Math.max(0, expense.total - absorbed));
      absorbed += actual;
      if (incomeType.specialBehavior === 'reimbursement_absorption')
        reimbursed += actual;
    }
  }
  reimbursed = Math.min(total, reimbursed);
  return {
    total,
    reimbursed,
    pending: Math.max(0, total - reimbursed),
    ratio: percentOf(reimbursed, total),
  };
}

export function buildTagStats(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
  tagMap: ReadonlyMap<number, TagRow>,
  recordTagsMap: ReadonlyMap<number, readonly number[]>,
): DimensionStat[] {
  const typeMap = toTypeMap(types);
  const cutoff = getPeriodCutoff(period);
  const buckets = new Map<string, DimensionStat>();
  let total = 0;

  for (const record of records) {
    if (record.recordTime < period.start || record.recordTime >= cutoff) {
      continue;
    }
    if (record.finalAmount <= 0) continue;
    if (categoryOf(typeMap, record.typeId) !== RECORD_TYPE_CATEGORY.expense) {
      continue;
    }

    const tagIds = recordTagsMap.get(record.id) ?? [];
    const tagId = tagIds.length > 0 ? Math.min(...tagIds) : null;
    const key = tagId === null ? UNTAGGED_KEY : `tag-${tagId}`;
    const name =
      tagId === null
        ? UNTAGGED_NAME
        : (tagMap.get(tagId)?.name ?? UNKNOWN_TAG_NAME);
    const existing = buckets.get(key);
    if (existing) {
      existing.amount += record.finalAmount;
      existing.count += 1;
    } else {
      buckets.set(key, {
        key,
        name,
        amount: record.finalAmount,
        count: 1,
        percent: 0,
      });
    }
    total += record.finalAmount;
  }

  return [...buckets.values()]
    .map(item => ({ ...item, percent: percentOf(item.amount, total) }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
}

export function buildAssetStats(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  period: ChartPeriod,
  assetMap: ReadonlyMap<number, AssetRow>,
): DimensionStat[] {
  const typeMap = toTypeMap(types);
  const cutoff = getPeriodCutoff(period);
  const buckets = new Map<string, DimensionStat>();
  let total = 0;

  for (const record of records) {
    if (record.recordTime < period.start || record.recordTime >= cutoff) {
      continue;
    }
    if (record.finalAmount <= 0) continue;
    if (categoryOf(typeMap, record.typeId) !== RECORD_TYPE_CATEGORY.expense) {
      continue;
    }

    const key = record.assetId > 0 ? `asset-${record.assetId}` : UNASSIGNED_KEY;
    const name =
      record.assetId > 0
        ? (assetMap.get(record.assetId)?.name ?? UNASSIGNED_NAME)
        : UNASSIGNED_NAME;
    const existing = buckets.get(key);
    if (existing) {
      existing.amount += record.finalAmount;
      existing.count += 1;
    } else {
      buckets.set(key, {
        key,
        name,
        amount: record.finalAmount,
        count: 1,
        percent: 0,
      });
    }
    total += record.finalAmount;
  }

  return [...buckets.values()]
    .map(item => ({ ...item, percent: percentOf(item.amount, total) }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
}

export function foldForDonut(
  stats: readonly { key: string; name: string; amount: number }[],
  keepCount = DEFAULT_DONUT_LIMIT,
): DonutStat[] {
  const total = stats.reduce((sum, item) => sum + item.amount, 0);
  const toDonut = (item: {
    key: string;
    name: string;
    amount: number;
  }): DonutStat => ({
    key: item.key,
    name: item.name,
    amount: item.amount,
    percent: percentOf(item.amount, total),
  });

  if (stats.length <= keepCount) {
    return stats.map(toDonut);
  }

  const kept = stats.slice(0, keepCount);
  const rest = stats.slice(keepCount);
  const otherAmount = rest.reduce((sum, item) => sum + item.amount, 0);
  return [
    ...kept.map(toDonut),
    {
      key: OTHER_KEY,
      name: `其他 ${rest.length} 类`,
      amount: otherAmount,
      percent: percentOf(otherAmount, total),
    },
  ];
}

export function buildTopExpenses(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  assets: readonly AssetRow[],
  period: ChartPeriod,
  limit = DEFAULT_TOP_LIMIT,
): TopExpenseView[] {
  const typeMap = toTypeMap(types);
  const assetMap = new Map(assets.map(asset => [asset.id, asset]));
  const cutoff = getPeriodCutoff(period);

  return records
    .filter(record => {
      if (record.recordTime < period.start || record.recordTime >= cutoff) {
        return false;
      }
      if (record.finalAmount <= 0) return false;
      return (
        categoryOf(typeMap, record.typeId) === RECORD_TYPE_CATEGORY.expense
      );
    })
    .sort(
      (a, b) => b.finalAmount - a.finalAmount || b.recordTime - a.recordTime,
    )
    .slice(0, limit)
    .map(record => {
      const type = typeMap.get(record.typeId);
      const typeName = type?.name ?? '未分类';
      return {
        record,
        typeName,
        typeIcon: type?.icon ?? null,
        assetName: assetMap.get(record.assetId)?.name ?? '',
        title: record.remark.trim() || typeName,
        amount: record.finalAmount,
      };
    });
}

export function buildDayCategoryStats(
  records: readonly RecordRow[],
  types: readonly TypeRow[],
  dayStart: number,
  dayEnd: number,
  limit = 3,
): Array<{ name: string; amount: number }> {
  const analysis = aggregateExpenseStatsForRange(
    records,
    types,
    null,
    dayStart,
    dayEnd,
  );
  return analysis.stats
    .slice(0, limit)
    .map(item => ({ name: item.name, amount: item.amount }));
}
