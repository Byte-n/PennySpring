import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  SYSTEM_STATUS,
  VISIBILITY,
  type Api,
  type AssetRow,
  type RecordDetail,
  type RecordRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  createUpdateRecordTool,
  type UpdateRecordToolDeps,
} from '../../src/agent/tools/updateRecord';

const RECORD_TIME = new Date(2026, 9, 30, 12, 34).getTime();

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
    id: 1,
    name: '餐饮',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
  }),
  typeRow({
    id: 2,
    name: '三餐',
    parentId: 1,
    typeCategory: RECORD_TYPE_CATEGORY.expense,
  }),
  typeRow({
    id: 4,
    name: '退款',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
  }),
];

const TAGS: TagRow[] = [tagRow({ id: 10, name: '朋友' })];
const ASSETS: AssetRow[] = [assetRow({ id: 20, name: '现金' })];

function recordRow(overrides: Partial<RecordRow> = {}): RecordRow {
  return {
    id: 100,
    typeId: 2,
    assetId: 20,
    intoAssetId: 0,
    booksId: 1,
    amount: 3000,
    finalAmount: 3000,
    charge: 0,
    remark: '午饭',
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: RECORD_TIME,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as RecordRow;
}

function recordDetail(overrides: Partial<RecordDetail> = {}): RecordDetail {
  return {
    record: recordRow(),
    tagIds: [10],
    imagePaths: ['file://a.jpg'],
    relatedRecordIds: [],
    ...overrides,
  };
}

function createApi(
  overrides: {
    detail?: jest.Mock;
    update?: jest.Mock;
  } = {},
): Api {
  return {
    record: {
      getDetailById:
        overrides.detail ?? jest.fn(async () => recordDetail()),
      update:
        overrides.update ??
        jest.fn(async (input: Partial<RecordRow>) => ({
          ...recordRow(),
          ...input,
        })),
    },
    type: { getAll: jest.fn(async () => TYPES) },
    tag: { getAll: jest.fn(async () => TAGS) },
    asset: { getByBook: jest.fn(async () => ASSETS) },
  } as unknown as Api;
}

function createExecute(
  api: Api,
  overrides: Omit<UpdateRecordToolDeps, 'api' | 'booksId'> = {},
) {
  const created = createUpdateRecordTool({ api, booksId: 1, ...overrides });
  return created.execute as (
    input: Record<string, unknown>,
    options: unknown,
  ) => Promise<unknown>;
}

describe('createUpdateRecordTool', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates the record with merged fields and returns the changes', async () => {
    const update = jest.fn(async (input: Partial<RecordRow>) => ({
      ...recordRow(),
      ...input,
    }));
    const execute = createExecute(createApi({ update }));

    const output = await execute({ recordId: 100, amount: 35 }, {});

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 100,
        booksId: 1,
        typeId: 2,
        amount: 3500,
        remark: '午饭',
        assetId: 20,
        tagIds: [10],
        imagePaths: ['file://a.jpg'],
        recordTime: RECORD_TIME,
      }),
    );
    expect(output).toEqual({
      ok: true,
      recordId: 100,
      changes: ['金额'],
      category: 'expense',
      type: '餐饮 / 三餐',
      amountYuan: 35,
      recordTime: '2026-10-30 12:34',
    });
  });

  it('appends the image attachments selected by the model', async () => {
    const update = jest.fn(async (input: Partial<RecordRow>) => ({
      ...recordRow(),
      ...input,
    }));
    const execute = createExecute(createApi({ update }), {
      attachments: [
        {
          id: 'att_1',
          ref: 'media:receipt.png',
          mediaType: 'image/jpeg',
          filename: 'receipt.jpg',
        },
      ],
    });

    await execute(
      { recordId: 100, attachmentIds: ['att_1'] },
      {},
    );

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        imagePaths: ['file://a.jpg', 'media:receipt.png'],
      }),
    );
  });

  it('rejects unknown attachment ids before reading or writing', async () => {
    const detail = jest.fn(async () => recordDetail());
    const update = jest.fn();
    const execute = createExecute(createApi({ detail, update }), {
      attachments: [],
    });

    await expect(
      execute({ recordId: 100, attachmentIds: ['att_missing'] }, {}),
    ).rejects.toThrow('未知附件 id：att_missing');
    expect(detail).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('does not write when nothing changes', async () => {
    const update = jest.fn();
    const execute = createExecute(createApi({ update }));

    await expect(execute({ recordId: 100 }, {})).rejects.toThrow(
      '工具 updateRecord 执行失败：没有需要修改的内容',
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects editing a refund record', async () => {
    const update = jest.fn();
    const detail = jest.fn(async () =>
      recordDetail({ record: recordRow({ typeId: 4 }) }),
    );
    const execute = createExecute(createApi({ detail, update }));

    await expect(execute({ recordId: 100, amount: 30 }, {})).rejects.toThrow(
      '退款/报销记录暂不支持在助手中修改，请在 App 内操作',
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('wraps update failures with the tool name', async () => {
    const update = jest.fn(async () => {
      throw new Error('database locked');
    });
    const execute = createExecute(createApi({ update }));

    await expect(execute({ recordId: 100, amount: 35 }, {})).rejects.toThrow(
      '工具 updateRecord 执行失败：database locked',
    );
  });
});
