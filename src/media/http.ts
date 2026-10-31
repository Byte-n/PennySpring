import { buildMediaUploadUrl, isMediaRef } from './refs';
import type { MediaSaveInput } from './types';

const UPLOAD_TIMEOUT_MS = 60_000;
const DEFAULT_IMAGE_MIME_TYPE = 'image/jpeg';
const DEFAULT_IMAGE_FILE_NAME = 'image.jpg';

function getMimeType(input: MediaSaveInput): string {
  return input.mimeType?.startsWith('image/')
    ? input.mimeType
    : DEFAULT_IMAGE_MIME_TYPE;
}

function getFileName(input: MediaSaveInput): string {
  return input.fileName?.trim() || DEFAULT_IMAGE_FILE_NAME;
}

export async function uploadMedia(
  serverUrl: string,
  booksId: number,
  input: MediaSaveInput,
): Promise<string> {
  const form = new FormData();
  form.append('booksId', String(booksId));
  form.append('file', {
    uri: input.uri,
    name: getFileName(input),
    type: getMimeType(input),
  } as unknown as Blob);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    const response = await fetch(buildMediaUploadUrl(serverUrl), {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as {
      result?: unknown;
      error?: unknown;
    } | null;

    if (!response.ok) {
      throw new Error(
        typeof payload?.error === 'string'
          ? payload.error
          : `图片上传失败（${response.status}）`,
      );
    }
    if (
      typeof payload?.result !== 'string' ||
      !isMediaRef(payload.result)
    ) {
      throw new Error('图片上传返回格式不正确');
    }
    return payload.result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('图片上传超时');
    }
    throw error instanceof Error ? error : new Error('图片上传失败');
  } finally {
    clearTimeout(timer);
  }
}
