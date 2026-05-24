import type { BookRow } from '@pennyspring/data';

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

jest.mock('@pennyspring/data', () => ({
  api: {
    book: {
      getById: jest.fn(),
      getDefault: jest.fn(),
    },
  },
}));

import { api } from '@pennyspring/data';
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

function getPersistedCurrentBook(): BookRow | null {
  const rawValue = mockStorageState.get(STORE_KEY);
  if (!rawValue) return null;

  return JSON.parse(rawValue).state.currentBook;
}

describe('bookStore', () => {
  beforeEach(() => {
    mockStorageState.clear();
    jest.clearAllMocks();
    useBookStore.setState({ currentBook: null });
  });

  test('persists the selected current book', async () => {
    useBookStore.getState().setCurrentBook(travelBook);
    await Promise.resolve();

    expect(getPersistedCurrentBook()).toEqual(travelBook);
  });

  test('initializes from the persisted current book when it still exists', async () => {
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({ state: { currentBook: travelBook }, version: 1 }),
    );
    jest.mocked(api.book.getById).mockResolvedValue(travelBook);

    await useBookStore.getState().initializeBook();

    expect(api.book.getById).toHaveBeenCalledWith(travelBook.id);
    expect(api.book.getDefault).not.toHaveBeenCalled();
    expect(useBookStore.getState().currentBook).toEqual(travelBook);
  });

  test('falls back to the default book when the persisted current book no longer exists', async () => {
    mockStorageState.set(
      STORE_KEY,
      JSON.stringify({ state: { currentBook: travelBook }, version: 1 }),
    );
    jest.mocked(api.book.getById).mockRejectedValue(new Error('账本不存在'));
    jest.mocked(api.book.getDefault).mockResolvedValue(defaultBook);

    await useBookStore.getState().initializeBook();

    expect(api.book.getDefault).toHaveBeenCalled();
    expect(useBookStore.getState().currentBook).toEqual(defaultBook);
  });
});
