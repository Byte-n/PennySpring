import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  SYSTEM_STATUS,
  type IconValue,
  type TypeRow,
} from '@pennyspring/data';
import type { Api } from '@pennyspring/api';

jest.mock('../../src/features/quickBookDraft/bookApi', () => ({
  resolveBookApi: jest.fn(),
}));
jest.mock('../../src/stores/syncVersionStore', () => ({
  bumpRecordVersion: jest.fn(),
}));

import { resolveBookApi } from '../../src/features/quickBookDraft/bookApi';
import { bumpRecordVersion } from '../../src/stores/syncVersionStore';
import { runQuickTemplateRecord } from '../../src/agent/headless/runQuickTemplateRecord';
import type { DraftBookTarget } from '../../src/features/quickBookDraft/draftBook';
import type { QuickTemplate } from '../../src/screens/quickTemplate/types';

const NOW = new Date('2026-11-09T10:00:00+08:00').getTime();

const TARGET: DraftBookTarget = {
  kind: 'local',
  serverUrl: '',
  booksId: 1,
  bookName: '日常账本',
};

function typeRow(overrides: Partial<TypeRow> = {}): TypeRow {
  return {
    id: 1,
    booksId: 1,
    parentId: 0,
    name: '餐饮',
    icon: '' as IconValue,
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    isSystem: SYSTEM_STATUS.system,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
    sort: 0,
    createdTime: NOW,
    updatedTime: NOW,
    ...overrides,
  };
}

function template(overrides: Partial<QuickTemplate> = {}): QuickTemplate {
  return {
    id: 1,
    booksId: 1,
    name: '早餐',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    typeId: 1,
    amount: 1500,
    charge: 0,
    remark: '早餐',
    assetId: 10,
    intoAssetId: 0,
    reimbursable: false,
    tagIds: [],
    icon: '',
    sort: 1,
    createdTime: NOW,
    updatedTime: NOW,
    ...overrides,
  };
}

function createApi(
  templates: QuickTemplate[],
  types: TypeRow[],
  create: jest.Mock,
): Api {
  return {
    quickTemplate: {
      list: jest.fn().mockResolvedValue(templates),
    },
    type: {
      getAll: jest.fn().mockResolvedValue(types),
    },
    record: {
      create,
    },
  } as unknown as Api;
}

describe('runQuickTemplateRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a record from the template and bumps record version', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    jest
      .mocked(resolveBookApi)
      .mockResolvedValue(createApi([template()], [typeRow()], create));

    const result = await runQuickTemplateRecord({
      requestId: 'request-1',
      templateId: 1,
      target: TARGET,
    });

    expect(result).toEqual({ templateName: '早餐', amountCents: 1500 });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        booksId: 1,
        typeId: 1,
        amount: 1500,
        charge: 0,
        remark: '早餐',
        assetId: 10,
        reimbursable: REIMBURSABLE.notReimbursable,
        tagIds: [],
        imagePaths: [],
      }),
    );
    expect(bumpRecordVersion).toHaveBeenCalledTimes(1);
  });

  test('throws when the template no longer exists', async () => {
    const create = jest.fn();
    jest
      .mocked(resolveBookApi)
      .mockResolvedValue(createApi([], [typeRow()], create));

    await expect(
      runQuickTemplateRecord({
        requestId: 'request-2',
        templateId: 99,
        target: TARGET,
      }),
    ).rejects.toThrow('模板已失效，请打开应用刷新');
    expect(create).not.toHaveBeenCalled();
  });

  test('throws when the template type no longer exists', async () => {
    const create = jest.fn();
    jest
      .mocked(resolveBookApi)
      .mockResolvedValue(createApi([template()], [], create));

    await expect(
      runQuickTemplateRecord({
        requestId: 'request-3',
        templateId: 1,
        target: TARGET,
      }),
    ).rejects.toThrow('模板分类已失效，请打开应用编辑');
    expect(create).not.toHaveBeenCalled();
  });

  test('throws when the template amount is invalid', async () => {
    const create = jest.fn();
    jest
      .mocked(resolveBookApi)
      .mockResolvedValue(
        createApi([template({ amount: 0 })], [typeRow()], create),
      );

    await expect(
      runQuickTemplateRecord({
        requestId: 'request-4',
        templateId: 1,
        target: TARGET,
      }),
    ).rejects.toThrow('请输入金额');
    expect(create).not.toHaveBeenCalled();
  });
});
