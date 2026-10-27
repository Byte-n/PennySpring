import dayjs from 'dayjs';

jest.mock('@pennyspring/api', () => ({
  BOOK_TYPE: { local: 'local', remote: 'remote' },
}));

import { BOOK_TYPE } from '@pennyspring/api';
import {
  formatUpdatedTime,
  getBookFooterStorage,
  getBookStorageLabel,
  stripServerProtocol,
} from '../src/screens/home/drawerContentModel';
import type { BookEntry, CurrentBookRef } from '../src/stores/bookStore';

const CREATED_TIME = new Date('2026-10-26T21:04:00').getTime();

function createBook(overrides: Partial<BookEntry> = {}): BookEntry {
  return {
    background: '',
    createdTime: CREATED_TIME,
    description: '',
    id: 1,
    kind: BOOK_TYPE.local,
    name: '日常账本',
    updatedTime: CREATED_TIME,
    ...overrides,
  };
}

describe('stripServerProtocol', () => {
  it('removes the http protocol and trailing slash from the server url', () => {
    expect(stripServerProtocol('http://192.168.1.20:3000')).toBe(
      '192.168.1.20:3000',
    );
    expect(stripServerProtocol('https://example.com/')).toBe('example.com');
  });
});

describe('getBookStorageLabel', () => {
  it('describes the local device as the storage location', () => {
    const ref: CurrentBookRef = { id: 1, kind: 'local' };

    expect(getBookStorageLabel(createBook(), ref)).toBe(
      '本地 · 数据保存在此设备',
    );
  });

  it('describes the server host for a remote book', () => {
    const ref: CurrentBookRef = {
      bookId: 2,
      kind: 'remote',
      serverUrl: 'http://192.168.1.20:3000',
    };

    expect(
      getBookStorageLabel(createBook({ kind: BOOK_TYPE.remote }), ref),
    ).toBe('网络 · 192.168.1.20:3000');
  });

  it('falls back to the book kind when the ref is missing', () => {
    expect(
      getBookStorageLabel(createBook({ kind: BOOK_TYPE.remote }), null),
    ).toBe('网络');
  });
});

describe('getBookFooterStorage', () => {
  it('returns 网络 for remote books and 本地 for local books', () => {
    expect(getBookFooterStorage(createBook({ kind: BOOK_TYPE.remote }))).toBe(
      '网络',
    );
    expect(getBookFooterStorage(createBook())).toBe('本地');
  });
});

describe('formatUpdatedTime', () => {
  it('formats the update time as MM-DD HH:mm', () => {
    expect(formatUpdatedTime(CREATED_TIME)).toBe(
      dayjs(CREATED_TIME).format('MM-DD HH:mm'),
    );
  });

  it('returns 未知 for missing or invalid time', () => {
    expect(formatUpdatedTime(0)).toBe('未知');
    expect(formatUpdatedTime(Number.NaN)).toBe('未知');
  });
});
