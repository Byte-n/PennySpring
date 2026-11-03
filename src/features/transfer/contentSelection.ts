import type { BookContentOptions } from './types';

export const DEFAULT_BOOK_CONTENT_OPTIONS: BookContentOptions = {
  includeImages: true,
  includeAgent: false,
  includeAiConfig: true,
};

export interface BookContentSelection extends BookContentOptions {
  bookId: number;
}

export interface TransferContentSelection {
  books: BookContentSelection[];
  includeSettings: boolean;
  includeNetworkBooks: boolean;
}

export function createTransferContentSelection(
  selectedBookIds: number[],
  bookOptions: Record<number, BookContentOptions>,
  includeSettings: boolean,
  includeNetworkBooks: boolean,
  fallback: BookContentOptions = DEFAULT_BOOK_CONTENT_OPTIONS,
): TransferContentSelection {
  return {
    books: selectedBookIds.map(bookId => ({
      bookId,
      ...(bookOptions[bookId] ?? fallback),
    })),
    includeSettings,
    includeNetworkBooks,
  };
}

export function hasTransferContent(
  selection: TransferContentSelection,
): boolean {
  return (
    selection.books.length > 0 ||
    selection.includeSettings ||
    selection.includeNetworkBooks
  );
}
