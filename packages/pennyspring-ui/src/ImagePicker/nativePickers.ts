import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import type { ImagePickerPickOptions, ImagePickerValue } from './types';

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

function normalizeImageValues(values: ImagePickerValue[]): ImagePickerValue[] {
  return values.map(normalizeImageValue);
}

function getSelectionLimit({ maxCount, multiple }: ImagePickerPickOptions): number {
  return multiple ? maxCount : 1;
}

export async function pickImageFromLibrary(
  options: ImagePickerPickOptions,
): Promise<ImagePickerValue | ImagePickerValue[] | undefined> {
  const response = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: getSelectionLimit(options),
  });
  const assets = response.assets ?? [];

  if (response.didCancel === true || assets.length === 0) {
    return undefined;
  }

  const values = normalizeImageValues(
    assets
      .filter((asset): asset is typeof asset & { uri: string } => asset.uri !== undefined)
      .slice(0, getSelectionLimit(options))
      .map(asset => ({
        uri: asset.uri,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        height: asset.height,
        mimeType: asset.type,
        width: asset.width,
      })),
  );

  if (values.length === 0) {
    return undefined;
  }

  return options.multiple ? values : values[0];
}

export async function pickImageFromFiles(
  options: ImagePickerPickOptions,
): Promise<ImagePickerValue | ImagePickerValue[] | undefined> {
  try {
    const files = await pick({
      allowMultiSelection: options.multiple,
      type: [types.images],
    });

    if (files.length === 0) {
      return undefined;
    }

    const values = normalizeImageValues(
      files
        .filter((file): file is typeof file & { uri: string } => file.uri !== undefined)
        .slice(0, getSelectionLimit(options))
        .map(file => ({
          uri: file.uri,
          name: file.name ?? undefined,
          type: file.type ?? undefined,
          fileSize: file.size ?? undefined,
        })),
    );

    if (values.length === 0) {
      return undefined;
    }

    return options.multiple ? values : values[0];
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
