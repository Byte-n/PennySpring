import {
  createDraftBookTarget,
  type DraftBookTarget,
} from '../quickBookDraft/draftBook';

export interface QuickTemplateRecordTaskInput {
  requestId: string;
  templateId: number;
  target: DraftBookTarget;
}

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
  return value.trim();
}

function readPositiveInt(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Headless 参数 ${key} 格式不正确`);
  }
  return value;
}

function parseBookRef(value: unknown): DraftBookTarget {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new Error('Headless 参数 bookRef 格式不正确');
    }
  }
  if (!isRecord(parsed)) {
    throw new Error('Headless 参数 bookRef 格式不正确');
  }
  try {
    return createDraftBookTarget({
      kind: parsed.kind as DraftBookTarget['kind'],
      serverUrl: typeof parsed.serverUrl === 'string' ? parsed.serverUrl : '',
      booksId: typeof parsed.booksId === 'number' ? parsed.booksId : 0,
      bookName: typeof parsed.bookName === 'string' ? parsed.bookName : '',
    });
  } catch (error: unknown) {
    throw new Error(
      `Headless 参数 bookRef 格式不正确：${
        error instanceof Error ? error.message : ''
      }`,
    );
  }
}

export function parseQuickTemplateRecordTaskData(
  data: unknown,
): QuickTemplateRecordTaskInput {
  if (!isRecord(data)) {
    throw new Error('Headless 任务参数格式不正确');
  }
  return {
    requestId: readRequiredString(data, 'requestId'),
    templateId: readPositiveInt(data, 'templateId'),
    target: parseBookRef(data.bookRef),
  };
}
