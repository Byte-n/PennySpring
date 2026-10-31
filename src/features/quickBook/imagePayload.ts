import type { FileUIPart } from 'ai';
import type { ImagePickerValue } from '@pennyspring/ui';

import {
  createAgentAttachment,
  type AgentAttachment,
} from '../../agent/core/attachments';
import { toImageFilePart } from '../../agent/ui/imageAttachments';
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

export function toQuickBookFilePart(image: QuickBookImage): FileUIPart | null {
  return toImageFilePart(toQuickBookImagePickerValue(image));
}

export function toQuickBookAttachment(image: QuickBookImage): AgentAttachment {
  return createAgentAttachment({
    localPath: image.localPath,
    mediaType: image.mimeType,
    filename: image.fileName,
  });
}
