import type { FileUIPart } from 'ai';
import type {
  ImagePickerImageQuality,
  ImagePickerValue,
} from '@pennyspring/ui';

import {
  toMediaSaveInput,
  type MediaStore,
} from '../../media';
import {
  createAgentAttachment,
  type AgentAttachment,
} from '../core/attachments';
import { AGENT_IMAGE_UNREADABLE_MESSAGE } from './copy';

export const AGENT_MAX_IMAGE_ATTACHMENTS = 4;
export const AGENT_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const AGENT_IMAGE_MAX_DIMENSION = 1_600;
export const AGENT_IMAGE_QUALITY: ImagePickerImageQuality = 0.8;

const DEFAULT_IMAGE_MEDIA_TYPE = 'image/jpeg';
const DEFAULT_IMAGE_FILENAME = 'image.jpg';

export interface PreparedImageMessage {
  files: FileUIPart[];
  attachments: AgentAttachment[];
}

export function isSendableImageValue(value: ImagePickerValue): boolean {
  if (!value.uri.trim()) {
    return false;
  }
  return value.fileSize === undefined || value.fileSize <= AGENT_IMAGE_MAX_BYTES;
}

function getImageMediaType(value: ImagePickerValue): string {
  return value.mimeType?.startsWith('image/')
    ? value.mimeType
    : DEFAULT_IMAGE_MEDIA_TYPE;
}

function getImageFilename(value: ImagePickerValue): string {
  return value.fileName ?? value.name ?? DEFAULT_IMAGE_FILENAME;
}

export function toImageFilePart(value: ImagePickerValue): FileUIPart | null {
  if (!isSendableImageValue(value) || !value.base64?.trim()) {
    return null;
  }

  const mediaType = getImageMediaType(value);

  return {
    type: 'file',
    mediaType,
    filename: getImageFilename(value),
    url: `data:${mediaType};base64,${value.base64}`,
  };
}

export function toRefFilePart(
  ref: string,
  value: ImagePickerValue,
): FileUIPart | null {
  if (!isSendableImageValue(value)) {
    return null;
  }

  return {
    type: 'file',
    mediaType: getImageMediaType(value),
    filename: getImageFilename(value),
    url: ref,
  };
}

export function toAgentAttachment(
  ref: string,
  value: ImagePickerValue,
  options: { localPath?: string } = {},
): AgentAttachment {
  return createAgentAttachment({
    ref,
    localPath: options.localPath,
    mediaType: value.mimeType,
    filename: value.fileName ?? value.name,
  });
}

export async function prepareImageMessage(
  images: readonly ImagePickerValue[],
  media: MediaStore,
): Promise<PreparedImageMessage> {
  const isLocal = media.scope.kind === 'local';
  for (const image of images) {
    if (!isSendableImageValue(image) || (isLocal && !image.base64?.trim())) {
      throw new Error(AGENT_IMAGE_UNREADABLE_MESSAGE);
    }
  }

  const files: FileUIPart[] = [];
  const attachments: AgentAttachment[] = [];

  for (const image of images) {
    const ref = await media.save(toMediaSaveInput(image));
    const file = isLocal
      ? toImageFilePart({ ...image, uri: ref })
      : toRefFilePart(ref, image);
    if (!file) {
      throw new Error(AGENT_IMAGE_UNREADABLE_MESSAGE);
    }
    files.push(file);
    attachments.push(
      toAgentAttachment(ref, image, isLocal ? { localPath: ref } : {}),
    );
  }

  return { files, attachments };
}
