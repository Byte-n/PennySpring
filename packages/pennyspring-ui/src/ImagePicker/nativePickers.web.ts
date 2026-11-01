/// <reference lib="dom" />
import type { ImagePickerPickOptions, ImagePickerValue } from './types';

function pickImageViaInput(
  options: ImagePickerPickOptions,
): Promise<ImagePickerValue | ImagePickerValue[] | undefined> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = options.multiple;

    input.addEventListener('change', () => {
      const files = Array.from(input.files ?? []).slice(
        0,
        options.multiple ? options.maxCount : 1,
      );

      if (files.length === 0) {
        resolve(undefined);
        return;
      }

      const values = files.map(file => ({
        uri: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }));

      resolve(options.multiple ? values : values[0]);
    });

    input.addEventListener('cancel', () => {
      resolve(undefined);
    });

    input.click();
  });
}

export function pickImageFromLibrary(
  options: ImagePickerPickOptions,
): Promise<ImagePickerValue | ImagePickerValue[] | undefined> {
  return pickImageViaInput(options);
}

export function pickImageFromCamera(
  options: ImagePickerPickOptions,
): Promise<ImagePickerValue | ImagePickerValue[] | undefined> {
  return pickImageViaInput(options);
}

export function pickImageFromFiles(
  options: ImagePickerPickOptions,
): Promise<ImagePickerValue | ImagePickerValue[] | undefined> {
  return pickImageViaInput(options);
}
