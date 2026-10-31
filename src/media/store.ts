import { ImagePicker } from '@pennyspring/ui';

import { uploadMedia } from './http';
import { isMediaRef, resolveMediaSource, toMediaRef } from './refs';
import type { MediaSaveInput, MediaScope, MediaStore } from './types';

const DEFAULT_IMAGE_MIME_TYPE = 'image/jpeg';
const READ_TIMEOUT_MS = 30_000;

const SUPPORTED_REMOTE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function inferExtension(value: string): string | undefined {
  const pathPart = value.split('?')[0]?.split('#')[0] ?? '';
  const matched = /\.([a-z0-9]+)$/i.exec(pathPart);
  return matched?.[1]?.toLowerCase();
}

function resolveMimeType(input: MediaSaveInput): string {
  const declared = input.mimeType?.trim().toLowerCase();
  if (declared === 'image/jpg') {
    return 'image/jpeg';
  }
  if (declared?.startsWith('image/')) {
    return declared;
  }
  const extension = inferExtension(input.fileName ?? input.uri);
  return extension
    ? MIME_BY_EXTENSION[extension] ?? DEFAULT_IMAGE_MIME_TYPE
    : DEFAULT_IMAGE_MIME_TYPE;
}

function resolveFileName(input: MediaSaveInput, mimeType: string): string {
  const fileName = input.fileName?.trim();
  if (fileName) {
    return fileName;
  }
  return `image.${EXTENSION_BY_MIME[mimeType] ?? 'jpg'}`;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('图片读取失败'));
      }
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('图片读取失败'));
    };
    reader.readAsDataURL(blob);
  });
}

async function readRefAsDataUrl(
  ref: string,
  serverUrl: string | undefined,
  token: string | undefined,
  cache: Map<string, string>,
): Promise<string> {
  if (ref.startsWith('data:')) {
    return ref;
  }

  const cached = cache.get(ref);
  if (cached !== undefined) {
    return cached;
  }

  const source = resolveMediaSource(ref, serverUrl, token);
  if (isMediaRef(ref) && source.uri === ref) {
    throw new Error('图片引用无法解析');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);
  try {
    const response = await fetch(source.uri, {
      headers: source.headers,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`图片读取失败（${response.status}）`);
    }
    const dataUrl = await readBlobAsDataUrl(await response.blob());
    cache.set(ref, dataUrl);
    return dataUrl;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('图片读取超时');
    }
    throw error instanceof Error ? error : new Error('图片读取失败');
  } finally {
    clearTimeout(timer);
  }
}

function createLocalStore(
  scope: Extract<MediaScope, { kind: 'local' }>,
): MediaStore {
  const cache = new Map<string, string>();

  return {
    scope,
    async save(input) {
      if (isMediaRef(input.uri)) {
        throw new Error('本地账本不支持网络媒体引用');
      }
      const mimeType = resolveMimeType(input);
      const persisted = await ImagePicker.persistImage({
        uri: input.uri,
        fileName: resolveFileName(input, mimeType),
        mimeType,
        base64: input.base64,
      });
      return persisted.uri;
    },
    resolveSource(ref) {
      return { uri: ref };
    },
    toRef(uri) {
      return uri;
    },
    toDataUrl(ref) {
      return readRefAsDataUrl(ref, undefined, undefined, cache);
    },
  };
}

function createRemoteStore(
  scope: Extract<MediaScope, { kind: 'remote' }>,
): MediaStore {
  const cache = new Map<string, string>();
  const uploadedRefs = new Map<string, string>();

  return {
    scope,
    async save(input) {
      const ref = toMediaRef(input.uri, scope.serverUrl);
      if (isMediaRef(ref)) {
        return ref;
      }
      if (input.uri.startsWith('http://') || input.uri.startsWith('https://')) {
        throw new Error('暂不支持上传外部图片地址');
      }
      const mimeType = resolveMimeType(input);
      if (!SUPPORTED_REMOTE_MIME_TYPES.has(mimeType)) {
        throw new Error('仅支持 JPG、PNG、WebP 图片');
      }
      const cacheKey = `${input.uri}|${mimeType}|${input.fileName ?? ''}|${
        input.fileSize ?? ''
      }`;
      const cachedRef = uploadedRefs.get(cacheKey);
      if (cachedRef !== undefined) {
        return cachedRef;
      }
      const uploadedRef = await uploadMedia(
        scope.serverUrl,
        scope.token,
        scope.booksId,
        {
          ...input,
          mimeType,
          fileName: resolveFileName(input, mimeType),
        },
      );
      uploadedRefs.set(cacheKey, uploadedRef);
      return uploadedRef;
    },
    resolveSource(ref) {
      return resolveMediaSource(ref, scope.serverUrl, scope.token);
    },
    toRef(uri) {
      return toMediaRef(uri, scope.serverUrl);
    },
    toDataUrl(ref) {
      return readRefAsDataUrl(ref, scope.serverUrl, scope.token, cache);
    },
  };
}

export function createMediaStore(scope: MediaScope): MediaStore {
  return scope.kind === 'local'
    ? createLocalStore(scope)
    : createRemoteStore(scope);
}
