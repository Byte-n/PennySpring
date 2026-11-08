import { FileSystem, Dirs } from 'react-native-file-access';
import {
  QUICK_BOOK_DRAFT_STATUS,
  localApi,
  type QuickBookDraftStatusValue,
} from '@pennyspring/api';

import { bumpDraftVersion } from '../../stores/draftVersionStore';
import { quickBookDraftCache } from './draftCacheStorage';
import { deleteDraftImageFiles } from './deleteDraftImages';

const DRAFT_DIRECTORY = 'quick-book-drafts';
const STAGING_ORPHAN_AGE_MS = 24 * 60 * 60 * 1000;

const ALL_DRAFT_STATUSES: QuickBookDraftStatusValue[] =
  QUICK_BOOK_DRAFT_STATUS.values();

function toLocalPath(uri: string): string | null {
  if (uri.startsWith('file://')) {
    try {
      return decodeURIComponent(uri.slice('file://'.length));
    } catch {
      return null;
    }
  }
  return uri.startsWith('/') ? uri : null;
}

function fileNameOf(path: string): string | null {
  const name = path.split('/').pop();
  return name === undefined || name === '' ? null : name;
}

async function cleanupStagingImages(): Promise<void> {
  const directory = `${Dirs.DocumentDir}/${DRAFT_DIRECTORY}`;
  const drafts = await quickBookDraftCache.list({
    statuses: ALL_DRAFT_STATUSES,
  });
  const referenced = new Set<string>();
  for (const draft of drafts) {
    const localPath = toLocalPath(draft.imagePath);
    const name = localPath === null ? null : fileNameOf(localPath);
    if (name !== null) {
      referenced.add(name);
    }
  }

  let names: string[];
  try {
    names = await FileSystem.ls(directory);
  } catch {
    return;
  }
  const now = Date.now();
  await Promise.all(
    names.map(async name => {
      if (referenced.has(name)) {
        return;
      }
      const path = `${directory}/${name}`;
      try {
        const stat = await FileSystem.stat(path);
        if (
          stat.type !== 'file' ||
          now - stat.lastModified <= STAGING_ORPHAN_AGE_MS
        ) {
          return;
        }
        await FileSystem.unlink(path);
      } catch {
        // 文件可能已被其他清理流程删除；忽略。
      }
    }),
  );
}

export async function cleanupQuickBookDraftsOnStartup(): Promise<void> {
  const localBooks = await localApi.book.getAll();
  const localBookIds = new Set(localBooks.map(book => book.id));
  const deletedImagePaths = await quickBookDraftCache.cleanup({
    isLocalBookExisting: async booksId => localBookIds.has(booksId),
  });
  await deleteDraftImageFiles(deletedImagePaths);
  await cleanupStagingImages();
  bumpDraftVersion();
}
