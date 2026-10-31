import dayjs from 'dayjs';
import type { RecordRow, TagRow, TypeRow } from '@pennyspring/api';

import { categoryLabel } from './labels';

export type QueryGroupBy = 'none' | 'day' | 'type' | 'tag' | 'month';

export interface QueryOptions {
  from?: string;
  to?: string;
  typeIds: number[];
  tagIds: number[];
  keyword: string;
  groupBy: QueryGroupBy;
  limit: number;
}

export interface QueryGroup {
  key: string;
  label: string;
  category?: string;
  count: number;
  expense: number;
  income: number;
  transfer: number;
}

export interface QueryRecordItem {
  id: number;
  time: string;
  type: string;
  category: string;
  amount: number;
  tags?: readonly string[];
  remark?: string;
  charge?: number;
}

export interface QueryResultPayload {
  book: string;
  count: number;
  range: {
    from: string | null;
    to: string | null;
    typeIds: number[];
    tagIds: number[];
    keyword: string | null;
  };
  totals: {
    expense: number;
    income: number;
    transfer: number;
  };
  groups?: QueryGroup[];
  groupsTruncated?: boolean;
  records?: QueryRecordItem[];
  truncated?: boolean;
  note?: string;
}

export interface QueryResultInput {
  bookName: string;
  options: QueryOptions;
  records: readonly RecordRow[];
  types: readonly TypeRow[];
  tags: readonly TagRow[];
  recordTags: ReadonlyArray<{ recordId: number; tagId: number }>;
}

interface Bucket {
  key: string;
  label: string;
  category?: string;
  count: number;
  expenseCents: number;
  incomeCents: number;
  transferCents: number;
}

