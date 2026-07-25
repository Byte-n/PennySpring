import type { BookRow } from '@pennyspring/api';

const mockStorageState = new Map<string, string>();

jest.mock('../src/stores/bookStorage', () => ({
  bookStorage: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorageState.get(key) ?? null)),
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

const STORE_KEY = 'pennyspring-book-store';

const defaultBook: BookRow = {
  id: 1,
  name: '默认账本',
  description: '',
  background: '',
  createdTime: 1,
  updatedTime: 1,
};

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

describe('bookStore', () => {
  beforeEach(() => {
    mockStorageState.clear();
    jest.clearAllMocks();
    useBookStore.setState({ currentBook: null, currentBookRef: null });
  });

  test('persists the selected current book ref', async () => {
    useBookStore.getState().setCurrentBook(
      { kind: 'local', id: travelBook.id },
      { kind: 'local', ...travelBook },
    );
    await Promise.resolve();

    expect(getPersistedCurrentBookRef()).toEqual({ kind: 'local', id: 2 });
  });

  test('initializes from the persisted local ref when it still exists', async () => {
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({
        state: { currentBookRef: { kind: 'local', id: travelBook.id } },
        version: 2,
      }),
    );
    jest.mocked(localApi.book.getById).mockResolvedValue(travelBook);

    await useBookStore.getState().initializeBook();

    expect(localApi.book.getById).toHaveBeenCalledWith(travelBook.id);
    expect(localApi.book.getDefault).not.toHaveBeenCalled();
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
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({ state: { currentBookRef: networkRef }, version: 2 }),
    );
    const remoteApi = {
      book: { getById: jest.fn().mockResolvedValue(remoteBook) },
    };
    jest.mocked(createRemoteApi).mockReturnValue(remoteApi as never);

    await useBookStore.getState().initializeBook();

    expect(createRemoteApi).toHaveBeenCalledWith('http://example.com');
    expect(remoteApi.book.getById).toHaveBeenCalledWith(remoteBook.id);
    expect(localApi.book.getDefault).not.toHaveBeenCalled();
    expect(useBookStore.getState().currentBook).toEqual({
      kind: 'remote',
      ...remoteBook,
    });
    expect(useBookStore.getState().currentBookRef).toEqual(networkRef);
  });
});
