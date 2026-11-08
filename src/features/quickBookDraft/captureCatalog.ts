import {
  BOOK_TYPE,
  VISIBILITY,
  createRemoteApi,
  localApi,
  type AssetRow,
  type BookRow,
  type TypeRow,
} from '@pennyspring/api';

import { getBookKey, useBookStore } from '../../stores/bookStore';
import {
  getServerToken,
  rehydrateNetworkBooks,
  useNetworkBookStore,
} from '../../stores/networkBookStore';
import { setQuickBookCaptureCatalog } from './native';

export interface CaptureCatalogBookRef {
  kind: 'local' | 'remote';
  serverUrl: string;
  booksId: number;
  bookName: string;
}

export interface CaptureCatalogBook {
  key: string;
  ref: CaptureCatalogBookRef;
  name: string;
  available: boolean;
  unavailableReason?: string;
  assets: Array<{ id: number; name: string }>;
  types: Array<{ id: number; label: string; sort: number }>;
}

export interface CaptureCatalog {
  version: number;
  currentBookKey: string | null;
  books: CaptureCatalogBook[];
}

interface CatalogResources {
  assets: Array<{ id: number; name: string }>;
  types: Array<{ id: number; label: string; sort: number }>;
}

const EMPTY_RESOURCES: CatalogResources = { assets: [], types: [] };
const REMOTE_CATALOG_TIMEOUT_MS = 4_000;

let lastVersion = 0;
let publishQueue: Promise<boolean> = Promise.resolve(false);

function nextVersion(): number {
  lastVersion = Math.max(Date.now(), lastVersion + 1);
  return lastVersion;
}

function buildTypeOptions(
  types: readonly TypeRow[],
): CatalogResources['types'] {
  const parentIds = new Set(
    types.filter(type => type.parentId > 0).map(type => type.parentId),
  );
  const typeById = new Map(types.map(type => [type.id, type]));
  return types
    .filter(type => !parentIds.has(type.id))
    .sort(
      (left, right) =>
        left.sort - right.sort || left.name.localeCompare(right.name),
    )
    .map(type => {
      const parent =
        type.parentId > 0 ? typeById.get(type.parentId) : undefined;
      return {
        id: type.id,
        label: parent ? `${parent.name} / ${type.name}` : type.name,
        sort: type.sort,
      };
    });
}

function buildResources(
  assets: readonly AssetRow[],
  types: readonly TypeRow[],
): CatalogResources {
  return {
    assets: assets
      .filter(asset => asset.invisible !== VISIBILITY.hidden)
      .sort((left, right) => left.sort - right.sort || left.id - right.id)
      .map(asset => ({ id: asset.id, name: asset.name })),
    types: buildTypeOptions(types),
  };
}

function localBookCatalog(
  book: BookRow,
  resources: CatalogResources,
): CaptureCatalogBook {
  const ref: CaptureCatalogBookRef = {
    kind: BOOK_TYPE.local,
    serverUrl: '',
    booksId: book.id,
    bookName: book.name,
  };
  return {
    key: `local:${book.id}`,
    ref,
    name: book.name,
    available: true,
    assets: resources.assets,
    types: resources.types,
  };
}

async function loadLocalBooks(): Promise<CaptureCatalogBook[]> {
  const books = await localApi.book.getAll();
  return Promise.all(
    books.map(async book => {
      try {
        const [assets, types] = await Promise.all([
          localApi.asset.getByBook(book.id),
          localApi.type.getAll(book.id),
        ]);
        return localBookCatalog(book, buildResources(assets, types));
      } catch {
        return localBookCatalog(book, EMPTY_RESOURCES);
      }
    }),
  );
}

async function loadRemoteBooks(): Promise<CaptureCatalogBook[]> {
  await rehydrateNetworkBooks();
  const refs = useNetworkBookStore.getState().refs;
  return Promise.all(
    refs.map(async ref => {
      const name = `网络账本 #${ref.bookId}`;
      const catalogRef: CaptureCatalogBookRef = {
        kind: BOOK_TYPE.remote,
        serverUrl: ref.serverUrl,
        booksId: ref.bookId,
        bookName: name,
      };
      const key = `remote:${ref.serverUrl}:${ref.bookId}`;
      const token = getServerToken(ref.serverUrl);
      if (token === '') {
        return {
          key,
          ref: catalogRef,
          name,
          available: false,
          unavailableReason: '服务器访问令牌未配置',
          assets: [],
          types: [],
        };
      }
      try {
        const api = createRemoteApi(ref.serverUrl, {
          token,
          timeoutMs: REMOTE_CATALOG_TIMEOUT_MS,
          timeoutMessage: '网络账本目录加载超时',
        });
        const [book, assets, types] = await Promise.all([
          api.book.getById(ref.bookId),
          api.asset.getByBook(ref.bookId),
          api.type.getAll(ref.bookId),
        ]);
        const resolvedRef = { ...catalogRef, bookName: book.name };
        return {
          key,
          ref: resolvedRef,
          name: book.name,
          available: true,
          ...buildResources(assets, types),
        };
      } catch (error: unknown) {
        return {
          key,
          ref: catalogRef,
          name,
          available: false,
          unavailableReason:
            error instanceof Error ? error.message : '网络账本不可用',
          assets: [],
          types: [],
        };
      }
    }),
  );
}

async function publish(): Promise<boolean> {
  const currentRef = useBookStore.getState().currentBookRef;
  const currentBook = useBookStore.getState().currentBook;
  const [localBooks, remoteBooks] = await Promise.all([
    loadLocalBooks().catch(() => []),
    loadRemoteBooks().catch(() => []),
  ]);
  const currentBookKey = getBookKey(currentRef);
  const rawBooks = [...localBooks, ...remoteBooks];
  const normalizedCurrent =
    currentBookKey !== null &&
    rawBooks.some(book => book.key === currentBookKey)
      ? currentBookKey
      : null;
  const currentName = currentBook?.name;
  const books =
    normalizedCurrent !== null && currentName !== undefined
      ? rawBooks.map(book =>
          book.key === normalizedCurrent
            ? {
                ...book,
                name: currentName,
                ref: { ...book.ref, bookName: currentName },
              }
            : book,
        )
      : rawBooks;
  const catalog: CaptureCatalog = {
    version: nextVersion(),
    currentBookKey: normalizedCurrent,
    books,
  };
  return setQuickBookCaptureCatalog(JSON.stringify(catalog));
}

/** 发布目录快照；并发调用按顺序执行，旧版本由原生拒绝。 */
export function publishQuickBookCaptureCatalog(): Promise<boolean> {
  const run = publishQueue.then(publish, publish);
  publishQueue = run.catch(() => false);
  return run;
}
