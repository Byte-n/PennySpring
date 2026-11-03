import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  VISIBILITY,
  type Api,
  type AssetRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  createCreateRecordsTool,
  type CreateRecordsToolDeps,
} from '../../src/agent/tools/createRecords';

function typeRow(
  overrides: Partial<TypeRow> & Pick<TypeRow, 'id' | 'name' | 'typeCategory'>,
): TypeRow {
  return {
    booksId: 1,
    parentId: 0,
    icon: '',
    isSystem: SYSTEM_STATUS.custom,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as TypeRow;
}

function tagRow(
  overrides: Partial<TagRow> & Pick<TagRow, 'id' | 'name'>,
): TagRow {
  return {
    booksId: 1,
    invisible: VISIBILITY.visible,
    icon: '',
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as TagRow;
}

function assetRow(
  overrides: Partial<AssetRow> & Pick<AssetRow, 'id' | 'name'>,
): AssetRow {
  return {
    booksId: 1,
    balance: 0,
    totalAmount: 0,
    billingDate: 0,
    repaymentDate: 0,
    type: ASSET_TYPE.capitalAccount,
    classification: ASSET_CLASSIFICATION.cash,
    invisible: VISIBILITY.visible,
    openBank: '',
    cardNo: '',
    remark: '',
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as AssetRow;
}

const TYPES: TypeRow[] = [
  typeRow({
    id: 2,
    name: '三餐',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
  }),
];

const TAGS: TagRow[] = [tagRow({ id: 10, name: '朋友' })];

const ASSETS: AssetRow[] = [assetRow({ id: 20, name: '现金' })];

function createApi(
  overrides: {
    createMany?: jest.Mock;
    getTypes?: jest.Mock;
  } = {},
): Api {
  return {
    type: { getAll: overrides.getTypes ?? jest.fn(async () => TYPES) },
    tag: { getAll: jest.fn(async () => TAGS) },
    asset: { getByBook: jest.fn(async () => ASSETS) },
    record: {
      createMany:
        overrides.createMany ??
        jest.fn(async (inputs: unknown[]) =>
          inputs.map((_, index) => ({ id: 99 + index })),
        ),
    },
  } as unknown as Api;
}

function createExecute(
  api: Api,
  overrides: Omit<CreateRecordsToolDeps, 'api' | 'booksId'> = {},
) {
  const created = createCreateRecordsTool({ api, booksId: 1, ...overrides });
  return created.execute as (
    input: Record<string, unknown>,
    options: unknown,
  ) => Promise<unknown>;
}

describe('createCreateRecordsTool', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes the whole batch in one call and returns compact results', async () => {
    const createMany = jest.fn(async (inputs: unknown[]) =>
      inputs.map((_, index) => ({ id: 99 + index })),
    );
    const execute = createExecute(createApi({ createMany }));

    const output = await execute(
      {
        records: [
          {
            typeId: 2,
            amount: 30,
            date: '2026-10-30',
            time: '12:34',
            remark: '午饭',
            tagIds: [10],
          },
          {
            typeId: 2,
            amount: 12.5,
            date: '2026-10-30',
            time: '18:00',
            remark: '晚饭',
          },
        ],
      },
      {},
    );

    expect(createMany).toHaveBeenCalledTimes(1);
    expect(createMany).toHaveBeenCalledWith([
      expect.objectContaining({
        typeId: 2,
        booksId: 1,
        amount: 3000,
        remark: '午饭',
        tagIds: [10],
        assetId: 0,
      }),
      expect.objectContaining({
        typeId: 2,
        booksId: 1,
        amount: 1250,
        remark: '晚饭',
        assetId: 0,
      }),
    ]);
    expect(output).toEqual({
      ok: true,
      count: 2,
      records: [
        {
          recordId: 99,
          category: 'expense',
          type: '三餐',
          amountYuan: 30,
          recordTime: '2026-10-30 12:34',
        },
        {
          recordId: 100,
          category: 'expense',
          type: '三餐',
          amountYuan: 12.5,
          recordTime: '2026-10-30 18:00',
        },
      ],
    });
  });

  it('does not write when any item is invalid', async () => {
    const createMany = jest.fn();
    const execute = createExecute(createApi({ createMany }));

    await expect(
      execute(
        {
          records: [
            { typeId: 2, amount: 30 },
            { typeId: 999, amount: 20 },
          ],
        },
        {},
      ),
    ).rejects.toThrow('第 2 笔：类型 ID 999 不存在');
    expect(createMany).not.toHaveBeenCalled();
  });

  it('wraps database write failures with the tool name', async () => {
    const createMany = jest.fn(async () => {
      throw new Error('database locked');
    });
    const execute = createExecute(createApi({ createMany }));

    await expect(
      execute({ records: [{ typeId: 2, amount: 30 }] }, {}),
    ).rejects.toThrow('工具 createRecords 执行失败：database locked');
  });

  it('wraps metadata read failures with the tool name', async () => {
    const getTypes = jest.fn(async () => {
      throw new Error('metadata down');
    });
    const execute = createExecute(createApi({ getTypes }));

    await expect(
      execute({ records: [{ typeId: 2, amount: 30 }] }, {}),
    ).rejects.toThrow('工具 createRecords 执行失败：metadata down');
  });

  it('attaches image attachments per record', async () => {
    const createMany = jest.fn(async (inputs: unknown[]) =>
      inputs.map((_, index) => ({ id: 100 + index })),
    );
    const execute = createExecute(createApi({ createMany }), {
      attachments: [
        {
          id: 'att_1',
          ref: 'media:shot.png',
          mediaType: 'image/jpeg',
          filename: 'shot.jpg',
        },
        {
          id: 'att_2',
          ref: 'media:receipt.png',
          mediaType: 'image/jpeg',
          filename: 'receipt.jpg',
        },
      ],
    });

    await execute(
      {
        records: [
          { typeId: 2, amount: 30 },
          {
            typeId: 2,
            amount: 40,
            attachmentIds: ['att_2', 'att_1'],
          },
        ],
      },
      {},
    );

    const inputs = createMany.mock.calls[0]?.[0] as Array<
      Record<string, unknown>
    >;
    expect(inputs[0]).not.toHaveProperty('imagePaths');
    expect(inputs[1]).toEqual(
      expect.objectContaining({
        imagePaths: ['media:receipt.png', 'media:shot.png'],
      }),
    );
  });

  it('rejects unknown attachment ids before writing', async () => {
    const createMany = jest.fn();
    const execute = createExecute(createApi({ createMany }), {
      attachments: [
        {
          id: 'att_1',
          ref: 'media:shot.png',
          mediaType: 'image/jpeg',
          filename: 'shot.jpg',
        },
      ],
    });

    await expect(
      execute(
        {
          records: [{ typeId: 2, amount: 30, attachmentIds: ['att_missing'] }],
        },
        {},
      ),
    ).rejects.toThrow('未知附件 id：att_missing');
    expect(createMany).not.toHaveBeenCalled();
  });

  it('notifies after the whole batch is created', async () => {
    const onRecordsChanged = jest.fn();
    const execute = createExecute(createApi(), { onRecordsChanged });

    await execute({ records: [{ typeId: 2, amount: 30 }] }, {});

    expect(onRecordsChanged).toHaveBeenCalledTimes(1);
  });

  it('does not notify when the create is rejected', async () => {
    const onRecordsChanged = jest.fn();
    const execute = createExecute(
      createApi({
        createMany: jest.fn(async () => {
          throw new Error('database locked');
        }),
      }),
      { onRecordsChanged },
    );

    await expect(
      execute({ records: [{ typeId: 2, amount: 30 }] }, {}),
    ).rejects.toThrow('工具 createRecords 执行失败：database locked');
    expect(onRecordsChanged).not.toHaveBeenCalled();
  });
});
