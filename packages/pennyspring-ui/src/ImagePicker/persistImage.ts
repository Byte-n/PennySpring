import { keepLocalCopy } from '@react-native-documents/picker';
import type { FileToCopy } from '@react-native-documents/picker';
import type { ImagePickerSelectedValue, ImagePickerValue } from './types';

const IMAGE_FILE_EXTENSION = /\.(jpe?g|png|gif|webp|heic|heif)$/i;

// keepLocalCopy 的 documentDirectory 在 iOS 落在 /Documents/，Android 落在 filesDir（路径含 /files/）。
const PERMANENT_STORAGE_MARKERS = ['/Documents/', '/files/'] as const;

function normalizeFileName(value: ImagePickerValue): string {
  const raw =
    value.fileName ?? value.name ?? value.uri.split('/').pop() ?? 'image';
  const safe = raw.replace(/[^\w.-]/g, '_');

  if (safe === '') {
    return 'image.jpg';
  }

  return IMAGE_FILE_EXTENSION.test(safe) ? safe : `${safe}.jpg`;
}

function isPersistedUri(uri: string): boolean {
  return PERMANENT_STORAGE_MARKERS.some(marker => uri.includes(marker));
}

function toFileToCopy(image: ImagePickerValue): FileToCopy {
  return {
    uri: image.uri,
    fileName: normalizeFileName(image),
  };
}

export async function persistImage(
  value: ImagePickerValue,
): Promise<ImagePickerValue>;
export async function persistImage(
  value: ImagePickerValue[],
): Promise<ImagePickerValue[]>;
export async function persistImage(value: undefined): Promise<undefined>;
export async function persistImage(
  value: ImagePickerSelectedValue | undefined,
): Promise<ImagePickerSelectedValue | undefined> {
  if (value === undefined) {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const pendingValues = values.filter(image => !isPersistedUri(image.uri));
  const [firstPending, ...restPending] = pendingValues;

  if (firstPending === undefined) {
    return value;
  }

  const files: [FileToCopy, ...FileToCopy[]] = [
    toFileToCopy(firstPending),
    ...restPending.map(toFileToCopy),
  ];

  const results = await keepLocalCopy({
    files,
    destination: 'documentDirectory',
  });

  let pendingIndex = 0;
  const nextValues = values.map(image => {
    if (isPersistedUri(image.uri)) {
      return image;
    }

    const result = results[pendingIndex];

    pendingIndex += 1;

    if (result === undefined) {
      throw new Error('图片转存失败：未知错误');
    }
    if (result.status === 'error') {
      throw new Error(`图片转存失败：${result.copyError}`);
    }

    return { ...image, uri: result.localUri };
  });

  return Array.isArray(value) ? nextValues : (nextValues[0] ?? value);
}
