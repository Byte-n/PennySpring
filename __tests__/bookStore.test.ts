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
import { getBookId, getBookKey, useBookStore } from '../src/stores/bookStore';
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
    // 让上一个用例的持久化写入落盘，再清空，避免串到下一个用例
    await new Promise(resolve => setTimeout(resolve, 0));
    mockStorageState.clear();
    jest.clearAllMocks();
    useBookStore.setState({
      currentBook: null,
      currentBookRef: null,
      initStatus: 'idle',
    });
    // setState 会触发一次异步写入，等它落盘后再清掉
    await new Promise(resolve => setTimeout(resolve, 0));
    await useBookStore.persist.clearStorage();
    useNetworkBookStore.setState({ tokens: {} });
    jest.mocked(localApi.book.getDefault).mockResolvedValue(defaultBook);
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

  test('keeps the manually selected book when a pending initialization resolves later', async () => {
    const serverUrl = 'http://pending.example.com';
    let resolveRemote: (book: BookRow) => void = () => undefined;
    const pendingBook = new Promise<BookRow>(resolve => {
      resolveRemote = resolve;
    });
    let markStarted: () => void = () => undefined;
    const started = new Promise<void>(resolve => {
      markStarted = resolve;
    });
    jest.mocked(createRemoteApi).mockReturnValue({
      book: {
        getById: jest.fn(() => {
          markStarted();
          return pendingBook;
        }),
      },
    } as never);
    useNetworkBookStore.setState({ tokens: { [serverUrl]: SERVER_TOKEN } });
    useBookStore.setState({
      currentBookRef: { kind: 'remote', serverUrl, bookId: remoteBook.id },
    });

    const initialization = useBookStore.getState().initializeBook();
    await started;
    // 启动超时后用户手动切换账本
    useBookStore
      .getState()
      .setCurrentBook(
        { kind: 'local', id: travelBook.id },
        { kind: 'local', ...travelBook },
      );
    resolveRemote(remoteBook);

    await initialization;

    expect(useBookStore.getState().currentBook).toEqual({
      kind: 'local',
      ...travelBook,
    });
    expect(useBookStore.getState().currentBookRef).toEqual({
      kind: 'local',
      id: travelBook.id,
    });
    expect(useBookStore.getState().initStatus).toBe('success');
  });

  test('keeps the current book ref when loading fails so it can be retried', async () => {
    const serverUrl = 'http://error.example.com';
    const networkRef = {
      kind: 'remote' as const,
      serverUrl,
      bookId: remoteBook.id,
    };
    jest.mocked(createRemoteApi).mockReturnValue({
      book: { getById: jest.fn().mockRejectedValue(new Error('网络不可达')) },
    } as never);
    useNetworkBookStore.setState({ tokens: { [serverUrl]: SERVER_TOKEN } });
    useBookStore.setState({ currentBookRef: networkRef });

    await expect(useBookStore.getState().initializeBook()).rejects.toThrow(
      '网络不可达',
    );
    await new Promise(resolve => setTimeout(resolve, 0));

    const state = useBookStore.getState();
    expect(state.initStatus).toBe('error');
    expect(state.currentBook).toBeNull();
    expect(state.currentBookRef).toEqual(networkRef);
    expect(getPersistedCurrentBookRef()).toEqual(networkRef);
    // 不自动回退本地默认账本，由用户手动切换
    expect(localApi.book.getDefault).not.toHaveBeenCalled();
  });

  test('loads the current book when initialization is retried after a failure', async () => {
    const serverUrl = 'http://retry.example.com';
    const networkRef = {
      kind: 'remote' as const,
      serverUrl,
      bookId: remoteBook.id,
    };
    const getById = jest
      .fn()
      .mockRejectedValueOnce(new Error('网络不可达'))
      .mockResolvedValueOnce(remoteBook);
    jest.mocked(createRemoteApi).mockReturnValue({
      book: { getById },
    } as never);
    useNetworkBookStore.setState({ tokens: { [serverUrl]: SERVER_TOKEN } });
    useBookStore.setState({ currentBookRef: networkRef });

    await expect(useBookStore.getState().initializeBook()).rejects.toThrow(
      '网络不可达',
    );

    await useBookStore.getState().initializeBook();

    const state = useBookStore.getState();
    expect(state.initStatus).toBe('success');
    expect(state.currentBook).toEqual({
      kind: 'remote',
      ...remoteBook,
    });
    expect(state.currentBookRef).toEqual(networkRef);
  });

  test('restores the persisted network ref on a cold start', async () => {
    const serverUrl = 'http://cold-start.example.com';
    const networkRef = {
      kind: 'remote' as const,
      serverUrl,
      bookId: remoteBook.id,
    };
    // 冷启动：内存状态为空，存储中保留上次选择的网络账本
    await new Promise(resolve => setTimeout(resolve, 0));
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({ state: { currentBookRef: networkRef }, version: 2 }),
    );

    const session = await useBookStore.getState().hydrateBookSession();

    expect(session).toEqual({ ref: networkRef, needsMetadata: true });
    expect(useBookStore.getState().currentBookRef).toEqual(networkRef);
    expect(getPersistedCurrentBookRef()).toEqual(networkRef);
  });

  test('initializes from the persisted network ref on a cold start', async () => {
    const serverUrl = 'http://cold-init.example.com';
    const networkRef = {
      kind: 'remote' as const,
      serverUrl,
      bookId: remoteBook.id,
    };
    jest.mocked(createRemoteApi).mockReturnValue({
      book: { getById: jest.fn().mockResolvedValue(remoteBook) },
    } as never);
    useNetworkBookStore.setState({ tokens: { [serverUrl]: SERVER_TOKEN } });
    await new Promise(resolve => setTimeout(resolve, 0));
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({ state: { currentBookRef: networkRef }, version: 2 }),
    );

    await useBookStore.getState().initializeBook();

    expect(useBookStore.getState().currentBookRef).toEqual(networkRef);
    expect(useBookStore.getState().currentBook).toEqual({
      kind: 'remote',
      ...remoteBook,
    });
  });

  test('hydrates a persisted network ref without fetching its metadata', async () => {
    const serverUrl = 'http://hydrate.example.com';
    const networkRef = {
      kind: 'remote' as const,
      serverUrl,
      bookId: remoteBook.id,
    };
    useBookStore.setState({ currentBookRef: networkRef });
    useNetworkBookStore.setState({ tokens: { [serverUrl]: SERVER_TOKEN } });

    const session = await useBookStore.getState().hydrateBookSession();

    expect(session).toEqual({ ref: networkRef, needsMetadata: true });
    expect(createRemoteApi).not.toHaveBeenCalled();
    expect(localApi.book.getDefault).not.toHaveBeenCalled();
    expect(useBookStore.getState().initStatus).toBe('loading');
    expect(useBookStore.getState().currentBook).toBeNull();
    expect(useBookStore.getState().currentBookRef).toEqual(networkRef);
  });

  test('resolves the local default during hydration when no ref is persisted', async () => {
    const session = await useBookStore.getState().hydrateBookSession();

    expect(session).toEqual({
      ref: { kind: 'local', id: defaultBook.id },
      needsMetadata: false,
    });
    expect(useBookStore.getState().currentBook).toEqual({
      kind: 'local',
      ...defaultBook,
    });
    expect(useBookStore.getState().initStatus).toBe('success');
  });

  test('loads metadata for the current ref without rehydrating storage', async () => {
    const serverUrl = 'http://load.example.com';
    const networkRef = {
      kind: 'remote' as const,
      serverUrl,
      bookId: remoteBook.id,
    };
    const remoteApi = {
      book: { getById: jest.fn().mockResolvedValue(remoteBook) },
    };
    jest.mocked(createRemoteApi).mockReturnValue(remoteApi as never);
    useNetworkBookStore.setState({ tokens: { [serverUrl]: SERVER_TOKEN } });
    useBookStore.setState({
      currentBookRef: networkRef,
      initStatus: 'loading',
    });

    await useBookStore.getState().loadCurrentBook();

    expect(remoteApi.book.getById).toHaveBeenCalledWith(remoteBook.id);
    expect(useBookStore.getState().currentBook).toEqual({
      kind: 'remote',
      ...remoteBook,
    });
    expect(useBookStore.getState().currentBookRef).toEqual(networkRef);
    expect(useBookStore.getState().initStatus).toBe('success');
  });

  test('keeps the persisted selection when metadata loading fails', async () => {
    const serverUrl = 'http://load-error.example.com';
    const networkRef = {
      kind: 'remote' as const,
      serverUrl,
      bookId: remoteBook.id,
    };
    jest.mocked(createRemoteApi).mockReturnValue({
      book: { getById: jest.fn().mockRejectedValue(new Error('网络不可达')) },
    } as never);
    useNetworkBookStore.setState({ tokens: { [serverUrl]: SERVER_TOKEN } });
    useBookStore.setState({
      currentBookRef: networkRef,
      initStatus: 'loading',
    });

    await expect(useBookStore.getState().loadCurrentBook()).rejects.toThrow(
      '网络不可达',
    );
    await new Promise(resolve => setTimeout(resolve, 0));

    const state = useBookStore.getState();
    expect(state.initStatus).toBe('error');
    expect(state.currentBook).toBeNull();
    expect(state.currentBookRef).toEqual(networkRef);
    expect(getPersistedCurrentBookRef()).toEqual(networkRef);
  });

  test('clears the current book when the selected book is gone', async () => {
    useBookStore
      .getState()
      .setCurrentBook(
        { kind: 'local', id: travelBook.id },
        { kind: 'local', ...travelBook },
      );

    useBookStore.getState().clearCurrentBook();
    await new Promise(resolve => setTimeout(resolve, 0));

    const state = useBookStore.getState();
    expect(state.currentBook).toBeNull();
    expect(state.currentBookRef).toBeNull();
    expect(state.initStatus).toBe('success');
    expect(getPersistedCurrentBookRef()).toBeNull();
  });
});

describe('getBookId', () => {
  test('reads the identity from local and remote refs', () => {
    expect(getBookId({ kind: 'local', id: 7 })).toBe(7);
    expect(
      getBookId({
        kind: 'remote',
        serverUrl: 'http://example.com',
        bookId: 9,
      }),
    ).toBe(9);
  });

  test('returns null when no book is selected', () => {
    expect(getBookId(null)).toBeNull();
  });
});

describe('getBookKey', () => {
  test('keeps local and remote books with the same numeric id distinct', () => {
    const localKey = getBookKey({ kind: 'local', id: 1 });
    const remoteKey = getBookKey({
      kind: 'remote',
      serverUrl: 'http://example.com',
      bookId: 1,
    });

    expect(localKey).toBe('local:1');
    expect(remoteKey).toBe('remote:http://example.com:1');
    expect(localKey).not.toBe(remoteKey);
  });

  test('returns null when no book is selected', () => {
    expect(getBookKey(null)).toBeNull();
  });
});
