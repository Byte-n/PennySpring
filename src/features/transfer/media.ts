export const MEDIA_REF_PREFIX = 'media:'

const DATA_URL_PATTERN = /^data:([^;,]*)(;base64)?,([\s\S]*)$/i
const KNOWN_IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
  'heif',
])

export interface ParsedDataUrl {
  mimeType: string
  base64: string
}

export function parseDataUrl(value: string): ParsedDataUrl | null {
  const matched = DATA_URL_PATTERN.exec(value)
  if (!matched || matched[2] !== ';base64') {
    return null
  }
  return {
    mimeType: matched[1] || 'application/octet-stream',
    base64: matched[3] ?? '',
  }
}

export function isDataUrl(value: string): boolean {
  return DATA_URL_PATTERN.test(value)
}

export function isExternalHttpUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://')
}

export function isMediaRef(value: string): boolean {
  return value.startsWith(MEDIA_REF_PREFIX)
}

export function isLocalFileUri(value: string): boolean {
  return (
    value.startsWith('file://') ||
    value.startsWith('content://') ||
    (value.startsWith('/') && !value.startsWith('//'))
  )
}

export function isPackagedMediaCandidate(value: string): boolean {
  return isDataUrl(value) || isLocalFileUri(value) || isMediaRef(value)
}

export function getMediaKey(value: string): string | null {
  return isMediaRef(value) ? value.slice(MEDIA_REF_PREFIX.length) : null
}

export function toMediaRef(key: string): string {
  return `${MEDIA_REF_PREFIX}${key}`
}

export function inferExtensionFromUri(uri: string): string {
  const path = uri.split('?')[0]?.split('#')[0] ?? ''
  const matched = /\.([a-z0-9]+)$/i.exec(path)
  const extension = matched?.[1]?.toLowerCase()
  return extension && KNOWN_IMAGE_EXTENSIONS.has(extension) ? extension : 'jpg'
}

export function inferExtensionFromMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase()
  if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'jpg'
  if (normalized === 'image/png') return 'png'
  if (normalized === 'image/webp') return 'webp'
  if (normalized === 'image/gif') return 'gif'
  if (normalized === 'image/heic') return 'heic'
  if (normalized === 'image/heif') return 'heif'
  return 'jpg'
}

export function inferMimeTypeFromUri(uri: string): string {
  const extension = inferExtensionFromUri(uri)
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'heic':
      return 'image/heic'
    case 'heif':
      return 'image/heif'
    default:
      return 'application/octet-stream'
  }
}

export function base64ByteLength(base64: string): number {
  const normalized = base64.replace(/\s/g, '')
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding)
}

export function collectMediaRefsFromValue(
  value: unknown,
  target: Set<string> = new Set(),
): Set<string> {
  if (typeof value === 'string') {
    if (isPackagedMediaCandidate(value)) {
      target.add(value)
    }
    return target
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectMediaRefsFromValue(item, target)
    }
    return target
  }
  if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value)) {
      collectMediaRefsFromValue(item, target)
    }
  }
  return target
}

export function collectMediaRefsFromJsonString(
  value: string,
  target: Set<string> = new Set(),
): Set<string> {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('AI 消息格式不正确')
  }
  return collectMediaRefsFromValue(parsed, target)
}
