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

import { createCreateRecordTool } from '../../src/agent/tools/createRecord';

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
    create?: jest.Mock;
    getTypes?: jest.Mock;
  } = {},
): Api {
  return {
    type: { getAll: overrides.getTypes ?? jest.fn(async () => TYPES) },
    tag: { getAll: jest.fn(async () => TAGS) },
    asset: { getByBook: jest.fn(async () => ASSETS) },
    record: {
      create:
        overrides.create ??
        jest.fn(async () => ({
          id: 99,
        })),
    },
  } as unknown as Api;
}

function createExecute(api: Api) {
  const created = createCreateRecordTool({ api, booksId: 1 });
  return created.execute as (
    input: Record<string, unknown>,
    options: unknown,
  ) => Promise<unknown>;
}

describe('createCreateRecordTool', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes the record and returns a compact result', async () => {
    const create = jest.fn(async () => ({ id: 99 }));
    const api = createApi({ create });
    const execute = createExecute(api);

    const output = await execute(
      {
        typeId: 2,
        amount: 30,
        date: '2026-10-30',
        time: '12:34',
        remark: '午饭',
        tagIds: [10],
      },
      {},
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        typeId: 2,
        booksId: 1,
        amount: 3000,
        remark: '午饭',
        tagIds: [10],
        assetId: 0,
      }),
    );
    expect(output).toEqual({
      ok: true,
      recordId: 99,
      category: 'expense',
      type: '三餐',
      amountYuan: 30,
      recordTime: '2026-10-30 12:34',
    });
  });

  it('does not write when validation fails', async () => {
    const create = jest.fn();
    const api = createApi({ create });
    const execute = createExecute(api);

    await expect(execute({ typeId: 999, amount: 30 }, {})).rejects.toThrow(
      '工具 createRecord 执行失败：类型 ID 999 不存在',
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('wraps database write failures with the tool name', async () => {
    const create = jest.fn(async () => {
      throw new Error('database locked');
    });
    const api = createApi({ create });
    const execute = createExecute(api);

    await expect(execute({ typeId: 2, amount: 30 }, {})).rejects.toThrow(
      '工具 createRecord 执行失败：database locked',
    );
  });

  it('wraps metadata read failures with the tool name', async () => {
    const getTypes = jest.fn(async () => {
      throw new Error('metadata down');
    });
    const execute = createExecute(createApi({ getTypes }));

    await expect(execute({ typeId: 2, amount: 30 }, {})).rejects.toThrow(
      '工具 createRecord 执行失败：metadata down',
    );
  });
});
