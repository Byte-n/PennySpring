import type { ImagePickerValue } from '@pennyspring/ui';

import { toMediaSaveInput, type MediaStore } from '../../media';

export interface PersistedRecordImages {
  images: ImagePickerValue[];
  imagePaths: string[];
}

/**
 * 提交记账前把选图交给当前账本的 MediaStore；落库只使用返回的 refs。
 */
export async function persistRecordImages(
  images: readonly ImagePickerValue[],
  media: MediaStore,
): Promise<PersistedRecordImages> {
  if (images.length === 0) {
    return { images: [], imagePaths: [] };
  }

  const persistedImages: ImagePickerValue[] = [];
  const imagePaths: string[] = [];
  for (const image of images) {
    const ref = await media.save(toMediaSaveInput(image));
    imagePaths.push(ref);
    const source = media.resolveSource(ref);
    persistedImages.push({
      ...image,
      uri: source.uri,
      headers: source.headers,
    });
  }

  return { images: persistedImages, imagePaths };
}
