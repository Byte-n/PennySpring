const ONE_SECOND_MS = 1_000;
const ONE_MINUTE_MS = 60_000;
const ONE_HOUR_MS = 3_600_000;

export interface SyncSummaryEntry {
  serial: string;
  lastAtMs: number | undefined;
}

export function formatRelative(fromMs: number, nowMs: number): string {
  const diff = Math.max(0, nowMs - fromMs);
  if (diff < ONE_SECOND_MS) {
    return '刚刚';
  }
  if (diff < ONE_MINUTE_MS) {
    return `${Math.floor(diff / ONE_SECOND_MS)}秒前`;
  }
  if (diff < ONE_HOUR_MS) {
    return `${Math.floor(diff / ONE_MINUTE_MS)}分钟前`;
  }
  return `${Math.floor(diff / ONE_HOUR_MS)}小时前`;
}

export function formatSyncTitle(
  entries: readonly SyncSummaryEntry[],
  nowMs: number,
): string {
  if (entries.length === 0) {
    return '';
  }
  const parts = entries.map(({ serial, lastAtMs }) => {
    const when =
      lastAtMs === undefined ? '等待中' : formatRelative(lastAtMs, nowMs);
    return `${serial} ${when}`;
  });
  return `db sync: ${parts.join(', ')}`;
}
