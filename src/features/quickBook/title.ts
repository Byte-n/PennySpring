import dayjs from 'dayjs';

import {
  QUICK_BOOK_THREAD_TITLE_PREFIX,
  QUICK_BOOK_THREAD_TITLE_TIME_FORMAT,
} from './constants';

export function buildQuickBookThreadTitle(
  now: number | Date = Date.now(),
): string {
  return `${QUICK_BOOK_THREAD_TITLE_PREFIX} ${dayjs(now).format(
    QUICK_BOOK_THREAD_TITLE_TIME_FORMAT,
  )}`;
}
