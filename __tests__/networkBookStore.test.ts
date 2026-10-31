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

import {
  getServerToken,
  useNetworkBookStore,
} from '../src/stores/networkBookStore';

const STORE_KEY = 'pennyspring-network-books';
const SERVER_A = 'http://192.168.1.10:8787';
const SERVER_B = 'http://192.168.1.11:8787';
const TOKEN_A = 'test-token-a-0123456789';
const TOKEN_B = 'test-token-b-0123456789';

describe('networkBookStore', () => {
  beforeEach(async () => {
    mockStorageState.clear();
    useNetworkBookStore.setState({ refs: [], tokens: {} });
    await useNetworkBookStore.persist.clearStorage();
  });

  it('stores access tokens per server', () => {
    const { setServerToken } = useNetworkBookStore.getState();

    setServerToken(SERVER_A, TOKEN_A);
    setServerToken(SERVER_B, TOKEN_B);
    setServerToken(SERVER_A, TOKEN_A);

    expect(getServerToken(SERVER_A)).toBe(TOKEN_A);
    expect(getServerToken(SERVER_B)).toBe(TOKEN_B);
    expect(getServerToken('http://unknown:8787')).toBe('');
  });

  it('ignores empty server urls and tokens', () => {
    const { setServerToken } = useNetworkBookStore.getState();

    setServerToken('', TOKEN_A);
    setServerToken(SERVER_A, '');

    expect(useNetworkBookStore.getState().tokens).toEqual({});
  });

  it('persists refs together with server tokens', async () => {
    const { addRef, setServerToken } = useNetworkBookStore.getState();

    setServerToken(SERVER_A, TOKEN_A);
    addRef({ serverUrl: SERVER_A, bookId: 3 });
    await Promise.resolve();

    const raw = mockStorageState.get(STORE_KEY);
    expect(raw).toBeDefined();
    expect(JSON.parse(raw as string).state).toEqual({
      refs: [{ serverUrl: SERVER_A, bookId: 3 }],
      tokens: { [SERVER_A]: TOKEN_A },
    });
  });

  it('keeps legacy refs while dropping tokens during v1 migration', async () => {
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({
        state: { refs: [{ serverUrl: SERVER_A, bookId: 3 }] },
        version: 1,
      }),
    );

    await useNetworkBookStore.persist.rehydrate();

    expect(useNetworkBookStore.getState().refs).toEqual([
      { serverUrl: SERVER_A, bookId: 3 },
    ]);
    expect(useNetworkBookStore.getState().tokens).toEqual({});
  });
});
