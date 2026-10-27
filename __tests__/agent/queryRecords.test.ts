import type { Api, RecordRow, TagRow, TypeRow } from '@pennyspring/api';

import {
  parseQueryArguments,
  projectQueryResult,
} from '../../src/agent/projection/record';
import { buildSystemPrompt } from '../../src/agent/projection/context';
import {
  createQueryRecordsTool,
  QUERY_RECORDS_TOOL,
} from '../../src/agent/tools/queryRecords';

const BASE_ROW = {
  assetId: 0,
  intoAssetId: 0,
  booksId: 1,
  charge: 0,
  reimbursable: 'none',
  remark: '',
  createdTime: 0,
  updatedTime: 0,
} as const;

function createType(
  id: number,
  name: string,
  typeCategory: TypeRow['typeCategory'],
  parentId = 0,
): TypeRow {
  return {
    id,
    booksId: 1,
    parentId,
    name,
    icon: '',
    typeCategory,
    isSystem: 'system',
    specialBehavior: '',
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
  };
}

function createRecord(
  id: number,
  typeId: number,
  amount: number,
  finalAmount: number,
  recordTime: number,
  extra: Partial<RecordRow> = {},
): RecordRow {
  return {
    ...BASE_ROW,
    id,
    typeId,
    amount,
    finalAmount,
    recordTime,
    ...extra,
  };
}

function createTag(id: number, name: string): TagRow {
  return {
    id,
    booksId: 1,
    name,
    invisible: 'visible',
    icon: '',
    createdTime: 0,
    updatedTime: 0,
  };
}

const TYPES: TypeRow[] = [
  createType(1, '餐饮', 'expense'),
  createType(2, '午饭', 'expense', 1),
  createType(3, '工资', 'income'),
  createType(4, '账户转账', 'transfer'),
];
const TAGS: TagRow[] = [createTag(10, '日常'), createTag(11, '工作')];

function at(year: number, month: number, day: number, hour = 12): number {
  return new Date(year, month - 1, day, hour, 0, 0, 0).getTime();
}

const RECORDS: RecordRow[] = [
  createRecord(1, 1, 1000, 1200, at(2026, 8, 31), { remark: '八月最后一顿' }),
  createRecord(2, 2, 2000, 2000, at(2026, 9, 1), { remark: '公司楼下午饭' }),
  createRecord(3, 3, 500000, 499000, at(2026, 9, 15), { remark: '九月工资' }),
  createRecord(4, 4, 10000, 100, at(2026, 9, 20), { charge: 100, remark: '转到储蓄卡' }),
  createRecord(5, 1, 3000, 3000, at(2026, 10, 1), { remark: '国庆聚餐' }),
];
const RECORD_TAGS = [
  { recordId: 2, tagId: 10 },
  { recordId: 2, tagId: 11 },
  { recordId: 3, tagId: 11 },
];

function project(overrides: Record<string, unknown> = {}) {
  return projectQueryResult({
    bookName: '日常账本',
    options: parseQueryArguments(JSON.stringify(overrides)),
    records: RECORDS,
    types: TYPES,
    tags: TAGS,
    recordTags: RECORD_TAGS,
  });
}

describe('parseQueryArguments', () => {
  it('空参数使用默认值', () => {
    expect(parseQueryArguments('')).toEqual({
      typeIds: [],
      tagIds: [],
      keyword: '',
      groupBy: 'none',
      limit: 20,
    });
  });

  it('拒绝非法日期与日期区间', () => {
    expect(() => parseQueryArguments('{"from":"2026-02-30"}')).toThrow(
      'from 不是合法日期',
    );
    expect(() =>
      parseQueryArguments('{"from":"2026-09-10","to":"2026-09-01"}'),
    ).toThrow('起始日期不能晚于结束日期');
  });

  it('拒绝非法 limit、groupBy 与类型数组', () => {
    expect(() => parseQueryArguments('{"limit":0}')).toThrow('limit 必须在 1 到 50');
    expect(() => parseQueryArguments('{"limit":51}')).toThrow('limit 必须在 1 到 50');
    expect(() => parseQueryArguments('{"groupBy":"week"}')).toThrow(
      'groupBy 不支持 week',
    );
    expect(() => parseQueryArguments('{"typeIds":[1,-2]}')).toThrow(
      'typeIds 必须是正整数数组',
    );
  });

  it('拒绝非法 JSON', () => {
    expect(() => parseQueryArguments('{oops')).toThrow('查询参数不是合法的 JSON');
  });
});

