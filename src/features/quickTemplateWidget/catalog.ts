import type { BookTypeValue } from '@pennyspring/api';

import { useBookStore } from '../../stores/bookStore';
import {
  draftTargetFromBookRef,
  resolveBookApi,
} from '../quickBookDraft/bookApi';
import {
  type QuickTemplateWidgetCatalog,
  setQuickTemplateWidgetCatalog,
} from './native';

let lastVersion = 0;
let publishQueue: Promise<boolean> = Promise.resolve(false);

function nextVersion(): number {
  lastVersion = Math.max(Date.now(), lastVersion + 1);
  return lastVersion;
}

function normalizeKind(kind: BookTypeValue): 'local' | 'remote' {
  return kind === 'remote' ? 'remote' : 'local';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return '账本数据不可用';
}

/**
 * 构建当前账本的桌面小组件快照。
 * 只包含模板 id 与完整名称；原生负责按尺寸取前 N 个、截断到 3 个字。
 */
export async function buildQuickTemplateWidgetCatalog(): Promise<QuickTemplateWidgetCatalog> {
  const version = nextVersion();
  const { currentBookRef, currentBook } = useBookStore.getState();
  if (currentBookRef === null || currentBook === null) {
    return { version, book: null };
  }

  const target = draftTargetFromBookRef(currentBookRef, currentBook.name);
  const baseBook = {
    kind: normalizeKind(target.kind),
    serverUrl: target.serverUrl,
    booksId: target.booksId,
    bookName: target.bookName || currentBook.name,
  };

  try {
    const api = await resolveBookApi(target);
    const templates = await api.quickTemplate.list(target.booksId);
    return {
      version,
      book: {
        ...baseBook,
        available: true,
        unavailableReason: '',
        templates: templates.map(template => ({
          id: template.id,
          name: template.name,
        })),
      },
    };
  } catch (error: unknown) {
    return {
      version,
      book: {
        ...baseBook,
        available: false,
        unavailableReason: getErrorMessage(error),
        templates: [],
      },
    };
  }
}

async function publish(): Promise<boolean> {
  const catalog = await buildQuickTemplateWidgetCatalog();
  return setQuickTemplateWidgetCatalog(JSON.stringify(catalog));
}

/** 发布小组件快照；并发调用按顺序执行，旧版本由原生拒绝。 */
export function publishQuickTemplateWidgetCatalog(): Promise<boolean> {
  const run = publishQueue.then(publish, publish);
  publishQueue = run.catch(() => false);
  return run;
}
