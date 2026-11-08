jest.mock('../../src/features/quickBookDraft/native', () => ({
  setQuickBookCaptureCatalog: jest.fn(async () => true),
}));

jest.mock('../../src/stores/bookStore', () => {
  const state: {
    currentBookRef: unknown;
    currentBook: unknown;
  } = { currentBookRef: null, currentBook: null };
  return {
    __bookState: state,
    useBookStore: { getState: () => state },
    getBookKey: (
      ref: {
        kind: string;
        id?: number;
        serverUrl?: string;
        bookId?: number;
      } | null,
    ) =>
      ref === null
        ? null
        : ref.kind === 'local'
          ? `local:${ref.id}`
          : `remote:${ref.serverUrl}:${ref.bookId}`,
    getRemoteApi: jest.fn(),
  };
});

jest.mock('../../src/stores/networkBookStore', () => {
  const state = { refs: [] as Array<{ serverUrl: string; bookId: number }> };
  return {
    __networkState: state,
    useNetworkBookStore: { getState: () => state },
    rehydrateNetworkBooks: jest.fn(async () => undefined),
    getServerToken: jest.fn(),
  };
});

jest.mock('@pennyspring/api', () => {
  const actual = jest.requireActual('@pennyspring/api');
  return {
    ...actual,
    localApi: {
      book: { getAll: jest.fn() },
      asset: { getByBook: jest.fn() },
      type: { getAll: jest.fn() },
    },
  };
});

import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  VISIBILITY,
  localApi,
  type AssetRow,
  type BookRow,
  type TypeRow,
} from '@pennyspring/api';

import { publishQuickBookCaptureCatalog } from '../../src/features/quickBookDraft/captureCatalog';
import { setQuickBookCaptureCatalog } from '../../src/features/quickBookDraft/native';
import {
  getServerToken,
  rehydrateNetworkBooks,
} from '../../src/stores/networkBookStore';

const NOW = new Date(2026, 10, 8, 12, 0).getTime();

const bookStoreMock = jest.requireMock('../../src/stores/bookStore') as {
  __bookState: { currentBookRef: unknown; currentBook: unknown };
  getRemoteApi: jest.Mock;
};
const networkStoreMock = jest.requireMock(
  '../../src/stores/networkBookStore',
) as {
  __networkState: { refs: Array<{ serverUrl: string; bookId: number }> };
};
const localApiMock = localApi as unknown as {
  book: { getAll: jest.Mock };
  asset: { getByBook: jest.Mock };
  type: { getAll: jest.Mock };
};

function bookRow(id: number, name: string): BookRow {
  return {
    id,
    name,
    description: '',
    background: '',
    createdTime: NOW,
    updatedTime: NOW,
  };
}

function assetRow(
  id: number,
  booksId: number,
  invisible: AssetRow['invisible'] = VISIBILITY.visible,
): AssetRow {
  return {
    id,
    booksId,
    name: `资产${id}`,
    balance: 0,
    totalAmount: 0,
    billingDate: 0,
    repaymentDate: 0,
    type: ASSET_TYPE.capitalAccount,
    classification: ASSET_CLASSIFICATION.cash,
    invisible,
    openBank: '',
    cardNo: '',
    remark: '',
    sort: id,
    createdTime: NOW,
    updatedTime: NOW,
  };
}

function typeRow(
  id: number,
  parentId: number,
  name: string,
  sort: number,
): TypeRow {
  return {
    id,
    booksId: 1,
    parentId,
    name,
    icon: '',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    isSystem: SYSTEM_STATUS.custom,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
    sort,
    createdTime: NOW,
    updatedTime: NOW,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  bookStoreMock.__bookState.currentBookRef = null;
  bookStoreMock.__bookState.currentBook = null;
  networkStoreMock.__networkState.refs = [];
  localApiMock.book.getAll.mockResolvedValue([bookRow(1, '日常')]);
  localApiMock.asset.getByBook.mockResolvedValue([
    assetRow(1, 1),
    assetRow(2, 1, VISIBILITY.hidden),
  ]);
  localApiMock.type.getAll.mockResolvedValue([
    typeRow(10, 0, '餐饮', 1),
    typeRow(11, 10, '午餐', 1),
    typeRow(12, 0, '交通', 2),
  ]);
  (getServerToken as jest.Mock).mockReturnValue('');
  (rehydrateNetworkBooks as jest.Mock).mockResolvedValue(undefined);
});

describe('publishQuickBookCaptureCatalog', () => {
  it('publishes local books with filtered assets, leaf types and the current book key', async () => {
    bookStoreMock.__bookState.currentBookRef = { kind: 'local', id: 1 };
    bookStoreMock.__bookState.currentBook = {
      kind: 'local',
      ...bookRow(1, '日常'),
    };

    await publishQuickBookCaptureCatalog();

    const payload = (setQuickBookCaptureCatalog as jest.Mock).mock
      .calls[0]?.[0];
    const catalog = JSON.parse(payload);
    expect(catalog.currentBookKey).toBe('local:1');
    expect(catalog.books).toHaveLength(1);
    expect(catalog.books[0].available).toBe(true);
    expect(catalog.books[0].assets).toEqual([{ id: 1, name: '资产1' }]);
    expect(catalog.books[0].types).toEqual([
      { id: 11, label: '餐饮 / 午餐', sort: 1 },
      { id: 12, label: '交通', sort: 2 },
    ]);
  });

  it('marks a remote book unavailable when its server token is missing', async () => {
    networkStoreMock.__networkState.refs = [
      { serverUrl: 'https://example.com', bookId: 8 },
    ];

    await publishQuickBookCaptureCatalog();

    const catalog = JSON.parse(
      (setQuickBookCaptureCatalog as jest.Mock).mock.calls[0]?.[0],
    );
    expect(catalog.books[1]).toMatchObject({
      key: 'remote:https://example.com:8',
      available: false,
      unavailableReason: '服务器访问令牌未配置',
      assets: [],
      types: [],
    });
    expect(catalog.books[1].ref).toEqual({
      kind: 'remote',
      serverUrl: 'https://example.com',
      booksId: 8,
      bookName: '网络账本 #8',
    });
  });

  it('increments the snapshot version on every publish', async () => {
    await publishQuickBookCaptureCatalog();
    await publishQuickBookCaptureCatalog();

    const versions = (setQuickBookCaptureCatalog as jest.Mock).mock.calls.map(
      call => JSON.parse(call[0]).version,
    );
    expect(versions[1]).toBeGreaterThan(versions[0]);
  });
});
