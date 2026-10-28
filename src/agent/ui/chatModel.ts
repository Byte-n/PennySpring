import dayjs from 'dayjs';

import type { AgentThreadRow } from '@pennyspring/api';

export {
  formatTokenCount,
  rowsToModelMessages,
  sumUsage,
  toDisplayMessages,
  toPersistedInputs,
} from '../core/messages';

export const NEW_THREAD_TITLE = '新对话';
const THREAD_TIME_FORMAT = 'MM-DD HH:mm';

export function getThreadTitle(thread: AgentThreadRow): string {
  return thread.title.trim() || NEW_THREAD_TITLE;
}

export function formatThreadTime(time: number): string {
  if (!Number.isFinite(time) || time <= 0) {
    return '时间未知';
  }
  return dayjs(time).format(THREAD_TIME_FORMAT);
}
