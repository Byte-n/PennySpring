import { BOOK_TYPE, type BookTypeValue } from '@pennyspring/api';

export interface DraftBookTarget {
  kind: BookTypeValue;
  serverUrl: string;
  booksId: number;
  bookName: string;
}

export function normalizeDraftBookName(name: string | undefined): string {
  return typeof name === 'string' ? name.trim() : '';
}

export function createDraftBookTarget(input: DraftBookTarget): DraftBookTarget {
  const kind = input.kind;
  if (kind !== BOOK_TYPE.local && kind !== BOOK_TYPE.remote) {
    throw new Error(`账本类型不合法: ${String(kind)}`);
  }
  if (!Number.isInteger(input.booksId) || input.booksId <= 0) {
    throw new Error(`账本 id 不合法: ${input.booksId}`);
  }
  const serverUrl = kind === BOOK_TYPE.remote ? input.serverUrl.trim() : '';
  if (kind === BOOK_TYPE.remote && serverUrl === '') {
    throw new Error('网络账本缺少服务器地址');
  }
  return {
    kind,
    serverUrl,
    booksId: input.booksId,
    bookName: normalizeDraftBookName(input.bookName),
  };
}

export function getDraftBookKey(target: DraftBookTarget): string {
  return target.kind === BOOK_TYPE.local
    ? `local:${target.booksId}`
    : `remote:${target.serverUrl}:${target.booksId}`;
}

export function isSameDraftBook(
  left: DraftBookTarget,
  right: DraftBookTarget,
): boolean {
  return getDraftBookKey(left) === getDraftBookKey(right);
}

export function isRemoteDraftBook(target: DraftBookTarget): boolean {
  return target.kind === BOOK_TYPE.remote;
}
