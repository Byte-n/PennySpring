import type { ImagePickerValue } from '@pennyspring/ui';

import type { QuickBookImage } from './types';

export function toQuickBookImagePickerValue(
  image: QuickBookImage,
): ImagePickerValue {
  return {
    uri: image.localPath,
    name: image.fileName,
    fileName: image.fileName,
    fileSize: image.fileSize,
    mimeType: image.mimeType,
    width: image.width,
    height: image.height,
    base64: image.base64,
  };
}
