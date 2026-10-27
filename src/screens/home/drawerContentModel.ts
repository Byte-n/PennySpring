import { BOOK_TYPE } from '@pennyspring/api';

import '../../utils/prototype';
import type { BookEntry, CurrentBookRef } from '../../stores/bookStore';

const LOCAL_STORAGE_LABEL = '本地 · 数据保存在此设备';
const LOCAL_STORAGE_SHORT_LABEL = '本地';
const REMOTE_STORAGE_LABEL = '网络';
const UNKNOWN_TIME_LABEL = '未知';

export function stripServerProtocol(serverUrl: string): string {
  return serverUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

/**
 * 账本卡的存储位置文案：本地写设备，网络写 host。
 * ref 缺失时退回账本来源类型，只给「网络 / 本地」。
 */
export function getBookStorageLabel(
  book: BookEntry | null,
  ref: CurrentBookRef | null,
): string {
  if (ref?.kind === 'remote') {
    return `${REMOTE_STORAGE_LABEL} · ${stripServerProtocol(ref.serverUrl)}`;
  }

  if (book?.kind === BOOK_TYPE.remote) {
    return REMOTE_STORAGE_LABEL;
  }

  return LOCAL_STORAGE_LABEL;
}

export function getBookFooterStorage(book: BookEntry): string {
  return book.kind === BOOK_TYPE.remote
    ? REMOTE_STORAGE_LABEL
    : LOCAL_STORAGE_SHORT_LABEL;
}

export function formatUpdatedTime(time: number | undefined): string {
  if (time === undefined || !Number.isFinite(time) || time <= 0) {
    return UNKNOWN_TIME_LABEL;
  }

  return time.formatDateBy('MM-DD HH:mm');
}
