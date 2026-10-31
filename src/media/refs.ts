import type { MediaImageSource } from './types';

export const MEDIA_REF_PREFIX = 'media:';

const MEDIA_KEY_PATTERN = /^[0-9a-f-]+\.(?:jpg|png|webp)$/i;

export function isMediaRef(value: string): boolean {
  return value.startsWith(MEDIA_REF_PREFIX);
}

export function buildMediaRef(fileName: string): string {
  return `${MEDIA_REF_PREFIX}${fileName}`;
}

export function getMediaKey(ref: string): string | null {
  if (!isMediaRef(ref)) {
    return null;
  }
  const key = ref.slice(MEDIA_REF_PREFIX.length);
  return MEDIA_KEY_PATTERN.test(key) ? key : null;
}

function normalizeServerUrl(serverUrl: string): string {
  return serverUrl.replace(/\/+$/, '');
}

export function resolveMediaRef(ref: string, serverUrl?: string): string {
  if (!isMediaRef(ref)) {
    return ref;
  }
  const key = getMediaKey(ref);
  if (!key || !serverUrl) {
    return ref;
  }
  return `${normalizeServerUrl(serverUrl)}/api/media/${key}`;
}

export function toMediaRef(uri: string, serverUrl: string): string {
  if (isMediaRef(uri)) {
    return uri;
  }
  const mediaUrlPrefix = `${normalizeServerUrl(serverUrl)}/api/media/`;
  if (!uri.startsWith(mediaUrlPrefix)) {
    return uri;
  }
  const key = uri.slice(mediaUrlPrefix.length);
  return MEDIA_KEY_PATTERN.test(key) ? buildMediaRef(key) : uri;
}

export function buildMediaUploadUrl(serverUrl: string): string {
  return `${normalizeServerUrl(serverUrl)}/api/media/upload`;
}

export function buildAuthHeaders(
  token: string | undefined,
): Record<string, string> | undefined {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function isServerMediaRef(ref: string, serverUrl?: string): boolean {
  if (isMediaRef(ref)) {
    return Boolean(serverUrl);
  }
  if (!serverUrl) {
    return false;
  }
  return isMediaRef(toMediaRef(ref, serverUrl));
}

export function resolveMediaSource(
  ref: string,
  serverUrl?: string,
  token?: string,
): MediaImageSource {
  const uri = resolveMediaRef(ref, serverUrl);
  const headers = isServerMediaRef(ref, serverUrl)
    ? buildAuthHeaders(token)
    : undefined;
  return headers ? { uri, headers } : { uri };
}
