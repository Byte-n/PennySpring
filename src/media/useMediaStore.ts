import { useMemo } from 'react';

import { useBookStore } from '../stores/bookStore';
import { useServerToken } from '../stores/networkBookStore';
import { createMediaStore } from './store';
import type { MediaStore } from './types';

export function useMediaStore(): MediaStore | null {
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const currentBook = useBookStore(state => state.currentBook);
  const remoteServerUrl =
    currentBookRef?.kind === 'remote' ? currentBookRef.serverUrl : undefined;
  const remoteToken = useServerToken(remoteServerUrl);

  return useMemo(() => {
    if (currentBookRef?.kind === 'remote') {
      return createMediaStore({
        kind: 'remote',
        booksId: currentBookRef.bookId,
        serverUrl: currentBookRef.serverUrl,
        token: remoteToken,
      });
    }
    if (currentBookRef?.kind === 'local') {
      return createMediaStore({ kind: 'local', booksId: currentBookRef.id });
    }
    if (currentBook?.kind === 'local') {
      return createMediaStore({ kind: 'local', booksId: currentBook.id });
    }
    return null;
  }, [currentBook, currentBookRef, remoteToken]);
}
