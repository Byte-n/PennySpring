import {
  BOOK_TYPE,
  QUICK_BOOK_DRAFT_SOURCE,
  QUICK_BOOK_DRAFT_STATUS,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  SYSTEM_STATUS,
  type DraftItem,
  type IconValue,
  type QuickBookDraftRow,
  type RecordDetail,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';
import type { MediaStore } from '../src/media';
import {
  applyAddRecordInitSeed,
  loadAddRecordInitSeed,
  resolveAddRecordInitSource,
  type AddRecordInitActions,
  type AddRecordInitDeps,
} from '../src/screens/addRecord/addRecordInit';
import type {
  AddRecordPresetPayload,
  AddRecordTemplatePayload,
} from '../src/screens/addRecord/AddRecordContext';
import type { AddRecordDraftInitPayload } from '../src/screens/addRecord/draftPrefill';
import type { DraftBookTarget } from '../src/features/quickBookDraft/draftBook';
import type { BookEntry } from '../src/stores/bookStore';

jest.mock('../src/features/quickBookDraft/draftCacheStorage', () => ({
  quickBookDraftCache: { getById: jest.fn() },
}));

jest.mock('../src/features/quickBookDraft/bookApi', () => ({
  draftTargetFromBookRef: (
    ref: { kind: string; id?: number },
    bookName: string,
  ) =>
    ref.kind === 'local'
      ? { kind: 'local', serverUrl: '', booksId: ref.id, bookName }
      : {
          kind: 'remote',
          serverUrl: '',
          booksId: 0,
          bookName,
        },
  resolveBookApi: jest.fn(),
}));

import { resolveBookApi } from '../src/features/quickBookDraft/bookApi';
import { quickBookDraftCache } from '../src/features/quickBookDraft/draftCacheStorage';

const mockDraftCache = quickBookDraftCache as unknown as { getById: jest.Mock };
const mockBookApi = {
  book: { getById: jest.fn() },
  type: { getAll: jest.fn() },
};

beforeEach(() => {
  mockDraftCache.getById.mockReset();
  mockBookApi.book.getById.mockReset();
  mockBookApi.type.getAll.mockReset();
  jest.mocked(resolveBookApi).mockResolvedValue(mockBookApi as never);
});

const NOW = new Date('2026-05-24T12:00:00+08:00').getTime();

function createBook(overrides: Partial<BookEntry> = {}): BookEntry {
  return {
    background: '',
    createdTime: NOW,
    description: '',
    id: 1,
    kind: BOOK_TYPE.local,
    name: '日常账本',
    updatedTime: NOW,
    ...overrides,
  };
}

function typeRow(overrides: Partial<TypeRow> = {}): TypeRow {
  return {
    id: 7,
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

function recordRow(overrides: Partial<RecordRow> = {}): RecordRow {
  return {
    id: 9,
    typeId: 7,
    assetId: 0,
    intoAssetId: 0,
    booksId: 1,
    amount: 0,
    finalAmount: 0,
    charge: 0,
    remark: '',
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: NOW,
    createdTime: NOW,
    updatedTime: NOW,
    ...overrides,
  };
}

function recordDetail(overrides: Partial<RecordDetail> = {}): RecordDetail {
  return {
    record: recordRow(),
    tagIds: [],
    imagePaths: [],
    relatedRecordIds: [],
    ...overrides,
  };
}

function draftItem(overrides: Partial<DraftItem> = {}): DraftItem {
  return {
    status: 'pending',
    recordId: 0,
    typeId: 0,
    typeName: '',
    amountCents: null,
    recordTime: NOW,
    remark: '',
    assetId: 0,
    assetName: '',
    intoAssetId: 0,
    intoAssetName: '',
    chargeCents: 0,
    tagIds: [],
    reimbursable: false,
    warnings: [],
    ...overrides,
  };
}

function draftRow(
  overrides: Partial<QuickBookDraftRow & { target: DraftBookTarget }> = {},
): QuickBookDraftRow & { target: DraftBookTarget } {
  return {
    id: 'draft-1',
    booksId: 1,
    target: {
      kind: BOOK_TYPE.local,
      serverUrl: '',
      booksId: 1,
      bookName: '日常账本',
    },
    status: QUICK_BOOK_DRAFT_STATUS.pending,
    source: QUICK_BOOK_DRAFT_SOURCE.floatingCapture,
    imagePath: '',
    attachImage: false,
    items: [draftItem()],
    preset: { assetId: 0, typeId: 0 },
    agentProviderId: 0,
    agentModelId: '',
    agentSummary: '',
    errorText: '',
    confirmedCount: 0,
    recordIds: [],
    createdTime: NOW,
    updatedTime: NOW,
    confirmedAt: 0,
    ...overrides,
  };
}

function presetPayload(
  overrides: Partial<AddRecordPresetPayload> = {},
): AddRecordPresetPayload {
  return {
    typeId: 7,
    amount: 500,
    remark: '',
    assetId: 1,
    intoAssetId: null,
    charge: 0,
    reimbursable: false,
    tagIds: [],
    ...overrides,
  };
}

function templatePayload(
  overrides: Partial<AddRecordTemplatePayload> = {},
): AddRecordTemplatePayload {
  return {
    id: 3,
    name: '通勤支出',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    typeId: 7,
    amount: 800,
    charge: 0,
    remark: '',
    assetId: null,
    intoAssetId: null,
    reimbursable: false,
    tagIds: [],
    ...overrides,
  };
}

function draftInitPayload(
  overrides: Partial<AddRecordDraftInitPayload> = {},
): AddRecordDraftInitPayload {
  return {
    draftId: 'draft-1',
    itemIndex: 0,
    booksId: 2,
    typeId: 7,
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    amount: 0,
    charge: 0,
    assetId: null,
    intoAssetId: null,
    reimbursable: false,
    recordTime: NOW,
    remark: '',
    tagIds: [],
    images: [],
    ...overrides,
  };
}

function createDeps(): {
  deps: AddRecordInitDeps;
  getDetailById: jest.Mock;
  getAllTypes: jest.Mock;
} {
  const getDetailById = jest.fn();
  const getAllTypes = jest.fn();
  return {
    deps: {
      currentBook: createBook(),
      currentBookRef: { kind: BOOK_TYPE.local, id: 1 },
      recordApi: { getDetailById },
      typeApi: { getAll: getAllTypes },
      media: null,
    },
    getDetailById,
    getAllTypes,
  };
}

describe('resolveAddRecordInitSource', () => {
  test('prefers the edited record over every prefill source', () => {
    const source = resolveAddRecordInitSource({
      recordId: 9,
      preset: presetPayload(),
      template: true,
      templatePayload: templatePayload(),
      draftId: 'draft-1',
    });

    expect(source).toEqual({ kind: 'edit', recordId: 9 });
  });

  test('resolves the preset before the template and draft prefill', () => {
    const preset = presetPayload();

    const source = resolveAddRecordInitSource({
      preset,
      template: true,
      draftId: 'draft-1',
    });

    expect(source).toEqual({ kind: 'preset', preset });
  });

  test('resolves a template flow with and without a payload', () => {
    const payload = templatePayload();

    expect(
      resolveAddRecordInitSource({ template: true, templatePayload: payload }),
    ).toEqual({ kind: 'template', templatePayload: payload });
    expect(resolveAddRecordInitSource({ template: true })).toEqual({
      kind: 'template',
      templatePayload: undefined,
    });
  });

  test('resolves a draft with the requested item index', () => {
    expect(
      resolveAddRecordInitSource({ draftId: 'draft-1', itemIndex: 2 }),
    ).toEqual({ kind: 'draft', draftId: 'draft-1', itemIndex: 2 });
  });

  test('returns null for a plain new record', () => {
    expect(resolveAddRecordInitSource({})).toBeNull();
  });
});

describe('loadAddRecordInitSeed', () => {
  test('maps the record detail into the edit init payload', async () => {
    const { deps, getDetailById, getAllTypes } = createDeps();
    getDetailById.mockResolvedValue(
      recordDetail({
        record: recordRow({
          id: 9,
          typeId: 7,
          amount: 1200,
          charge: 30,
          remark: '午餐',
          recordTime: NOW,
          assetId: 0,
          intoAssetId: 4,
          reimbursable: REIMBURSABLE.reimbursable,
        }),
        tagIds: [3, 4],
        relatedRecordIds: [11],
      }),
    );
    getAllTypes.mockResolvedValue([
      typeRow({ id: 7, typeCategory: RECORD_TYPE_CATEGORY.income }),
    ]);

    const seed = await loadAddRecordInitSeed(
      { kind: 'edit', recordId: 9 },
      deps,
    );

    expect(getDetailById).toHaveBeenCalledWith(9, 1);
    expect(getAllTypes).toHaveBeenCalledWith(1);
    expect(seed).toEqual({
      kind: 'edit',
      typeCategory: RECORD_TYPE_CATEGORY.income,
      payload: {
        editingRecordId: 9,
        typeId: 7,
        amount: 1200,
        remark: '午餐',
        recordTime: NOW,
        tags: [3, 4],
        images: [],
        assetId: null,
        intoAssetId: 4,
        charge: 30,
        reimbursable: true,
        relatedRecordIds: [11],
      },
    });
  });

  test('resolves edit image paths through the media store when available', async () => {
    const { deps, getDetailById, getAllTypes } = createDeps();
    const resolveSource = jest.fn((uri: string) => ({
      uri: `resolved:${uri}`,
    }));
    getDetailById.mockResolvedValue(
      recordDetail({ imagePaths: ['file://a.jpg', 'file://b.jpg'] }),
    );
    getAllTypes.mockResolvedValue([typeRow()]);

    const seed = await loadAddRecordInitSeed(
      { kind: 'edit', recordId: 9 },
      { ...deps, media: { resolveSource } as unknown as MediaStore },
    );

    expect(seed.kind).toBe('edit');
    expect(seed.payload).toMatchObject({
      images: [
        { uri: 'resolved:file://a.jpg' },
        { uri: 'resolved:file://b.jpg' },
      ],
    });
  });

  test('leaves the tab unresolved when the edited record type no longer exists', async () => {
    const { deps, getDetailById, getAllTypes } = createDeps();
    getDetailById.mockResolvedValue(recordDetail());
    getAllTypes.mockResolvedValue([]);

    const seed = await loadAddRecordInitSeed(
      { kind: 'edit', recordId: 9 },
      deps,
    );

    expect(seed.typeCategory).toBeUndefined();
  });

  test('rejects the edit flow when the current book is not ready', async () => {
    const { deps } = createDeps();

    await expect(
      loadAddRecordInitSeed(
        { kind: 'edit', recordId: 9 },
        { ...deps, currentBook: null },
      ),
    ).rejects.toThrow('当前账本未就绪，请稍后重试');
  });

  test('keeps the preset payload and resolves the tab from the preset type', async () => {
    const { deps, getAllTypes } = createDeps();
    const preset = presetPayload({ typeId: 8 });
    getAllTypes.mockResolvedValue([
      typeRow({ id: 8, typeCategory: RECORD_TYPE_CATEGORY.transfer }),
    ]);

    const seed = await loadAddRecordInitSeed({ kind: 'preset', preset }, deps);

    expect(getAllTypes).toHaveBeenCalledWith(1);
    expect(seed).toEqual({
      kind: 'preset',
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      payload: preset,
    });
  });

  test('passes an existing template payload straight through', async () => {
    const { deps } = createDeps();
    const payload = templatePayload({
      typeCategory: RECORD_TYPE_CATEGORY.income,
    });

    const seed = await loadAddRecordInitSeed(
      { kind: 'template', templatePayload: payload },
      deps,
    );

    expect(seed).toEqual({
      kind: 'template',
      typeCategory: RECORD_TYPE_CATEGORY.income,
      payload,
    });
  });

  test('returns an empty template seed for a blank template', async () => {
    const { deps } = createDeps();

    const seed = await loadAddRecordInitSeed({ kind: 'template' }, deps);

    expect(seed).toEqual({
      kind: 'template',
      typeCategory: undefined,
      payload: undefined,
    });
  });

  test('maps a draft item from the target book into the draft init payload', async () => {
    const { deps } = createDeps();
    mockDraftCache.getById.mockResolvedValue(
      draftRow({ items: [draftItem({ typeId: 7, amountCents: 3650 })] }),
    );
    mockBookApi.book.getById.mockResolvedValue(createBook({ id: 1 }));
    mockBookApi.type.getAll.mockResolvedValue([
      typeRow({
        id: 7,
        booksId: 1,
        typeCategory: RECORD_TYPE_CATEGORY.transfer,
      }),
    ]);

    const seed = await loadAddRecordInitSeed(
      { kind: 'draft', draftId: 'draft-1', itemIndex: 0 },
      deps,
    );

    expect(mockBookApi.book.getById).toHaveBeenCalledWith(1);
    expect(mockBookApi.type.getAll).toHaveBeenCalledWith(1);
    expect(seed).toEqual({
      kind: 'draft',
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      payload: expect.objectContaining({
        draftId: 'draft-1',
        itemIndex: 0,
        booksId: 1,
        typeId: 7,
        amount: 3650,
      }),
    });
  });

  test('rejects a draft belonging to another book', async () => {
    const { deps } = createDeps();
    mockDraftCache.getById.mockResolvedValue(
      draftRow({
        booksId: 2,
        target: {
          kind: BOOK_TYPE.local,
          serverUrl: '',
          booksId: 2,
          bookName: '其他账本',
        },
      }),
    );

    await expect(
      loadAddRecordInitSeed(
        { kind: 'draft', draftId: 'draft-1', itemIndex: 0 },
        deps,
      ),
    ).rejects.toThrow('请先切换到草稿所属账本');
  });

  test('rejects a discarded draft', async () => {
    const { deps } = createDeps();
    mockDraftCache.getById.mockResolvedValue(
      draftRow({ status: QUICK_BOOK_DRAFT_STATUS.discarded }),
    );

    await expect(
      loadAddRecordInitSeed(
        { kind: 'draft', draftId: 'draft-1', itemIndex: 0 },
        deps,
      ),
    ).rejects.toThrow('草稿已丢弃，无法确认');
  });

  test('rejects a confirmed draft item', async () => {
    const { deps } = createDeps();
    mockDraftCache.getById.mockResolvedValue(
      draftRow({ items: [draftItem({ status: 'confirmed' })] }),
    );

    await expect(
      loadAddRecordInitSeed(
        { kind: 'draft', draftId: 'draft-1', itemIndex: 0 },
        deps,
      ),
    ).rejects.toThrow('草稿内容已更新，请返回草稿详情刷新后重试');
  });

  test('rejects a draft item index that no longer exists', async () => {
    const { deps } = createDeps();
    mockDraftCache.getById.mockResolvedValue(draftRow());

    await expect(
      loadAddRecordInitSeed(
        { kind: 'draft', draftId: 'draft-1', itemIndex: 1 },
        deps,
      ),
    ).rejects.toThrow('草稿内容已更新，请返回草稿详情刷新后重试');
  });

  test('rejects a draft whose target book has been removed', async () => {
    const { deps } = createDeps();
    mockDraftCache.getById.mockResolvedValue(draftRow());
    mockBookApi.book.getById.mockRejectedValue(new Error('missing'));
    mockBookApi.type.getAll.mockResolvedValue([typeRow()]);

    await expect(
      loadAddRecordInitSeed(
        { kind: 'draft', draftId: 'draft-1', itemIndex: 0 },
        deps,
      ),
    ).rejects.toThrow('目标账本已不存在，请丢弃草稿后重新截图');
  });
});

describe('applyAddRecordInitSeed', () => {
  function createActions(): AddRecordInitActions {
    return {
      init: jest.fn(),
      initFromPreset: jest.fn(),
      initFromTemplate: jest.fn(),
      initBlankTemplate: jest.fn(),
      initFromDraft: jest.fn(),
    };
  }

  test('routes each seed kind to its matching init action', () => {
    const actions = createActions();
    const editPayload = {
      editingRecordId: 9,
      typeId: 7,
      amount: 0,
      remark: '',
      recordTime: NOW,
      tags: [],
      images: [],
      assetId: null,
      intoAssetId: null,
      charge: 0,
      reimbursable: false,
      relatedRecordIds: [],
    };
    const preset = presetPayload();
    const template = templatePayload();
    const draft = draftInitPayload();

    applyAddRecordInitSeed({ kind: 'edit', payload: editPayload }, actions);
    applyAddRecordInitSeed({ kind: 'preset', payload: preset }, actions);
    applyAddRecordInitSeed(
      {
        kind: 'template',
        payload: template,
        typeCategory: template.typeCategory,
      },
      actions,
    );
    applyAddRecordInitSeed({ kind: 'draft', payload: draft }, actions);

    expect(actions.init).toHaveBeenCalledWith(editPayload);
    expect(actions.initFromPreset).toHaveBeenCalledWith(preset);
    expect(actions.initFromTemplate).toHaveBeenCalledWith(template);
    expect(actions.initBlankTemplate).not.toHaveBeenCalled();
    expect(actions.initFromDraft).toHaveBeenCalledWith(draft);
  });

  test('opens a blank template when the template seed has no payload', () => {
    const actions = createActions();

    applyAddRecordInitSeed({ kind: 'template' }, actions);

    expect(actions.initBlankTemplate).toHaveBeenCalledTimes(1);
    expect(actions.initFromTemplate).not.toHaveBeenCalled();
  });
});