interface RecordTagLink {
  recordId: number;
  tagId: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_GROUPS = 20;
const CENTS_PER_YUAN = 100;
const REMARK_LIMIT = 60;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GROUP_BY_VALUES: readonly QueryGroupBy[] = [
  'none',
  'day',
  'type',
  'tag',
  'month',
];
const UNTAGGED_KEY = 'untagged';
const UNTAGGED_LABEL = '未打标签';
const UNKNOWN_TYPE_LABEL = '未知类型';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toYuan(cents: number): number {
  return Math.round(cents) / CENTS_PER_YUAN;
}

function parseDateField(value: unknown, field: 'from' | 'to'): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${field} 必须是 YYYY-MM-DD 格式`);
  }

  const text = value.trim();
  if (!DATE_PATTERN.test(text)) {
    throw new Error(`${field} 必须是 YYYY-MM-DD 格式`);
  }

  const parsed = dayjs(text);
  if (!parsed.isValid() || parsed.format('YYYY-MM-DD') !== text) {
    throw new Error(`${field} 不是合法日期：${text}`);
  }

  return text;
}

function parseIdArray(value: unknown, field: 'typeIds' | 'tagIds'): number[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`${field} 必须是正整数数组`);
  }
  if (!value.every(item => Number.isInteger(item) && (item as number) > 0)) {
    throw new Error(`${field} 必须是正整数数组`);
  }
  return [...new Set(value as number[])];
}

function parseLimit(value: unknown): number {
  if (value === undefined || value === null) {
    return DEFAULT_LIMIT;
  }
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_LIMIT
  ) {
    throw new Error(`limit 必须在 1 到 ${MAX_LIMIT} 之间`);
  }
  return value;
}

function parseGroupBy(value: unknown): QueryGroupBy {
  if (value === undefined || value === null) {
    return 'none';
  }
  if (
    typeof value !== 'string' ||
    !GROUP_BY_VALUES.includes(value as QueryGroupBy)
  ) {
    throw new Error(`groupBy 不支持 ${String(value)}`);
  }
  return value as QueryGroupBy;
}

export function parseQueryArguments(raw: string): QueryOptions {
  if (!raw.trim()) {
    return parseQueryOptions({});
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('查询参数不是合法的 JSON');
  }
  if (!isRecord(parsed)) {
    throw new Error('查询参数必须是 JSON 对象');
  }
  return parseQueryOptions(parsed);
}

function parseQueryOptions(raw: Record<string, unknown>): QueryOptions {
  const from = parseDateField(raw.from, 'from');
  const to = parseDateField(raw.to, 'to');
  if (from && to && dayjs(from).valueOf() > dayjs(to).valueOf()) {
    throw new Error('起始日期不能晚于结束日期');
  }

  const keyword = raw.keyword === undefined || raw.keyword === null
    ? ''
    : raw.keyword;
  if (typeof keyword !== 'string') {
    throw new Error('keyword 必须是字符串');
  }

  return {
    from,
    to,
    typeIds: parseIdArray(raw.typeIds, 'typeIds'),
    tagIds: parseIdArray(raw.tagIds, 'tagIds'),
    keyword: keyword.trim(),
    groupBy: parseGroupBy(raw.groupBy),
    limit: parseLimit(raw.limit),
  };
}

function expandTypeIds(
  typeIds: readonly number[],
  types: readonly TypeRow[],
): Set<number> | undefined {
  if (typeIds.length === 0) {
    return undefined;
  }

  const expanded = new Set(typeIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const type of types) {
      if (
        type.parentId !== 0 &&
        expanded.has(type.parentId) &&
        !expanded.has(type.id)
      ) {
        expanded.add(type.id);
        changed = true;
      }
    }
  }
  return expanded;
}

function buildRecordTagMap(
  recordTags: ReadonlyArray<RecordTagLink>,
): Map<number, number[]> {
  const map = new Map<number, number[]>();
  for (const link of recordTags) {
    const list = map.get(link.recordId);
    if (list) {
      list.push(link.tagId);
    } else {
      map.set(link.recordId, [link.tagId]);
    }
  }
  return map;
}

function buildTagBuckets(
  tagIds: readonly number[],
  tagNames: ReadonlyMap<number, string>,
): Bucket[] {
  if (tagIds.length === 0) {
    return [createBucket(UNTAGGED_KEY, UNTAGGED_LABEL)];
  }

  return tagIds.map(tagId =>
    createBucket(
      String(tagId),
      tagNames.get(tagId) ?? `标签 ${tagId}`,
    ),
  );
}

function createBucket(
  key: string,
  label: string,
  category?: string,
): Bucket {
  return {
    key,
    label,
    category,
    count: 0,
    expenseCents: 0,
    incomeCents: 0,
    transferCents: 0,
  };
}

function recordBucketKey(
  record: RecordRow,
  groupBy: QueryGroupBy,
  type: TypeRow | undefined,
  tagIds: readonly number[],
  tagNames: ReadonlyMap<number, string>,
  date: dayjs.Dayjs,
): Bucket[] {
  switch (groupBy) {
    case 'day':
      return [createBucket(date.format('YYYY-MM-DD'), date.format('MM-DD'))];
    case 'month':
      return [createBucket(date.format('YYYY-MM'), date.format('YYYY-MM'))];
    case 'type':
      return [
        createBucket(
          String(record.typeId),
          type?.name ?? UNKNOWN_TYPE_LABEL,
          categoryLabel(type?.typeCategory),
        ),
      ];
    case 'tag':
      return buildTagBuckets(tagIds, tagNames);
    case 'none':
      return [];
  }
}

function applyAmounts(bucket: Bucket, record: RecordRow, category: string): void {
  if (category === '支出') {
    bucket.expenseCents += record.finalAmount;
  } else if (category === '收入') {
    bucket.incomeCents += record.finalAmount;
  } else if (category === '转账') {
    bucket.transferCents += record.amount;
  }
  bucket.count += 1;
}

function collectBuckets(
  records: readonly RecordRow[],
  groupBy: QueryGroupBy,
  typeMap: ReadonlyMap<number, TypeRow>,
  tagNames: ReadonlyMap<number, string>,
  recordTagMap: ReadonlyMap<number, readonly number[]>,
): Bucket[] {
  const buckets = new Map<string, Bucket>()

  for (const record of records) {
    const type = typeMap.get(record.typeId)
    const category = categoryLabel(type?.typeCategory)
    const tagIds = recordTagMap.get(record.id) ?? []
    const date = dayjs(record.recordTime)
    const recordBuckets = recordBucketKey(
      record,
      groupBy,
      type,
      tagIds,
      tagNames,
      date,
    )

    for (const candidate of recordBuckets) {
      const bucket = buckets.get(candidate.key) ?? candidate
      applyAmounts(bucket, record, category)
      buckets.set(bucket.key, bucket)
    }
  }

  const list = [...buckets.values()]
  if (groupBy === 'day' || groupBy === 'month') {
    list.sort((left, right) => left.key.localeCompare(right.key))
  } else {
    list.sort((left, right) => {
      const leftIncome = left.expenseCents + left.incomeCents
      const rightIncome = right.expenseCents + right.incomeCents
      return (
        rightIncome - leftIncome ||
        right.count - left.count ||
        right.transferCents - left.transferCents ||
        left.label.localeCompare(right.label)
      )
    })
  }
  return list
}

function toQueryGroup(bucket: Bucket): QueryGroup {
  return {
    key: bucket.key,
    label: bucket.label,
    ...(bucket.category === undefined ? {} : { category: bucket.category }),
    count: bucket.count,
    expense: toYuan(bucket.expenseCents),
    income: toYuan(bucket.incomeCents),
    transfer: toYuan(bucket.transferCents),
  };
}

function toQueryRecord(
  record: RecordRow,
  type: TypeRow | undefined,
  tagNames: readonly string[],
  withRemark: boolean,
): QueryRecordItem {
  const category = categoryLabel(type?.typeCategory)
  const isTransfer = category === '转账'
  const remark = record.remark.trim()

  return {
    id: record.id,
    time: dayjs(record.recordTime).format('YYYY-MM-DD HH:mm'),
    type: type?.name ?? UNKNOWN_TYPE_LABEL,
    category,
    amount: toYuan(isTransfer ? record.amount : record.finalAmount),
    ...(tagNames.length ? { tags: tagNames } : {}),
    ...(withRemark && remark ? { remark: remark.slice(0, REMARK_LIMIT) } : {}),
    ...(isTransfer && record.charge > 0
      ? { charge: toYuan(record.charge) }
      : {}),
  }
}

export function projectQueryResult(input: QueryResultInput): QueryResultPayload {
  const { options } = input;
  const fromTime = options.from ? dayjs(options.from).startOf('day').valueOf() : undefined;
  const toTime = options.to ? dayjs(options.to).endOf('day').valueOf() : undefined;
  const typeFilter = expandTypeIds(options.typeIds, input.types);
  const tagFilter = options.tagIds.length ? new Set(options.tagIds) : undefined;
  const keyword = options.keyword.toLowerCase();

  const typeMap = new Map(input.types.map(type => [type.id, type]));
  const tagNames = new Map(input.tags.map(tag => [tag.id, tag.name]));
  const recordTagMap = buildRecordTagMap(input.recordTags);

  const filtered = input.records
    .filter(record => {
      if (fromTime !== undefined && record.recordTime < fromTime) return false;
      if (toTime !== undefined && record.recordTime > toTime) return false;
      if (typeFilter && !typeFilter.has(record.typeId)) return false;
      if (tagFilter) {
        const tagIds = recordTagMap.get(record.id) ?? [];
        if (!tagIds.some(tagId => tagFilter.has(tagId))) return false;
      }
      if (keyword && !record.remark.toLowerCase().includes(keyword)) return false;
      return true;
    })
    .sort(
      (left, right) =>
        right.recordTime - left.recordTime || right.id - left.id,
    );

  let expenseCents = 0;
  let incomeCents = 0;
  let transferCents = 0;
  for (const record of filtered) {
    const category = categoryLabel(typeMap.get(record.typeId)?.typeCategory);
    if (category === '支出') {
      expenseCents += record.finalAmount;
    } else if (category === '收入') {
      incomeCents += record.finalAmount;
    } else if (category === '转账') {
      transferCents += record.amount;
    }
  }

  const payload: QueryResultPayload = {
    book: input.bookName,
    count: filtered.length,
    range: {
      from: options.from ?? null,
      to: options.to ?? null,
      typeIds: options.typeIds,
      tagIds: options.tagIds,
      keyword: options.keyword || null,
    },
    totals: {
      expense: toYuan(expenseCents),
      income: toYuan(incomeCents),
      transfer: toYuan(transferCents),
    },
  };

  if (options.groupBy === 'none') {
    const limit = Math.min(Math.max(options.limit, 1), MAX_LIMIT);
    payload.records = filtered.slice(0, limit).map(record => {
      const tagIds = recordTagMap.get(record.id) ?? [];
      const names = tagIds
        .map(tagId => tagNames.get(tagId))
        .filter((name): name is string => Boolean(name));
      return toQueryRecord(
        record,
        typeMap.get(record.typeId),
        [...new Set(names)],
        Boolean(options.keyword),
      );
    });
    if (filtered.length > limit) {
      payload.truncated = true;
    }
  } else {
    const buckets = collectBuckets(
      filtered,
      options.groupBy,
      typeMap,
      tagNames,
      recordTagMap,
    );
    payload.groups = buckets.slice(0, MAX_GROUPS).map(toQueryGroup);
    if (buckets.length > MAX_GROUPS) {
      payload.groupsTruncated = true;
    }
  }

  if (filtered.length === 0) {
    payload.note = '该条件下没有查询到记录';
  }

  return payload;
}
