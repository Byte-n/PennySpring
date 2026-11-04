import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  VISIBILITY,
  type Api,
  type AssetRow,
  type DraftItem,
  type TypeRow,
} from '@pennyspring/api';

import {
  createQuickBookDraftTools,
  normalizeRecordDraftItems,
  SAVE_RECORD_DRAFTS_TOOL_NAME,
  type NormalizeRecordDraftItemsParams,
  type SaveRecordDraftsInput,
} from '../../src/agent/tools/saveRecordDrafts';

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
  typeRow({ id: 2, name: '餐饮', typeCategory: RECORD_TYPE_CATEGORY.expense }),
  typeRow({ id: 3, name: '打车', typeCategory: RECORD_TYPE_CATEGORY.expense }),
  typeRow({
    id: 4,
    name: '转账',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
  }),
  typeRow({
    id: 5,
    name: '其他账本类型',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    booksId: 2,
  }),
];

const ASSETS: AssetRow[] = [
  assetRow({ id: 20, name: '现金' }),
  assetRow({ id: 21, name: '招行卡', sort: 2 }),
  assetRow({ id: 22, name: '其他账本资产', booksId: 2 }),
];

const NOW = new Date(2026, 10, 4, 12, 34, 0, 0).getTime();

function normalize(
  input: SaveRecordDraftsInput,
  overrides: Partial<NormalizeRecordDraftItemsParams> = {},
): DraftItem[] {
  return normalizeRecordDraftItems({
    input,
    booksId: 1,
    preset: { assetId: 0, typeId: 0 },
    types: TYPES,
    assets: ASSETS,
    now: NOW,
    ...overrides,
  });
}

function createApi(
  overrides: {
    updateItems?: jest.Mock;
    createMany?: jest.Mock;
  } = {},
): Api {
  return {
    type: { getAll: jest.fn(async () => TYPES) },
    asset: { getByBook: jest.fn(async () => ASSETS) },
    quickBookDraft: {
      updateItems:
        overrides.updateItems ??
        jest.fn(async (id: string, items: DraftItem[]) => ({
          id,
          status: 'pending',
          items,
        })),
    },
    record: {
      createMany: overrides.createMany ?? jest.fn(async () => [{ id: 99 }]),
    },
  } as unknown as Api;
}

function createSaveExecute(api: Api) {
  const tools = createQuickBookDraftTools({
    api,
    booksId: 1,
    draftId: 'draft-1',
    preset: { assetId: 0, typeId: 0 },
    imagePath: 'file:///draft/one.jpg',
  });
  const tool = tools[SAVE_RECORD_DRAFTS_TOOL_NAME];
  if (!tool || typeof tool.execute !== 'function') {
    throw new Error('missing saveRecordDrafts tool');
  }
  return tool.execute as (
    input: SaveRecordDraftsInput,
    options: unknown,
  ) => Promise<{ draftId: string; itemCount: number }>;
}

