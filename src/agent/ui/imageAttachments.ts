import type { FileUIPart } from 'ai';
import type {
  ImagePickerImageQuality,
  ImagePickerValue,
} from '@pennyspring/ui';

import {
  createAgentAttachment,
  type AgentAttachment,
} from '../core/attachments';

export const AGENT_MAX_IMAGE_ATTACHMENTS = 4;
export const AGENT_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const AGENT_IMAGE_MAX_DIMENSION = 1_600;
export const AGENT_IMAGE_QUALITY: ImagePickerImageQuality = 0.8;

const DEFAULT_IMAGE_MEDIA_TYPE = 'image/jpeg';
const DEFAULT_IMAGE_FILENAME = 'image.jpg';

export function isSendableImageValue(value: ImagePickerValue): boolean {
  if (!value.base64?.trim()) {
    return false;
  }
  return value.fileSize === undefined || value.fileSize <= AGENT_IMAGE_MAX_BYTES;
}

export function toImageFilePart(value: ImagePickerValue): FileUIPart | null {
  if (!isSendableImageValue(value)) {
    return null;
  }

  const mediaType = value.mimeType?.startsWith('image/')
    ? value.mimeType
    : DEFAULT_IMAGE_MEDIA_TYPE;
  const filename =
    value.fileName ?? value.name ?? DEFAULT_IMAGE_FILENAME;

  return {
    type: 'file',
    mediaType,
    filename,
    url: `data:${mediaType};base64,${value.base64}`,
  };
}

export function toImageFileParts(
  values: readonly ImagePickerValue[],
): FileUIPart[] {
  return values
    .map(toImageFilePart)
    .filter((part): part is FileUIPart => part !== null);
}

export function toAgentAttachment(value: ImagePickerValue): AgentAttachment {
  return createAgentAttachment({
    localPath: value.uri,
    mediaType: value.mimeType,
    filename: value.fileName ?? value.name,
  });
}

export function toAgentAttachments(
  values: readonly ImagePickerValue[],
): AgentAttachment[] {
  return values.map(toAgentAttachment);
}
