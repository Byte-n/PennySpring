import { localApi } from '@pennyspring/api';

import { cleanupQuickBookDraftOrphanImages } from './native';

import { bumpDraftVersion } from '../../stores/draftVersionStore';
import { deleteDraftImageFiles } from './deleteDraftImages';

export async function cleanupQuickBookDraftsOnStartup(): Promise<void> {
  const deletedImagePaths = await localApi.quickBookDraft.cleanup();
  await deleteDraftImageFiles(deletedImagePaths);
  try {
    await cleanupQuickBookDraftOrphanImages();
  } catch {
    // 孤儿图片清理失败不阻塞启动与角标刷新。
  }
  bumpDraftVersion();
}
