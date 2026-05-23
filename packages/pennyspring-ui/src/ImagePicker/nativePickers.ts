import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import type { ImagePickerValue } from './types';

function normalizeFileName(value: ImagePickerValue): string | undefined {
  return value.fileName ?? value.name;
}

function normalizeMimeType(value: ImagePickerValue): string | undefined {
  return value.mimeType ?? value.type;
}

function normalizeImageValue(value: ImagePickerValue): ImagePickerValue {
  return {
    ...value,
    fileName: normalizeFileName(value),
    mimeType: normalizeMimeType(value),
  };
}

export async function pickImageFromLibrary(): Promise<ImagePickerValue | undefined> {
  const response = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
  });
  const asset = response.assets?.[0];

  if (response.didCancel === true || asset?.uri === undefined) {
    return undefined;
  }

  return normalizeImageValue({
    uri: asset.uri,
    fileName: asset.fileName,
    fileSize: asset.fileSize,
    height: asset.height,
    mimeType: asset.type,
    width: asset.width,
  });
}

export async function pickImageFromFiles(): Promise<ImagePickerValue | undefined> {
  try {
    const [file] = await pick({
      allowMultiSelection: false,
      type: [types.images],
    });

    if (file?.uri === undefined) {
      return undefined;
    }

    return normalizeImageValue({
      uri: file.uri,
      name: file.name ?? undefined,
      type: file.type ?? undefined,
      fileSize: file.size ?? undefined,
    });
  } catch (error: unknown) {
    if (
      isErrorWithCode(error)
      && error.code === errorCodes.OPERATION_CANCELED
    ) {
      return undefined;
    }

    throw error;
  }
}
