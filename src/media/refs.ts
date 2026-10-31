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
