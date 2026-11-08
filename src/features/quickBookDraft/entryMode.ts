export type QuickBookEntryMode = 'floatingBall' | 'notification';

export const DEFAULT_QUICK_BOOK_ENTRY_MODE: QuickBookEntryMode = 'floatingBall';

export function parseQuickBookEntryMode(
  value: unknown,
): QuickBookEntryMode | null {
  return value === 'floatingBall' || value === 'notification' ? value : null;
}

export function normalizeQuickBookEntryMode(
  value: unknown,
): QuickBookEntryMode {
  return parseQuickBookEntryMode(value) ?? DEFAULT_QUICK_BOOK_ENTRY_MODE;
}