describe('projectQueryResult', () => {
  it('按日期闭区间过滤，并把分换算成元', () => {
    const result = project({ from: '2026-09-01', to: '2026-09-30' });

    expect(result.count).toBe(3);
    expect(result.totals).toEqual({
      expense: 20,
      income: 4990,
      transfer: 100,
    });
  });

  it('支出与收入使用 finalAmount，转账不计入收支', () => {
    const result = project({ from: '2026-09-01', to: '2026-09-30' });

    expect(result.totals.expense).toBe(20);
    expect(result.totals.income).toBe(4990);
    expect(result.totals.transfer).toBe(100);
  });

  it('按一级类型筛选时包含其子类型', () => {
    const result = project({ typeIds: [1] });

    expect(result.count).toBe(3);
    expect(result.records?.map(record => record.type)).toEqual([
      '餐饮',
      '午饭',
      '餐饮',
    ]);
  });

  it('按标签过滤为任一匹配，并返回标签名', () => {
    const result = project({ tagIds: [10] });

    expect(result.count).toBe(1);
    expect(result.records?.[0]).toMatchObject({
      type: '午饭',
      tags: ['日常', '工作'],
    });
  });

  it('关键词只匹配备注，并仅在命中时返回备注', () => {
    const withKeyword = project({ keyword: '工资' });
    const withoutKeyword = project({});

    expect(withKeyword.count).toBe(1);
    expect(withKeyword.records?.[0]?.remark).toBe('九月工资');
    expect(withoutKeyword.records?.every(record => record.remark === undefined)).toBe(
      true,
    );
  });

  it('groupBy=type 聚合收支并省略明细', () => {
    const result = project({
      from: '2026-09-01',
      to: '2026-09-30',
      groupBy: 'type',
    });

    expect(result.records).toBeUndefined();
    expect(result.groups).toEqual([
      {
        key: '3',
        label: '工资',
        category: '收入',
        count: 1,
        expense: 0,
        income: 4990,
        transfer: 0,
      },
      {
        key: '2',
        label: '午饭',
        category: '支出',
        count: 1,
        expense: 20,
        income: 0,
        transfer: 0,
      },
      {
        key: '4',
        label: '账户转账',
        category: '转账',
        count: 1,
        expense: 0,
        income: 0,
        transfer: 100,
      },
    ]);
  });

  it('groupBy=day 按日期升序聚合', () => {
    const result = project({
      from: '2026-09-01',
      to: '2026-09-30',
      groupBy: 'day',
    });

    expect(result.groups?.map(group => group.key)).toEqual([
      '2026-09-01',
      '2026-09-15',
      '2026-09-20',
    ]);
  });

  it('groupBy=tag 时未打标签的记录归入单独分组', () => {
    const result = project({
      from: '2026-09-01',
      to: '2026-09-30',
      groupBy: 'tag',
    });

    const labels = result.groups?.map(group => group.label);

    expect(labels).toContain('日常');
    expect(labels).toContain('工作');
    expect(labels).toContain('未打标签');
  });

  it('限制明细条数并标记截断', () => {
    const result = project({ limit: 2 });

    expect(result.records).toHaveLength(2);
    expect(result.count).toBe(5);
    expect(result.truncated).toBe(true);
    expect(result.records?.map(record => record.time)).toEqual([
      '2026-10-01 12:00',
      '2026-09-20 12:00',
    ]);
  });

  it('转账明细返回转账金额与手续费，而不是 finalAmount', () => {
    const result = project({ typeIds: [4] });

    expect(result.records?.[0]).toMatchObject({
      type: '账户转账',
      category: '转账',
      amount: 100,
      charge: 1,
    });
  });

  it('无结果时给出明确提示', () => {
    const result = project({ from: '2026-01-01', to: '2026-01-31' });

    expect(result.count).toBe(0);
    expect(result.records).toEqual([]);
    expect(result.note).toBe('该条件下没有查询到记录');
  });
});

describe('createQueryRecordsTool', () => {
  function createApi(): Api {
    return {
      record: {
        getByBook: jest.fn(async () => RECORDS),
        getRecordTags: jest.fn(async () => RECORD_TAGS),
      },
      type: {
        getAll: jest.fn(async () => TYPES),
      },
      tag: {
        getAll: jest.fn(async () => TAGS),
      },
    } as unknown as Api;
  }

  it('读取当前账本数据并返回裁剪后的 JSON', async () => {
    const api = createApi();
    const execute = createQueryRecordsTool({
      api,
      booksId: 1,
      bookName: '日常账本',
    });

    const output = JSON.parse(
      await execute({
        id: 'call_1',
        name: QUERY_RECORDS_TOOL.name,
        arguments: '{"from":"2026-09-01","to":"2026-09-30"}',
      }),
    );

    expect(api.record.getByBook).toHaveBeenCalledWith(1);
    expect(api.record.getRecordTags).toHaveBeenCalledWith(1);
    expect(output).toMatchObject({
      book: '日常账本',
      count: 3,
      range: { from: '2026-09-01', to: '2026-09-30' },
    });
  });

  it('拒绝未知工具与非法参数', async () => {
    const execute = createQueryRecordsTool({
      api: createApi(),
      booksId: 1,
      bookName: '日常账本',
    });

    await expect(
      execute({ id: 'call_1', name: 'writeRecord', arguments: '{}' }),
    ).rejects.toThrow('不支持的工具：writeRecord');
    await expect(
      execute({ id: 'call_2', name: QUERY_RECORDS_TOOL.name, arguments: '{oops' }),
    ).rejects.toThrow('查询参数不是合法的 JSON');
  });
});

describe('buildSystemPrompt', () => {
  it('注入账本、当前日期与类型字典，并声明只读约束', () => {
    const prompt = buildSystemPrompt({
      bookName: '日常账本',
      today: '2026-10-27',
      types: TYPES,
    });

    expect(prompt).toContain('日常账本');
    expect(prompt).toContain('2026-10-27');
    expect(prompt).toContain('- 1 餐饮（支出）');
    expect(prompt).toContain('- 2 午饭（支出，父类型：餐饮）');
    expect(prompt).toContain('只能查询');
    expect(prompt).toContain('金额单位：元');
  });
});
