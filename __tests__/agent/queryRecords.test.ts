import type { Api, RecordRow, TagRow, TypeRow } from '@pennyspring/api';

import {
  parseQueryArguments,
  projectQueryResult,
} from '../../src/agent/projection/record';
import { buildSystemPrompt } from '../../src/agent/projection/context';
import {
  createQueryRecordsTool,
  QUERY_RECORDS_TOOL_NAME,
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
  createRecord(4, 4, 10000, 100, at(2026, 9, 20), {
    charge: 100,
    remark: '转到储蓄卡',
  }),
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
    expect(() => parseQueryArguments('{"limit":0}')).toThrow(
      'limit 必须在 1 到 50',
    );
    expect(() => parseQueryArguments('{"limit":51}')).toThrow(
      'limit 必须在 1 到 50',
    );
    expect(() => parseQueryArguments('{"groupBy":"week"}')).toThrow(
      'groupBy 不支持 week',
    );
    expect(() => parseQueryArguments('{"typeIds":[1,-2]}')).toThrow(
      'typeIds 必须是正整数数组',
    );
  });

  it('拒绝非法 JSON', () => {
    expect(() => parseQueryArguments('{oops')).toThrow(
      '查询参数不是合法的 JSON',
    );
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

  it('明细返回记录 id 供修改记录引用', () => {
    const result = project({ from: '2026-09-01', to: '2026-09-30' });

    expect(result.records?.map(record => record.id)).toEqual([4, 3, 2]);
  });

  it('关键词只匹配备注，并仅在命中时返回备注', () => {
    const withKeyword = project({ keyword: '工资' });
    const withoutKeyword = project({});

    expect(withKeyword.count).toBe(1);
    expect(withKeyword.records?.[0]?.remark).toBe('九月工资');
    expect(
      withoutKeyword.records?.every(record => record.remark === undefined),
    ).toBe(true);
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
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createApi(overrides: { getRecords?: jest.Mock } = {}): Api {
    return {
      record: {
        getByBook: overrides.getRecords ?? jest.fn(async () => RECORDS),
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

  function createExecute(api: Api = createApi()) {
    const tool = createQueryRecordsTool({
      api,
      booksId: 1,
      bookName: '日常账本',
    });
    return tool.execute as (
      input: Record<string, unknown>,
      options: unknown,
    ) => Promise<string>;
  }

  it('读取当前账本数据并返回裁剪后的 JSON', async () => {
    const execute = createExecute();
    const output = JSON.parse(
      await execute({ from: '2026-09-01', to: '2026-09-30' }, {}),
    );

    expect(output).toMatchObject({
      book: '日常账本',
      count: 3,
      range: { from: '2026-09-01', to: '2026-09-30' },
    });
  });

  it('非法参数抛出统一工具错误', async () => {
    const execute = createExecute();

    await expect(execute({ from: '2026-02-30' }, {})).rejects.toThrow(
      '工具 queryRecords 执行失败：from 不是合法日期：2026-02-30',
    );
    expect(QUERY_RECORDS_TOOL_NAME).toBe('queryRecords');
  });

  it('读取账本失败时抛出统一工具错误', async () => {
    const getRecords = jest.fn(async () => {
      throw new Error('database down');
    });
    const execute = createExecute(createApi({ getRecords }));

    await expect(execute({}, {})).rejects.toThrow(
      '工具 queryRecords 执行失败：database down',
    );
  });
});

describe('buildSystemPrompt', () => {
  it('注入账本与当前日期，声明工具约束且不包含类型字典', () => {
    const prompt = buildSystemPrompt({
      bookName: '日常账本',
      today: '2026-10-27',
    });

    expect(prompt).toContain('日常账本');
    expect(prompt).toContain('2026-10-27');
    expect(prompt).toContain('listTypes');
    expect(prompt).toContain('createRecord');
    expect(prompt).toContain('updateRecord');
    expect(prompt).toContain('修改记录前必须先调用 queryRecords');
    expect(prompt).toContain('用户确认');
    expect(prompt).toContain('金额单位：元');
    expect(prompt).toContain('attachmentIds');
    expect(prompt).not.toContain('- 1 餐饮（支出）');
    expect(prompt).not.toContain('- 2 午饭（支出，父类型：餐饮）');
  });

  it('声明截图快捷记账免审批并保留修改记录的确认', () => {
    const prompt = buildSystemPrompt({
      bookName: '日常账本',
      today: '2026-10-27',
      autoApproveCreate: true,
    });

    expect(prompt).toContain('本次截图快捷记账已开启免审批');
    expect(prompt).toContain('直接写入账本');
    expect(prompt).toContain('修改已有记录');
    expect(prompt).toContain('调用后会先请用户确认');
  });
});
