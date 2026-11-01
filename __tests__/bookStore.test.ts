import type { BookRow } from '@pennyspring/api';

const mockStorageState = new Map<string, string>();

jest.mock('../src/stores/bookStorage', () => ({
  bookStorage: {
    getItem: jest.fn((key: string) =>
      Promise.resolve(mockStorageState.get(key) ?? null),
    ),
    setItem: jest.fn((key: string, value: string) => {
      mockStorageState.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      mockStorageState.delete(key);
      return Promise.resolve();
    }),
  },
}));

jest.mock('@pennyspring/api', () => ({
  localApi: {
    book: {
      getById: jest.fn(),
      getDefault: jest.fn(),
    },
  },
  createRemoteApi: jest.fn(),
  BOOK_TYPE: {
    local: 'local',
    remote: 'remote',
  },
}));

import { createRemoteApi, localApi } from '@pennyspring/api';
import { useBookStore } from '../src/stores/bookStore';
import { useNetworkBookStore } from '../src/stores/networkBookStore';

const STORE_KEY = 'pennyspring-book-store';
const SERVER_TOKEN = 'test-token-0123456789';

const travelBook: BookRow = {
  id: 2,
  name: '旅行账本',
  description: '旅行消费',
  background: '',
  createdTime: 2,
  updatedTime: 2,
};

const remoteBook: BookRow = {
  id: 5,
  name: '网络账本',
  description: '远程协作',
  background: '',
  createdTime: 5,
  updatedTime: 5,
};

type PersistedShape = { state: { currentBookRef: unknown }; version: number };

function getPersistedCurrentBookRef(): unknown {
  const rawValue = mockStorageState.get(STORE_KEY);
  if (!rawValue) {
    return null;
  }

  return (JSON.parse(rawValue) as PersistedShape).state.currentBookRef;
}

const defaultBook: BookRow = {
  id: 1,
  name: '默认账本',
  description: '默认本地账本',
  background: '',
  createdTime: 1,
  updatedTime: 1,
};

describe('bookStore', () => {
  beforeEach(async () => {
    mockStorageState.clear();
    jest.clearAllMocks();
    useBookStore.setState({ currentBook: null, currentBookRef: null });
    useNetworkBookStore.setState({ tokens: {} });
    jest.mocked(localApi.book.getDefault).mockResolvedValue(defaultBook);
    // 清空 persist 缓存，确保每次测试重新读取 mockStorageState
    await useBookStore.persist.clearStorage();
  });

  test('persists the selected current book ref', async () => {
    useBookStore
      .getState()
      .setCurrentBook(
        { kind: 'local', id: travelBook.id },
        { kind: 'local', ...travelBook },
      );
    await Promise.resolve();

    expect(getPersistedCurrentBookRef()).toEqual({ kind: 'local', id: 2 });
  });

  test('initializes from the persisted local ref when it still exists', async () => {
    jest.mocked(localApi.book.getById).mockResolvedValue(travelBook);

    // 直接设置 store state，模拟 rehydrate 后的状态
    useBookStore.setState({
      currentBookRef: { kind: 'local', id: travelBook.id },
    });

    await useBookStore.getState().initializeBook();

    expect(localApi.book.getById).toHaveBeenCalledWith(travelBook.id);
    expect(useBookStore.getState().currentBook).toEqual({
      kind: 'local',
      ...travelBook,
    });
    expect(useBookStore.getState().currentBookRef).toEqual({
      kind: 'local',
      id: travelBook.id,
    });
  });

  test('initializes from a persisted network ref by fetching from the server', async () => {
    const networkRef = {
      kind: 'remote' as const,
      serverUrl: 'http://example.com',
      bookId: remoteBook.id,
    };
    const remoteApi = {
      book: { getById: jest.fn().mockResolvedValue(remoteBook) },
    };
    jest.mocked(createRemoteApi).mockReturnValue(remoteApi as never);

    // 直接设置 store state，模拟 rehydrate 后的状态
    useBookStore.setState({ currentBookRef: networkRef });
    useNetworkBookStore.setState({
      tokens: { 'http://example.com': SERVER_TOKEN },
    });

    await useBookStore.getState().initializeBook();

    expect(createRemoteApi).toHaveBeenCalledWith('http://example.com', {
      token: SERVER_TOKEN,
    });
    expect(remoteApi.book.getById).toHaveBeenCalledWith(remoteBook.id);
    expect(localApi.book.getDefault).not.toHaveBeenCalled();
    expect(useBookStore.getState().currentBook).toEqual({
      kind: 'remote',
      ...remoteBook,
    });
    expect(useBookStore.getState().currentBookRef).toEqual(networkRef);
  });
});
