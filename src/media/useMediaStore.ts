import { useMemo } from 'react';

import { useBookStore } from '../stores/bookStore';
import { createMediaStore } from './store';
import type { MediaStore } from './types';

export function useMediaStore(): MediaStore | null {
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const currentBook = useBookStore(state => state.currentBook);

  return useMemo(() => {
    if (currentBookRef?.kind === 'remote') {
      return createMediaStore({
        kind: 'remote',
        booksId: currentBookRef.bookId,
        serverUrl: currentBookRef.serverUrl,
      });
    }
    if (currentBookRef?.kind === 'local') {
      return createMediaStore({ kind: 'local', booksId: currentBookRef.id });
    }
    if (currentBook?.kind === 'local') {
      return createMediaStore({ kind: 'local', booksId: currentBook.id });
    }
    return null;
  }, [currentBook, currentBookRef]);
}
