import { useRequest } from 'ahooks';
import { BOOK_TYPE, localApi } from '@pennyspring/api';

import {
  getRemoteApi,
  type BookEntry,
  type CurrentBookRef,
} from '../../stores/bookStore';
import {
  type NetworkBookRef,
  useNetworkBookRefs,
} from '../../stores/networkBookStore';

export interface QuickBookItem {
  entry: BookEntry;
  ref: CurrentBookRef;
}

async function loadQuickBooks(
  networkRefs: NetworkBookRef[],
): Promise<QuickBookItem[]> {
  const [localBooks, networkResults] = await Promise.all([
    localApi.book.getAll(),
    Promise.allSettled(
      networkRefs.map(async ref => {
        const book = await getRemoteApi(ref.serverUrl).book.getById(ref.bookId);
        return { book, ref };
      }),
    ),
  ]);

  const localItems: QuickBookItem[] = localBooks.map(row => ({
    entry: { kind: BOOK_TYPE.local, ...row },
    ref: { kind: 'local', id: row.id },
  }));

  const networkItems: QuickBookItem[] = networkResults.flatMap(result =>
    result.status === 'fulfilled'
      ? [
          {
            entry: { kind: BOOK_TYPE.remote, ...result.value.book },
            ref: {
              kind: 'remote',
              serverUrl: result.value.ref.serverUrl,
              bookId: result.value.ref.bookId,
            },
          } as QuickBookItem,
        ]
      : [],
  );

  return [...localItems, ...networkItems];
}

export function useQuickBookList() {
  const networkRefs = useNetworkBookRefs();
  const {
    data = [],
    error,
    loading,
    run,
  } = useRequest(() => loadQuickBooks(networkRefs), { manual: true });

  return { error, items: data, loading, refresh: run };
}
