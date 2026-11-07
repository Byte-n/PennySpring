import {
  QUICK_BOOK_DRAFT_SOURCE,
  type QuickBookDraftSourceValue,
} from '@pennyspring/api';

import {
  runQuickBookDraft,
  type RunQuickBookDraftInput,
} from './runQuickBookDraft';

export const QUICK_BOOK_DRAFT_TASK_NAME = 'QuickBookDraftTask';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(
  data: Record<string, unknown>,
  key: string,
): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Headless 参数 ${key} 缺失或格式不正确`);
  }
  return value;
}

function readBooksId(data: Record<string, unknown>): number {
  const value = data.booksId ?? data.bookId;
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error('Headless 参数 booksId 缺失或格式不正确');
  }
  return value;
}

function readOptionalId(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  if (value === undefined) {
    return 0;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`Headless 参数 ${key} 格式不正确`);
  }
  return value;
}

function readOptionalSource(
  data: Record<string, unknown>,
): QuickBookDraftSourceValue | undefined {
  const value = data.source;
  if (value === undefined) {
    return undefined;
  }
  if (
    typeof value !== 'string' ||
    !QUICK_BOOK_DRAFT_SOURCE.values().includes(
      value as QuickBookDraftSourceValue,
    )
  ) {
    throw new Error('Headless 参数 source 格式不正确');
  }
  return value as QuickBookDraftSourceValue;
}

/** 兼容预设对象与设计稿中的顶层 assetId/typeId 两种传参。 */
export function parseQuickBookDraftTaskData(
  data: unknown,
): RunQuickBookDraftInput {
  if (!isRecord(data)) {
    throw new Error('Headless 任务参数格式不正确');
  }
  const draftId = readRequiredString(data, 'draftId');
  const imagePath = readRequiredString(data, 'imagePath');
  const booksId = readBooksId(data);
  const presetSource = isRecord(data.preset) ? data.preset : data;
  const assetId = readOptionalId(presetSource, 'assetId');
  const typeId = readOptionalId(presetSource, 'typeId');
  const source = readOptionalSource(data);

  return {
    draftId,
    imagePath,
    booksId,
    ...(source === undefined ? {} : { source }),
    ...(assetId > 0 || typeId > 0 ? { preset: { assetId, typeId } } : {}),
  };
}

/** Android HeadlessJsTaskService 通过 AppRegistry.startHeadlessTask 调用。 */
export async function QuickBookDraftTask(data: unknown): Promise<void> {
  await runQuickBookDraft(parseQuickBookDraftTaskData(data));
}
