import { ImagePicker, type ImagePickerValue } from '@pennyspring/ui';

export interface PersistedRecordImages {
  images: ImagePickerValue[];
  imagePaths: string[];
}

/**
 * 提交记账前把选图副本转存到永久目录；落库只使用返回的 imagePaths。
 */
export async function persistRecordImages(
  images: readonly ImagePickerValue[],
): Promise<PersistedRecordImages> {
  if (images.length === 0) {
    return { images: [], imagePaths: [] };
  }

  const persistedImages = await ImagePicker.persistImage([...images]);

  return {
    images: persistedImages,
    imagePaths: persistedImages.map(image => image.uri),
  };
}