describe('normalizeRecordDraftItems', () => {
  it('locks preset type and asset and ignores model supplied values', () => {
    const items = normalize(
      {
        summary: '两笔餐饮',
        items: [
          {
            typeId: 3,
            assetId: 21,
            amount: 36.5,
            remark: '午餐',
          },
        ],
      },
      { preset: { assetId: 20, typeId: 2 } },
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      status: 'pending',
      recordId: 0,
      typeId: 2,
      typeName: '餐饮',
      assetId: 20,
      assetName: '现金',
      amountCents: 3_650,
      remark: '午餐',
      tagIds: [],
      reimbursable: false,
    });
  });

  it('clears ids that do not belong to the target book and adds Chinese warnings', () => {
    const items = normalize({
      items: [
        {
          typeId: 999,
          assetId: 888,
          intoAssetId: 777,
          amount: 10,
        },
        {
          typeId: 5,
          assetId: 22,
          amount: 10,
        },
        {
          typeId: -1,
          assetId: 1.5,
          amount: 10,
        },
      ],
    });

    expect(items[0]).toMatchObject({
      typeId: 0,
      typeName: '',
      assetId: 0,
      assetName: '',
      intoAssetId: 0,
      intoAssetName: '',
    });
    expect(items[0]?.warnings.join('')).toContain('类型');
    expect(items[0]?.warnings.join('')).toContain('资产');
    expect(items[1]).toMatchObject({
      typeId: 0,
      assetId: 0,
      intoAssetId: 0,
    });
    expect(items[1]?.warnings.length).toBeGreaterThanOrEqual(2);
    expect(items[2]).toMatchObject({
      typeId: 0,
      assetId: 0,
    });
    expect(items[2]?.warnings.length).toBeGreaterThanOrEqual(2);
    for (const item of items) {
      for (const warning of item.warnings) {
        expect(warning).toMatch(/[\u4e00-\u9fa5]/);
      }
    }
  });

  it('resolves transfer assets from the target book', () => {
    const items = normalize({
      items: [
        {
          typeId: 4,
          assetId: 20,
          intoAssetId: 21,
          amount: 100,
        },
      ],
    });

    expect(items[0]).toMatchObject({
      typeId: 4,
      typeName: '转账',
      assetId: 20,
      assetName: '现金',
      intoAssetId: 21,
      intoAssetName: '招行卡',
    });
  });

  it('converts yuan to cents and warns when amount is missing or invalid', () => {
    const items = normalize({
      items: [
        { typeId: 2, amount: 36.5, charge: 1.5 },
        { typeId: 2 },
        { typeId: 2, amount: 0 },
        { typeId: 2, amount: Number.POSITIVE_INFINITY },
        { typeId: 2, amount: 100_000_001 },
      ],
    });

    expect(items[0]).toMatchObject({ amountCents: 3_650, chargeCents: 150 });
    expect(items[0]?.warnings).toEqual([]);
    expect(items[1]?.amountCents).toBeNull();
    expect(items[1]?.warnings.join('')).toContain('金额');
    expect(items[2]?.amountCents).toBeNull();
    expect(items[3]?.amountCents).toBeNull();
    expect(items[4]?.amountCents).toBeNull();
    expect(items[2]?.warnings.join('')).toContain('金额');
    expect(items[3]?.warnings.join('')).toContain('金额');
    expect(items[4]?.warnings.join('')).toContain('金额');
  });

  it('warns and falls back to zero when charge is invalid', () => {
    const items = normalize({
      items: [{ typeId: 2, amount: 10, charge: -1 }],
    });

    expect(items[0]?.chargeCents).toBe(0);
    expect(items[0]?.warnings.join('')).toContain('手续费');
  });

  it('truncates more than 20 items and warns on the last kept item', () => {
    const items = normalize({
      items: Array.from({ length: 21 }, (_, index) => ({
        typeId: 2,
        amount: index + 1,
      })),
    });

    expect(items).toHaveLength(20);
    expect(items[19]?.warnings.join('')).toContain('20');
    expect(items[19]?.warnings.join('')).toContain('截断');
  });

  it('combines date and time into a millisecond timestamp', () => {
    const items = normalize({
      items: [{ typeId: 2, amount: 10, date: '2026-11-01', time: '08:09' }],
    });

    expect(items[0]?.recordTime).toBe(
      new Date(2026, 10, 1, 8, 9, 0, 0).getTime(),
    );
    expect(items[0]?.warnings).toEqual([]);
  });

  it('defaults missing date and time to today and the current time', () => {
    const items = normalize({ items: [{ typeId: 2, amount: 10 }] });

    expect(items[0]?.recordTime).toBe(NOW);
    expect(items[0]?.warnings).toEqual([]);
  });

  it('warns and falls back to the current time for invalid date or time', () => {
    const invalidDate = normalize({
      items: [{ typeId: 2, amount: 10, date: '2026-13-99', time: '08:09' }],
    });
    const invalidTime = normalize({
      items: [{ typeId: 2, amount: 10, date: '2026-11-01', time: '25:99' }],
    });

    expect(invalidDate[0]?.recordTime).toBe(NOW);
    expect(invalidDate[0]?.warnings.join('')).toContain('日期');
    expect(invalidTime[0]?.recordTime).toBe(NOW);
    expect(invalidTime[0]?.warnings.join('')).toContain('时间');
  });

  it('keeps existing warnings and always leaves tagIds empty', () => {
    const items = normalize({
      items: [
        {
          typeId: 2,
          amount: 10,
          tagIds: [1, 2],
          warnings: ['模型提示'],
        } as unknown as SaveRecordDraftsInput['items'][number],
      ],
    });

    expect(items[0]?.tagIds).toEqual([]);
    expect(items[0]?.warnings[0]).toBe('模型提示');
  });
});

describe('createQuickBookDraftTools', () => {
  it('exposes only listTypes, listAssets and saveRecordDrafts', () => {
    const tools = createQuickBookDraftTools({
      api: createApi(),
      booksId: 1,
      draftId: 'draft-1',
      preset: { assetId: 0, typeId: 0 },
      imagePath: 'file:///draft/one.jpg',
    });

    expect(Object.keys(tools).sort()).toEqual([
      'listAssets',
      'listTypes',
      'saveRecordDrafts',
    ]);
    for (const forbidden of [
      'createRecords',
      'updateRecords',
      'deleteRecords',
      'queryRecords',
      'listTags',
    ]) {
      expect(tools).not.toHaveProperty(forbidden);
    }
  });
});

describe('saveRecordDrafts tool', () => {
  it('writes the normalized draft through updateItems and never writes records', async () => {
    const updateItems = jest.fn(async (id: string, items: DraftItem[]) => ({
      id,
      status: 'pending',
      items,
    }));
    const createMany = jest.fn(async () => [{ id: 99 }]);
    const execute = createSaveExecute(createApi({ updateItems, createMany }));

    const result = await execute(
      {
        summary: '午餐两笔',
        items: [
          { typeId: 2, amount: 36.5, remark: '午餐' },
          { typeId: 3, amount: 20, remark: '打车' },
        ],
      },
      {},
    );

    expect(result).toEqual({ draftId: 'draft-1', itemCount: 2 });
    expect(updateItems).toHaveBeenCalledTimes(1);
    expect(updateItems).toHaveBeenCalledWith(
      'draft-1',
      expect.arrayContaining([
        expect.objectContaining({ typeId: 2, amountCents: 3_650 }),
        expect.objectContaining({ typeId: 3, amountCents: 2_000 }),
      ]),
      { assetId: 0, typeId: 0 },
      { agentSummary: '午餐两笔' },
    );
    expect(createMany).not.toHaveBeenCalled();
  });

  it('overwrites the same draft when called repeatedly', async () => {
    const updateItems = jest.fn(async (id: string, items: DraftItem[]) => ({
      id,
      status: 'pending',
      items,
    }));
    const execute = createSaveExecute(createApi({ updateItems }));

    await execute({ items: [{ typeId: 2, amount: 10 }] }, {});
    const second = await execute({ items: [{ typeId: 3, amount: 20 }] }, {});

    expect(second.itemCount).toBe(1);
    expect(updateItems).toHaveBeenCalledTimes(2);
    expect(updateItems.mock.calls[1]?.[1]).toEqual([
      expect.objectContaining({ typeId: 3, amountCents: 2_000 }),
    ]);
  });
});
