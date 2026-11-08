import { BOOK_TYPE, localApi, type Api } from '@pennyspring/api';

import { createMediaStore, type MediaStore } from '../../media';
import { getRemoteApi, type CurrentBookRef } from '../../stores/bookStore';
import {
  getServerToken,
  rehydrateNetworkBooks,
} from '../../stores/networkBookStore';
import type { DraftBookTarget } from './draftBook';

export function draftTargetFromBookRef(
  ref: CurrentBookRef,
  bookName: string,
): DraftBookTarget {
  return ref.kind === BOOK_TYPE.local
    ? {
        kind: BOOK_TYPE.local,
        serverUrl: '',
        booksId: ref.id,
        bookName,
      }
    : {
        kind: BOOK_TYPE.remote,
        serverUrl: ref.serverUrl,
        booksId: ref.bookId,
        bookName,
      };
}

export async function resolveBookApi(target: DraftBookTarget): Promise<Api> {
  if (target.kind === BOOK_TYPE.local) {
    return localApi;
  }
  await rehydrateNetworkBooks();
  const token = getServerToken(target.serverUrl);
  if (token === '') {
    throw new Error('服务器访问令牌未配置');
  }
  return getRemoteApi(target.serverUrl, token);
}

export async function resolveBookMedia(
  target: DraftBookTarget,
): Promise<MediaStore> {
  if (target.kind === BOOK_TYPE.local) {
    return createMediaStore({ kind: 'local', booksId: target.booksId });
  }
  await rehydrateNetworkBooks();
  const token = getServerToken(target.serverUrl);
  if (token === '') {
    throw new Error('服务器访问令牌未配置');
  }
  return createMediaStore({
    kind: 'remote',
    booksId: target.booksId,
    serverUrl: target.serverUrl,
    token,
  });
}
